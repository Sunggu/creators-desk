/**
 * 파일/폴더명으로 사용할 수 없는 금지 문자 정규식
 * - Windows/Linux/macOS 파일시스템 금지 특수문자: \ / : * ? " < > |
 * - 제어 문자: ASCII 0x00 ~ 0x1F, 0x7F
 */
// Control characters are exactly what this rule exists to reject, so the
// `no-control-regex` warning is expected here.
// eslint-disable-next-line no-control-regex
export const INVALID_FILE_NAME_CHARS_REGEX = /[\\/:*?"<>|\x00-\x1f\x7f]/g;

/**
 * 파일/폴더명 유효성 검사용 정규식
 */
// eslint-disable-next-line no-control-regex
export const INVALID_FILE_NAME_REGEX = /[\\/:*?"<>|\x00-\x1f\x7f]/;

/**
 * 파일명이 올바른지 검증하는 함수
 */
export function isValidFileName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  return !INVALID_FILE_NAME_REGEX.test(trimmed);
}

/**
 * 파일명에서 금지된 문자를 제거하고 정제하는 함수
 */
export function sanitizeFileName(name: string): string {
  return name.replace(INVALID_FILE_NAME_CHARS_REGEX, '').trim();
}

export function getUniqueFileName(
  existingNames: string[],
  baseName = 'Untitled',
): string {
  const set = new Set(existingNames.map((n) => n.toLowerCase()));
  const defaultWithExt = `${baseName}.md`;
  if (!set.has(defaultWithExt.toLowerCase())) {
    return defaultWithExt;
  }
  let index = 1;
  while (set.has(`${baseName.toLowerCase()} ${index}.md`)) {
    index++;
  }
  return `${baseName} ${index}.md`;
}

export function getUniqueFolderName(
  existingNames: string[],
  baseName = '새 폴더',
): string {
  const set = new Set(existingNames.map((n) => n.toLowerCase()));
  if (!set.has(baseName.toLowerCase())) {
    return baseName;
  }
  let index = 1;
  while (set.has(`${baseName.toLowerCase()} ${index}`)) {
    index++;
  }
  return `${baseName} ${index}`;
}
