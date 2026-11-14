/* 의존성 없는 간단한 코드 하이라이터: highlight(source, 'html'|'css'|'js') → 안전하게 이스케이프된 HTML */
(function (root) {
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function span(cls, s) { return '<span class="tk-' + cls + '">' + esc(s) + '</span>'; }

  // 정규식으로 토큰을 순서대로 찾고, 사이의 일반 텍스트는 이스케이프만 한다.
  function run(src, re, fn) {
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      out += esc(src.slice(last, m.index)) + fn(m);
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  var JS_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(var|let|const|function|return|if|else|for|while|new|this|typeof|true|false|null|undefined|break|continue|switch|case)\b|(\b\d+(?:\.\d+)?\b)|\b([A-Za-z_$][\w$]*)(?=\()/g;
  function js(src) {
    return run(src, JS_RE, function (m) {
      if (m[1]) return span('c', m[1]);
      if (m[2]) return span('s', m[2]);
      if (m[3]) return span('k', m[3]);
      if (m[4]) return span('n', m[4]);
      return span('f', m[5]);
    });
  }

  var CSS_RE = /(\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|([^{}@;"']+?)(\{)|([\w-]+)(\s*:)|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|em|rem|%|ms|s|vh|vw|deg)?(?![\w-]))/g;
  function css(src) {
    return run(src, CSS_RE, function (m) {
      if (m[1]) return span('c', m[1]);
      if (m[2]) return span('s', m[2]);
      if (m[3] !== undefined) return span('t', m[3]) + esc(m[4]);
      if (m[5]) return span('a', m[5]) + esc(m[6]);
      if (m[7]) return span('n', m[7]);
      return span('n', m[8]);
    });
  }

  var HTML_RE = /(<!--[\s\S]*?-->)|(<\/?)([A-Za-z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?>)/g;
  var ATTR_RE = /([^\s=>\/]+)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s>]+)?/g;
  function html(src) {
    return run(src, HTML_RE, function (m) {
      if (m[1]) return span('c', m[1]);
      var attrs = run(m[4], ATTR_RE, function (a) {
        return span('a', a[1]) + (a[2] ? esc(a[2]) : '') + (a[3] ? span('s', a[3]) : '');
      });
      return span('p', m[2]) + span('t', m[3]) + attrs + span('p', m[5]);
    });
  }

  root.highlight = function (src, lang) {
    var f = lang === 'html' ? html : lang === 'css' ? css : js;
    return f(src);
  };
})(typeof window !== 'undefined' ? window : globalThis);
