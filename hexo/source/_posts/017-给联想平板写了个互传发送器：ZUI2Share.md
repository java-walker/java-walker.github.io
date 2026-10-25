---
title: "给联想平板写了个互传发送器：ZUI2Share"
date: 2026-10-25 21:30:00
categories: 技术
tags:
  - Android
  - 逆向
  - 互传联盟
---

> 起因很简单：一加能往联想平板传文件，平板却找不到任何一个入口往外发。

## 事情是这样的

我手上有台联想小新 Pad（ZUI 16），平时拿来看文档、记笔记。手机是一加。

有天想把平板上的一个安装包发到手机，点开分享面板傻眼了——系统互传（联想叫「超级互联」）只能**收**，不能**发**给一加。准确说是平板上的互传界面只能「搜索附近设备」，一加开了互传它也搜得到，但平板自己作为发送方去推文件，整个 UI 里根本没有这个功能。

先说结论：**这个功能其实存在，只是没做界面**。联想把它做成了 AIDL 接口藏在系统服务里，我给它套了个壳，就是 [ZUI2Share](https://github.com/java-walker/ZUI2Share)。

## 走过的弯路

一开始没想反编译，先试了现成方案。

**CatShare**，一个开源的互传联盟第三方客户端，思路很漂亮：自己实现 BLE 发现和 Wi-Fi Direct 组网，冒充系统互传。我给它补了几个兼容性 patch（比如它读不到 `p2p0` 的 MAC 地址，我配了 Shizuku 帮它读），最后卡在一步：握手能走完，文件传输阶段一加那边直接超时。看日志，一加的互传服务只认联想系统服务发起的 P2P 组网，第三方 App 自己建的组它不加入。

这条路走不通之后我又动了把 CatShare 塞进 `/system/priv-app` 的念头，也失败了——平板的 root 是 KernelSU，4.x 版本不支持 system 目录挂载，得装 meta-overlayfs，太折腾。

后来想明白一件事：**CatShare 在重造轮子，而联想其实已经把轮子造好了，只是没装方向盘。**

## 正确的打开方式

把 `/system/priv-app/ZuiFileTransfer` 拖进 jadx，反编译出来的东西让我有点意外：

```java
// com.zui.wifip2p 暴露的服务
Service:    com.zui.wifip2p/.RemoteStatusService
Action:     com.zui.wifip2p.action.RemoteApiService
Permission: com.zui.wifip2p.permission.RemoteApiService
```

这个权限的 protectionLevel 是 **normal**。也就是说，任何一个普通 App 在 Manifest 里声明一下，就能合法 bind 这个系统服务、调用它的文件发送接口。没有签名校验，没有调用方白名单，什么都没有。

接口长这样：

```java
IServiceManager.getService(0)   → IFastTransfer
IFastTransfer.registerCallback(callback)   // 设备列表从 onDevices 回调推过来
IFastTransfer.callSendFile(deviceType, bleMac, uris)
```

就这么三个调用。后面 BLE 握手、Wi-Fi P2P 组网、断点续传，全是联想自己的服务在干。对端一加看到的请求和系统互传发出来的一模一样，当然照单全收。

不过「接口存在」和「能用」之间还隔着几个坑，值得记下来：

**AIDL 事务号是按方法声明顺序生成的**，不是字母序。我第一版 .aidl 按习惯把方法按字母排了，结果 `registerCallback` 怎么调都返回 false——对端按事务号分发，我这边序号 1 的方法在对端眼里是别的操作。把声明顺序改成和反编译出来的 Stub 一致，一次通过。对接别人的 AIDL 时，先看对端 `onTransact` 里的分支号，再写自己的接口文件，这个顺序不能凭感觉来。

**`file://` URI 会被一加拒收。** 联想的 `getMimeTypeForUri()` 只处理 `content://`，`file://` 直接返回 null。MIME 是 null 的一加那边解析失败，会在 `Download/OnePlus Share/` 下留下一个 0 字节的空壳文件，发送端却显示「传输完成」。我最开始测试 TXT 能通、APK 不通，排查了半天 URI 权限、provider 授权，最后发现是 MIME 的问题——解法是发送前把文件登记进 MediaStore，换一个正经的 `content://media/external/downloads/...` 回来。修完之后 MD5 校验，两边完全一致。

**还有个阴间的：一加的互传开关是限时的。** 打开后显示「X 分 X 秒内有效」，五分钟一到自动关闭。关闭后 BLE 广播就停了，平板这边设备列表里还显示着（缓存），但发什么都是超时失败，状态码 6。我一度以为是协议不兼容，反复改代码，最后发现只需要在手机上重新点一下开关。调试 Android 的问题，先确认对端真的活着，这句话说了多少年了还是会忘。

## 做成了什么样

App 本身很简单，一个界面三步：选设备、选文件、发送。

比较有意思的是「选择本机应用」这个功能：列出平板上装的 177 个应用，支持按用户/系统筛选和搜索，勾选之后自动把 APK 从 `/data/app` 里抽出来（这个路径普通应用读不了目录但能读文件，权限设计挺微妙），按 `应用名-包名-版本号.apk` 重命名，然后走互传发出去。给新手机装软件倒是意外地顺手。

实测 TXT 和 APK 都能正常发到一加，MD5 一致，整个过程三四秒。大文件没测过极限速度，但走的是 Wi-Fi Direct 直连，理论上不是瓶颈。

## 几点说明

- 项目在 [GitHub](https://github.com/java-walker/ZUI2Share)，Release 里有打包好的 APK，要求 Android 12+ 且设备上有联想的互传服务（ZUI 平板基本都行，其他品牌没测）
- 一加那边**什么都不用装**，打开互传开关就行，这也是我坚持不用 LocalSend 的原因——就是想看看纯靠发送端能不能解决
- 一加互传开关五分钟过期这个设计属实反人类，建议OPPO系的产品经理看看
- 代码里 AIDL 那部分是从反编译结果还原的，联想哪天更新改了接口可能就失效了，且用且珍惜

回过头看，这次折腾最有意思的点不是逆向本身，而是发现厂商把功能做完了却不上界面——大概产品经理觉得「平板给别人发文件」是个伪需求吧。但对有两台设备的人来说，这恰恰是最常见的场景。
