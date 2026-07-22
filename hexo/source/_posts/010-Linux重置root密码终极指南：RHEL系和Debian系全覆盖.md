---
title: "008 Linux重置root密码终极指南：RHEL系和Debian系全覆盖"
date: 2026-07-05 22:55:00
categories: 运维
tags:
  - Linux
  - 运维
  - 系统
---

> 原文转载自微信公众号「walker-行者」Linux 系列。
> 原始链接：https://mp.weixin.qq.com/s?__biz=MzkwMDgyMTA2OQ==&mid=2247483828&idx=1&sn=86f8395ced0a7fd493ae3d55b1331cb0&chksm=c0bf7896f7c8f1809480193f6485949bf2ebb287befd79f8d81575701024e23c405ec3f00b21&cur_album_id=4586547322464501762&scene=189#wechat_redirect

  

> 手把手教你进入救援模式重置密码，附带SELinux关键一步

## 场景说明

作为运维人员或Linux学习者，**忘记root密码**是迟早会遇到的问题。别慌，Linux提供了完善的密码重置机制——核心思路是**进入单用户/救援模式**，跳过密码验证，然后重新设置密码。

⚠️ **物理机/虚拟机操作**：以下操作需要**物理接触服务器**或通过**虚拟机控制台**（VNC/iDRAC/IPMI）执行，**不能通过SSH远程操作**（因为要重启系统，SSH连接会断开）。云服务器请使用云厂商提供的**控制台VNC**功能连接。

## 第一篇：RHEL系（CentOS / Rocky Linux / AlmaLinux / RHEL）

## 方法一：rd.break救援模式（CentOS 7+/RHEL 7+ 主流方法）

### 第一步：开机进入GRUB编辑

1.  **重启系统**
    
    （或开机）
    
2.  出现GRUB引导菜单时，**快速按 `e`** 进入内核参数编辑界面
    
3.  菜单通常一闪而过，建议开机时**不停按 `e`** 或 **不停按 `↓` 方向键**暂停菜单
    

> 💡 **GRUB是什么？** GRUB（Grand Unified Bootloader）是Linux系统启动时的引导程序，负责加载内核并启动系统。在GRUB界面按 `e` 可以临时编辑启动参数（重启后恢复，不会永久修改）。

```
                                                            
```

#### 第二步：编辑内核参数

1.  找到以 **`linux`** 或 **`linuxefi`** 开头的内核行
    
2.  移动光标到**行末尾**
    
3.  在最后添加参数：
    

```
 rd.break
```

**修改前：**

```
linux /vmlinuz-3.10.0-957.el7.x86_64 root=/dev/mapper/centos-root ro rhgb quiet
```

**修改后：**

```
linux /vmlinuz-3.10.0-957.el7.x86_64 root=/dev/mapper/centos-root ro rhgb quiet rd.break
```

4.  按下 **`Ctrl+X`** 或 **`F10`** 启动进入救援模式
    

#### 第三步：命令行重置密码

进入后会出现 `switch_root:/#` 提示符，依次执行以下命令：`   `

```
# 1. 将 /sysroot 挂载为可读写（默认是只读）
```

系统会自动重启，开机时会执行**SELinux重标记**（开机时间会变长，耐心等待！）

### 方法二：init=/bin/bash 单用户模式（备用方案）

如果 `rd.break` 方式不生效（某些老硬件/特殊环境），可以尝试这个方法：

#### 操作步骤

1.  GRUB界面按 `e` 进入编辑
    
2.  找到 `linux` 开头的内核行，在行尾添加：
    

```
rw init=/bin/bash
```

3.  按 `Ctrl+X` 启动     
    

```
# 直接进入 root shell（无需密码！）  
```

## 第二篇：Debian系（Ubuntu / Debian）

> 🎯 **Ubuntu方法论**：Ubuntu默认**没有SELinux**，不需要 `/.autorelabel` 步骤，也不用 `rd.break`。两种方法任选其一即可。

### 方法一：GRUB恢复模式（最简单，推荐桌面/服务器）

### 第一步：调出GRUB菜单

重启机器，开机瞬间：

-   **BIOS传统启动**
    
    ：长按 `Shift`
    
-   **UEFI新电脑/云主机VNC**
    
    ：反复按 `Esc`
    

出现GNU GRUB菜单后松手。

```
┌──────────────────────────────────────────────────────┐     
```

#### 第二步：进入恢复模式

1.  选择 **`Advanced options for Ubuntu`** 回车
    
2.  选中带 **`(recovery mode)`** 的内核，回车
    
3.  在恢复菜单选择：**`root - Drop to root shell prompt`**
    

```
┌──────────────────────────────────────────────────────┐
```

#### 第三步：挂载可读写、重置密码

进入root命令行后依次输入：

```
# 根分区默认只读，先改成读写
```

> 💡 **Ubuntu特殊说明**：Ubuntu默认**禁用root登录**，日常使用 `sudo` 提权。因此重置**普通用户**密码即可（通常是安装时创建的用户）。如果你确实需要启用root登录，执行 `passwd root` 并设置密码后，还需修改SSH配置允许root登录。

#### 第四步：重启生效

```
# 切回只读再重启
```

系统正常启动，用新密码登录。

方法二：GRUB直接单用户shell（云服务器VNC常用）

### 操作步骤

