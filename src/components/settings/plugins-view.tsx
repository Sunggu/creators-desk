export default function PluginsView() {
  const supportedFormats = [
    { ext: '.md', name: '마크다운 에디터', status: '기본 내장', desc: 'WYSIWYG Live Preview 및 읽기 모드 지원' },
    { ext: '.txt', name: '일반 텍스트', status: '지원 예정', desc: '일반 메모 및 로그 파일 열람' },
    { ext: '.json', name: '구조화 데이터', status: '지원 예정', desc: '설정 및 데이터 스키마 에디터' },
    { ext: '.png / .jpg', name: '이미지 뷰어', status: '지원 예정', desc: '그래픽 자료 및 미디어 에셋 미리보기' },
  ];

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div className="rounded-md border border-violet-500/30 bg-violet-500/10 p-3.5">
        <h4 className="font-semibold text-violet-300">플러그인 기반 확장 아키텍처</h4>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
          Creators Desk는 플러그인 아키텍처를 통해 마크다운 외에도 다양한 파일 형식과 저작 도구를 에디터 창에 자유롭게 확장할 수 있도록 설계되어 있습니다.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-zinc-100">지원 파일 포맷 현황</h4>
        <div className="space-y-2">
          {supportedFormats.map((item) => (
            <div key={item.ext} className="rounded border border-zinc-800 bg-[#141417] p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-zinc-100">{item.ext}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    item.status === '기본 내장'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
