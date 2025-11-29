
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const items = [
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

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/5 bg-[radial-gradient(circle_at_top,#151b3e,#050711)] px-4 py-5 text-xs text-slate-200 shadow-[18px_0_40px_rgba(0,0,0,0.65)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[conic-gradient(from_210deg,#4d9fff,#7b5cff,#39f5c3,#4d9fff)] shadow-[0_0_25px_rgba(77,159,255,0.7)]" />
        <div>
          <div className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            ETHUB
          </div>
          <div className="text-[11px] text-slate-500">DevOS Dashboard</div>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] transition",
                active
                  ? "bg-gradient-to-r from-sky-600/80 to-indigo-600/70 text-white shadow-[0_12px_26px_rgba(15,23,42,0.9)] border border-sky-400/50"
                  : "bg-slate-950/50 text-slate-300 hover:bg-slate-900/80 border border-transparent hover:border-slate-600/60",
              ].join(" ")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950/70 text-sky-300 group-hover:bg-slate-900/80 group-hover:text-sky-100">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

