/**
 * 본 제품 자체의 라이선스 고지 메타데이터.
 * 원본은 notices/project.json 이고, 고지서 생성기와 앱 UI가 함께 읽는다.
 * AGPL-3.0 은 `LICENSE` 원고와 notices/project.json 이 일치하는지
 * scripts/notices/notice-integrity.spec.ts 가 검증한다.
 */
export interface ProjectLicenseDto {
  productName: string;
  licenseId: string;
  copyrightYear: string;
  copyrightHolder: string;
  sourceUrl: string;
  contactEmail: string;
  noticePagePath: string;
  textNoticePath: string;
}