1.  GRUB菜单选中Ubuntu默认内核，按 `e` 编辑启动参数
    
2.  找到 **`linux`** 开头的那一行
    
3.  把行里的 **`ro`** 改成 **`rw`**，行尾添加 **`init=/bin/bash`**
    

**修改前：**

```
linux /boot/vmlinuz-xxx root=UUID=xxx ro quiet splash
```

**修改后：**

```
linux /boot/vmlinuz-xxx root=UUID=xxx rw quiet splash init=/bin/bash
```

4.  按 **`Ctrl+X`** 直接进入root shell
    
5.  重置密码：
    

```
passwd ubuntu
```

6.  重启系统：
    

```
exec /sbin/init
```

## 三、RHEL系 vs Ubuntu 重置密码核心区别

| 对比项 | RHEL系（CentOS/Rocky/RHEL） | Ubuntu/Debian |
| --- | --- | --- |
| **救援模式关键字** | `rd.break` | recovery mode / `init=/bin/bash` |
| **SELinux处理** | ✅ **必须** `touch /.autorelabel` | ❌ 默认无SELinux，**不需要** |
| **根分区挂载** | `/sysroot` | `/` |
| **重置对象** | `passwd root` | `passwd 普通用户`  （或root） |
| **默认root登录** | 启用 | 禁用（用sudo） |
## 四、常见报错与解决方案

## 报错1：Authentication token manipulation error

```
passwd: Authentication token manipulation error
```

**原因**：文件系统是**只读**状态，无法写入新密码

**解决方案**：

RHEL系：

```
mount -o remount,rw /sysroot
```

Ubuntu：

```
mount -o rw,remount /
```

### 报错2：改完密码重启后登录失败（RHEL系）

**原因**：**SELinux拦截**了登录请求（密码正确但无法登录）

**解决方案**：

-   重新走一遍整个流程
    
-   在 `chroot /sysroot` 环境下**一定要执行**：
    

```
touch /.autorelabel
```

-   重启时等待SELinux重标记完成
    

### 报错3：GRUB菜单一闪而过，看不到

**解决方案**：

-   RHEL系：开机时**不停按 `e`** 或 **不停按 `↓`**
    
-   Ubuntu BIOS模式：开机时**不停按 `Shift`**
    
-   Ubuntu UEFI模式：开机时**不停按 `Esc`**
    
-   云服务器：使用云厂商的**控制台VNC**连接，在控制台界面中操作
    

> 💡 **虚拟机用户提示**：VMware中开机后**立即用鼠标点击黑屏区域**，然后快速按对应按键，确保键盘输入被虚拟机捕获。

## 五、为什么RHEL系要有 `/.autorelabel` 这一步？

SELinux（Security-Enhanced Linux）会给每个文件打上**安全上下文标签**（类似于文件的“身份证”）。当你通过救援模式修改了 `/etc/shadow`（密码文件）时，这个文件的SELinux标签可能**与当前策略不一致**。

-   **有 `/.autorelabel`**
    
     → 下次开机时系统会**自动扫描并修正**所有文件的SELinux标签 → 登录正常
    
-   **没有 `/.autorelabel`**
    
     → SELinux策略和文件标签不一致，**拒绝登录** → 进不去系统
    

> 🎯 **记住**：RHEL系无论用哪种方法，**修改密码后一定要执行 `touch /.autorelabel`**！Ubuntu用户直接跳过这步。

## 六、云服务器特别提醒

| 云平台 | 推荐方式 | 说明 |
| --- | --- | --- |
| 阿里云 | 控制台 → 重置实例密码 | 官方功能，最省事 |
| 腾讯云 | 控制台 → 重置密码 | 不需要进GRUB |
| AWS EC2 | 分离根卷 → 挂载到临时实例修改 | 官方推荐方法 |
> 💡 **强烈建议**：云服务器优先使用云厂商提供的\*\*「重置密码」\*\*功能，远比手动进GRUB更安全、更方便！

## 七、完整操作速查卡片

## RHEL系（CentOS/Rocky/RHEL）— rd.break 方式（推荐）

```
# GRUB界面按 e，在 linux 行尾加 rd.break 
```

### RHEL系— init=/bin/bash 方式（备用）

```
# GRUB界面按 e，在 linux 行尾加 rw init=/bin/bash
```

### Ubuntu — recovery mode 方式（推荐）

```
# GRUB界面选择 Advanced options → recovery mode → root
```

### Ubuntu — init=/bin/bash 方式（备用）

```
# GRUB界面按 e，linux 行把 ro 改成 rw，行尾加 init=/bin/bash
```

## 八、快速对比总结表

| 操作步骤 | RHEL系（CentOS/Rocky） | Ubuntu/Debian |
| --- | --- | --- |
| **GRUB按键** | 按 `e` | `Shift`  （BIOS）/ `Esc`（UEFI） |
| **内核参数** | 行尾加 `rd.break` | recovery mode 或 `init=/bin/bash` |
| **挂载命令** | `mount -o remount,rw /sysroot` | `mount -o rw,remount /` |
| **切换环境** | `chroot /sysroot` | 不需要（直接在 / 下操作） |
| **SELinux重标记** | ✅ `touch /.autorelabel` | ❌ 不需要 |
| **重置密码** | `passwd root` | `passwd 用户名` |
| **重启** | `exit`  （自动重启） | `exec /sbin/init` |
* * *

> 📌
