/** 고지 모델 -> 배포물 동봉용 평문 고지서 (PC 설치물 / 컨테이너 이미지용). */

const WIDTH = 70;
const RULE = '='.repeat(WIDTH);
const THIN_RULE = '-'.repeat(WIDTH);

function pad(index) {
  return String(index).padStart(2, ' ');
}

function renderEntry(entry) {
  const lines = [
    `${THIN_RULE}`,
    `${pad(entry.index)}. ${entry.name} (v${entry.version}) - ${entry.licenseId}`,
    `${THIN_RULE}`,
  ];
  if (entry.description) lines.push(entry.description);
  lines.push('');
  lines.push(entry.copyright || '(저작권 문구는 원본 라이선스 파일을 참조하십시오.)');
  if (entry.repositoryUrl) lines.push(`Source: ${entry.repositoryUrl}`);
  if (entry.licenseFileName) lines.push(`License file: ${entry.licenseFileName}`);
  lines.push('');
  return lines.join('\n');
}

function renderSection(section) {
  const blocks = section.groups.map((group) =>
    [`[${group.name}]`, '', ...group.entries.map(renderEntry)].join('\n'),
  );
  return [
    '',
    '',
    section.title,
    RULE,
    '',
    section.description,
    '',
    ...blocks,
  ].join('\n');
}

export function renderNoticeText(model) {
  const toc = model.entries
    .map((entry) => `${pad(entry.index)}. ${entry.name} (v${entry.version}) - ${entry.licenseId}`)
    .join('\n');

  const head = [
    RULE,
    'Open Source Software Notice',
    RULE,
    '',
    `${model.productName} (version ${model.version}) 는 오픈소스 소프트웨어를 사용하고 있습니다.`,
    '본 고지서는 배포물에 포함된 오픈소스 소프트웨어의 저작권 및 라이선스 정보를 기술합니다.',
    '',
    `문의처: ${model.contactEmail}`,
    `원본 소스: ${model.sourceUrl}`,
    '',
    THIN_RULE,
    `본 제품 라이선스: ${model.projectLicenseId}`,
    `저작권: ${model.copyrightLine}`,
    `소스 코드 공개 (${model.projectLicenseId} 제13조): 네트워크를 통해 제공되는 본 제품에 대해서도`,
    `동일한 조건으로 원본 소스 코드를 제공합니다. ${model.sourceUrl}`,
    THIN_RULE,
    '',
    THIN_RULE,
    `목록 (Table of Contents) - 총 ${model.totals.packages}개 패키지 / ${model.totals.licenses}종 라이선스`,
    THIN_RULE,
    '',
    toc,
  ].join('\n');

  const texts = model.licenseTexts
    .map(
      (licenseText) =>
        `\n\n${THIN_RULE}\n${licenseText.title}\n${THIN_RULE}\n\n${licenseText.text.trim()}\n`,
    )
    .join('');

  return `${head}${model.sections.map(renderSection).join('\n')}${texts}\n${RULE}\n생성 도구: scripts/generate-notices.mjs (package.json 프로덕션 의존성 기준 자동 생성)\n${RULE}\n`;
}