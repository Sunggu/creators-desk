import { EditorView } from '@codemirror/view';

/**
 * Visual identity for the note editor. Isolated from the component so token
 * styling can evolve without touching editor lifecycle code.
 */
export const obsidianEditorTheme = EditorView.theme(
  {
    '&': {
      color: '#dcddde',
      backgroundColor: '#1e1e22',
      height: '100%',
      fontSize: '15px',
      outline: 'none',
    },
    '.cm-scroller': {
      overflow: 'visible',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
    },
    '.cm-content': {
      padding: '0 0 160px 0',
      lineHeight: '1.75',
      caretColor: '#a78bfa',
      maxWidth: '100%',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#a78bfa',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(124, 58, 237, 0.3) !important',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.015)',
    },
    '.cm-header': { fontWeight: '700', color: '#ffffff' },
    '.cm-header-1': { fontSize: '1.75rem', lineHeight: '1.3' },
    '.cm-header-2': { fontSize: '1.4rem', lineHeight: '1.35' },
    '.cm-header-3': { fontSize: '1.2rem', lineHeight: '1.4' },
    '.cm-strong': { fontWeight: '700', color: '#ffffff' },
    '.cm-em': { fontStyle: 'italic', color: '#e4e4e7' },
    '.cm-link': { color: '#a78bfa', textDecoration: 'underline' },
    '.cm-url': { color: '#818cf8' },
  },
  { dark: true },
);
