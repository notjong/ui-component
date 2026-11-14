(function () {
  var DATA = window.ELEMENTS, CATS = window.CATS, CAT_ORDER = window.CAT_ORDER;
  var navList = document.getElementById('navList');
  var detail = document.getElementById('detail');
  var side = document.getElementById('side');

  // 사이드바: 카테고리 그룹별 렌더
  CAT_ORDER.forEach(function (catKey) {
    var items = DATA.filter(function (e) { return e.cat === catKey; });
    var grp = document.createElement('div');
    grp.className = 'grp';
    grp.innerHTML = '<span class="grp__title">' + CATS[catKey].label + ' (' + items.length + ')</span>';
    navList.appendChild(grp);
    items.forEach(function (e) {
      var b = document.createElement('button');
      b.className = 'nav-item';
      b.dataset.n = e.n;
      b.innerHTML = '<span class="nav-item__no">' + e.n + '</span>' +
                    '<span>' + e.name + '</span>' +
                    '<span class="nav-item__ko">' + e.ko + '</span>';
      b.addEventListener('click', function () { select(e.n); side.classList.remove('is-open'); });
      navList.appendChild(b);
    });
  });

  // 미리보기 문서: 소스 탭과 동일한 html/css/js 문자열 사용
  function buildSrcdoc(e) {
    var base =
      'body{font-family:"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;' +
      'margin:0;padding:28px;color:#18181b;background:#fff;display:flex;align-items:center;' +
      'justify-content:center;min-height:100vh;box-sizing:border-box;}*{box-sizing:border-box;}';
    return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<style>' + base + e.css + '</style></head><body>' +
      '<div class="demo-root">' + e.html + '</div>' +
      '<script>' + (e.js || '').replace(/<\/script>/g, '<\\/script>') + '<\/script></body></html>';
  }

  function codeBlock(label, source, lang) {
    if (!source || !source.trim()) {
      return '<div class="panel" data-tab="' + lang + '" hidden>' +
        '<div class="code-empty">이 요소는 ' + label + ' 코드가 필요하지 않습니다.</div></div>';
    }
    return '<div class="panel" data-tab="' + lang + '" hidden>' +
      '<div class="code-wrap"><button class="code-copy" data-src="' + lang + '">복사</button>' +
      '<pre><code class="lang-' + lang + '">' + window.highlight(source.trim(), lang) + '</code></pre></div></div>';
  }

  function copyText(text, btn) {
    function done() {
      var old = btn.dataset.label || btn.textContent;
      btn.dataset.label = old;
      btn.textContent = '복사됨 ✓'; btn.classList.add('is-done');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('is-done'); }, 1200);
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { btn.textContent = '복사 실패'; }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  function select(n, skipHash) {
    var e = DATA.find(function (x) { return x.n === n; });
    if (!e) return;

    document.querySelectorAll('.nav-item').forEach(function (b) {
      b.classList.toggle('is-active', Number(b.dataset.n) === n);
    });

    detail.innerHTML =
      '<div class="detail__head">' +
        '<span class="detail__no">' + (e.n < 10 ? '0' + e.n : e.n) + '</span>' +
        '<h2 class="detail__title">' + e.name + '</h2>' +
        '<span class="detail__ko">' + e.ko + '</span>' +
        '<span class="badge">' + CATS[e.cat].label + '</span>' +
      '</div>' +
      '<p class="detail__desc">' + e.desc + '</p>' +
      '<div class="tabs" role="tablist">' +
        '<button class="tab is-active" role="tab" data-tab="preview">미리보기</button>' +
        '<button class="tab" role="tab" data-tab="html">HTML</button>' +
        '<button class="tab" role="tab" data-tab="css">CSS</button>' +
        '<button class="tab" role="tab" data-tab="js">JS</button>' +
      '</div>' +
      '<div class="panel" data-tab="preview"><iframe class="preview-frame" title="미리보기" sandbox="allow-scripts"></iframe></div>' +
      codeBlock('HTML', e.html, 'html') +
      codeBlock('CSS', e.css, 'css') +
      codeBlock('JavaScript', e.js, 'js');

    detail.querySelector('.preview-frame').srcdoc = buildSrcdoc(e);

    detail.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        var key = t.dataset.tab;
        detail.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('is-active', x === t); });
        detail.querySelectorAll('.panel').forEach(function (p) { p.hidden = p.dataset.tab !== key; });
      });
    });

    detail.querySelectorAll('.code-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.dataset.src;
        copyText((src === 'html' ? e.html : src === 'css' ? e.css : e.js).trim(), btn);
      });
    });

    document.title = e.name + ' · UI 컴포넌트 사전';
    if (!skipHash) history.replaceState(null, '', '#' + e.n);
    detail.parentElement.scrollTop = 0;
  }

  document.getElementById('menuToggle').addEventListener('click', function () {
    side.classList.toggle('is-open');
  });

  function fromHash() {
    var n = parseInt(location.hash.slice(1), 10);
    select(DATA.some(function (x) { return x.n === n; }) ? n : 1, true);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
