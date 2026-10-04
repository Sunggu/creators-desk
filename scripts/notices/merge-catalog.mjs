/** 자동 수집 메타데이터에 카탈로그 보정값을 합치고 고지 대상 목록을 확정한다. */
import { isKnownLicenseId } from './project-license.mjs';

const FALLBACK_GROUP = '기타 오픈소스';

function toEntry(meta, overrides, defaultScope) {
  const scope = overrides.scope ?? meta.scopeHint ?? defaultScope ?? 'bundled';
  const group = (overrides.group ?? '').trim() || FALLBACK_GROUP;
  const copyright = overrides.copyright ?? meta.copyrightLines.join('\n');
  return {
    name: meta.name,
    version: meta.version,
    group,
    description: overrides.description ?? meta.description ?? '',
    repositoryUrl: overrides.repositoryUrl ?? meta.repositoryUrl ?? null,
    licenseId: overrides.licenseId ?? meta.licenseId,
    licenseFileName: meta.licenseFileName,
    copyright,
    scope,
  };
}

/**
 * @param {Map<string, object>} collected 자동 수집된 패키지 메타데이터
 * @param {object} catalog notices/catalog.json
 * @returns {{ entries: object[], errors: string[], warnings: string[] }}
 */
export function mergeCatalog(collected, catalog) {
  const overrides = catalog?.packages ?? {};
  const entries = [];
  const errors = [];
  const warnings = [];

  for (const meta of collected.values()) {
    const entry = toEntry(meta, overrides[meta.name] ?? {}, catalog?.defaultScope);
    if (!entry.licenseId) {
      errors.push(
        `${entry.name}@${entry.version}: 라이선스를 판별할 수 없습니다. ` +
          'package.json license 필드 또는 notices/ 원고를 추가하세요.',
      );
      continue;
    }
    if (!isKnownLicenseId(entry.licenseId)) {
      errors.push(
        `${entry.name}@${entry.version}: '${entry.licenseId}' 원고가 없습니다. ` +
          `notices/${entry.licenseId}.txt 를 추가하세요.`,
      );
      continue;
    }
    if (!entry.copyright) {
      warnings.push(`${entry.name}@${entry.version}: 저작권 문구를 찾지 못했습니다.`);
    }
    entries.push(entry);
  }

  const names = new Set(collected.keys());
  for (const name of Object.keys(overrides)) {
    if (!names.has(name)) {
      warnings.push(`카탈로그에 '${name}' 이지만 배포물 의존성 트리에 없습니다.`);
    }
  }

  return { entries, errors, warnings };
}