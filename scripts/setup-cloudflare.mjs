#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sessionDir = resolve(process.cwd(), '.wrangler-session');

function run(cmd, capture = true) {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      stdio: capture ? ['pipe', 'pipe', 'pipe'] : 'inherit',
      env: {
        ...process.env,
        XDG_CONFIG_HOME: sessionDir,
        WRANGLER_HOME: sessionDir,
      },
    });
  } catch (err) {
    if (capture && err.stderr) {
      return `ERROR: ${err.stderr.toString()}`;
    }
    throw err;
  }
}

console.log('\n🚀 [Creators Desk] Cloudflare D1 & R2 자동 셋업 시작...\n');

// 1. Check Wrangler Auth
console.log('🔍 1. Cloudflare 인증 상태 확인 중...');
const whoamiOut = run('npx wrangler whoami');
if (whoamiOut.includes('You are not logged in') || whoamiOut.includes('ERROR:')) {
  console.error('\n❌ Cloudflare 계정에 로그인되어 있지 않습니다.');
  console.log('👉 먼저 다음 명령어를 실행하여 이 프로젝트에 사용할 계정으로 로그인해주세요:');
  console.log('   pnpm wrangler login\n');
  process.exit(1);
}

const emailMatch = whoamiOut.match(/associated with the email ([^\.\s]+@[^\.\s]+\.[^\s\.]+)/i);
const accountIdMatch = whoamiOut.match(/([a-f0-9]{32})/i);
const email = emailMatch ? emailMatch[1] : 'Unknown Email';
const accountId = accountIdMatch ? accountIdMatch[1] : 'Unknown ID';

console.log(`   ✅ 연결된 계정: ${email}`);
console.log(`   ✅ Account ID:  ${accountId}`);

// 2. Ensure D1 Database
console.log('\n📦 2. Cloudflare D1 데이터베이스(creators-desk-db) 확인/생성 중...');
let d1ListJson = [];
try {
  const rawList = run('npx wrangler d1 list --json');
  d1ListJson = JSON.parse(rawList);
} catch {
  d1ListJson = [];
}

let db = d1ListJson.find((item) => item.name === 'creators-desk-db');
let dbUuid = db ? db.uuid : null;

if (!dbUuid) {
  console.log('   ✨ D1 데이터베이스 생성 중: creators-desk-db...');
  const createOut = run('npx wrangler d1 create creators-desk-db');
  const match = createOut.match(/database_id\s*=\s*"([a-f0-9-]+)"/i) || createOut.match(/([a-f0-9-]{36})/i);
  if (match) {
    dbUuid = match[1];
    console.log(`   ✅ D1 생성 완료! Database ID: ${dbUuid}`);
  } else {
    console.log('   ⚠️ D1 생성 완료 (ID 자동 재조회)');
    const refreshList = JSON.parse(run('npx wrangler d1 list --json'));
    const found = refreshList.find((i) => i.name === 'creators-desk-db');
    dbUuid = found ? found.uuid : null;
  }
} else {
  console.log(`   ✅ 기존 D1 데이터베이스 발견: ${dbUuid}`);
}

// 3. Apply Schema Migration
console.log('\n📜 3. D1 스키마 마이그레이션 적용 중 (d1/schema.sql)...');
run('npx wrangler d1 execute creators-desk-db --remote --file=./d1/schema.sql -y');
run('npx wrangler d1 execute creators-desk-db --local --file=./d1/schema.sql -y');
console.log('   ✅ 원격(Remote) 및 로컬(Local) D1 스키마 적용 완료 (Vaults, Files, Links, FTS5)');

// 4. Ensure R2 Bucket
console.log('\n🪣 4. Cloudflare R2 버킷(creators-desk-vaults) 확인/생성 중...');
const r2List = run('npx wrangler r2 bucket list');
if (!r2List.includes('creators-desk-vaults')) {
  console.log('   ✨ R2 버킷 생성 중: creators-desk-vaults...');
  run('npx wrangler r2 bucket create creators-desk-vaults');
  console.log('   ✅ R2 버킷 생성 완료: creators-desk-vaults');
} else {
  console.log('   ✅ 기존 R2 버킷 발견: creators-desk-vaults');
}

// 5. Update wrangler.toml
if (dbUuid) {
  console.log('\n📝 5. wrangler.toml에 D1 Database ID 동기화 중...');
  const tomlPath = resolve(process.cwd(), 'wrangler.toml');
  let tomlContent = readFileSync(tomlPath, 'utf-8');
  tomlContent = tomlContent.replace(
    /database_id\s*=\s*"[^"]*"/,
    `database_id = "${dbUuid}"`
  );
  writeFileSync(tomlPath, tomlContent, 'utf-8');
  console.log(`   ✅ wrangler.toml 업데이트 완료 (database_id = "${dbUuid}")`);
}

console.log('\n🎉 [완료] Cloudflare 인프라 셋업이 성공적으로 끝났습니다!');
console.log('   이제 `pnpm dev`로 로컬 개발을 하거나, `git push origin main`으로 자동 배포할 수 있습니다.\n');
