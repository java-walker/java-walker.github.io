---
title: "014 Linux 磁盘挂载完全指南：分区、格式化、挂载与不重启识别"
date: 2026-07-19 07:00:00
categories: 运维
tags:
  - Linux
  - 运维
  - 系统
---

> 原文转载自微信公众号「walker-行者」Linux 系列。
> 原始链接：https://mp.weixin.qq.com/s?__biz=MzkwMDgyMTA2OQ==&mid=2247483886&idx=1&sn=79082868cbd100f9267a2e45bfc372bc&chksm=c0bf78ccf7c8f1da7700bc9b2c360c97c72ecb2465401af7c3a5ab9bb2f5abfc5370a54db921&cur_album_id=4586547322464501762&scene=189#wechat_redirect

> 新硬盘从识别到永久挂载，一篇搞定所有步骤

## 一、核心流程概述

新硬盘投入使用需要经过 **5个步骤**：

`   1  识别磁盘 → 分区 → 格式化 → 临时挂载 → 永久挂载（配置fstab）       `

> ⚠️ **关键提醒**：普通`mount`临时挂载**重启失效**！生产环境必须通过`/etc/fstab`配置实现**开机自动挂载**，且**优先使用UUID**挂载（设备唯一标识，不受硬盘顺序变更影响）。

## 二、第一步：识别磁盘

加装物理硬盘后，系统无法即时识别，**需重启服务器**方可识别新磁盘。

`   1  2  3  4  lsblk -f              # 查看块设备、分区、文件系统、挂载状态（最常用）   fdisk -l              # 查看系统所有磁盘详细分区表   df -h                 # 查看已挂载磁盘的容量、使用情况   blkid                 # 查看所有块设备UUID（永久唯一标识）       `

### 设备命名规则

| 命名 | 含义 |
| --- | --- |
| `/dev/sda` | 第1块物理硬盘 |
| `/dev/sdb` | 第2块物理硬盘 |
| `/dev/sdc` | 第3块物理硬盘 |
| `/dev/sdc1` | 第3块硬盘的**第1个分区** |
| `/dev/sdc2` | 第3块硬盘的**第2个分区** |
## 三、第二步：分区（fdisk）

以新磁盘 `/dev/sdc` 为例：

`   1  2  # 进入分区编辑界面   fdisk /dev/sdc       `

### fdisk 交互命令

| 命令 | 作用 |
| --- | --- |
| `n` | **新建**  磁盘分区 |
| `p` | **查看**  当前磁盘分区表 |
| `d` | **删除**  已有分区 |
| `w` | **保存并退出**  （⚠️ 不执行则所有分区操作失效！） |
| `q` | **直接退出**  ，不保存任何修改 |
### ✅ 快速分区流程

`   1  2  fdisk /dev/sdc   # 输入 n → 回车（默认主分区）→ 回车（默认起始扇区）→ 回车（默认结束扇区）→ 输入 w（保存退出）       `

完成后生成 `/dev/sdc1` 分区。

## 四、第三步：格式化

新建分区无文件系统，**必须格式化**后才可挂载使用。

`   1  2  3  4  5  # 标准写法1（通用）   mkfs -t ext4 /dev/sdc1       # 标准写法2（简写，效果一致）   mkfs.ext4 /dev/sdc1       `

### 常用文件系统格式

| 格式 | 特点 | 适用场景 |
| --- | --- | --- |
| `ext4` | 稳定通用，兼容所有Linux | 通用推荐 |
| `xfs` | 高性能，支持大文件 | CentOS 7+ 默认 |
> ⚠️ 注意：必须写完整分区名 `/dev/sdc1`，不能写成 `/dev/sdc` 或 `/dev/sd1`！

## 五、第四步：临时挂载（mount）

临时挂载**仅当前系统生效**，服务器重启后全部失效，适用于测试或临时使用场景。

`   1  2  3  4  5  6  7  8  # 1. 创建挂载目录   mkdir -p /xinmulu       # 2. 执行挂载   mount /dev/sdc1 /xinmulu       # 3. 查看挂载结果   df -h       `

### 卸载（取消挂载）

`   1  2  3  4  5  # 方式1：通过设备名卸载   umount /dev/sdc1       # 方式2：通过挂载点卸载   umount /xinmulu       `

## 六、第五步：永久挂载（/etc/fstab）

### 6.1 为什么用UUID？

| 挂载方式 | 稳定性 | 风险 |
| --- | --- | --- |
| `/dev/sdc1` | ❌ 不稳定 | 硬盘顺序变更（如拔插）会导致挂载到错误设备 |
| `UUID=xxx` | ✅ 稳定 | **唯一标识**  ，硬盘顺序变化不影响 |
> 🎯 **生产环境强制使用UUID挂载！**

### 6.2 获取UUID

`   1  2  blkid /dev/sdc1   # 输出示例：/dev/sdc1: UUID="a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx" TYPE="ext4"       `

### 6.3 编辑配置文件

