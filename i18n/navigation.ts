import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const locales = ['zh-tw', 'zh-cn', 'kr', 'jp'] as const;

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
