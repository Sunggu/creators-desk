import TailscaleStatusCard from './components/tailscale-status-card';
import { useTailscaleStatus } from './hooks/use-tailscale-status';

export default function App() {
  const status = useTailscaleStatus();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div className="w-full max-w-sm space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-sky-400">Creators Desk</h1>
          <p className="mt-2 text-sm text-zinc-400">작업 환경 상태 확인</p>
        </header>
        <TailscaleStatusCard status={status} />
      </div>
    </main>
  );
}