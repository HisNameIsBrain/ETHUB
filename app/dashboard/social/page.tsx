"use client";

import Link from "next/link";
import { useState } from "react";
import type React from "react";
import { motion } from "framer-motion";
import {
  Archive,
  BellRing,
  Flag,
  Heart,
  Image,
  Lock,
  MessageCircle,
  MessagesSquare,
  Paperclip,
  RefreshCcw,
  Send,
  Share2,
  ShieldBan,
  ShieldCheck,
  Sparkles,
  Sticker,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { useEdgeStore } from "@/lib/edgestore";

type UploadedAttachment = {
  id: string;
  url: string;
  type: "image" | "sticker" | "gif" | "file";
  name?: string;
  uploading?: boolean;
  progress?: number;
};

type FeedAttachment = { url: string; type: UploadedAttachment["type"] };

type Post = {
  id: string;
  author: string;
  handle: string;
  isAdmin: boolean;
  content: string;
  likes: number;
  reposts: number;
  replies: number;
  timestamp: string;
  attachments: FeedAttachment[];
  subscribed: boolean;
};

const starterPosts: Post[] = [
  {
    id: "1",
    author: "ETHUB Admin",
    handle: "@ethub-sec",
    isAdmin: true,
    content:
      "Shipping a Bluesky-inspired social lane. Admins own the feed, members can like, repost, reply, subscribe, and open encrypted DMs.",
    likes: 188,
    reposts: 42,
    replies: 29,
    timestamp: "2m",
    attachments: [
      {
        url: "https://images.unsplash.com/photo-1527437934671-61474b530017?auto=format&fit=crop&w=800&q=80",
        type: "image" as const,
      },
    ],
    subscribed: true,
  },
  {
    id: "2",
    author: "Security Blue Team",
    handle: "@blue.ops",
    isAdmin: true,
    content:
      "Retro thread is live — quote this post with your findings. Replays, stickers, gifs, and encrypted attachments are enabled for responders.",
    likes: 96,
    reposts: 20,
    replies: 17,
    timestamp: "14m",
    attachments: [],
    subscribed: false,
  },
  {
    id: "3",
    author: "Pulse Labs",
    handle: "@pulse",
    isAdmin: false,
    content:
      "Loving the new bubbly nav + glow! DM requests are encrypted, and mods can flag/ban in-line without taking the feed offline.",
    likes: 64,
    reposts: 12,
    replies: 11,
    timestamp: "45m",
    attachments: [],
    subscribed: false,
  },
];

const starterConversations = [
  {
    id: "ops",
    title: "Ops Desk",
    handle: "@ops-lead",
    unread: 2,
    encrypted: true,
    pinned: true,
    messages: [
      {
        id: "m1",
        sender: "@ops-lead",
        content: "Rotated keys on build runner. Need sign-off?",
        time: "8:10",
        attachments: [],
      },
      {
        id: "m2",
        sender: "you",
        content: "Yes, attach the patch diff and I will archive it to the incident room.",
        time: "8:12",
        attachments: [],
      },
    ],
  },
  {
    id: "creators",
    title: "Creators",
    handle: "@orbit",
    unread: 0,
    encrypted: true,
    pinned: false,
    messages: [
      {
        id: "m3",
        sender: "@orbit",
        content: "Can we ship GIF/sticker reactions to the announcements?",
        time: "7:55",
        attachments: [],
      },
    ],
  },
];

type Conversation = (typeof starterConversations)[number];

export default function SocialPage() {
  const { user, isLoaded } = useUser();
  const { edgestore } = useEdgeStore();

  const [posts, setPosts] = useState<Post[]>(starterPosts);
  const [composer, setComposer] = useState({
    text: "",
    attachments: [] as UploadedAttachment[],
    isAdminBroadcast: true,
  });
  const [conversations, setConversations] = useState<Conversation[]>(
    starterConversations,
  );
  const [activeConversationId, setActiveConversationId] = useState(
    starterConversations[0]?.id ?? "",
  );
  const [dmInput, setDmInput] = useState("");
  const [moderation, setModeration] = useState({
    flaggedHandle: "",
    banList: ["@spark"],
  });

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const isAuthenticated = !!user;

  async function handleAttachment(files: FileList | null) {
    if (!isAuthenticated) return;
    if (!files?.length) return;

    const uploads: UploadedAttachment[] = [];
    for (const file of Array.from(files)) {
      const tempId = crypto.randomUUID();
      const optimistic: UploadedAttachment = {
        id: tempId,
        name: file.name,
        url: "",
        type: "image",
        uploading: true,
        progress: 0,
      };
      setComposer((prev) => ({
        ...prev,
        attachments: [...prev.attachments, optimistic],
      }));

      try {
        const result = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setComposer((prev) => ({
              ...prev,
              attachments: prev.attachments.map((att) =>
                att.id === tempId ? { ...att, progress } : att,
              ),
            }));
          },
        });

        uploads.push({
          id: tempId,
          url: result.url,
          type: "image",
          name: file.name,
          uploading: false,
          progress: 100,
        });
      } catch (error) {
        console.error("Upload failed", error);
        setComposer((prev) => ({
          ...prev,
          attachments: prev.attachments.filter((att) => att.id !== tempId),
        }));
      }
    }

    if (uploads.length) {
      setComposer((prev) => ({
        ...prev,
        attachments: prev.attachments.map((att) =>
          uploads.find((u) => u.id === att.id) ?? att,
        ),
      }));
    }
  }

  function handlePublish() {
    if (!isAuthenticated) return;
    if (!composer.text.trim()) return;

    const newPost: Post = {
      id: crypto.randomUUID(),
      author: user?.fullName || user?.username || "You",
      handle: `@${user?.username || "ethub-user"}`,
      isAdmin: composer.isAdminBroadcast,
      content: composer.text,
      likes: 0,
      reposts: 0,
      replies: 0,
      timestamp: "now",
      attachments: composer.attachments.map((att) => ({
        url: att.url,
        type: att.type,
      })),
      subscribed: true,
    };

    setPosts((prev) => [newPost, ...prev]);
    setComposer({ text: "", attachments: [], isAdminBroadcast: true });
  }

  function toggleReaction(postId: string, field: "likes" | "reposts") {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              [field]: post[field] + 1,
            }
          : post,
      ),
    );
  }

  function subscribe(postId: string) {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              subscribed: !post.subscribed,
            }
          : post,
      ),
    );
  }

  function sendMessage() {
    if (!dmInput.trim() || !activeConversation) return;

    const message = {
      id: crypto.randomUUID(),
      sender: "you",
      content: dmInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: [],
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: [...c.messages, message], unread: 0 }
          : c,
      ),
    );
    setDmInput("");
  }

  function flagHandle() {
    if (!moderation.flaggedHandle.trim()) return;
    setModeration((prev) => ({
      ...prev,
      banList: Array.from(new Set([...prev.banList, prev.flaggedHandle])),
      flaggedHandle: "",
    }));
  }

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      <HeroBar isSignedIn={!!user} />

      {!user && <SignedOutCTA />}

      <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
        <div className="space-y-4">
          <Composer
            composer={composer}
            isAuthenticated={isAuthenticated}
            onTextChange={(text) => setComposer((prev) => ({ ...prev, text }))}
            onAdminToggle={(isAdminBroadcast) =>
              setComposer((prev) => ({ ...prev, isAdminBroadcast }))
            }
            onUpload={handleAttachment}
            onPublish={handlePublish}
          />

          <Feed
            posts={posts}
            onLike={(id) => toggleReaction(id, "likes")}
            onRepost={(id) => toggleReaction(id, "reposts")}
            onSubscribe={subscribe}
          />
        </div>

        <div className="space-y-4">
          <ModerationCard
            moderation={moderation}
            onFlag={flagHandle}
            onChange={(value) => setModeration((prev) => ({ ...prev, ...value }))}
          />
          <DirectMessages
            conversations={conversations}
            activeConversationId={activeConversationId}
            onChangeConversation={setActiveConversationId}
            onSend={sendMessage}
            dmInput={dmInput}
            onDmChange={setDmInput}
          />
        </div>
      </div>
    </div>
  );
}

