import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createAppTranslator } from '@/hooks/useAppTranslation';

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });
  const { translateTerm } = createAppTranslator(t);
  const itemName = translateTerm(`Script.Name.${id}`, undefined, 2);

  // 回傳項目名稱
  return { title: itemName };
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
