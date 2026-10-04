import { useState } from 'react';
import { OPEN_SOURCE_PACKAGES } from './open-source-licenses-data';

export default function OpenSourceLicensesView() {
  const [showFullMitText, setShowFullMitText] = useState(false);

  return (
    <div className="space-y-5 text-xs text-zinc-300">
      {/* MIT Commercial Safe Notice Banner */}
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <h4 className="font-semibold text-emerald-300">상업적 이용 보장 (100% Permissive Open Source)</h4>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
          Creators Desk는 상업적 이용 및 수정·배포가 자유로운 **MIT License** 및 **Apache-2.0** 호환 라이브러리만을 채택하여 구축되었습니다. 안심하고 상업적 목적으로 활용하실 수 있습니다.
        </p>
        <button
          onClick={() => setShowFullMitText((v) => !v)}
          className="mt-2 text-[11px] font-medium text-emerald-400 hover:underline cursor-pointer"
        >
          {showFullMitText ? '▲ MIT 라이선스 전문 접기' : '▼ Creators Desk MIT 라이선스 전문 보기'}
        </button>
        {showFullMitText && (
          <pre className="mt-2 overflow-x-auto rounded bg-[#121215] p-2.5 font-mono text-[10px] text-zinc-400 leading-normal border border-zinc-800">
{`MIT License

Copyright (c) 2026 Creators Desk Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.`}
          </pre>
        )}
      </div>

      {/* Package List */}
      <div>
        <h4 className="mb-2 font-semibold text-zinc-200">사용된 오픈소스 패키지 및 라이선스</h4>
        <div className="divide-y divide-zinc-800 rounded border border-zinc-800 bg-[#161619]">
          {OPEN_SOURCE_PACKAGES.map((pkg) => (
            <div key={pkg.name} className="flex items-center justify-between p-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-zinc-100">{pkg.name}</span>
                  <span className="text-[10px] text-zinc-500">{pkg.version}</span>
                </div>
                <div className="text-[11px] text-zinc-400">{pkg.description}</div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-violet-300 border border-violet-500/20">
                  {pkg.license}
                </span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  상업용 허용
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
