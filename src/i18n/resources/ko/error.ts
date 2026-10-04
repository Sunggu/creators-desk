/**
 * BASELINE BUNDLE - Korean. See `./common.ts` for the baseline contract.
 *
 * Every key here is an {@link AppErrorCode}. Throwing a code instead of a
 * sentence is what allows the application layer to stay catalog-independent.
 */
export const errorKo = {
  'vault.nameRequired': 'Vault 이름을 입력해주세요.',
  'vault.notFound': 'Vault를 찾을 수 없습니다.',
  'file.nameRequired': '이름을 입력해주세요.',
  'file.notFound': '파일을 찾을 수 없습니다.',
  'file.moveIntoSelf': '자기 자신으로 이동할 수 없습니다.',
  'file.moveIntoDescendant': '하위 폴더 안으로 이동할 수 없습니다.',
};