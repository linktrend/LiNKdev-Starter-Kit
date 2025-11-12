'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { buildLocalePath } from '@/lib/locale';

export function useLocalePath() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';

  const buildPath = useMemo(() => {
    return (path: string = '/') => buildLocalePath(locale, path);
  }, [locale]);

  return { locale, buildPath };
}
