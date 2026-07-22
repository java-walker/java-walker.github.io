---
title: Hexo 代码块与排版测试
date: 2026-07-22 23:10:00
categories: 技术
tags:
  - Hexo
  - Markdown
---

一篇用来验证主题排版与代码高亮的测试文。

## 行内代码与引用

使用 `hexo generate` 可以生成静态站点，输出目录为 `public/`。

> 引用块：好的工具应该让你专注于内容，而不是折腾配置。

## 代码高亮

```javascript
function greet(name) {
  // Hexo 默认使用 highlight.js 渲染代码块
  console.log(`Hello, ${name}!`);
}
greet('Lyuu');
```

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print([fib(i) for i in range(10)])
```

## 列表与表格

| 命令 | 作用 |
| --- | --- |
| `hexo new` | 新建文章 |
| `hexo generate` | 生成静态文件 |
| `hexo server` | 本地预览 |
| `hexo deploy` | 部署到远端 |

1. 第一步
2. 第二步
3. 第三步

排版正常，说明主题工作良好。
