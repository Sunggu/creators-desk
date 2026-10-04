-- D1 SQLite Initial Migration Schema
-- Creators Desk: Vaults, File Nodes, Backlinks, and Full-Text Search (FTS5)

-- 1. Vaults Table (Immutable key vs Mutable alias)
CREATE TABLE IF NOT EXISTS vaults (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  alias TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vaults_key ON vaults(key);

-- 2. File Nodes Table (Hierarchical tree metadata)
CREATE TABLE IF NOT EXISTS file_nodes (
  id TEXT PRIMARY KEY,
  vault_key TEXT NOT NULL REFERENCES vaults(key) ON DELETE CASCADE,
  parent_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('file', 'folder')),
  r2_key TEXT,
  size INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_file_nodes_vault ON file_nodes(vault_key);
CREATE INDEX IF NOT EXISTS idx_file_nodes_parent ON file_nodes(parent_id);

-- 3. Wikilinks & Backlinks Indexing Table
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  vault_key TEXT NOT NULL,
  source_file_id TEXT NOT NULL,
  target_file_name TEXT NOT NULL,
  target_file_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_links_vault ON links(vault_key);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_file_name);

-- 4. SQLite FTS5 Full-Text Search Virtual Table
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  file_id UNINDEXED,
  vault_key UNINDEXED,
  title,
  content
);