function HeroBar({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/80 via-slate-950 to-black p-6 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.18),transparent_38%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,0.14),transparent_34%)] blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-slate-100">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Social + Messaging</p>
          <h1 className="text-3xl font-semibold text-white">
            Bluesky-style feed with encrypted DMs and glowing bubbles
          </h1>
          <p className="max-w-3xl text-sm text-slate-200">
            Admins can create, edit, delete, and archive broadcasts. Members can like, share, comment, subscribe, and DM with end-to-end encryption. Attach images, stickers, and GIFs via EdgeStore uploads.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-indigo-100">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Lock className="h-3.5 w-3.5" />
              E2E messaging
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <UploadCloud className="h-3.5 w-3.5" />
              EdgeStore uploads
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              Glow-backed mobile bubbles
            </span>
          </div>
        </div>
        <div className="relative isolate w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 shadow-lg">
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Realtime status</p>
              <h3 className="text-lg font-semibold text-white">{isSignedIn ? "Signed in" : "Guest preview"}</h3>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </div>
          <ul className="mt-3 space-y-2 text-xs text-slate-200">
            <li className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-cyan-200" />
              DMs encrypted with attachment controls
            </li>
            <li className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-amber-200" />
              Subscribe for admin drops
            </li>
            <li className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-rose-200" />
              Reposts, quotes, likes, comments enabled
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function SignedOutCTA() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
      <div className="space-y-0.5">
        <p className="text-base font-semibold text-white">Authenticate with Clerk</p>
        <p className="text-slate-300">
          Sign in to publish broadcasts, join conversations, and keep your DMs encrypted end-to-end.
        </p>
      </div>
      <div className="flex gap-2 text-sm font-semibold">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 hover:bg-white/20"
        >
          <UserPlus className="h-4 w-4" />
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-background"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

