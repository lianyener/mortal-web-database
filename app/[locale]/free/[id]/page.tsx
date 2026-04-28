import fs from 'fs';
import path from 'path';
import FreeDetailClient from './FreeDetailClient';

// export async function generateStaticParams() {
//   const filePath = path.join(process.cwd(), 'public', 'data', 'script', 'index_free.json');

//   try {
//     // 讀取 index_free.json 並將 keys 轉換為 id 列表
//     const fileContent = fs.readFileSync(filePath, 'utf-8');
//     const data = JSON.parse(fileContent);
//     return Object.keys(data).map((key) => ({ id: key }));
//   } catch (error) {
//     console.error('Error reading index_free.json:', error);
//     return [];
//   }
// }

export default function FreeDetailPage() {
  return <FreeDetailClient />;
}