/** npm `license` 필드 및 라이선스 전문 텍스트에서 SPDX ID와 저작권 문구를 추출한다. */

const SPDX_ALIASES = new Map([
  ['mit', 'MIT'],
  ['apache-2.0', 'Apache-2.0'],
  ['apache 2.0', 'Apache-2.0'],
  ['apache2', 'Apache-2.0'],
  ['agpl-3.0', 'AGPL-3.0'],
  ['agpl3', 'AGPL-3.0'],
  ['gpl-3.0', 'GPL-3.0'],
  ['gpl3', 'GPL-3.0'],
  ['isc', 'ISC'],
  ['bsd-3-clause', 'BSD-3-Clause'],
  ['bsd-2-clause', 'BSD-2-Clause'],
  ['unlicense', 'Unlicense'],
  ['cc0-1.0', 'CC0-1.0'],
]);

const TEXT_SIGNATURES = [
  [/Permission is hereby granted, free of charge/, 'MIT'],
  [/Apache License[\s\S]{0,80}Version 2\.0/, 'Apache-2.0'],
  [/GNU AFFERO GENERAL PUBLIC LICENSE/, 'AGPL-3.0'],
  [/GNU GENERAL PUBLIC LICENSE[\s\S]{0,40}Version 3/, 'GPL-3.0'],
  [/Permission to use, copy, modify, and\/or distribute this software/, 'ISC'],
];

const COPYRIGHT_LINE = /^(copyright|\(c\)|©)/i;

/** package.json 의 license / licenses 필드를 SPDX ID로 정규화한다. */
export function normalizeLicenseId(raw) {
  if (typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return SPDX_ALIASES.get(key) ?? (key === '' ? null : raw.trim());
}

/** 여러 형태의 license 필드에서 하나의 후보 문자열을 추출한다. */
function readRawLicenseField(packageJson) {
  if (typeof packageJson?.license === 'string') return packageJson.license;
  const entry = packageJson?.licenses;
  if (Array.isArray(entry) && typeof entry[0]?.type === 'string') return entry[0].type;
  return null;
}

/** package.json 필드를 우선 사용하고, 없으면 라이선스 전문 서명을 검사한다. */
export function detectLicenseId(packageJson, licenseText) {
  const fromField = normalizeLicenseId(readRawLicenseField(packageJson));
  if (fromField) return { licenseId: fromField, detectedBy: 'package.json' };
  for (const [pattern, licenseId] of TEXT_SIGNATURES) {
    if (licenseText && pattern.test(licenseText)) {
      return { licenseId, detectedBy: 'license-text' };
    }
  }
  return null;
}

/** 라이선스 전문에서 저작권 고지 문구만 추출한다 (조건 조항은 제외). */
export function extractCopyrightLines(licenseText) {
  if (!licenseText) return [];
  const lines = licenseText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => COPYRIGHT_LINE.test(line));
  return [...new Set(lines)].slice(0, 3);
}