import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  collectNoticeEntries,
} from '../generate-notices.mjs';
import { buildNoticeModel } from './build-notice-model.mjs';
import { PROJECT_LICENSE, licenseTextFileFor, licenseTitleFor } from './project-license.mjs';
import { renderNoticeHtml } from './render-notice-html.mjs';
import { renderNoticeText } from './render-notice-text.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

function readRepoJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function loadLicenseTexts(licenseIds) {
  return new Map(
    licenseIds.map((licenseId) => [
      licenseId,
      {
        title: licenseTitleFor(licenseId),
        text: fs.readFileSync(path.join(ROOT, licenseTextFileFor(licenseId)), 'utf8'),
      },
    ]),
  );
}

describe('라이선스 원고 (notices/)', () => {
  it('제공하는 전문이 실제 배포물 라이선스와 일치하는지 검증', () => {
    const mit = fs.readFileSync(path.join(ROOT, 'notices', 'MIT.txt'), 'utf8');
    const reactLicense = fs.readFileSync(
      path.join(ROOT, 'node_modules', 'react', 'LICENSE'),
      'utf8',
    );
    expect(normalizeForCompare(mit)).toBe(normalizeForCompare(reactLicense));
  });

  it('Apache-2.0 원고가 apache.org 정본과 동일한 조항을 담는지 검증', () => {
    const apache = fs.readFileSync(path.join(ROOT, 'notices', 'Apache-2.0.txt'), 'utf8');
    expect(apache).toContain('Apache License');
    expect(apache).toContain('Version 2.0, January 2004');
    expect(apache).toContain('APPENDIX: How to apply the Apache License to your work.');
  });

  function normalizeForCompare(text) {
    return text
      .replace(/<year>|<copyright holders>/g, 'X')
      .replace(/Copyright \(c\).*?\n/, 'Copyright X\n')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim();
  }
});

describe('카탈로그 정합성 (notices/catalog.json)', () => {
  const catalog = readRepoJson('notices/catalog.json');
  const names = Object.keys(catalog.packages);

  it('고지 대상 패키지마다 한국어 설명이 기재되어 있다', () => {
    const missing = names.filter((name) => !catalog.packages[name].description);
    expect(missing).toEqual([]);
  });

  it('고지 대상 패키지마다 그룹이 기재되어 있다', () => {
    const missing = names.filter((name) => !catalog.packages[name].group);
    expect(missing).toEqual([]);
  });
});

describe('프로젝트 자체 라이선스 (notices/project.json + LICENSE)', () => {
  it('프로젝트가 AGPL-3.0 으로 선언되어 있다', () => {
    expect(PROJECT_LICENSE.licenseId).toBe('AGPL-3.0');
  });

  it('LICENSE 원고가 선언된 라이선스와 일치한다', () => {
    expect(licenseTextFileFor(PROJECT_LICENSE.licenseId)).toBe('LICENSE');
    const license = fs.readFileSync(path.join(ROOT, 'LICENSE'), 'utf8');
    expect(license).toContain('GNU AFFERO GENERAL PUBLIC LICENSE');
    expect(license).toContain('Version 3, 19 November 2007');
  });

  it('고지 대상이 아닌 빌드 도구 라이선스를 제품 라이선스로 표기하지 않는다', () => {
    expect(PROJECT_LICENSE.licenseId).not.toBe('MIT');
    expect(PROJECT_LICENSE.licenseId).not.toBe('Apache-2.0');
  });

  it('고지서 출력 경로가 실제 산출물 경로와 일치한다', () => {
    expect(fs.existsSync(path.join(ROOT, PROJECT_LICENSE.noticePagePath))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, PROJECT_LICENSE.textNoticePath))).toBe(true);
  });
});

describe('생성된 고지서 최신 상태', () => {
  const { entries, errors, warnings, version } = collectNoticeEntries();

  it('수집 및 병합 과정에서 오류가 없다', () => {
    expect(errors).toEqual([]);
  });

  it('고의적 누락이 없다 (경고만 허용)', () => {
    expect(warnings).toEqual([]);
  });

  it('고지 대상 패키지가 1개 이상이다', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it('모든 고지 대상에 저작권 문구가 있다', () => {
    const missing = entries.filter((entry) => !entry.copyright);
    expect(missing.map((entry) => entry.name)).toEqual([]);
  });

  it('모든 고지 대상에 원본 라이선스 파일명이 있다', () => {
    const missing = entries.filter((entry) => !entry.licenseFileName);
    expect(missing.map((entry) => entry.name)).toEqual([]);
  });

  it('public/notice.html 과 THIRD-PARTY-NOTICES.txt 가 최신이다', () => {
    const model = buildNoticeModel({
      project: PROJECT_LICENSE,
      version,
      entries,
      licenseTexts: loadLicenseTexts([...new Set(entries.map((entry) => entry.licenseId))]),
    });
    const files = [
      ['public/notice.html', renderNoticeHtml(model)],
      ['THIRD-PARTY-NOTICES.txt', renderNoticeText(model)],
    ];
    const stale = files
      .filter(([relativePath, content]) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8') !== content)
      .map(([relativePath]) => relativePath);
    expect(stale).toEqual([]);
  });
});