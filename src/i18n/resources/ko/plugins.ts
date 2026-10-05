/**
 * BASELINE BUNDLE - Korean. See `./common.ts` for the baseline contract.
 *
 * File-extension rows are keyed by extension. Status is a nested key rather than
 * a free-form string so the "built in" vs "planned" distinction stays a data
 * decision, not a string comparison in the view.
 */
export const pluginsKo = {
  architectureHeading: '플러그인 기반 확장 아키텍처',
  architectureBody:
    'Creators Desk는 플러그인 아키텍처를 통해 마크다운 외에도 다양한 파일 형식과 저작 도구를 에디터 창에 자유롭게 확장할 수 있도록 설계되어 있습니다.',
  formatsHeading: '지원 파일 포맷 현황',
  statusBuiltIn: '기본 내장',
  statusPlanned: '지원 예정',
  format_md_name: '마크다운 에디터',
  format_md_desc: 'WYSIWYG Live Preview 및 읽기 모드 지원',
  format_txt_name: '일반 텍스트',
  format_txt_desc: '일반 메모 및 로그 파일 열람',
  format_json_name: '구조화 데이터',
  format_json_desc: '설정 및 데이터 스키마 에디터',
  format_image_name: '이미지 뷰어',
  format_image_desc: '그래픽 자료 및 미디어 에셋 미리보기',
};
