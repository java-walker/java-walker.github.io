(function () {
  'use strict';
  var JSON_URL = '/last_updated.json';

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

  function render() {
    fetch(JSON_URL, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.updated_at) return;
        var rel = relative(data.updated_at);
        var abs = absolute(data.updated_at);
        var text = '本站更新于 ' + (rel ? rel + '（' + abs + '）' : abs);
        if (data.source) text += ' · ' + data.source;

        // Place 1: 博客侧栏，Lyuu 的博客 / Code Create Life 下方
        var meta = document.querySelector('.site-meta');
        if (meta && meta.parentNode) {
          var blog = document.createElement('div');
          blog.className = 'site-updated';
          blog.textContent = text;
          meta.parentNode.insertBefore(blog, meta.nextSibling);
        }

        // Place 2: 主页底部（原 ICP 位置）
        var home = document.getElementById('site-updated-home');
        if (home) {
          home.textContent = text;
        }
      })
      .catch(function () { /* 离线或 JSON 缺失时静默 */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
