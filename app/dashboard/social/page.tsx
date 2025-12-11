"use client";

import type React from "react";
import {
  Archive,
  BellRing,
  Edit3,
  Flag,
  Heart,
  Image,
  Layers,
  Link2,
  Lock,
  MessageCircle,
  MessagesSquare,
  Share2,
  ShieldBan,
  ShieldCheck,
  Sparkles,
  Sticker,
  Trash2,
  UploadCloud,
} from "lucide-react";

const adminPosts = [
  {
    title: "Security roadmap drop",
    summary:
      "Admins broadcast zero-trust rollouts, recovery runbooks, and cross-team drills. Users are locked to likes, shares, comments, and subscribes.",
    tags: ["Broadcast", "Zero-trust", "Mobile-first"],
    actions: ["Create", "Edit", "Delete", "Archive"],
    stats: { likes: 124, shares: 38, comments: 19, subscribers: 402 },
  },
  {
    title: "Incident retro & patch notes",
    summary:
      "Postmortems stay encrypted at rest. Only admins can update; users interact socially without mutating source of truth.",
    tags: ["Post", "Encrypted", "Immutable"],
    actions: ["Edit", "Archive"],
    stats: { likes: 96, shares: 22, comments: 44, subscribers: 367 },
  },
];

const moderationQueue = [
  { user: "@aurora", reason: "Flagged DM: suspicious link", status: "Flagged" },
  { user: "@spark", reason: "Comment spam", status: "Banned" },
  { user: "@orbit", reason: "Attachment review", status: "Queued" },
];

const threads = [
  {
    title: "Encrypted DM: build updates",
    participants: ["you", "@ops-lead"],
    lastMessage: "Shared release gif + deployment sticker; key rotated automatically.",
    attachments: ["Images", "Stickers", "GIF"],
    status: "E2E protected",
  },
  {
    title: "Customer triage",
    participants: ["you", "@admin", "@security"],
    lastMessage: "Pinned audit log and locked archive for posterity.",
    attachments: ["Logs", "Screenshots"],
    status: "Archive-ready",
  },
];

