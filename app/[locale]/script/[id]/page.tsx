import fs from 'fs';
import path from 'path';
import ScriptDetailClient from './ScriptDetailClient';

export async function generateStaticParams() {
  const dataDir = path.join(process.cwd(), 'public', 'data', 'script');

  try {
    // 從資料夾檔案清單產生id列表
    const filenames = fs.readdirSync(dataDir);
    const excludeFiles = ['index.json', 'all.json', 'index_free.json'];
    return filenames.filter((name) => name.endsWith('.json') && !excludeFiles.includes(name)).map((name) => ({ id: name.replace(/\.json$/, '') }));
  } catch (error) {
    console.error('Error reading script data directory:', error);
    return [];
  }
}

export default function ScriptDetailPage() {
  return <ScriptDetailClient />;
}
