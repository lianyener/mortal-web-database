import { TopNavbar } from '@/components/layout/TopNavbar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* 頂部固定導覽列 */}
      <TopNavbar />
    </main>
  );
}