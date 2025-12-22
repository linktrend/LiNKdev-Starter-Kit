import { redirect } from '@/i18n/routing';

export default function RootPage() {
  // Redirect to login page (next-intl will handle locale automatically)
  redirect({ href: '/login', locale: 'en' });
}

