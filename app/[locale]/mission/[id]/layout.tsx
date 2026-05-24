import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // 回傳項目ID
  return { title: id };
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
