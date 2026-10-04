export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '').trim();
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
