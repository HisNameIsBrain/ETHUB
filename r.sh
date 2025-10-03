#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./r.sh --pages        # create/refresh missing pages only
#   ./r.sh --navbar       # replace Navbar with the latest version
#   ./r.sh --layout       # ensure ClerkProvider wrapping in app/layout.tsx
#   ./r.sh --all          # do all of the above
#
# Notes:
# - Backs up existing targets to *.bak.<timestamp>
# - Requires a Next.js app directory structure

TS="$(date +%Y%m%d-%H%M%S)"

ROOT_CHECK() {
  if [[ ! -f "package.json" || ! -d "app" ]]; then
    echo "Run from your Next.js project root (must contain package.json and app/)."
    exit 1
  fi
}

BK() { # backup if exists
  local f="$1"
  if [[ -f "$f" ]]; then
    cp "$f" "$f.bak.$TS"
    echo "Backup: $f -> $f.bak.$TS"
  fi
}

WRITE() { # write file with heredoc
  local path="$1"
  shift
  mkdir -p "$(dirname "$path")"
  BK "$path"
  cat > "$path" <<'EOF'
__CONTENT__
EOF
  # Replace placeholder marker in-file
  local tmp="$(mktemp)"
  sed '1,/^__CONTENT__$/d' "$path" > "$tmp" && mv "$tmp" "$path"
  echo "Wrote: $path"
}

ADD_NO_SCROLLBAR_TO_GLOBALS() {
  local f="app/globals.css"
  if [[ -f "$f" ]]; then
    if ! grep -q "no-scrollbar" "$f"; then
      BK "$f"
      cat >> "$f" <<'EOF'

/* mobile tabs drawer helper */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
EOF
      echo "Updated: $f (no-scrollbar utilities appended)"
    else
      echo "Skip: globals.css already has no-scrollbar utilities"
    fi
  else
    echo "Warn: app/globals.css not found; skipping no-scrollbar append"
  fi
}

PAGES() {
  # /portal
  WRITE app/portal/page.tsx <<'EOF'
"use client";
import { Card } from "@/components/ui/card";
export default function PortalPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Client Portal</h1>
      <p className="text-sm text-muted-foreground">Track repair status, invoices, and messages.</p>
      <Card className="p-4"><h2 className="font-medium mb-2">Repairs</h2><p className="text-sm text-muted-foreground">Linked device updates appear here.</p></Card>
      <Card className="p-4"><h2 className="font-medium mb-2">Invoices</h2><p className="text-sm text-muted-foreground">View and download invoices.</p></Card>
    </div>
  );
}
EOF

  # /dashboard/services/new
  WRITE app/dashboard/services/new/page.tsx <<'EOF'
"use client";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function NewServicePage() {
  const router = useRouter();
  const createService = useMutation(api.services.create);
  const [name, setName] = useState("");

  const onSubmit = async () => {
    if (!name.trim()) return;
    const p = createService({ name, description: "", price: 0, isPublic: true, archived: false });
    toast.promise(p, {
      loading: "Creating service...",
      success: () => { router.push("/dashboard/services"); return "Service created!"; },
      error: "Failed to create service.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">New Service</h1>
      <Card className="p-4 space-y-3">
        <Input placeholder="Service name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={onSubmit}>Create Service</Button>
      </Card>
    </div>
  );
}
EOF

  # /dashboard/services/categories
  WRITE app/dashboard/services/categories/page.tsx <<'EOF'
"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ServiceCategoriesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Service Categories</h1>
      <p className="text-sm text-muted-foreground">Organize services into categories.</p>
      <Card className="p-4 flex items-center justify-between">
        <span className="font-medium">Example Category</span>
        <Button size="sm" variant="outline"><PlusCircle className="h-4 w-4 mr-1" />Add</Button>
      </Card>
    </div>
  );
}
EOF

  # /dashboard/settings
  WRITE app/dashboard/settings/page.tsx <<'EOF'
"use client";
import { Card } from "@/components/ui/card";
export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card className="p-4"><h2 className="font-medium">Profile</h2><p className="text-sm text-muted-foreground">Manage account info.</p></Card>
      <Card className="p-4"><h2 className="font-medium">Notifications</h2><p className="text-sm text-muted-foreground">Email/SMS alerts.</p></Card>
    </div>
  );
}
EOF

  # /documents
  WRITE app/documents/page.tsx <<'EOF'
"use client";
import { Card } from "@/components/ui/card";
export default function DocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Manage manuals, terms, and shared files.</p>
      </Card>
    </div>
  );
}
EOF

  # optional: /pc (public/client order status)
  WRITE app/pc/page.tsx <<'EOF'
