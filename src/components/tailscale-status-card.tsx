import type { TailscaleStatusViewModel } from '../core/application/use-cases/get-tailscale-status';
import type { TailscaleStatusKind } from '../core/application/use-cases/get-tailscale-status';

interface StatusMeta {
  label: string;
  dot: string;
  badge: string;
  hint: string;
}

const STATUS_META: Record<TailscaleStatusKind, StatusMeta> = {
  running: {
    label: '실행 중',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    hint: 'Tailscale 에이전트가 정상 동작 중입니다.',
  },
  'needs-login': {
    label: '로그인 필요',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    hint: 'Tailscale 로그인이 필요합니다.',
  },
  starting: {
    label: '시작 중',
    dot: 'bg-sky-400',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    hint: 'Tailscale 에이전트 상태를 확인하는 중입니다.',
  },
  stopped: {
    label: '중지됨',
    dot: 'bg-rose-400',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    hint: 'Tailscale 에이전트가 실행 중이 아닙니다.',
  },
  unavailable: {
    label: '확인 불가',
    dot: 'bg-zinc-500',
    badge: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    hint: 'Tailscale 상태를 조회할 수 없습니다.',
  },
};

interface TailscaleStatusCardProps {
  status: TailscaleStatusViewModel;
}

export default function TailscaleStatusCard({
  status,
}: TailscaleStatusCardProps) {
  const meta = STATUS_META[status.kind];

  return (
    <section className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-100">Tailscale Agent</h2>
        <span
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${meta.badge}`}
        >
          <span
            aria-hidden
            className={`h-2 w-2 animate-pulse rounded-full ${meta.dot}`}
          />
          {meta.label}
        </span>
      </header>

      <p className="mt-1 text-sm text-zinc-400">{meta.hint}</p>

      {status.kind === 'running' || status.hostname ? (
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-zinc-500">호스트</dt>
            <dd className="font-medium text-zinc-200">{status.hostname}</dd>
          </div>
          {status.dnsName ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-zinc-500">Tailnet</dt>
              <dd className="text-zinc-300">{status.dnsName}</dd>
            </div>
          ) : null}
          {status.tailscaleIps.length > 0 ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-zinc-500">IP</dt>
              <dd className="text-zinc-300">
                {status.tailscaleIps.join(' · ')}
              </dd>
            </div>
          ) : null}
          {status.version ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-zinc-500">버전</dt>
              <dd className="text-zinc-300">{status.version}</dd>
            </div>
          ) : null}
          {status.online ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-zinc-500">동기화</dt>
              <dd className="text-emerald-300">온라인</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <p className="mt-5 text-xs text-zinc-500">
        10초마다 자동 갱신됩니다
        {status.checkedAt
          ? ` · 갱신: ${new Date(status.checkedAt).toLocaleTimeString('ko-KR')}`
          : ''}
      </p>
    </section>
  );
}