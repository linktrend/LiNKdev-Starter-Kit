export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
  url: string;
  robots?: string;
  favicon?: string;
  type?: string;
}

export interface User {
  created_at: string | null;
  email: string | null | undefined;
  email_verified: string | null;
  id: string;
  image: string | null;
  name: string | null;
  stripe_current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string | null;
}

export interface Post {
  id: string /* primary key */;
  title: string;
  content: JSON | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface MainNavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: any;
  label?: string;
  description?: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
  mainNav: MainNavItem[];
}