"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PCPage() {
  const sp = useSearchParams();
  const { isAuthenticated } = useConvexAuth();
  const [orderInput, setOrderInput] = useState(sp.get("order") ?? "");
  const [tokenInput, setTokenInput] = useState(sp.get("token") ?? "");
  const orderFromUrl = sp.get("order") ?? "";
  const tokenFromUrl = sp.get("token") ?? "";
  const usingUrlCreds = !!orderFromUrl && (!!tokenFromUrl || isAuthenticated);
  const data = useQuery(api.jobs.getPublic, usingUrlCreds ? { orderNumber: orderFromUrl || orderInput, token: (tokenFromUrl || tokenInput) ?? "" } : "skip");
  const showPrompt = !usingUrlCreds || data === undefined || (data as any)?.error;

  return (
    <div className="mx-auto max-w-xl p-4 space-y-4">
      <h1 className="text-lg font-semibold">Repair Status</h1>
      {showPrompt && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="h-4 w-4" />
            <span>{isAuthenticated ? "Enter an order number to view." : "Access link missing. Enter order + token."}</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Input placeholder="Order number" value={orderInput} onChange={(e) => setOrderInput(e.target.value)} />
            {!isAuthenticated && (<Input placeholder="Access token" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} />)}
            <Button onClick={() => {
              const p = new URLSearchParams();
              if (orderInput) p.set("order", orderInput);
              if (!isAuthenticated && tokenInput) p.set("token", tokenInput);
              window.location.search = p.toString();
            }} disabled={!orderInput || (!isAuthenticated && !tokenInput)}>View status</Button>
          </div>
        </Card>
      )}
      {!showPrompt && data && (data as any).job && <JobView jobData={data as any} />}
    </div>
  );
}

