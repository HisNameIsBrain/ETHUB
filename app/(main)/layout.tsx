import { AppShellLayout } from "@/components/layouts/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
