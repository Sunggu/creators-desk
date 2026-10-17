// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useWikilinkNavigation } from './use-wikilink-navigation';

const mockFile = (id: string, name: string): FileNodeDto => ({
  id,
  vaultId: 'vlt-1',
  parentId: null,
  name,
  type: 'file',
  createdAt: 1,
  updatedAt: 1,
});

describe('useWikilinkNavigation', () => {
  it('opens existing target file by resolving wikilink target', () => {
    const onOpen = vi.fn();
    const onCreateAndOpen = vi.fn();
    const nodes = [mockFile('f1', 'Welcome.md'), mockFile('f2', 'Guide.md')];

    const { result } = renderHook(() =>
      useWikilinkNavigation(nodes, onOpen, onCreateAndOpen),
    );

    result.current('Welcome');
    expect(onOpen).toHaveBeenCalledWith('f1');
    expect(onCreateAndOpen).not.toHaveBeenCalled();
  });

  it('calls onCreateAndOpen when target does not exist', () => {
    const onOpen = vi.fn();
    const onCreateAndOpen = vi.fn();
    const nodes = [mockFile('f1', 'Welcome.md')];

    const { result } = renderHook(() =>
      useWikilinkNavigation(nodes, onOpen, onCreateAndOpen),
    );

    result.current('New Concept');
    expect(onOpen).not.toHaveBeenCalled();
    expect(onCreateAndOpen).toHaveBeenCalledWith('New Concept');
  });

  it('ignores empty target strings and does not call onCreateAndOpen', () => {
    const onOpen = vi.fn();
    const onCreateAndOpen = vi.fn();
    const nodes = [mockFile('f1', 'Welcome.md')];

    const { result } = renderHook(() =>
      useWikilinkNavigation(nodes, onOpen, onCreateAndOpen),
    );

    result.current('   ');
    expect(onOpen).not.toHaveBeenCalled();
    expect(onCreateAndOpen).not.toHaveBeenCalled();
  });

  it('stays inert when target is missing and onCreateAndOpen is omitted', () => {
    const onOpen = vi.fn();
    const nodes = [mockFile('f1', 'Welcome.md')];

    const { result } = renderHook(() => useWikilinkNavigation(nodes, onOpen));

    result.current('NonExistent');
    expect(onOpen).not.toHaveBeenCalled();
  });
});