function JobView({ jobData }: { jobData: any }) {
  const { job, events } = jobData;
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">Order #{job.orderNumber}</div>
          <span className="text-xs px-2 py-1 rounded bg-muted">{job.status}</span>
        </div>
        <div className="mt-1 text-sm opacity-80">{job.deviceModel}{job.serial ? ` • SN: ${job.serial}` : ""}</div>
        {job.eta ? <div className="mt-1 text-xs">ETA: {new Date(job.eta).toLocaleDateString()}</div> : null}
      </Card>
      <Card className="p-4">
        <div className="font-medium mb-2">Progress</div>
        <div className="space-y-3">
          {[...events].sort((a: any, b: any) => a.createdAt - b.createdAt).map((e: any) => (
            <div key={e._id}>
              <div className="text-sm">{labelFor(e.type)}</div>
              {e.message ? <div className="text-xs opacity-80">{e.message}</div> : null}
              <div className="text-[11px] opacity-60">{new Date(e.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
function labelFor(t: string) {
  if (t === "received") return "Device received";
  if (t === "diagnosis_started") return "Diagnosis started";
  if (t === "diagnosis_done") return "Diagnosis complete";
  if (t === "parts_ordered") return "Parts ordered";
  if (t === "parts_arrived") return "Parts arrived";
  if (t === "repair_started") return "Repair started";
  if (t === "repair_done") return "Repair completed";
  if (t === "qa_started") return "Quality check";
  if (t === "qa_passed") return "Quality check passed";
  if (t === "ready") return "Ready for pickup/delivery";
  if (t === "delivered") return "Delivered";
  return t;
}
EOF
}

NAVBAR() {
  # Update the Navbar component you showed (path from your code sample)
  local path="app/(marketing)/_components/navbar.tsx"
  WRITE "$path" <<'EOF'
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
import TopSiriLoader from "@/components/top-siri-loader";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Home as HomeIcon, LayoutDashboard, FolderCog, ChevronDown, FileText, PanelsTopLeft, Sparkles, Settings as Cog, User as UserIcon, Search } from "lucide-react";
import * as React from "react";

function NavItem({ href, label, Icon, active, onClick }:{ href:string; label:string; Icon:React.ComponentType<React.SVGProps<SVGSVGElement>>; active:boolean; onClick?:()=>void; }) {
  return (
    <motion.div whileHover={{ y:-1, scale:1.02 }} whileTap={{ scale:0.98 }}>
      <Link href={href} onClick={onClick} className={["inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border", active ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-white/5 border-transparent"].join(" ")}>
        <Icon className="h-4 w-4"/>{label}
      </Link>
    </motion.div>
  );
}
function ProfileButtonLg() {
  return (
    <div className="relative h-12 w-12">
      <span className="absolute -inset-[12%] pointer-events-none"><SiriGlowInvert rotateSec={3.6} innerRotateSec={4.6} blurPx={10} insetPercent={0} opacity={0.85} thicknessPx={9} inner/></span>
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-black/40 backdrop-blur"><UserButton appearance={{ elements:{ userButtonAvatarBox:"rounded-full" }}}/></div>
    </div>
  );
}

export default function Navbar(){
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [svcOpen, setSvcOpen] = React.useState(false);
  const [svcOpenMobile, setSvcOpenMobile] = React.useState(false);
  const [query, setQuery] = React.useState(""); const [drawerQuery, setDrawerQuery] = React.useState("");
  const isActive = (href:string)=> pathname===href || pathname.startsWith(href+"/");
  const submitSearch=(q:string)=>{ const v=q.trim(); if(!v) return; router.push(`/search?q=${encodeURIComponent(v)}`); };

  return (
    <>
      <TopSiriLoader/>
      <nav className="sticky top-0 z-[90] w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto max-w-7xl px-4 py-1">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <button aria-label="Open menu" onClick={()=>{setOpen(true); setTimeout(()=>{},220);}} className="h-9 w-9 grid place-items-center rounded-lg border hover:bg-white/5 transition md:hidden"><Menu className="h-4 w-4"/></button>
              <Link href="/" className="flex items-center gap-2" aria-label="Home">
                <motion.span className="hidden sm:inline-flex items-center gap-2" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.35}}>
                  <Sparkles className="h-5 w-5"/><img src="/logo.svg" alt="ETHUB" className="h-7 w-auto"/>
                </motion.span>
                <span className="sm:hidden text-base font-semibold">ETECHHUB</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center">
              <div className="relative h-10 w-10">
                <span className="absolute -inset-[10%] pointer-events-none"><SiriGlowInvert rotateSec={3.6} innerRotateSec={4.6} blurPx={10} insetPercent={-8} opacity={0.85} thicknessPx={9} inner/></span>
                <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-black/40 backdrop-blur"><UserButton appearance={{ elements:{ userButtonAvatarBox:"rounded-full" }}}/></div>
              </div>
            </div>
            <div className="md:hidden w-9 h-9"/>
          </div>
          <div className="hidden md:block">
            <form onSubmit={(e)=>{e.preventDefault(); submitSearch(query);}} className="relative w-full sm:w-96">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"/>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search…" className="h-8 pl-8 pr-3 w-full text-sm rounded-md border border-transparent bg-muted/60 focus:bg-muted/70 outline-none"/>
            </form>
          </div>
          <div className="hidden md:flex items-center gap-1 mt-2">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.35}}>
              <NavItem href="/" label="Home" Icon={HomeIcon} active={isActive("/")}/>
            </motion.div>
            <NavItem href="/dashboard" label="Dashboard" Icon={LayoutDashboard} active={isActive("/dashboard")}/>
            <div className="relative">
              <button onClick={()=>setSvcOpen(v=>!v)} className={["inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition border", pathname.startsWith("/dashboard/services") ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-white/5 border-transparent"].join(" ")}>
                <FolderCog className="h-4 w-4"/> Services <ChevronDown className={`h-4 w-4 transition ${svcOpen ? "rotate-180":""}`}/>
              </button>
              <AnimatePresence>
                {svcOpen && (
                  <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}} onMouseLeave={()=>setSvcOpen(false)} className="absolute left-0 mt-2 w-56 rounded-lg border bg-background shadow-lg p-2">
                    <Link href="/dashboard/services" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5" onClick={()=>setSvcOpen(false)}><FolderCog className="h-4 w-4"/> All Services</Link>
                    <Link href="/dashboard/services/new" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5" onClick={()=>setSvcOpen(false)}><Sparkles className="h-4 w-4"/> New Service</Link>
                    <Link href="/dashboard/services/categories" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/5" onClick={()=>setSvcOpen(false)}><PanelsTopLeft className="h-4 w-4"/> Categories</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NavItem href="/documents" label="Documents" Icon={FileText} active={isActive("/documents")}/>
            <NavItem href="/portal" label="Portal" Icon={PanelsTopLeft} active={isActive("/portal")}/>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm md:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}} onClick={()=>setOpen(false)}>
            <motion.div className="absolute left-0 top-0 h-full w-[25%] min-w-[260px] max-w-xs border-r bg-background shadow-xl flex flex-col" initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{type:"spring", stiffness:260, damping:28}} onClick={(e)=>e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 border-b">
                <span className="inline-flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4"/> Menu</span>
                <button aria-label="Close menu" onClick={()=>setOpen(false)} className="h-8 w-8 grid place-items-center rounded-md border hover:bg-white/5 transition"><X className="h-4 w-4"/></button>
              </div>
              <form onSubmit={(e)=>{e.preventDefault(); submitSearch(drawerQuery); setOpen(false);}} className="p-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"/>
                  <input value={drawerQuery} onChange={(e)=>setDrawerQuery(e.target.value)} placeholder="Search…" className="h-9 pl-8 pr-3 w-full text-sm rounded-md border border-transparent bg-muted/60 focus:bg-muted/70 outline-none"/>
                </div>
              </form>
              <div className="p-3 border-y">
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{rotate:2, scale:1.02}} transition={{type:"spring", stiffness:300, damping:18}}><ProfileButtonLg/></motion.div>
                  <div className="flex flex-col"><div className="inline-flex items-center gap-2 font-medium"><UserIcon className="h-4 w-4"/>Account</div><span className="text-xs text-muted-foreground">Profile & settings</span></div>
                </div>
              </div>
              <div className="p-2 space-y-1 overflow-y-auto">
                <Link href="/" onClick={()=>setOpen(false)} className={["flex items-center gap-3 rounded-md px-3 py-2 text-sm transition", isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-white/5"].join(" ")}><HomeIcon className="h-4 w-4"/> Home</Link>
                <Link href="/dashboard" onClick={()=>setOpen(false)} className={["flex items-center gap-3 rounded-md px-3 py-2 text-sm transition", isActive("/dashboard") ? "bg-primary text-primary-foreground" : "hover:bg-white/5"].join(" ")}><LayoutDashboard className="h-4 w-4"/> Dashboard</Link>
                <button onClick={()=>setSvcOpenMobile(v=>!v)} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-white/5"><span className="inline-flex items-center gap-3"><FolderCog className="h-4 w-4"/> Services</span><ChevronDown className={`h-4 w-4 transition ${svcOpenMobile ? "rotate-180":""}`}/></button>
                <AnimatePresence initial={false}>
                  {svcOpenMobile && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="ml-8 flex flex-col">
                      <Link href="/dashboard/services" onClick={()=>setOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-white/5">All Services</Link>
                      <Link href="/dashboard/services/new" onClick={()=>setOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-white/5">New Service</Link>
                      <Link href="/dashboard/services/categories" onClick={()=>setOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-white/5">Categories</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Link href="/documents" onClick={()=>setOpen(false)} className={["flex items-center gap-3 rounded-md px-3 py-2 text-sm transition", isActive("/documents") ? "bg-primary text-primary-foreground" : "hover:bg-white/5"].join(" ")}><FileText className="h-4 w-4"/> Documents</Link>
                <Link href="/portal" onClick={()=>setOpen(false)} className={["flex items-center gap-3 rounded-md px-3 py-2 text-sm transition", isActive("/portal") ? "bg-primary text-primary-foreground" : "hover:bg-white/5"].join(" ")}><PanelsTopLeft className="h-4 w-4"/> Portal</Link>
              </div>
              <div className="mt-auto p-2 border-t">
                <Link href="/dashboard/settings" onClick={()=>setOpen(false)} className={["flex items-center gap-3 rounded-md px-3 py-2 text-sm transition", isActive("/dashboard/settings") ? "bg-primary text-primary-foreground" : "hover:bg-white/5"].join(" ")}><Cog className="h-4 w-4"/> Settings</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
EOF
}

LAYOUT() {
  local path="app/layout.tsx"
  if [[ -f "$path" ]]; then
    if ! grep -q "ClerkProvider" "$path"; then
      WRITE "$path" <<'EOF'
"use client";
import "./globals.css";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/app/(marketing)/_components/navbar";
import AssistantLauncher from "@/components/assistant-launcher";

type RootLayoutProps = { children: React.ReactNode; };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
        <body className="min-h-screen bg-background text-foreground antialiased">
          <ConvexClientProvider>
            <Navbar />
            <AssistantLauncher />
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster richColors />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
EOF
    else
      echo "Skip: layout already wrapped with ClerkProvider"
    fi
  else
    echo "Warn: app/layout.tsx not found; skipping layout update"
  fi
}

MAIN() {
  ROOT_CHECK
  if [[ $# -eq 0 || "$1" == "--all" ]]; then
    PAGES
    NAVBAR
    LAYOUT
    ADD_NO_SCROLLBAR_TO_GLOBALS
    echo "Done: pages, navbar, layout updated."
  else
    for arg in "$@"; do
      case "$arg" in
        --pages) PAGES ;;
        --navbar) NAVBAR ;;
        --layout) LAYOUT ;;
        *) echo "Unknown arg: $arg"; exit 2 ;;
      esac
    done
    ADD_NO_SCROLLBAR_TO_GLOBALS
    echo "Done."
  fi
}

MAIN "$@"
