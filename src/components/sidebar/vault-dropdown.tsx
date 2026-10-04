import { useEffect, useRef, useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';

interface VaultDropdownProps {
  activeVault: VaultDto;
  vaults: VaultDto[];
  onSelectVault: (id: string) => void;
  onOpenVaultModal: () => void;
}

export default function VaultDropdown({
  activeVault,
  vaults,
  onSelectVault,
  onOpenVaultModal,
}: VaultDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 최대 3개의 Vault 제공 (현재 Vault를 우선 포함하거나 목록 앞 3개)
  const displayedVaults = vaults.slice(0, 3);
  const hasMore = vaults.length > 3;

  return (
    <div ref={containerRef} className="relative border-t border-[#24242a] bg-[#18181b] p-2">
      {/* Dropdown Popup Menu (opens upward) */}
      {isOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-1.5 rounded-lg border border-[#2e2e38] bg-[#1c1c20] p-1.5 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            프로젝트 목록 (최대 3개)
          </div>

          <div className="space-y-0.5 mt-1">
            {displayedVaults.map((v) => {
              const isSelected = v.id === activeVault.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectVault(v.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-left transition ${
                    isSelected
                      ? 'bg-violet-600/20 text-violet-300 font-semibold'
                      : 'text-zinc-300 hover:bg-[#282830] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isSelected ? 'bg-violet-400 ring-2 ring-violet-500/30' : 'bg-zinc-600'
                      }`}
                    />
                    <span className="truncate">{v.name}</span>
                  </div>

                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-violet-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* 더보기 / 프로젝트 관리 버튼 */}
          <div className="border-t border-[#282830] mt-1.5 pt-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenVaultModal();
              }}
              className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-zinc-400 hover:bg-[#282830] hover:text-zinc-100 transition group"
            >
              <span className="flex items-center space-x-1.5">
                <svg className="h-3.5 w-3.5 text-zinc-500 group-hover:text-violet-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>{hasMore ? `더보기 (${vaults.length}개 모두 보기)` : '프로젝트 관리...'}</span>
              </span>
              <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300">팝업 ↗</span>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button at Bottom of Sidebar */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition bg-[#1f1f24] hover:bg-[#27272e] text-zinc-200 border border-[#2a2a32]"
        title="프로젝트 선택 및 관리"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="h-2 w-2 rounded-full bg-violet-400 shrink-0 ring-1 ring-violet-500/40" />
          <span className="font-semibold text-zinc-100 truncate">{activeVault.name}</span>
        </div>
        <svg
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