function Composer({
  composer,
  isAuthenticated,
  onTextChange,
  onAdminToggle,
  onUpload,
  onPublish,
}: {
  composer: { text: string; attachments: UploadedAttachment[]; isAdminBroadcast: boolean };
  isAuthenticated: boolean;
  onTextChange: (value: string) => void;
  onAdminToggle: (value: boolean) => void;
  onUpload: (files: FileList | null) => void;
  onPublish: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-xl">
      {!isAuthenticated && (
        <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm" aria-hidden>
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-200">
            Sign in to publish and upload attachments
          </div>
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.08),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.08),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(94,234,212,0.08),transparent_45%)]" />
      <div className="flex items-center justify-between text-sm text-indigo-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Compose broadcast or reply</span>
        </div>
        <label className="inline-flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={composer.isAdminBroadcast}
            onChange={(e) => onAdminToggle(e.target.checked)}
            className="h-4 w-4 rounded border-white/30 bg-white/10"
            disabled={!isAuthenticated}
          />
          Admin-only publish
        </label>
      </div>
      <textarea
        value={composer.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Write a Bluesky-style post, mention @handles, or paste a link…"
        className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400 focus:border-white/20 focus:outline-none"
        rows={4}
        disabled={!isAuthenticated}
      />

      {composer.attachments.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {composer.attachments.map((att) => (
            <div
              key={att.id}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              {att.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={att.url} alt={att.name || "upload"} className="h-32 w-full object-cover" />
              ) : (
                <div className="grid h-32 place-items-center text-xs text-slate-200">
                  Uploading {att.name}
                </div>
              )}
              {att.uploading && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                    style={{ width: `${att.progress ?? 0}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-100">
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10">
            <Image className="h-3.5 w-3.5" />
            Add images / GIFs
            <input
              type="file"
              accept="image/*"
              className="hidden"
              multiple
              onChange={(e) => onUpload(e.target.files)}
              disabled={!isAuthenticated}
            />
          </label>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
            <Sticker className="h-3.5 w-3.5" />
            Stickers
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
            <Lock className="h-3.5 w-3.5" />
            E2E by default
          </span>
        </div>
        <button
          onClick={onPublish}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:brightness-110"
          disabled={!isAuthenticated}
        >
          <Sparkles className="h-4 w-4" />
          Publish
        </button>
      </div>
    </div>
  );
}

function Feed({
  posts,
  onLike,
  onRepost,
  onSubscribe,
}: {
  posts: Post[];
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onSubscribe: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-inner"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.06),transparent_42%),radial-gradient(circle_at_80%_40%,rgba(236,72,153,0.06),transparent_40%)]" />
          <header className="flex items-center justify-between gap-3 text-sm text-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-100">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
                  {post.isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <MessagesSquare className="h-3.5 w-3.5" />}
                  {post.isAdmin ? "Admin broadcast" : "Member post"}
                </span>
                <span className="text-slate-400">{post.timestamp}</span>
              </div>
              <p className="text-base font-semibold text-white">{post.author}</p>
              <p className="text-xs text-slate-400">{post.handle}</p>
            </div>
            {post.subscribed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-200">
                <BellRing className="h-3.5 w-3.5" />
                Subscribed
              </span>
            ) : (
              <button
                onClick={() => onSubscribe(post.id)}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-100 transition hover:bg-white/20"
              >
                <BellRing className="h-3.5 w-3.5" />
                Subscribe
              </button>
            )}
          </header>

          <p className="mt-2 text-sm text-slate-100">{post.content}</p>

          {post.attachments.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {post.attachments.map((att, idx) => (
                <div key={`${post.id}-${idx}`} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={att.url} alt="attachment" className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-indigo-100">
            <ActionChip Icon={Heart} label={`Like ${post.likes}`} onClick={() => onLike(post.id)} />
            <ActionChip Icon={RefreshCcw} label={`Repost ${post.reposts}`} onClick={() => onRepost(post.id)} />
            <ActionChip Icon={MessageCircle} label={`Reply ${post.replies}`} />
            <ActionChip Icon={Share2} label="Quote / Share" />
            <ActionChip Icon={Archive} label="Archive" />
            <ActionChip Icon={Flag} label="Flag" />
          </div>
        </article>
      ))}
    </div>
  );
}

function ModerationCard({
  moderation,
  onFlag,
  onChange,
}: {
  moderation: { flaggedHandle: string; banList: string[] };
  onFlag: () => void;
  onChange: (value: Partial<{ flaggedHandle: string; banList: string[] }>) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-xl">
      <div className="flex items-center gap-2 text-sm text-white">
        <ShieldBan className="h-4 w-4 text-amber-300" />
        <h3 className="text-lg font-semibold">Moderation</h3>
      </div>
      <p className="mt-2 text-xs text-slate-300">
        Flag, soft-ban, and archive messages without interrupting the social feed. Actions mirror Bluesky moderation controls.
      </p>

      <div className="mt-3 space-y-2 text-sm text-slate-200">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
          <input
            value={moderation.flaggedHandle}
            onChange={(e) => onChange({ flaggedHandle: e.target.value })}
            placeholder="@handle to flag or ban"
            className="flex-1 rounded-xl bg-transparent px-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onFlag}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-100 transition hover:bg-white/20"
          >
            <Flag className="h-3.5 w-3.5" />
            Flag / Ban
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-indigo-100">
          <p className="mb-2 flex items-center gap-2 text-sm text-white">
            <Archive className="h-4 w-4" />
            Archived & banned handles
          </p>
          <div className="flex flex-wrap gap-2">
            {moderation.banList.map((handle) => (
              <span key={handle} className="rounded-full bg-white/10 px-3 py-1">
                {handle}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectMessages({
  conversations,
  activeConversationId,
  onChangeConversation,
  onSend,
  dmInput,
  onDmChange,
}: {
  conversations: Conversation[];
  activeConversationId: string;
  onChangeConversation: (id: string) => void;
  onSend: () => void;
  dmInput: string;
  onDmChange: (value: string) => void;
}) {
  const active = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-xl">
      <div className="grid gap-4 md:grid-cols-[1.2fr_2fr]">
        <div className="border-b border-white/5 p-4 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between text-sm text-indigo-100">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4" />
              <span>Encrypted DMs</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px]">
              <Lock className="h-3 w-3" />
              E2E
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onChangeConversation(conversation.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${conversation.id === activeConversationId ? "border-white/20 bg-white/10" : "border-white/5 bg-white/5 hover:border-white/10"}`}
              >
                <div className="flex items-center justify-between text-slate-100">
                  <span className="font-semibold">{conversation.title}</span>
                  {conversation.unread > 0 && (
                    <span className="rounded-full bg-emerald-500/20 px-2 text-[11px] text-emerald-200">
                      {conversation.unread} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{conversation.handle}</p>
                <div className="mt-1 inline-flex items-center gap-2 text-[11px] text-indigo-100">
                  {conversation.encrypted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                      <Lock className="h-3 w-3" />
                      Encrypted
                    </span>
                  )}
                  {conversation.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                      <Sparkles className="h-3 w-3" />
                      Pinned
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {active ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-200">
                  <p className="text-base font-semibold text-white">{active.title}</p>
                  <p className="text-xs text-slate-400">{active.handle} • encrypted</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-100">
                  <Share2 className="h-3.5 w-3.5" />
                  Share securely
                </span>
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
                {active.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl px-3 py-2 ${message.sender === "you" ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white" : "bg-white/5"}`}
                  >
                    <div className="flex items-center justify-between text-xs text-indigo-100">
                      <span>{message.sender}</span>
                      <span className="text-slate-400">{message.time}</span>
                    </div>
                    <p className="mt-1 text-slate-100">{message.content}</p>
                    {message.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map((file) => (
                          <span key={file.id} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] text-indigo-100">
                            <Paperclip className="h-3 w-3" />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                <div className="flex items-center gap-2 text-[11px] text-indigo-100">
                  <Lock className="h-3.5 w-3.5" /> Messages, attachments, stickers encrypted at rest and in transit
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={dmInput}
                    onChange={(e) => onDmChange(e.target.value)}
                    placeholder="Send a secure message with @mentions"
                    className="flex-1 rounded-xl bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={onSend}
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:brightness-110"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
              Select a conversation to start encrypted messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionChip({
  Icon,
  label,
  onClick,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 transition hover:bg-white/10"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
