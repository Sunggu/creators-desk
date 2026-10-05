#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// 프로젝트 전용 격리된 세션 디렉토리
const sessionDir = resolve(process.cwd(), '.wrangler-session');
const args = process.argv.slice(2);

const result = spawnSync('npx', ['wrangler', ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
    XDG_CONFIG_HOME: sessionDir,
    WRANGLER_HOME: sessionDir,
  },
});

process.exit(result.status ?? 0);
