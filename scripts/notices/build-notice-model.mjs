/** 고지서 렌더러가 소비하는 순수 고지 모델을 만든다. */

const SCOPE_SECTIONS = [
  {
    scope: 'bundled',
    title: '1. 배포물에 포함된 오픈소스 소프트웨어',
    description:
      '브라우저 번들, 서버 번들, 프로덕션 이미지(node_modules)에 함께 배포되는 패키지입니다.',
  },
  {
    scope: 'build-output',
    title: '2. 배포물 생성에 반영된 빌드 단계 라이브러리',
    description: '빌드 단계에서 배포물(CSS 등)에 코드가 반영되는 패키지입니다.',
  },
];

const UNGROUPED = '기타 오픈소스';

export function toAnchor(name) {
  return `pkg-${name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}`;
}

function groupByScopeAndGroup(entries) {
  const sections = SCOPE_SECTIONS.map((section) => {
    const scoped = entries.filter((entry) => entry.scope === section.scope);
    const groupNames = [...new Set(scoped.map((entry) => entry.group))].sort((a, b) =>
      a === UNGROUPED ? 1 : b === UNGROUPED ? -1 : a.localeCompare(b, 'ko'),
    );
    return {
      ...section,
      groups: groupNames.map((name) => ({
        name,
        entries: scoped
          .filter((entry) => entry.group === name)
          .sort((a, b) => a.name.localeCompare(b.name, 'en')),
      })),
    };
  });
  return sections.filter((section) => section.groups.length > 0);
}

function collectLicenseIds(entries) {
  return [...new Set(entries.map((entry) => entry.licenseId))].sort((a, b) =>
    a.localeCompare(b, 'en'),
  );
}

/**
 * @param {{ project: object, version: string, entries: object[], licenseTexts: Map<string, {title: string, text: string}> }} input
 */
export function buildNoticeModel({ project, version, entries, licenseTexts }) {
  let index = 0;
  const sections = groupByScopeAndGroup(entries).map((section) => ({
    ...section,
    groups: section.groups.map((group) => ({
      ...group,
      entries: group.entries.map((entry) => ({
        ...entry,
        index: (index += 1),
        anchor: toAnchor(entry.name),
      })),
    })),
  }));

  const flat = sections.flatMap((section) => section.groups.flatMap((group) => group.entries));
  const licenseIds = collectLicenseIds(flat);

  return {
    productName: project.productName,
    version,
    projectLicenseId: project.licenseId,
    copyrightLine: `Copyright (C) ${project.copyrightYear} ${project.copyrightHolder}`,
    sourceUrl: project.sourceUrl,
    contactEmail: project.contactEmail,
    noticePageFileName: 'notice.html',
    sections,
    entries: flat,
    licenseTexts: licenseIds
      .filter((licenseId) => licenseTexts.has(licenseId))
      .map((licenseId) => ({ licenseId, ...licenseTexts.get(licenseId) })),
    missingLicenseTexts: licenseIds.filter((licenseId) => !licenseTexts.has(licenseId)),
    totals: { packages: flat.length, licenses: licenseIds.length },
  };
}