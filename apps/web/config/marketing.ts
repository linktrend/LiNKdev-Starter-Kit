import { MarketingConfig, MainNavItem } from 'types';

const mainNavItems: MainNavItem[] = [
  {
    title: 'Features',
    href: '/#features'
  },
  {
    title: 'Pricing',
    href: '/#pricing'
  },
  {
    title: 'Blog',
    href: '/blog'
  },
  {
    title: 'Documentation',
    href: '/docs'
  }
];

export const marketingConfig: MarketingConfig = {
  mainNav: mainNavItems
};
