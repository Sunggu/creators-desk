import { PROJECT_LICENSE } from '../../core/project-license';
import LicenseNoticeCard, { NoticePageLink } from './license-notice-card';
import SourceCodeOffer from './source-code-offer';

export default function OpenSourceLicensesView() {
  return (
    <div className="space-y-3 text-xs text-zinc-300">
      <p className="text-[11px] leading-relaxed text-zinc-400">
        <strong className="font-semibold text-zinc-200">{PROJECT_LICENSE.productName}</strong>는 아래
        오픈소스 소프트웨어를 사용합니다. 각 라이브러리의 저작권 문구와 라이선스 전문은{' '}
        <strong className="font-semibold text-zinc-200">오픈소스 고지서</strong>에 수록되어 있으며, 빌드된{' '}
        <code className="font-mono">/notice.html</code> 페이지와 저장소의{' '}
        <code className="font-mono">THIRD-PARTY-NOTICES.txt</code>에서 동일하게 확인할 수 있습니다.
      </p>

      <LicenseNoticeCard />
      <SourceCodeOffer />

      <section className="rounded-md border border-zinc-800 bg-[#141417] p-3">
        <h4 className="font-semibold text-zinc-100">고지서에 관하여</h4>
        <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-zinc-400">
          <li>· 고지 대상은 브라우저·서버 번들과 프로덕션 이미지에 함께 배포되는 패키지입니다.</li>
          <li>· 라이브러리 추가·삭제 시 고지서는 자동 생성되며, 목록과 전문이 항상 일치합니다.</li>
          <li>· 라이선스 변경이나 상업적 이용 관련 문의는 아래로 연락해 주십시오.</li>
        </ul>
        <p className="mt-2 text-[11px] text-zinc-400">
          문의처:{' '}
          <a href={`mailto:${PROJECT_LICENSE.contactEmail}`} className="text-violet-300 hover:underline">
            {PROJECT_LICENSE.contactEmail}
          </a>
        </p>
      </section>

      <div className="pt-1">
        <NoticePageLink />
      </div>
    </div>
  );
}