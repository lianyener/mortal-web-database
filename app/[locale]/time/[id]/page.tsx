import fs from 'fs';
import path from 'path';
import TimeDetailClient from './TimeDetailClient';

// export async function generateStaticParams() {
//   const dataDir = path.join(process.cwd(), 'public', 'data', 'time');

//   try {
//     // 從資料夾檔案清單產生id列表
//     const filenames = fs.readdirSync(dataDir);
//     return filenames.filter((name) => name.endsWith('.json') && name !== 'all.json').map((name) => ({ id: name.replace(/\.json$/, '') }));
//   } catch (error) {
//     console.error('Error reading time data directory:', error);
//     return [];
//   }
// }

export default function TimeDetailPage() {
  return <TimeDetailClient />;
}