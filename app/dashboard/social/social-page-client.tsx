"use client";

import React from "react";
import Link from "next/link";

type TabKey = "feed" | "messages" | "groups";

type User = {
  id: string;
  name: string;
  handle: string;
};

type Post = {
  id: string;
  author: User;
  createdAtLabel: string;
  body: string;
  likes: number;
  comments: number;
};

type Thread = {
  id: string;
  peer: User;
  lastMessage: string;
  updatedAtLabel: string;
  unread: number;
};

type Group = {
  id: string;
  name: string;
  members: number;
  description: string;
  joined: boolean;
};

const me: User = { id: "me", name: "Brain", handle: "@brain" };

const seedUsers: User[] = [
  { id: "u1", name: "Alex", handle: "@alex" },
  { id: "u2", name: "Mia", handle: "@mia" },
  { id: "u3", name: "Noah", handle: "@noah" },
];

const seedPosts: Post[] = [
  {
    id: "p1",
    author: seedUsers[0],
    createdAtLabel: "Today",
    body: "Shipping a new module in ETHUB. Next: social feed + DMs.",
    likes: 12,
    comments: 3,
  },
  {
    id: "p2",
    author: seedUsers[1],
    createdAtLabel: "Yesterday",
    body: "Anyone testing Next.js 15 + React 19 in Termux? Curious about watchpack.",
    likes: 8,
    comments: 6,
  },
];

const seedThreads: Thread[] = [
  {
    id: "t1",
    peer: seedUsers[2],
    lastMessage: "Send me the route structure you’re using for /dashboard/social.",
    updatedAtLabel: "2m",
    unread: 2,
  },
  {
    id: "t2",
    peer: seedUsers[0],
    lastMessage: "Got it. Rename nav.config.js → .ts fixed the build.",
    updatedAtLabel: "1h",
    unread: 0,
  },
];

const seedGroups: Group[] = [
  {
    id: "g1",
    name: "Repairs Lab",
    members: 142,
    description: "Diagnostics, parts sourcing, microsoldering workflows.",
    joined: true,
  },
  {
    id: "g2",
    name: "Builders",
    members: 87,
    description: "Full-stack, Next.js, Convex, automation, deployment.",
    joined: false,
  },
  {
    id: "g3",
    name: "Design & UI",
    members: 64,
    description: "Nav systems, shadcn UI patterns, motion, visuals.",
    joined: false,
  },
];

