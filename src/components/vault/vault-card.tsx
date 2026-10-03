import type { VaultDto } from '../../core/domain/vault.dto';

interface VaultCardProps {
  vault: VaultDto;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function VaultCard({ vault, onSelect, onDelete }: VaultCardProps) {
  const formattedDate = new Date(vault.updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect(vault.id)}
      className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-150 hover:border-sky-500/50 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 group-hover:text-sky-300">{vault.name}</h3>
            <p className="text-xs text-zinc-400">최근 수정: {formattedDate}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`'${vault.name}' Vault를 삭제하시겠습니까? 모든 파일이 삭제됩니다.`)) {
              onDelete(vault.id);
            }
          }}
          className="opacity-0 transition-opacity duration-150 hover:text-rose-400 group-hover:opacity-100 text-zinc-500 p-1"
          title="Vault 삭제"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
