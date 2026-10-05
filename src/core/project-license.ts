import type { ProjectLicenseDto } from './domain/project-license.dto';
import projectLicense from '../../notices/project.json';

/**
 * notices/project.json 은 고지서 생성기(scripts/generate-notices.mjs)와
 * 앱 UI가 함께 읽는 단일 진실 공급원이다.
 */
export const PROJECT_LICENSE: ProjectLicenseDto = projectLicense;

/**
 * 사용자가 브라우저에서 고지서를 여는 경로.
 * 생성기는 `public/` 아래에 쓰지만 Vite 는 그 내용을 배포 루트로 옮기므로,
 * 브라우저에서는 `public/` 접두사를 제거한 경로를 쓴다.
 */
const NOTICE_PAGE_URL_PATH = PROJECT_LICENSE.noticePagePath.replace(/^public\//, '');

export const NOTICE_PAGE_URL = `${import.meta.env.BASE_URL}${NOTICE_PAGE_URL_PATH}`;