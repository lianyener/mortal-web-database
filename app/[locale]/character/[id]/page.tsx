import fs from 'fs';
import path from 'path';
import CharacterDetailClient from './CharacterDetailClient';

// export async function generateStaticParams() {
//   const dataDir = path.join(process.cwd(), 'public', 'data', 'character');

//   try {
//     // 從資料夾檔案清單產生id列表
//     const filenames = fs.readdirSync(dataDir);
//     return filenames.filter((name) => name.endsWith('.json') && name !== 'all.json').map((name) => ({ id: name.replace(/\.json$/, '') }));
//   } catch (error) {
//     console.error('Error reading character data directory:', error);
//     return [];
//   }
// }

export default function CharacterDetailPage() {
  return <CharacterDetailClient />;
}
