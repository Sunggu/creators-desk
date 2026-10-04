import { useEffect, useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';
import OpenSourceLicensesView from './open-source-licenses-view';

interface SettingsModalProps {
  isOpen: boolean;
  activeVault: VaultDto;
  onClose: () => void;
  onRenameVault?: (id: string, newAlias: string) => void;
}

type SettingsTab = 'project' | 'preferences' | 'licenses';

export default function SettingsModal({
  isOpen,
  activeVault,
  onClose,
  onRenameVault,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('licenses');
  const [editingAlias, setEditingAlias] = useState(activeVault.alias);

  useEffect(() => {
    setEditingAlias(activeVault.alias);
  }, [activeVault]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div
        className="flex h-[520px] w-full max-w-2xl flex-col rounded-lg border border-[#2a2a32] bg-[#18181b] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex h-12 items-center justify-between border-b border-[#26262e] px-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-zinc-100">환경설정 & 라이선스</span>
            <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
              v0.1
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-[#26262e] hover:text-zinc-100 transition cursor-pointer"
            title="닫기 (Esc)"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body with Left Tabs and Right Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Tabs Rail */}
          <div className="w-44 shrink-0 border-r border-[#26262e] bg-[#141417] p-2 space-y-1">
            <button
              onClick={() => setActiveTab('licenses')}
              className={`flex w-full items-center space-x-2 rounded px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                activeTab === 'licenses'
                  ? 'bg-violet-600/20 text-violet-300 font-semibold'
                  : 'text-zinc-400 hover:bg-[#1e1e24] hover:text-zinc-200'
              }`}
            >
              <span>📜 오픈소스 라이선스</span>
            </button>

            <button
              onClick={() => setActiveTab('project')}
              className={`flex w-full items-center space-x-2 rounded px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                activeTab === 'project'
                  ? 'bg-violet-600/20 text-violet-300 font-semibold'
                  : 'text-zinc-400 hover:bg-[#1e1e24] hover:text-zinc-200'
              }`}
            >
              <span>📁 프로젝트 (Vault) 설정</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex w-full items-center space-x-2 rounded px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-violet-600/20 text-violet-300 font-semibold'
                  : 'text-zinc-400 hover:bg-[#1e1e24] hover:text-zinc-200'
              }`}
            >
              <span>⚙️ 에디터 환경설정</span>
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#18181b]">
            {activeTab === 'licenses' && <OpenSourceLicensesView />}

            {activeTab === 'project' && (
              <div className="space-y-4 text-xs text-zinc-300">
                <h4 className="font-semibold text-zinc-100">현재 활성 Vault 정보</h4>
                <div className="space-y-3 rounded border border-zinc-800 bg-[#141417] p-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">프로젝트 표시 이름 (Alias)</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editingAlias}
                        onChange={(e) => setEditingAlias(e.target.value)}
                        className="flex-1 rounded border border-zinc-700 bg-[#1e1e24] px-2.5 py-1.5 text-zinc-100 outline-hidden focus:border-violet-500"
                      />
                      <button
                        onClick={() => onRenameVault?.(activeVault.id, editingAlias)}
                        className="rounded bg-violet-600 px-3 py-1.5 font-medium text-white hover:bg-violet-500 transition cursor-pointer"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-zinc-800 pt-2 text-[11px] text-zinc-500 space-y-1">
                    <div>불변 저장소 키: <span className="font-mono text-zinc-400">{activeVault.key}</span></div>
                    <div>고유 식별자: <span className="font-mono text-zinc-400">{activeVault.id}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4 text-xs text-zinc-300">
                <h4 className="font-semibold text-zinc-100">에디터 동작 및 테마</h4>
                <div className="space-y-3 rounded border border-zinc-800 bg-[#141417] p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-zinc-200">다크 테마 (Obsidian Minimal)</div>
                      <div className="text-[11px] text-zinc-500">집중을 위한 순수 다크 팔레트 고정</div>
                    </div>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">기본 활성화</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
                    <div>
                      <div className="font-medium text-zinc-200">자동 실시간 저장 (Auto-save)</div>
                      <div className="text-[11px] text-zinc-500">타이핑 400ms 후 D1 및 R2에 자동 보관</div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">동작 중</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
