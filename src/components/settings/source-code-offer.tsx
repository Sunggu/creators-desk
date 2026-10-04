import { PROJECT_LICENSE } from '../../core/project-license';

export default function SourceCodeOffer({ className = '' }: { className?: string }) {
  return (
    <section className={`rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
        <h4 className="text-[12px] font-semibold text-emerald-300">
          소스 코드 공개 안내 ({PROJECT_LICENSE.licenseId} 제13조)
        </h4>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
        본 제품은 네트워크를 통해 제공되는 소프트웨어입니다. 원격 네트워크를 통해 프로그램을 수정·실행하는
        경우에도 아래 경로에서 동일한 조건으로 원본 소스 코드를 받아 사용할 수 있습니다.
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
        전체 소스 코드를 통째로 받아 <span className="font-mono text-zinc-300">LICENSE</span>{' '}
        파일(라이선스 전문)을 함께 보존하여 자유롭게 이용하실 수도 있습니다.
      </p>
      <a
        href={PROJECT_LICENSE.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 inline-block break-all font-mono text-[11px] text-emerald-400 hover:underline"
      >
        {PROJECT_LICENSE.sourceUrl}
      </a>
    </section>
  );
}