const attachmentPalette = [
  { label: "Images", description: "PNG/JPG previews with blur-safe thumbnails.", Icon: Image },
  { label: "Stickers", description: "Reaction packs that respect moderation rules.", Icon: Sticker },
  { label: "GIF", description: "Looping clips stay encrypted until render.", Icon: UploadCloud },
];

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/70 via-slate-900 to-black p-6 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.15),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(94,234,212,0.12),transparent_35%)] blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">Community + Secure Messaging</p>
            <h1 className="text-3xl font-bold text-white">Admin-led social feed with encrypted DMs</h1>
            <p className="max-w-3xl text-sm text-slate-200">
              Admins publish posts with full edit/create/delete/archive controls. Users can only like, share, comment, and subscribe
              for notification pings. Direct messages stay end-to-end encrypted with attachment controls, bans, and flagging hooks.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-indigo-100">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <Lock className="h-3.5 w-3.5" />
                Encryption on by default
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <BellRing className="h-3.5 w-3.5" />
                Subscribe for drops
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Glow-backed bubbles for mobile nav
              </span>
            </div>
          </div>
          <div className="relative isolate w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 shadow-lg">
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Broadcast defaults</p>
                <h3 className="text-lg font-semibold text-white">Admin only publishing</h3>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-300" />
                Users: like, share, comment, subscribe only
              </li>
              <li className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-cyan-200" />
                Admins: create, edit, delete, archive posts
              </li>
              <li className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-amber-200" />
                Flag + ban flows wired for moderation
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Admin feed</p>
              <h2 className="text-xl font-semibold text-white">Broadcast posts</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-indigo-100">
              <Sparkles className="h-4 w-4" />
              Locked interactions for members
            </div>
          </header>

          <div className="space-y-3">
            {adminPosts.map((post) => (
              <article
                key={post.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-inner"
              >
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(94,234,212,0.08),transparent_45%),radial-gradient(circle_at_80%_40%,rgba(129,140,248,0.08),transparent_45%)]" />
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-100">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
                        <Lock className="h-3.5 w-3.5" />
                        Admin broadcast
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
                        <Layers className="h-3.5 w-3.5" />
                        Immutable content
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-white">{post.title}</h3>
                    <p className="text-sm text-slate-200">{post.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-indigo-100">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center text-xs text-indigo-100">
                    <Stat label="Likes" value={post.stats.likes} />
                    <Stat label="Shares" value={post.stats.shares} />
                    <Stat label="Comments" value={post.stats.comments} />
                    <Stat label="Subscribers" value={post.stats.subscribers} />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-indigo-100">
                  {post.actions.map((action) => (
                    <button
                      key={action}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10"
                    >
                      {action === "Create" && <Sparkles className="h-3.5 w-3.5" />}
                      {action === "Edit" && <Edit3 className="h-3.5 w-3.5" />}
                      {action === "Delete" && <Trash2 className="h-3.5 w-3.5" />}
                      {action === "Archive" && <Archive className="h-3.5 w-3.5" />}
                      {action}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100">
                  <ActionPill Icon={Heart} label="Like" />
                  <ActionPill Icon={Share2} label="Share" />
                  <ActionPill Icon={MessageCircle} label="Comment" />
                  <ActionPill Icon={BellRing} label="Subscribe" />
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg">
            <div className="flex items-center justify-between text-sm text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Profile preview</p>
                <h3 className="text-lg font-semibold">Member card</h3>
              </div>
              <Lock className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-2 text-sm text-slate-200">
              Build a social-grade profile that still respects admin-only publishing. Users follow to get notifications while DM permissions stay scoped.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-indigo-100">
              <span className="rounded-xl bg-white/5 px-3 py-2">Notify on admin drops</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">DM requests encrypted</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">Attachments allowed</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">Ban + flag ready</span>
            </div>
          </div>

          <div id="moderation" className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-white">
              <ShieldBan className="h-4 w-4 text-amber-300" />
              <h3 className="text-lg font-semibold">Flagging & bans</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Moderation is explicit: flagged items, soft bans, and attachment reviews ready for staff-only escalation.
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              {moderationQueue.map((item) => (
                <div
                  key={item.user}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold text-white">{item.user}</p>
                    <p className="text-xs text-slate-300">{item.reason}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] text-indigo-100">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section id="dm" className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Direct encrypted messaging</p>
              <h2 className="text-xl font-semibold text-white">DM threads</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-indigo-100">
              <MessagesSquare className="h-4 w-4" />
              Attachments allowed
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {threads.map((thread) => (
              <article
                key={thread.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-inner"
              >
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.08),transparent_40%)]" />
                <div className="flex items-center justify-between text-xs text-indigo-100">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
                    <Lock className="h-3.5 w-3.5" />
                    {thread.status}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Archive + ban ready
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{thread.title}</h3>
                <p className="text-sm text-slate-200">{thread.lastMessage}</p>
                <p className="mt-1 text-xs text-indigo-100">Participants: {thread.participants.join(", ")}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100">
                  {thread.attachments.map((attachment) => (
                    <span key={attachment} className="rounded-full bg-white/5 px-3 py-1">
                      {attachment}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100">
                  <ActionPill Icon={MessageCircle} label="Reply" />
                  <ActionPill Icon={Share2} label="Share securely" />
                  <ActionPill Icon={Archive} label="Archive thread" />
                  <ActionPill Icon={Flag} label="Flag" />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-white">
              <UploadCloud className="h-4 w-4 text-cyan-300" />
              <h3 className="text-lg font-semibold">Attachments</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Image, sticker, and GIF delivery remains encrypted until rendered. Moderation can pause or ban abusive senders.
            </p>
            <div className="mt-3 space-y-2">
              {attachmentPalette.map(({ label, description, Icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
                >
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-indigo-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-300">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-white">
              <Link2 className="h-4 w-4 text-emerald-300" />
              <h3 className="text-lg font-semibold">Notifications & subscriptions</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Subscriptions stay one-way: users subscribe to admin updates and get push/email pings without write access.
            </p>
            <div className="mt-3 grid gap-2 text-xs text-indigo-100">
              <span className="rounded-xl bg-white/5 px-3 py-2">Digest + instant pings</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">Mobile-friendly bubbles</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">Glow feedback on tap</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionPill({
  Icon,
  label,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-100">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/5 px-2 py-1">
      <p className="text-[11px] uppercase tracking-wide text-indigo-100">{label}</p>
      <p className="text-base font-semibold text-white">{value}</p>
    </div>
  );
}
