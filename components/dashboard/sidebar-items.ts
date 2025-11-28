// components/dashboard/sidebar-items.ts

import {
  LayoutDashboard,
  FileCode2,
  TerminalSquare,
  FolderTree,
  Docker,
  Network,
  MonitorPlay,
  Settings,
  ShieldCheck,
} from "lucide-react";

export const DASHBOARD_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/code", label: "Code Studio", icon: FileCode2 },
  { href: "/dashboard/terminal", label: "Terminal", icon: TerminalSquare },
  { href: "/dashboard/files", label: "File Manager", icon: FolderTree },
  { href: "/dashboard/docker", label: "Docker Control", icon: Docker },
  { href: "/dashboard/ssh", label: "SSH Sessions", icon: Network },
  { href: "/dashboard/preview", label: "Live Preview", icon: MonitorPlay },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck },
];
