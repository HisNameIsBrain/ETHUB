import type { ComponentType } from "react";
import type { SVGProps } from "react";
import {
  Home,
  LayoutDashboard,
  MessagesSquare,
  Users,
  Settings,
} from "lucide-react";

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavLink = {
  label: string;
  href: string;
  Icon?: NavIcon;
  items?: NavLink[]; // nested links
};

export type NavGroup = {
  label: string;
  items: NavLink[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Home", href: "/", Icon: Home },
      { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
    ],
  },
  {
    label: "Social",
    items: [
      { label: "Social", href: "/dashboard/social", Icon: MessagesSquare },
      { label: "DM Console", href: "/dashboard/social/dm" },
      { label: "Threads", href: "/dashboard/social/threads" },
      { label: "Groups", href: "/dashboard/social/groups" },
    ],
  },
  {
    label: "Community",
    items: [{ label: "Community", href: "/dashboard/community", Icon: Users }],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", href: "/dashboard/settings", Icon: Settings }],
  },
];
