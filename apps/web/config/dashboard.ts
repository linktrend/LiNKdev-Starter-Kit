import {
  LineChart,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Users2,
  Inbox,
  FileText,
  User,
  Building2,
  Database,
  HelpCircle
} from 'lucide-react';

export interface NavItem {
  href: string;
  icon: keyof typeof iconComponents;
  label: string;
  disabled?: boolean;
}

export const iconComponents = {
  Inbox,
  ShoppingCart,
  FileText,
  Package,
  Users2,
  LineChart,
  User,
  Building2,
  Database,
  HelpCircle
};

export const navConfig = [
  { href: '/dashboard', icon: 'Inbox', label: 'Dashboard' },
  { href: '/profile', icon: 'User', label: 'Profile' },
  { href: '/records', icon: 'Database', label: 'Records' },
  { href: '/org/org-1', icon: 'Building2', label: 'Organization' },
  { href: '/help', icon: 'HelpCircle', label: 'Help' },
  // { href: '/dashboard/posts', icon: 'FileText', label: 'Posts' },
  {
    href: '/dashboard/customer',
    icon: 'Users2',
    label: 'Customers',
    disabled: true
  },
  {
    href: '/dashboard/analytics',
    icon: 'LineChart',
    label: 'Analytics',
    disabled: true
  }
];
