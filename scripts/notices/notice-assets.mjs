/** 고지 페이지 인라인 스타일. 외부 폰트/스크립트 의존 없이 단일 파일로 동작한다. */
export const NOTICE_STYLES = `
:root {
  --bg: #121215;
  --surface: #18181b;
  --surface-2: #1e1e24;
  --border: #2a2a32;
  --text: #d4d4d8;
  --text-strong: #fafafa;
  --muted: #a1a1aa;
  --accent: #a78bfa;
  --ok: #6ee7b7;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  font-size: 14px;
  line-height: 1.7;
}
.wrap { max-width: 60rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
header.hero {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: linear-gradient(160deg, #1c1b22, var(--surface));
  padding: 1.75rem;
}
h1 { margin: 0 0 .35rem; font-size: 1.5rem; color: var(--text-strong); letter-spacing: -.01em; }
.subtitle { margin: 0; color: var(--muted); font-size: .82rem; }
.badges { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: 1rem; }
.badge {
  border-radius: 6px; padding: .15rem .5rem; font-size: .72rem; font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.badge-license { background: rgba(167,139,250,.16); color: #c4b5fd; border: 1px solid rgba(167,139,250,.3); }
.badge-version { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }
section { margin-top: 2.25rem; }
h2 { margin: 0 0 .5rem; font-size: 1.1rem; color: var(--text-strong); }
h3 { margin: 1.5rem 0 .6rem; font-size: .92rem; color: var(--text-strong); }
p { margin: .5rem 0; }
.lead { color: var(--muted); font-size: .82rem; }
.card { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: 1.25rem; }
.card + .card { margin-top: .75rem; }
a { color: var(--accent); }
a:hover { color: #c4b5fd; }
dl.meta { display: grid; grid-template-columns: 8.5rem 1fr; gap: .4rem 1rem; margin: 0; font-size: .82rem; }
dl.meta dt { color: var(--muted); }
dl.meta dd { margin: 0; color: var(--text); word-break: break-all; }
.notice-box { border-left: 3px solid var(--ok); background: rgba(110,231,183,.07); padding: .85rem 1rem; border-radius: 0 8px 8px 0; }
.toolbar { display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; margin: 1.25rem 0 .5rem; }
.toolbar input {
  flex: 1 1 16rem; padding: .5rem .75rem; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface-2); color: var(--text); font-size: .85rem; outline: none;
}
.toolbar input:focus { border-color: var(--accent); }
.count { color: var(--muted); font-size: .78rem; }
ol.toc { list-style: none; padding: 0; margin: .5rem 0 0; }
ol.toc li { border-bottom: 1px solid var(--border); }
ol.toc li:last-child { border-bottom: 0; }
ol.toc a { display: flex; flex-wrap: wrap; gap: .5rem; align-items: baseline; padding: .5rem .25rem; text-decoration: none; font-size: .84rem; }
ol.toc a:hover { background: var(--surface); }
.num { color: var(--muted); font-family: ui-monospace, monospace; font-size: .75rem; min-width: 1.6rem; }
.lic { margin-left: auto; font-size: .68rem; font-family: ui-monospace, monospace; padding: .05rem .4rem; border-radius: 4px; background: rgba(167,139,250,.14); color: #c4b5fd; }
.entry { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: 1.1rem; scroll-margin-top: 1rem; }
.entry + .entry { margin-top: .6rem; }
.entry-head { display: flex; flex-wrap: wrap; gap: .5rem; align-items: baseline; }
.entry-name { color: var(--text-strong); font-weight: 600; font-size: .95rem; }
.entry-version { color: var(--muted); font-family: ui-monospace, monospace; font-size: .78rem; }
.entry-desc { margin: .4rem 0 0; color: var(--muted); font-size: .82rem; }
.copyright { margin: .55rem 0 0; padding: .5rem .7rem; border-radius: 6px; background: #101013; border: 1px solid #23232b; font-family: ui-monospace, monospace; font-size: .74rem; white-space: pre-wrap; word-break: break-word; color: #c9c9d1; }
.entry-links { margin-top: .55rem; font-size: .78rem; }
.entry-links a { margin-right: .9rem; }
details.license-text { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: .85rem 1.1rem; }
details.license-text + details.license-text { margin-top: .6rem; }
details.license-text summary { cursor: pointer; color: var(--text-strong); font-weight: 600; font-size: .88rem; }
details.license-text pre { margin: .85rem 0 0; padding: .9rem; border-radius: 8px; background: #0d0d10; border: 1px solid #23232b; overflow-x: auto; font-size: .72rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; color: #b9b9c2; }
.hidden { display: none !important; }
footer.page-foot { margin-top: 3rem; padding-top: 1.25rem; border-top: 1px solid var(--border); color: var(--muted); font-size: .76rem; }
@media print {
  body { background: #fff; color: #000; }
  .toolbar { display: none; }
  .card, .entry, details.license-text, header.hero { border-color: #ccc; background: #fff; }
  details.license-text[open] pre, pre { color: #000; background: #fafafa; border-color: #ddd; }
  a { color: #000; }
}
`;

/** 고지 페이지 인라인 스크립트 (검색 필터만 담당, 외부 라이브러리 미사용). */
export const NOTICE_SCRIPT = `
(function () {
  var input = document.getElementById('notice-search');
  var count = document.getElementById('notice-count');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc]'));
  function apply() {
    var query = input.value.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var hit = !query || card.dataset.search.toLowerCase().indexOf(query) !== -1;
      card.classList.toggle('hidden', !hit);
      if (hit) visible += 1;
    });
    tocLinks.forEach(function (link) {
      link.classList.toggle('hidden', query !== '' && document.getElementById(link.dataset.toc).classList.contains('hidden'));
    });
    count.textContent = query
      ? visible + ' / ' + cards.length + ' 개 표시'
      : '총 ' + cards.length + '개 패키지';
  }
  input.addEventListener('input', apply);
  apply();
})();
`;