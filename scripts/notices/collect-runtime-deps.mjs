/** 설치된 node_modules 트리를 직접 순회해 의존성 클로저를 수집한다. (YAML 파싱 불필요) */
import fs from 'node:fs';
import path from 'node:path';

import { detectLicenseId, extractCopyrightLines } from './detect-license.mjs';

const LICENSE_FILE = /^licen[sc]e(\.(txt|md))?$/i;
const REPOSITORY_FIELDS = ['repository', 'bugs'];

/** node 의 모듈 해석 규칙을 그대로 적용해 패키지 디렉터리를 찾는다. */
export function resolvePackageDir(name, fromDir) {
  let dir = path.resolve(fromDir);
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name);
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return fs.realpathSync(candidate);
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function readRepositoryUrl(packageJson) {
  for (const field of REPOSITORY_FIELDS) {
    const value = packageJson[field];
    const url = typeof value === 'string' ? value : value?.url;
    if (typeof url !== 'string') continue;
    return url
      .replace(/^git\+/, '')
      .replace(/\.git$/, '')
      .replace(/^git:\/\//, 'https://')
      .replace(/^git@github\.com:/, 'https://github.com/');
  }
  return null;
}

function findLicenseFile(dir) {
  return fs.readdirSync(dir).find((file) => LICENSE_FILE.test(file)) ?? null;
}

function readPackageMeta(dir) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const licenseFileName = findLicenseFile(dir);
  const licenseText = licenseFileName
    ? fs.readFileSync(path.join(dir, licenseFileName), 'utf8')
    : '';
  const detected = detectLicenseId(packageJson, licenseText);
  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description ?? '',
    repositoryUrl: readRepositoryUrl(packageJson) ?? packageJson.homepage ?? null,
    licenseId: detected?.licenseId ?? null,
    licenseDetectedBy: detected?.detectedBy ?? null,
    licenseFileName,
    copyrightLines: extractCopyrightLines(licenseText),
    dependencies: Object.keys(packageJson.dependencies ?? {}),
  };
}

/**
 * entryNames 를 루트로 삼아 재귀 의존성을 모두 수집한다.
 * 각 의존성은 선언된 부모 패키지의 디렉터리 기준으로 해석한다 (pnpm 비-hoisted 구조 대응).
 * @returns {Map<string, ReturnType<typeof readPackageMeta>>}
 */
export function collectDependencyClosure(rootDir, entryNames) {
  const collected = new Map();
  const queue = entryNames.map((name) => ({ name, fromDir: rootDir }));
  while (queue.length > 0) {
    const { name, fromDir } = queue.shift();
    if (collected.has(name)) continue;
    const dir = resolvePackageDir(name, fromDir);
    if (!dir) throw new Error(`패키지를 찾을 수 없습니다: ${name} (node_modules 설치가 필요합니다)`);
    const meta = readPackageMeta(dir);
    collected.set(name, meta);
    queue.push(...meta.dependencies.map((dep) => ({ name: dep, fromDir: dir })));
  }
  return collected;
}

/**
 * 카탈로그에 기재되었으나 런타임 클로저에는 없는 이름은 빌드 단계 루트로 취급한다.
 * @param {object} manifest package.json
 * @param {Map<string, unknown>} collected 런타임 클로저
 * @param {string[]} catalogNames notices/catalog.json 의 패키지 이름
 */
export function selectBuildOutputRoots(manifest, collected, catalogNames) {
  const devDependencies = manifest.devDependencies ?? {};
  const roots = catalogNames.filter((name) => !collected.has(name));
  const unknown = roots.filter((name) => !(name in devDependencies));
  if (unknown.length > 0) {
    throw new Error(`빌드 도구로 지정되었으나 package.json 에 없습니다: ${unknown.join(', ')}`);
  }
  return roots;
}