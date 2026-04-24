import fs from 'fs';
import path from 'path';
import EndDetailClient from './EndDetailClient';

export async function generateStaticParams() {
  const dataDir = path.join(process.cwd(), 'public', 'data', 'end');

  try {
    // 從資料夾檔案清單產生id列表
    const filenames = fs.readdirSync(dataDir);
    return filenames.filter((name) => name.endsWith('.json') && name !== 'all.json').map((name) => ({ id: name.replace(/\.json$/, '') }));
  } catch (error) {
    console.error('Error reading end data directory:', error);
    return [];
  }
}

export default function EndDetailPage() {
  return <EndDetailClient />;
}
