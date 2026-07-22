#!/usr/bin/env node
'use strict';

/*
 * set-domain.js
 * 站点域名唯一真源 = 仓库根目录 .env 的 SITE_DOMAIN
 * 本脚本在 CI（以及本地）把域名同步到下列各处，保证「改一处，全站更新」：
 *   1) CNAME                                    —— GitHub Pages 自定义域名
 *   2) hexo/_config.yml 的 url                  —— 博客全站 URL（Hexo 用它生成所有 blog 页面）
 *   3) hexo/_config.next.yml 的 portal 菜单      —— 博客侧栏「主页/门户」链接
 *   4) 根 index.html 的 3 个站内链接             —— GPNU资源 / 简历 / 关于
 *   5) 根 gpnu.html 内遗留的旧域名 lyuu.cn 资源   —— 站内 PDF 等（归一为 SITE_DOMAIN）
 *
 * 设计要点（避免踩坑）：
 *   - 替换按「路径」(gpnu.html / about) 匹配，而不是按域名匹配，
 *     因此即使将来把域名从 lyuu.eu.cc 改成别的，也能正确归一，且绝不会误伤
 *     github / zhihu / unpkg 等外链。
 *   - 幂等：只有内容真正变化时才写文件，避免无谓的 git 提交。
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ENV_FILE = path.join(ROOT, '.env');

function readDomain() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error('[set-domain] 未找到 .env');
    process.exit(1);
  }
  const text = fs.readFileSync(ENV_FILE, 'utf8');
  const m = text.match(/^\s*SITE_DOMAIN\s*=\s*([^\s#]+)\s*$/m);
  if (!m) {
    console.error('[set-domain] .env 中未找到 SITE_DOMAIN');
    process.exit(1);
  }
  // 去掉可能的协议前缀与结尾斜杠，统一成裸域名
  return m[1].replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function writeIfChanged(relPath, content) {
  const p = path.join(ROOT, relPath);
  if (!fs.existsSync(p)) {
    console.warn('[set-domain] 跳过缺失文件:', relPath);
    return;
  }
  const cur = fs.readFileSync(p, 'utf8');
  if (cur !== content) {
    fs.writeFileSync(p, content);
    console.log('[set-domain] 已更新:', relPath);
  } else {
    console.log('[set-domain] 已是最新:', relPath);
  }
}

function replaceInFile(relPath, regex, replacer) {
  const p = path.join(ROOT, relPath);
  if (!fs.existsSync(p)) {
    console.warn('[set-domain] 跳过缺失文件:', relPath);
    return;
  }
  const s = fs.readFileSync(p, 'utf8');
  const next = s.replace(regex, replacer);
  if (next !== s) {
    fs.writeFileSync(p, next);
    console.log('[set-domain] 已更新:', relPath);
  } else {
    console.log('[set-domain] 已是最新:', relPath);
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const domain = readDomain();
const https = `https://${domain}`;
console.log('[set-domain] 目标域名:', domain);

// 1) CNAME —— 直接写入裸域名
writeIfChanged('CNAME', domain + '\n');

// 2) hexo/_config.yml 的 url（博客唯一真源，CI 重建后所有 blog 页面域名自动更新）
replaceInFile(
  'hexo/_config.yml',
  /(^url:\s*)https?:\/\/\S+/m,
  (_, g1) => `${g1}${https}/blog`
);

// 3) hexo/_config.next.yml 的 portal 菜单
replaceInFile(
  'hexo/_config.next.yml',
  /(portal:\s*)https?:\/\/[^\s|]+/,
  (_, g1) => `${g1}${https}/`
);

// 4) 根 index.html 的 3 个站内链接（按路径匹配，不受旧域名影响，不碰外链）
replaceInFile(
  'index.html',
  /(https?:\/\/)[^\/"'\s]+(\/(?:gpnu\.html|about\/?))/g,
  (_, g1, g2) => `${g1}${domain}${g2}`
);

// 5) gpnu.html 内遗留的旧域名 lyuu.cn 站内资源（PDF）链接，归一为 SITE_DOMAIN
//    同时兼容「当前 SITE_DOMAIN」，确保将来改 .env 域名时也能同步更新。
//    只匹配指向 lyuu.cn 或本站点域名的链接，绝不碰 github / zhihu / unpkg 等外链。
replaceInFile(
  'gpnu.html',
  new RegExp('(https?://)(?:lyuu\\.cn|' + escapeRegExp(domain) + ')(/[^\\s"\']+)', 'g'),
  (_, proto, p) => `${proto}${domain}${p}`
);

console.log('[set-domain] 完成');
