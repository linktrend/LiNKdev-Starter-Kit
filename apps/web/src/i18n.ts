import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';

export default getRequestConfig(async ({ locale }) => {
  // No validation - just return the locale and messages
  return {
    locale: locale || 'en',
    messages: (await import(`../messages/${locale || 'en'}.json`)).default
  };
});