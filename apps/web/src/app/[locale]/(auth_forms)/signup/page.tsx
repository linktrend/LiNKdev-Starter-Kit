import { redirect } from 'next/navigation';

interface SignUpPageProps {
  params: { locale: string };
}

export default function SignUpPage({ params: { locale } }: SignUpPageProps) {
  const normalizedLocale = locale || 'en';
  redirect(`/${normalizedLocale}/onboarding`);
}
