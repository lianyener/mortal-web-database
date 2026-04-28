import fs from 'fs';
import path from 'path';

const sourceDir = '.open-next';
const targetDir = '.open-next/assets/_worker.js';

console.log("📦 整理 Cloudflare Pages Worker 目錄結構...");

// 建立 _worker.js 目錄 (這會告訴 Cloudflare 不要插手打包)
fs.mkdirSync(targetDir, { recursive: true });

// 1. 將 worker.js 移入並改名為 index.js (這是目錄模式的必備入口)
if (fs.existsSync(path.join(sourceDir, 'worker.js'))) {
  fs.renameSync(path.join(sourceDir, 'worker.js'), path.join(targetDir, 'index.js'));
}

// 2. 將所有 OpenNext 產生的相依伺服器資料夾一併移入
const dirsToMove = ['cloudflare', 'server-functions', 'middleware', '.build'];
for (const dir of dirsToMove) {
  if (fs.existsSync(path.join(sourceDir, dir))) {
    fs.renameSync(path.join(sourceDir, dir), path.join(targetDir, dir));
  }
}

console.log("✅ Worker 目錄整理完成！");