export function SocialPageClient() {
  const [tab, setTab] = React.useState<TabKey>("feed");

  // feed state
  const [posts, setPosts] = React.useState<Post[]>(seedPosts);
  const [composer, setComposer] = React.useState("");

  // messages state
  const [threads, setThreads] = React.useState<Thread[]>(seedThreads);
  const [activeThreadId, setActiveThreadId] = React.useState<string>(seedThreads[0]?.id ?? "");
  const [messageDraft, setMessageDraft] = React.useState("");

  // groups state
  const [groups, setGroups] = React.useState<Group[]>(seedGroups);
  const [groupQuery, setGroupQuery] = React.useState("");

  const activeThread = React.useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  );

  function createPost() {
    const body = composer.trim();
    if (!body) return;

    const newPost: Post = {
      id: `p_${Date.now()}`,
      author: me,
      createdAtLabel: "Now",
      body,
      likes: 0,
      comments: 0,
    };

    setPosts((p) => [newPost, ...p]);
    setComposer("");
  }

  function likePost(postId: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  }

  function openThread(id: string) {
    setActiveThreadId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  }

  function sendMessage() {
    const text = messageDraft.trim();
    if (!text || !activeThread) return;

    // simple “echo” behavior for UI placeholder: update last message + time
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, lastMessage: `You: ${text}`, updatedAtLabel: "Now" }
          : t
      )
    );
    setMessageDraft("");
  }

  function toggleGroupJoin(groupId: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, joined: !g.joined } : g))
    );
  }

  const filteredGroups = React.useMemo(() => {
    const q = groupQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
    );
  }, [groups, groupQuery]);

  return (
    <div className="min-h-[calc(100vh-0px)] p-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard Social</h1>
          <p className="text-sm text-muted-foreground">
            Feed, messages, and groups (placeholder UI, ready to wire to Convex).
          </p>
        </div>

        <div className="flex gap-2">
          <Link className="rounded-md border px-3 py-2 text-sm hover:bg-accent" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-md border px-3 py-2 text-sm hover:bg-accent" href="/">
            Home
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>
          Feed
        </TabButton>
        <TabButton active={tab === "messages"} onClick={() => setTab("messages")}>
          Messages
          {threads.some((t) => t.unread > 0) ? (
            <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">
              {threads.reduce((n, t) => n + t.unread, 0)}
            </span>
          ) : null}
        </TabButton>
        <TabButton active={tab === "groups"} onClick={() => setTab("groups")}>
          Groups
        </TabButton>
      </div>

      {tab === "feed" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="lg:col-span-1 rounded-xl border p-4 space-y-3">
            <h2 className="font-medium">Create post</h2>
            <textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="Write an update..."
              className="w-full min-h-[110px] rounded-md border bg-background p-3 text-sm outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={createPost}
                className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                Post
              </button>
            </div>

            <div className="rounded-lg border p-3 text-xs text-muted-foreground space-y-1">
              <div className="font-medium text-foreground">Next wiring</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Convex: posts query + create mutation</li>
                <li>EdgeStore: upload media attachments</li>
                <li>Reactions/comments tables</li>
              </ul>
            </div>
          </section>

          <section className="lg:col-span-2 rounded-xl border p-4 space-y-4">
            <h2 className="font-medium">Feed</h2>
            <div className="space-y-3">
              {posts.map((p) => (
                <article key={p.id} className="rounded-xl border p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium leading-5">{p.author.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.author.handle} • {p.createdAtLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => likePost(p.id)}
                      className="shrink-0 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                    >
                      Like ({p.likes})
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{p.body}</p>
                  <div className="text-xs text-muted-foreground">
                    Comments: {p.comments}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "messages" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="lg:col-span-1 rounded-xl border p-4 space-y-3">
            <h2 className="font-medium">Threads</h2>
            <div className="space-y-2">
              {threads.map((t) => {
                const active = t.id === activeThreadId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => openThread(t.id)}
                    className={[
                      "w-full text-left rounded-lg border p-3 hover:bg-accent",
                      active ? "bg-accent" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{t.peer.name}</div>
                      <div className="text-xs text-muted-foreground">{t.updatedAtLabel}</div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {t.lastMessage}
                    </div>
                    {t.unread > 0 ? (
                      <div className="mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs">
                        Unread: {t.unread}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-2 rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium">
                {activeThread ? `Chat with ${activeThread.peer.name}` : "Chat"}
              </h2>
              <div className="text-xs text-muted-foreground">
                Placeholder chat (wire to your DM module later)
              </div>
            </div>

            <div className="rounded-lg border p-3 space-y-2 text-sm">
              {activeThread ? (
                <>
                  <Bubble who={activeThread.peer.name} text={activeThread.lastMessage} />
                  <Bubble who="You" text="(Messages will render here when wired to DB.)" />
                </>
              ) : (
                <div className="text-muted-foreground">Select a thread.</div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
                disabled={!activeThread}
              >
                Send
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === "groups" && (
        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-medium">Groups</h2>
            <input
              value={groupQuery}
              onChange={(e) => setGroupQuery(e.target.value)}
              placeholder="Search groups..."
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none sm:w-[320px]"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.map((g) => (
              <div key={g.id} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{g.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Members: {g.members}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleGroupJoin(g.id)}
                    className="shrink-0 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    {g.joined ? "Leave" : "Join"}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md border px-3 py-1.5 text-sm",
        active ? "bg-accent" : "hover:bg-accent",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
