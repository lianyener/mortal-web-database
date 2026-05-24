import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createAppTranslator } from '@/hooks/useAppTranslation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const { translateTerm } = createAppTranslator(t);

  return { title: translateTerm('Web.Label.EventTable', undefined, 2) };
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
