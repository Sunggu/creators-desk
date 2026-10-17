import { useEffect, useMemo, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface SearchPanelProps {
  nodes: FileNodeDto[];
  onSelectFile: (fileId: string) => void;
  /** Dismisses the mobile drawer once a result is picked. */
  onCloseMobile?: () => void;
  vaultId?: string;
}

export default function SearchPanel({
  nodes,
  onSelectFile,
  onCloseMobile,
  vaultId,
}: SearchPanelProps) {
  const t = useTranslate();
  const [query, setQuery] = useState('');
  const [serverSnippets, setServerSnippets] = useState<Record<string, string>>({});

  const targetVaultId = vaultId || nodes[0]?.vaultId;

  useEffect(() => {
    const trimmed = query.trim();
    if (!targetVaultId || !trimmed) {
      setServerSnippets({});
      return;
    }

    let cancelled = false;
    fetch(`/api/vaults/${targetVaultId}/search?q=${encodeURIComponent(trimmed)}`)
      .then((res) =>
        res.ok
          ? (res.json() as Promise<Array<{ file_id: string; match_snippet: string }>>)
          : [],
      )
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const snippets: Record<string, string> = {};
        for (const item of data) {
          snippets[item.file_id] = item.match_snippet;
        }
        setServerSnippets(snippets);
      })
      .catch(() => {
        // Safe fallback when offline or in test environments
      });

    return () => {
      cancelled = true;
    };
  }, [targetVaultId, query]);

  const files = useMemo(() => nodes.filter((n) => n.type === 'file'), [nodes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return files.map((file) => ({ file, snippet: file.content }));
    }

    const matchedMap = new Map<string, { file: FileNodeDto; snippet?: string }>();

    // 1. Local nodes matching title or local content
    for (const f of files) {
      const matchName = f.name.toLowerCase().includes(q);
      const matchContent = Boolean(f.content && f.content.toLowerCase().includes(q));
      if (matchName || matchContent) {
        matchedMap.set(f.id, { file: f, snippet: f.content });
      }
    }

    // 2. Server FTS5 search matches (including lazily unloaded file bodies)
    for (const [fileId, snippet] of Object.entries(serverSnippets)) {
      const node = files.find((f) => f.id === fileId);
      if (node) {
        const cleanSnippet = snippet.replace(/<[^>]+>/g, '');
        matchedMap.set(fileId, { file: node, snippet: cleanSnippet });
      }
    }

    return Array.from(matchedMap.values());
  }, [files, query, serverSnippets]);

  return (
    <div className="flex h-full w-full flex-col select-none">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#26262e] px-3.5">
        <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
          {t('ribbon.menuSearch')}
        </span>
        <span className="text-[11px] text-zinc-500">
          {t('sidebar.searchResults', { count: filtered.length })}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 text-xs text-zinc-300">
        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sidebar.searchPlaceholder')}
            className="w-full rounded border border-zinc-700 bg-[#1e1e24] px-3 py-1.5 pl-8 text-zinc-100 placeholder-zinc-500 outline-hidden focus:border-violet-500"
            autoFocus
          />
          <MonochromeIcon name="search" className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map(({ file, snippet }) => (
            <div
              key={file.id}
              onClick={() => {
                onSelectFile(file.id);
                onCloseMobile?.();
              }}
              className="flex flex-col rounded p-2 hover:bg-[#222228] transition cursor-pointer"
            >
              <div className="font-semibold text-zinc-200">{file.name.replace(/\.md$/i, '')}</div>
              {snippet && (
                <div className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500 leading-normal">
                  {snippet}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-zinc-500">{t('sidebar.searchEmpty')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
