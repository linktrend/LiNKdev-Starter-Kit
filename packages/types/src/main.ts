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
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at?: string;
  updated_at?: string;
  app_metadata?: any;
  aud?: string;
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
