import { redirect } from 'next/navigation';

interface SignupStep2PageProps {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export default function SignupStep2Page({ params: { locale }, searchParams }: SignupStep2PageProps) {
  const normalizedLocale = locale || 'en';
  const urlParams = new URLSearchParams();

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlParams.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((val) => {
        if (val !== undefined) {
          urlParams.append(key, val);
        }
      });
    }
  });

  urlParams.set('step', '2');

  const query = urlParams.toString();
  const target = query ? `/${normalizedLocale}/onboarding?${query}` : `/${normalizedLocale}/onboarding?step=2`;

  redirect(target);
}
