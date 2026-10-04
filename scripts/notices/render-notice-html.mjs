/** 고지 모델 -> 독립 실행 가능한 HTML 페이지. (React/외부 런타임 의존 없음) */
import { NOTICE_SCRIPT, NOTICE_STYLES } from './notice-assets.mjs';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderToc(entries) {
  const items = entries
    .map(
      (entry) => `      <li><a href="#${entry.anchor}" data-toc="${entry.anchor}">
        <span class="num">${entry.index}.</span>
        <span>${escapeHtml(entry.name)}</span>
        <span class="lic">${escapeHtml(entry.licenseId)}</span>
      </a></li>`,
    )
    .join('\n');
  return `    <ol class="toc">\n${items}\n    </ol>`;
}

function renderEntry(entry) {
  const search = [entry.name, entry.description, entry.licenseId, entry.copyright]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const links = [
    entry.repositoryUrl
      ? `<a href="${escapeHtml(entry.repositoryUrl)}" target="_blank" rel="noreferrer noopener">저장소</a>`
      : null,
    `<a href="#license-${entry.licenseId.toLowerCase()}">라이선스 전문</a>`,
    entry.licenseFileName
      ? `<span class="entry-links" style="margin:0;color:var(--muted)">원본 파일: ${escapeHtml(entry.licenseFileName)}</span>`
      : null,
  ]
    .filter(Boolean)
    .join('\n        ');

  return `      <article class="entry" id="${entry.anchor}" data-search="${escapeHtml(search)}">
        <div class="entry-head">
          <span class="num">${entry.index}.</span>
          <span class="entry-name">${escapeHtml(entry.name)}</span>
          <span class="entry-version">v${escapeHtml(entry.version)}</span>
          <span class="lic">${escapeHtml(entry.licenseId)}</span>
        </div>
        ${entry.description ? `<p class="entry-desc">${escapeHtml(entry.description)}</p>` : ''}
        <pre class="copyright">${escapeHtml(entry.copyright || '(저작권 문구가 기재된 원본 라이선스 파일을 참조하십시오.)')}</pre>
        <div class="entry-links">
        ${links}
        </div>
      </article>`;
}

function renderGroup(group) {
  return `      <h3>${escapeHtml(group.name)}</h3>\n${group.entries.map(renderEntry).join('\n')}`;
}

function renderSection(section) {
  return `    <section id="scope-${section.scope}">
      <h2>${escapeHtml(section.title)}</h2>
      <p class="lead">${escapeHtml(section.description)}</p>
${section.groups.map(renderGroup).join('\n')}
    </section>`;
}

function renderLicenseTextBlock(licenseText) {
  return `    <details class="license-text" id="license-${licenseText.licenseId.toLowerCase()}" open>
      <summary>${escapeHtml(licenseText.title)}</summary>
      <pre>${escapeHtml(licenseText.text.trim())}</pre>
    </details>`;
}

export function renderNoticeHtml(model) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>오픈소스 소프트웨어 고지서 · ${escapeHtml(model.productName)}</title>
    <style>${NOTICE_STYLES}</style>
  </head>
  <body>
    <div class="wrap">
      <header class="hero">
        <h1>오픈소스 소프트웨어 고지서 (Open Source Notice)</h1>
        <p class="subtitle">${escapeHtml(model.productName)} v${escapeHtml(model.version)} 에 포함된 오픈소스 소프트웨어의 저작권 및 라이선스 정보입니다.</p>
        <div class="badges">
          <span class="badge badge-license">본 제품 라이선스: ${escapeHtml(model.projectLicenseId)}</span>
          <span class="badge badge-version">고지 대상 ${model.totals.packages}개 · 라이선스 ${model.totals.licenses}종</span>
        </div>
      </header>

      <section>
        <h2>1. 본 제품에 대하여</h2>
        <div class="card">
          <dl class="meta">
            <dt>제품명</dt><dd>${escapeHtml(model.productName)}</dd>
            <dt>버전</dt><dd>${escapeHtml(model.version)}</dd>
            <dt>라이선스</dt><dd>${escapeHtml(model.projectLicenseId)}</dd>
            <dt>저작권</dt><dd>${escapeHtml(model.copyrightLine)}</dd>
            <dt>원본 소스</dt><dd><a href="${escapeHtml(model.sourceUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(model.sourceUrl)}</a></dd>
            <dt>문의처</dt><dd><a href="mailto:${escapeHtml(model.contactEmail)}">${escapeHtml(model.contactEmail)}</a></dd>
          </dl>
        </div>
        <div class="notice-box">
          <p><strong>소스 코드 공개 안내 (${escapeHtml(model.projectLicenseId)} 제13조).</strong></p>
          <p>${escapeHtml(model.productName)}는 네트워크를 통해 제공되는 소프트웨어입니다. 본 제품에 접속하여 이를 수정·실행하는 경우에도 원본 소스 코드를 아래 경로에서 받아 사용할 수 있습니다.</p>
          <p><a href="${escapeHtml(model.sourceUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(model.sourceUrl)}</a></p>
          <p class="lead">전체 소스 코드를 통째로 제공받아 COPYING 파일(라이선스 전문)을 함께 보존하여 자유롭게 이용하실 수도 있습니다.</p>
        </div>
      </section>

      <section>
        <h2>2. 고지 대상 목록 (Table of Contents)</h2>
        <div class="toolbar">
          <input id="notice-search" type="search" placeholder="패키지명, 설명, 저작권자 검색" aria-label="패키지 검색" />
          <span class="count" id="notice-count"></span>
        </div>
${renderToc(model.entries)}
      </section>

${model.sections.map(renderSection).join('\n')}

      <section>
        <h2>${escapeHtml(String(model.sections.length + 2))}. 라이선스 전문</h2>
        <p class="lead">아래 전문은 각 패키지 배포물에 포함되는 라이선스 원문과 동일합니다.</p>
${model.licenseTexts.map(renderLicenseTextBlock).join('\n')}
      </section>

      <footer class="page-foot">
        <p>본 고지서는 <code>package.json</code>의 프로덕션 의존성과 설치된 <code>node_modules</code> 트리에서 자동으로 생성되었습니다.</p>
        <p>라이브러리 추가·삭제 시 <code>pnpm run notices</code>로 본 문서를 다시 생성하십시오. 문의: <a href="mailto:${escapeHtml(model.contactEmail)}">${escapeHtml(model.contactEmail)}</a></p>
      </footer>
    </div>
    <script>${NOTICE_SCRIPT}</script>
  </body>
</html>
`;
}