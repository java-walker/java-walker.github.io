# Hexo 博客（独立子目录）

本目录是一个**全新独立的 Hexo 博客项目**，使用 [NexT](https://github.com/next-theme/hexo-theme-next) 主题。
它放在仓库的 `hexo/` 子目录中，**没有改动**根目录现有的 `index.html`（封面页）、`ai-guide/`（VuePress 文档）、`gpnu.html` 等内容。

## 目录说明
- `_config.yml`：Hexo 主配置（站点名、URL=https://lyuu.cc、语言 zh-CN、部署）
- `_config.next.yml`：NexT 主题配置（菜单、社交、外观）
- `source/_posts/`：你的博客文章（Markdown）
- `source/about/`：关于页
- `themes/next/`：NexT 主题（通过 npm 安装）

## 本地预览
```bash
cd hexo
npm install          # 首次需安装依赖（已安装可跳过）
hexo server          # 启动本地服务，访问 http://localhost:4000
```

## 写一篇新文章
```bash
hexo new "文章标题"          # 在 source/_posts/ 生成 .md
# 编辑该文件，支持 Markdown + Front Matter
hexo generate               # 生成静态文件到 public/
```

## 生成静态站点
```bash
hexo generate     # 或 hexo g，输出到 public/
```

## 部署到 GitHub Pages（重要提醒）
本仓库 `java-walker.github.io` 是 GitHub Pages **用户站点**，发布目录必须是默认分支（main）的**根目录**。
直接 `hexo deploy` 会把 `public/` 推到 `main` 分支，**覆盖**根目录现有的 `index.html`、`ai-guide/`、`gpnu.html` 等。

**推荐的安全流程（源码/发布分离）：**
1. 把 Hexo 源码（`hexo/` 目录内容）提交到一个独立分支，例如 `source`。
2. 配置 GitHub Actions：在 `source` 分支 push 时执行 `npm install && hexo generate`，再把 `public/` 部署到 `main` 分支。
3. 现有内容（`ai-guide` 等）可保留：把它们也放进 Hexo 的 `source/` 目录（Hexo 会原样拷贝到 `public/`），或部署时用脚本合并。

> 在你确认合并策略之前，请**不要**直接执行 `hexo deploy`。
> 当前 `_config.yml` 里的 `deploy` 已配置 git，但仅在你明确要发布时使用。

## 与现有内容整合（可选）
- 想保留 AI 指南：把 `ai-guide/` 拷贝到 `hexo/source/ai-guide/`，Hexo 生成时会保留为 `/ai-guide/` 子站。
- 想保留封面主页：可将其作为 Hexo 的自定义页面，或继续用根域名跳转。

## 常用命令速查
| 命令 | 作用 |
| --- | --- |
| `hexo new <title>` | 新建文章 |
| `hexo generate` / `hexo g` | 生成静态文件 |
| `hexo server` / `hexo s` | 本地预览 |
| `hexo deploy` / `hexo d` | 部署（谨慎使用） |
| `hexo clean` | 清理缓存与 public |
