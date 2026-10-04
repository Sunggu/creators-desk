/**
 * 본 프로젝트 자체의 라이선스 메타데이터(notices/project.json) 로더와
 * SPDX 라이선스 ID -> 전문 원고 경로 레지스트리.
 * 앱 UI(src/core/project-license.ts)와 고지서 생성기가 같은 값을 사용한다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const PROJECT_LICENSE = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'notices', 'project.json'), 'utf8'),
);

/** SPDX 라이선스 ID -> 전문 텍스트 파일 경로 (저장소 루트 기준) */
const LICENSE_TEXT_FILES = {
  'AGPL-3.0': 'LICENSE',
  'MIT': 'notices/MIT.txt',
  'Apache-2.0': 'notices/Apache-2.0.txt',
};

const LICENSE_TITLES = {
  'AGPL-3.0': 'GNU Affero General Public License v3.0',
  'MIT': 'MIT License',
  'Apache-2.0': 'Apache License, Version 2.0',
};

export function licenseTextFileFor(licenseId) {
  return LICENSE_TEXT_FILES[licenseId] ?? null;
}

export function licenseTitleFor(licenseId) {
  return LICENSE_TITLES[licenseId] ?? licenseId;
}

export function isKnownLicenseId(licenseId) {
  return Object.hasOwn(LICENSE_TEXT_FILES, licenseId);
}