import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const locales = ['zh-tw'] as const;

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);