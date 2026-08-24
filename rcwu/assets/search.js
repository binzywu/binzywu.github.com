/* Client-side search for Runchen's Brain — plain JS, no deps.
   Fetches search-index.json (built by build.py) once, then filters on input. */
(function () {
  var input = document.getElementById('q');
  var list = document.getElementById('search-results');
  if (!input || !list) return;
  var root = window.__ROOT__ || '';
  var idx = null, results = [], active = -1;

  function load() {
    if (idx) return Promise.resolve(idx);
    return fetch(root + 'search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { idx = d; return d; })
      .catch(function () { idx = []; return idx; });
  }
  function tokens(q) { return q.toLowerCase().split(/\s+/).filter(Boolean); }
  function score(rec, toks) {
    var t = rec.title.toLowerCase();
    var tags = (rec.tags || []).join(' ').toLowerCase();
    var body = (rec.text || '').toLowerCase();
    var s = 0;
    for (var i = 0; i < toks.length; i++) {
      var tok = toks[i];
      var inT = t.indexOf(tok) >= 0, inTag = tags.indexOf(tok) >= 0, inB = body.indexOf(tok) >= 0;
      if (!(inT || inTag || inB)) return 0;
      if (inT) s += 5;
      if (inTag) s += 3;
      if (inB) s += 1;
      if (t.indexOf(tok) === 0) s += 3;
    }
    return s;
  }
  function snippet(rec, toks) {
    var body = rec.text || ''; if (!body) return '';
    var lb = body.toLowerCase(), pos = -1;
    for (var i = 0; i < toks.length; i++) {
      var p = lb.indexOf(toks[i]);
      if (p >= 0 && (pos < 0 || p < pos)) pos = p;
    }
    if (pos < 0) pos = 0;
    var start = Math.max(0, pos - 40);
    return (start > 0 ? '…' : '') + body.slice(start, start + 140) + (start + 140 < body.length ? '…' : '');
  }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function hl(text, toks) {
    var out = esc(text);
    toks.forEach(function (tok) {
      if (!tok) return;
      var re = new RegExp('(' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }
  function close() { list.hidden = true; list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); active = -1; }
  function render(q) {
    var toks = tokens(q);
    if (!toks.length) { close(); return; }
    results = (idx || []).map(function (r) { return { r: r, s: score(r, toks) }; })
      .filter(function (o) { return o.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 8).map(function (o) { return o.r; });
    active = -1;
    if (!results.length) {
      list.innerHTML = '<li class="search-empty" aria-disabled="true">No matches</li>';
    } else {
      list.innerHTML = results.map(function (r, i) {
        return '<li role="option" data-i="' + i + '" id="sr-' + i + '">'
          + '<a href="' + root + r.url + '">'
          + '<span class="sr-top"><span class="sr-title">' + hl(r.title, toks) + '</span>'
          + '<span class="sr-type">' + esc(r.type) + '</span></span>'
          + '<span class="sr-snip">' + hl(snippet(r, toks), toks) + '</span></a></li>';
      }).join('');
    }
    list.hidden = false; input.setAttribute('aria-expanded', 'true');
  }
  function setActive(n) {
    var items = list.querySelectorAll('li[role=option]');
    if (!items.length) return;
    active = (n + items.length) % items.length;
    for (var i = 0; i < items.length; i++) items[i].classList.toggle('active', i === active);
    input.setAttribute('aria-activedescendant', 'sr-' + active);
    items[active].scrollIntoView({ block: 'nearest' });
  }
  function go() {
    var pick = (active >= 0 && results[active]) ? results[active] : results[0];
    if (pick) location.href = root + pick.url;
  }
  input.addEventListener('focus', function () { load().then(function () { if (input.value.trim()) render(input.value); }); });
  input.addEventListener('input', function () { load().then(function () { render(input.value); }); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { if (!list.hidden) { e.preventDefault(); go(); } }
    else if (e.key === 'Escape') { close(); input.blur(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) close(); });
})();
