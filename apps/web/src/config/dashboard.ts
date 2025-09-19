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
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    label: "Settings"
  }
];

import { Icons } from '@/components/icons';

export const iconComponents = {
  BarChart: Icons.BarChart,
  Settings: Icons.settings,
  Database: Icons.Database,
  Puzzle: Icons.Puzzle,
  Bolt: Icons.Bolt,
  Menu: Icons.Menu,
  Eclipse: Icons.Eclipse,
  SquarePen: Icons.SquarePen,
  Sparkles: Icons.Sparkles,
  Code: Icons.Code,
  Upload: Icons.Upload,
  MessageCircleIcon: Icons.MessageCircleIcon,
  Component: Icons.Component,
  CircleUser: Icons.CircleUser,
};

export default dashboardConfig;
