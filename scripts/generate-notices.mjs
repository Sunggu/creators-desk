#!/usr/bin/env node
/**
 * 오픈소스 고지서 자동 생성기.
 *   node scripts/generate-notices.mjs          public/notice.html + THIRD-PARTY-NOTICES.txt 생성
 *   node scripts/generate-notices.mjs --check  생성물이 최신 상태인지 검증만 수행 (CI용)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildNoticeModel } from './notices/build-notice-model.mjs';
import { collectDependencyClosure, selectBuildOutputRoots } from './notices/collect-runtime-deps.mjs';
import { mergeCatalog } from './notices/merge-catalog.mjs';
import {
  PROJECT_LICENSE,
  licenseTextFileFor,
  licenseTitleFor,
} from './notices/project-license.mjs';
import { renderNoticeHtml } from './notices/render-notice-html.mjs';
import { renderNoticeText } from './notices/render-notice-text.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function collectNoticeEntries() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const catalog = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'notices', 'catalog.json'), 'utf8'),
  );
  const catalogNames = Object.keys(catalog.packages ?? {});
  const collected = collectDependencyClosure(ROOT, Object.keys(manifest.dependencies ?? {}));
  const buildRoots = selectBuildOutputRoots(manifest, collected, catalogNames);
  for (const meta of collectDependencyClosure(ROOT, buildRoots).values()) {
    meta.scopeHint = 'build-output';
    collected.set(meta.name, meta);
  }

  const result = mergeCatalog(collected, catalog);
  return { ...result, version: manifest.version };
}

function loadLicenseTexts(licenseIds) {
  const texts = new Map();
  for (const licenseId of licenseIds) {
    const relative = licenseTextFileFor(licenseId);
    if (!relative) continue;
    texts.set(licenseId, {
      title: licenseTitleFor(licenseId),
      text: fs.readFileSync(path.join(ROOT, relative), 'utf8'),
    });
  }
  return texts;
}

export function buildNoticeArtifacts() {
  const { entries, errors, warnings, version } = collectNoticeEntries();
  if (errors.length > 0) {
    throw new Error(`고지서 생성 실패:\n  - ${errors.join('\n  - ')}`);
  }
  const model = buildNoticeModel({
    project: PROJECT_LICENSE,
    version,
    entries,
    licenseTexts: loadLicenseTexts([...new Set(entries.map((e) => e.licenseId))]),
  });
  if (model.missingLicenseTexts.length > 0) {
    throw new Error(`라이선스 전문 원고 누락: ${model.missingLicenseTexts.join(', ')}`);
  }
  return {
    warnings,
    totals: model.totals,
    files: [
      { path: PROJECT_LICENSE.noticePagePath, content: renderNoticeHtml(model) },
      { path: PROJECT_LICENSE.textNoticePath, content: renderNoticeText(model) },
    ],
  };
}

function run() {
  const checkOnly = process.argv.includes('--check');
  const { warnings, totals, files } = buildNoticeArtifacts();

  for (const warning of warnings) console.warn(`  경고  ${warning}`);
  console.log(`  고지 대상 ${totals.packages}개 패키지 / ${totals.licenses}종 라이선스`);

  const stale = [];
  for (const file of files) {
    const target = path.join(ROOT, file.path);
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    if (current === file.content) continue;
    if (checkOnly) {
      stale.push(file.path);
    } else {
      fs.writeFileSync(target, file.content);
      console.log(`  생성  ${file.path}`);
    }
  }

  if (stale.length > 0) {
    console.error(
      `\n  고지서가 최신 상태가 아닙니다: ${stale.join(', ')}\n  'pnpm run notices' 를 실행하십시오.`,
    );
    process.exitCode = 1;
    return;
  }
  console.log('  확인  고지서 최신 상태');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();