`   1  vim /etc/fstab       `

### 6.4 添加挂载配置

`   1  UUID=xxxx-xxxx-xxxx-xxxx  /xinmulu  ext4  defaults  0  0       `

### 6.5 fstab 六字段详解

| 字段顺序 | 含义 | 示例值 |
| --- | --- | --- |
| 第1列 | 设备标识（**推荐UUID**） | `UUID=xxx-xxx`   或 `/dev/sdc1` |
| 第2列 | 挂载点目录 | `/xinmulu` |
| 第3列 | 文件系统类型 | `ext4`   / `xfs` |
| 第4列 | 挂载权限参数 | `defaults`  （默认读写） |
| 第5列 | dump备份标记 | `0`  （不备份） |
| 第6列 | fsck开机自检顺序 | `0`  （不检测） |
### 6.6 校验配置（不重启生效）

`   1  2  3  4  5  # 加载fstab所有配置，无报错则配置无误   mount -a       # 确认挂载生效   df -h       `

## 七、完整标准实操流程

`   1  2  3  4  5  6  7  8  9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  # 1. 重启后查看新磁盘设备   lsblk -f      # 2. 磁盘分区   fdisk /dev/sdc   # 操作步骤：n → 回车 → 回车 → w      # 3. 格式化分区   mkfs -t ext4 /dev/sdc1      # 4. 创建挂载目录   mkdir /xinmulu      # 5. 临时挂载（测试）   mount /dev/sdc1 /xinmulu      # 6. 获取UUID   blkid /dev/sdc1      # 7. 配置永久挂载   vim /etc/fstab   # 添加：UUID=xxx-xxx /xinmulu ext4 defaults 0 0      # 8. 校验配置   mount -a      # 9. 确认生效   df -h       `

## 八、高频易错点汇总

| ❌ 错误操作 | ✅ 正确操作 | 后果 |
| --- | --- | --- |
| 格式化写成 `/dev/sd1` | 必须写完整分区名 `/dev/sdc1` | 找不到设备，操作失败 |
| 分区后未执行 `w` 保存 | 必须执行 `w` 写入并退出 | 所有分区操作无效 |
| 未格式化直接挂载 | 先 `mkfs` 格式化再挂载 | 挂载报错，无法使用 |
| 仅临时挂载，不配置fstab | 配置 `/etc/fstab` 永久挂载 | 重启后挂载失效 |
| 使用 `/dev/sdc1` 设备名挂载 | 使用 `UUID=xxx` 挂载 | 硬盘顺序变更导致挂载异常 |
## 九、命令速查卡片

| 操作 | 命令 |
| --- | --- |
| 查看磁盘/分区/挂载状态 | `lsblk -f` |
| 查看所有磁盘分区 | `fdisk -l` |
| 查看已挂载磁盘容量 | `df -h` |
| 查看设备UUID | `blkid`   或 `blkid /dev/sdc1` |
| 进入分区编辑 | `fdisk /dev/sdc` |
| 格式化分区（通用） | `mkfs -t ext4 /dev/sdc1` |
| 格式化分区（简写） | `mkfs.ext4 /dev/sdc1` |
| 临时挂载 | `mount /dev/sdc1 /xinmulu` |
| 卸载磁盘 | `umount /dev/sdc1`   或 `umount /xinmulu` |
| 编辑永久挂载配置 | `vim /etc/fstab` |
| 加载/校验fstab配置 | `mount -a` |
* * *

## 生产场景：无法重启服务器，如何识别新硬盘？

**场景说明**：线上服务器业务运行中，**禁止重启**，新增物理硬盘后系统未识别，无需重启可手动扫描识别磁盘。

## 重新扫描 SCSI/SATA 总线

### 1\. 找到 SCSI Host 控制器

`   1  2  ls /sys/class/scsi_host/   # 输出示例：host0  host1  host2       `

### 2\. 逐个扫描所有 Host

`   1  2  3  4  5  6  7  8  9  # 方式1：逐个扫描   echo "- - -" > /sys/class/scsi_host/host0/scan   echo "- - -" > /sys/class/scsi_host/host1/scan   echo "- - -" > /sys/class/scsi_host/host2/scan       # 方式2：一键扫描所有（推荐）   for host in /sys/class/scsi_host/host*/scan; do       echo "- - -" > $host   done       `

> **参数说明：**`- - -` 三个横线分别代表：
> 
> -   第1个 `-`：扫描所有 **Channel**
>     
> -   第2个 `-`：扫描所有 **Target**
>     
> -   第3个 `-`：扫描所有 **LUN**
>     

* * *

## 验证新硬盘是否识别

`   1  2  3  4  5  6  7  8  9  10  # 方法1：查看内核日志   dmesg | tail -20   dmesg | grep -i "sd[a-z]"       # 方法2：查看块设备   lsblk -f   fdisk -l       # 方法3：查看新增设备   ls /dev/sd* | sort       `

> 📌 > 如果觉得有用，欢迎**点赞、在看、转发**三连！
