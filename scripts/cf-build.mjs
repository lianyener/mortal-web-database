import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

if (process.platform === 'linux' && !process.env.SWC_NATIVE_BINDING_CACHE) {
  const uid = process.getuid();

  // 若 /opt/buildhome 為目前使用者所有，先將權限收緊為 0755
  try {
    if (fs.statSync('/opt/buildhome').uid === uid) {
      fs.chmodSync('/opt/buildhome', 0o755);
    }
  } catch {}

  const isSafeDir = (targetDir) => {
    try {
      fs.mkdirSync(targetDir, { recursive: true, mode: 0o700 });
      fs.chmodSync(targetDir, 0o700);
      let cur = path.resolve(targetDir);
      while (true) {
        const st = fs.statSync(cur);
        const validOwner = st.uid === uid || st.uid === 0;
        const safePerm = (st.mode & 0o022) === 0 || (st.mode & 0o1000) !== 0;
        if (!validOwner || !safePerm) return false;
        const parent = path.dirname(cur);
        if (parent === cur) break;
        cur = parent;
      }
      return true;
    } catch {
      return false;
    }
  };

  const candidates = [
    '/opt/buildhome/.cache/swc',
    '/var/tmp/swc-cache',
    '/dev/shm/swc-cache',
  ];

  const validCache = candidates.find(isSafeDir);
  if (validCache) {
    process.env.SWC_NATIVE_BINDING_CACHE = validCache;
    console.log(`[cf-build] Using SWC_NATIVE_BINDING_CACHE=${validCache}`);
  } else {
    for (const p of ['/', '/opt', '/opt/buildhome', '/tmp', '/var/tmp', '/dev/shm']) {
      try {
        const st = fs.statSync(p);
        console.log(`[cf-build] ${p}: uid=${st.uid}, mode=${(st.mode & 0o7777).toString(8)}`);
      } catch {}
    }
  }
}

execSync('npx opennextjs-cloudflare build', { stdio: 'inherit' });