// src/App.tsx
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState<number>(0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur text-center">
        <h1 className="text-2xl font-bold text-sky-400 mb-2">
          pnpm + Vite + TS + Tailwind
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          정상적으로 세팅되었습니다.
        </p>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white transition-all hover:bg-sky-400 active:scale-95"
        >
          Count: {count}
        </button>
      </div>
    </main>
  );
}