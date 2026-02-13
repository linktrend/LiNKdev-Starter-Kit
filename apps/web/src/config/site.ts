import { SiteConfig } from '@starter/types';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const siteConfig: SiteConfig = {
  name: 'LiNKdev Starter Kit',
  description:
    'A complete & open-source Next.js 14 Subscription Starter template using Supabase, Stripe, Tailwind CSS.',
  url: siteUrl,
  ogImage: `${siteUrl}/og.jpg`,
  links: {
    twitter: 'https://x.com/YOUR_HANDLE',
    github: 'https://github.com/linktrend/LiNKdev-Starter-Kit'
  },
  mainNav: []
};
