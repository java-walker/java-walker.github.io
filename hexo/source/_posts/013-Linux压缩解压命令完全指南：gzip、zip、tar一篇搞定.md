---
title: "011 Linux压缩解压命令完全指南：gzip、zip、tar一篇搞定"
date: 2026-07-09 00:03:00
categories: 运维
tags:
  - Linux
  - 运维
  - 系统
---

> 原文转载自微信公众号「walker-行者」Linux 系列。
> 原始链接：https://mp.weixin.qq.com/s?__biz=MzkwMDgyMTA2OQ==&mid=2247483835&idx=1&sn=9b4eced4740cbd8f113b585794ca7718&chksm=c0bf7899f7c8f18fb053686545e9c3303f9355aad8719fbced128691d479a56512924de9a28d&cur_album_id=4586547322464501762&scene=189#wechat_redirect

# Linux压缩解压命令完全指南：gzip、zip、tar一篇搞定

> 从单文件压缩到目录打包，一文掌握Linux所有压缩场景

## 一、gzip / gunzip（.gz格式）

`gzip` 是Linux自带的压缩工具，特点：**只压缩单个文件，不打包目录**，压缩后原文件消失。

### 基本操作

```
# 压缩文件（原文件消失，生成 test.txt.gz）
```

### 保留原文件压缩/解压

```
# 压缩并保留原文件（-c 输出到标准输出，重定向保存）
```

### 批量操作

```
# 压缩目录下所有.log文件（每个文件单独压缩成.gz）
```

> ⚠️ **注意**：gzip **不能直接压缩文件夹**，要打包目录需要配合 `tar` 使用。

## 二、zip / unzip（跨平台通用格式）

`zip` 是Windows/Linux通用的压缩格式，**支持目录打包**，跨平台兼容性好。

### 压缩（zip）

```
# 压缩文件
```

### 解压（unzip）

```
# 解压到当前目录
```

### 实操演示

```
# 1. 打包压缩网站目录
```

## 三、tar — Linux最强大的打包工具

`tar` 是Linux下**最核心的归档工具**，常与 `gzip` 配合生成 `.tar.gz` 文件。核心功能是**打包**（把多个文件/目录合成一个文件），压缩功能依赖 `-z`（gzip）等参数调用外部压缩程序。

### 参数说明（⚠️ -f 必须放最后！）

| 参数 | 含义 | 说明 |
| --- | --- | --- |
| `-c` | create | 创建压缩包 |
| `-x` | extract | 解压包 |
| `-v` | verbose | 显示过程日志 |
| `-f` | file | **指定压缩包文件名（必须紧跟包名）** |
| `-z` | gzip | 使用gzip压缩/解压（生成 `.tar.gz`） |
| `-C` | 指定目录 | **解压到指定目录** |
| `-t` | list | 查看压缩包内容（不解压） |
> 🎯 **记忆口诀**：`tar -zcvf` = 打包压缩，`tar -zxvf` = 解压。参数顺序随意，**但 `-f` 必须在最后**，因为它后面紧跟文件名。

### 打包压缩（.tar.gz）

```
# 打包并压缩目录/文件（最常用）
```

### 解压（.tar.gz）

```
# 解压到当前目录
```

### 仅打包不压缩（.tar）

```
# 打包（去掉 -z）
```

### 其他常用操作

```
# 查看压缩包内容（不解压）
```

> 💡 **本质理解**：`tar` 负责**打包**（归档），`-z` 负责**压缩**（调用gzip），两者通过管道配合完成完整流程。`tar` 本身不压缩，它把多个文件拼成一个 `.tar`；`-z` 再把这个 `.tar` 压缩成 `.tar.gz`。同理，`-j` 调用 `bzip2` 生成 `.tar.bz2`，`-J` 调用 `xz` 生成 `.tar.xz`。

## 四、三种格式对比

| 格式 | 工具 | 支持目录 | 跨平台 | 压缩率 | 常见用途 |
| --- | --- | --- | --- | --- | --- |
| `.gz` | `gzip`  /`gunzip` | ❌ 不支持 | 一般 | 中等 | **单文件压缩**  ，配合tar |
| `.zip` | `zip`  /`unzip` | ✅ 支持（-r） | ✅ Windows通用 | 中等 | **跨平台文件传输** |
| `.tar.gz` | `tar -zcvf`  /`tar -zxvf` | ✅ 支持 | Linux主流 | 较高 | **Linux服务器首选** |
### 选择建议

| 场景 | 推荐格式 | 命令 |
| --- | --- | --- |
| Linux服务器备份 | `.tar.gz` | `tar -zcvf backup.tar.gz /path/` |
| 分享给Windows用户 | `.zip` | `zip -r share.zip /path/` |
| 仅压缩单个日志文件 | `.gz` | `gzip app.log` |
| 发送源码包 | `.tar.gz` | `tar -zcvf source.tar.gz src/` |
## 五、高频实操示例

```
# 1. 备份整个项目目录（最常用）
```

## 六、命令速查卡片

## gzip 系列

| 操作 | 命令 |
| --- | --- |
| 压缩（原文件消失） | `gzip file.txt` |
| 解压（压缩包消失） | `gunzip file.txt.gz` |
| 压缩并保留原文件 | `gzip -c file.txt > file.txt.gz` |
| 解压并保留压缩包 | `gunzip -c file.txt.gz > file.txt` |
| 查看压缩文件内容 | `zcat file.txt.gz` |
| 批量压缩 | `gzip *.log` |
### zip 系列

| 操作 | 命令 |
| --- | --- |
| 压缩文件 | `zip file.zip a.txt b.txt` |
| 压缩目录（必加-r） | `zip -r pack.zip dir/` |
| 解压到当前目录 | `unzip pack.zip` |
| 解压到指定目录 | `unzip pack.zip -d /tmp/` |
| 查看压缩包内容 | `unzip -l pack.zip` |
### tar 系列

| 操作 | 命令 |
| --- | --- |
| 打包压缩（.tar.gz） | `tar -zcvf backup.tar.gz /path/` |
| 解压（.tar.gz） | `tar -zxvf backup.tar.gz` |
| 解压到指定目录 | `tar -zxvf backup.tar.gz -C /tmp/` |
| 仅打包不压缩（.tar） | `tar -cvf archive.tar /path/` |
| 查看压缩包内容 | `tar -ztvf backup.tar.gz` |
| 解压单个文件 | `tar -zxvf backup.tar.gz file.txt` |
## 提示：你可以用help来获取帮助，eg. tar --help

## 七、常见报错与解决

| 报错 | 原因 | 解决 |
| --- | --- | --- |
| `tar: You must specify one of the '-Acdtrux' options` | 参数顺序错误 | 确保 `-f` 在最后 |
| `gzip: stdin: unexpected end of file` | 压缩包损坏 | 尝试 `gunzip -c` 恢复部分数据 |
| `zip error: Nothing to do!` | 压缩目录未加 `-r` | 加上 `-r` 参数 |
| `Cannot open: No such file or directory` | 文件路径错误 | 检查文件是否存在 |
* * *

> 📌 **如果觉得有用，欢迎****点赞、在看、转发**三连！
