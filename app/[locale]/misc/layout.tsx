import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createAppTranslator } from '@/hooks/useAppTranslation';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { translateTerm } = createAppTranslator(t);
  const categoryName = translateTerm('Web.Label.Misc', undefined, 2);

  // 取得 Root Layout 的 metadata
  const parentMetadata = await parent;
  const parentTemplate = parentMetadata.title?.template || '%s';

  return {
    title: {
      // 第三層用模板
      template: parentTemplate.replace('%s', `%s - ${categoryName}`),
      // 當前標題
      default: categoryName
    }
  };
}

export default function ListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
