import fs from 'fs';
import path from 'path';
import SpecialDetailClient from './SpecialDetailClient';

// export async function generateStaticParams() {
//   const dataDir = path.join(process.cwd(), 'public', 'data', 'special');

//   try {
//     // 從資料夾檔案清單產生id列表
//     const filenames = fs.readdirSync(dataDir);
//     return filenames.filter((name) => name.endsWith('.json') && name !== 'all.json').map((name) => ({ id: name.replace(/\.json$/, '') }));
//   } catch (error) {
//     console.error('Error reading special data directory:', error);
//     return [];
//   }
// }

export default function SpecialDetailPage() {
  return <SpecialDetailClient />;
}
