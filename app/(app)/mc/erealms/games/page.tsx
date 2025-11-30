"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const games = [
  {
    title: "eRealms 2014",
    desc: "My first public world. Messy spawn, broken warps, and the first time strangers logged into something I hosted.",
    img: "/games/erealms-2014-1.jpg",
  },
  {
    title: "Reboots & Resets",
    desc: "Each reboot was a lesson in backups, plugins, and accepting that progress sometimes meant starting over.",
    img: "/games/erealms-reboot.gif",
  },
  {
    title: "Build Servers",
    desc: "Creative hubs that taught me about worldedit, region protection, and the joy of just letting people build.",
    img: "/games/erealms-build.png",
  },
  {
    title: "PvP Experiments",
    desc: "Lag, balance issues, and intense chats – my crash course in performance, fairness, and community management.",
    img: "/games/erealms-pvp.png",
  },
  {
    title: "Season Launches",
    desc: "Announcing wipes and new seasons while quietly hoping the server wouldn’t choke under everyone logging in at once.",
    img: "/games/erealm-launch.png",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <main className="relative mx-auto max-w-5xl px-4 pb-24 pt-20 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_55%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-emerald-500/20 via-sky-500/10 to-transparent blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            eRealms · Worlds & Games
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            The worlds that secretly trained me for infra work
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 md:text-base">
            These weren’t just maps. They were live labs for uptime, community,
            and adaptation. Every broken region and lag spike pushed me closer
            to thinking like a systems engineer.
          </p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {games.map((game, i) => (
            <motion.article
              key={game.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-sm"
            >
              <div className="relative h-40 w-full overflow-hidden md:h-48">
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.02 }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={game.img}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                </motion.div>
              </div>
              <div className="space-y-2 p-4">
                <h2 className="text-sm font-semibold md:text-base">
                  {game.title}
                </h2>
                <p className="text-xs text-slate-300 md:text-sm">
                  {game.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
}
