export const dashboardConfig = {
  title: "Dashboard",
  features: { uploads: true, analytics: true }
};

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const navConfig: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "BarChart",
    label: "Dashboard"
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: "MessageCircleIcon",
    label: "Notifications"
  },
  {
    title: "Billing",
    href: "/billing",
    icon: "CreditCard",
    label: "Billing"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    label: "Settings"
  },
  {
    title: "Admin",
    href: "/labs/admin",
    icon: "CircleUser",
    label: "Admin"
  }
];

import { icons } from '@/components/icons';

export const iconComponents = {
  BarChart: icons.BarChart,
  Settings: icons.Settings,
  Database: icons.Database,
  Puzzle: icons.Puzzle,
  Bolt: icons.Bolt,
  Menu: icons.Menu,
  Eclipse: icons.Eclipse,
  SquarePen: icons.SquarePen,
  Sparkles: icons.Sparkles,
  Code: icons.Code,
  Upload: icons.Upload,
  MessageCircleIcon: icons.MessageCircle,
  Component: icons.Component,
  CircleUser: icons.CircleUser,
  CreditCard: icons.CreditCard,
};

export default dashboardConfig;
