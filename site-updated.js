(function () {
  'use strict';
  var JSON_URL = '/last_updated.json';

  // 动态注入样式——避免依赖 NexT 的 inject 块（本环境 inject 块对 custom_file_path 无效）
  function injectStyles() {
    if (document.getElementById('site-updated-styles')) return;
    var css =
      '.site-updated{' +
        'display:block;width:100%;margin:8px 0 0;padding-top:6px;' +
        'border-top:1px solid rgba(127,127,127,0.25);' +
        'font-size:12px;line-height:1.5;text-align:center;' +
        'opacity:0.8;box-sizing:border-box;word-break:break-word;' +
      '}' +
      '.site-updated-home{' +
        'display:block;font-size:13px;color:#9aa3ad;text-align:center;' +
        'opacity:0.85;letter-spacing:0.2px;' +
      '}';
    var s = document.createElement('style');
    s.id = 'site-updated-styles';
    s.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(s);
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function relative(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    var s = Math.floor((Date.now() - then) / 1000);
    if (s < 0) s = 0;
    if (s < 60) return s + ' 秒前';
    var m = Math.floor(s / 60);
    if (m < 60) return m + ' 分钟前';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' 小时前';
    var d = Math.floor(h / 24);
    return d + ' 天前';
  }

  function absolute(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
           ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function buildText(data) {
    if (!data || !data.updated_at) return '';
    var rel = relative(data.updated_at);
    var abs = absolute(data.updated_at);
    var text = '本站更新于 ' + (rel ? rel + '（' + abs + '）' : abs);
    if (data.source) text += ' · ' + data.source;
    return text;
  }

  function render() {
    fetch(JSON_URL, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var text = buildText(data);
        if (!text) return;

        // Place 1: 博客侧栏 — 插入 .site-meta 内部、副标题正下方
        // 关键：appendChild（不是 insertBefore 到 parentNode），
        // 避免被 header 的 flex-row 布局横向挤压、导致标题折行
        var meta = document.querySelector('.site-meta');
        if (meta) {
          var blog = document.createElement('div');
          blog.className = 'site-updated';
          blog.textContent = text;
          meta.appendChild(blog);
        }

        // Place 2: 主页 — 社交图标下方的 #site-updated-home 容器
        var home = document.getElementById('site-updated-home');
        if (home) home.textContent = text;
      })
      .catch(function () { /* 离线或 JSON 缺失时静默 */ });
  }

  function init() {
    injectStyles();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
