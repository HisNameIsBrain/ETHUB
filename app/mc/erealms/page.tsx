// app/games/page.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GamesPage() {
  const timeline = [
    {
      date: "February 2014",
      title: "The First Signal",
      text: `A teenager under the name HisNameIsBrain began giving away Minecraft servers.
      The post read: “eDevil is taking a break… We’re giving away free servers! Click here for your free server → edevil.net/erealms.” 
      That link—eRealms—was the beginning of everything.`,
      img: "/games/erealms-2014-1.jpg",
    },
    {
      date: "Early March 2014",
      title: "Building the World",
      text: `You and @DevoRX_ began laying blocks on what would become eRealms’ main PC server. 
      Tweets showed the arena forming—stone walls, red battlegrounds, glowing circles. A world taking shape.`,
      img: "/games/erealms-build.jpg",
    },
    {
      date: "March 6, 2014",
      title: "eRealms Reboots",
      text: `“eDevil Hosting is coming back, and this time it’s getting real.”  
      Behind that playful confidence was the drive to lead, manage a team, and build a community from scratch.`,
      img: "/games/erealms-reboot.jpg",
    },
    {
      date: "March 9, 2014",
      title: "The PvP Arena",
      text: `“Today we are working on the PVP Arena. It looks amazing!”  
      The iconic lava-ringed battleground became the heart of eRealms—your first designed player experience.`,
      img: "/games/erealms-pvp.jpg",
    },
    {
      date: "March 13–16, 2014",
      title: "Launch Week",
      text: `You finished your Android management app, prepped the network, and released eRealms to the public.
      IP: mc.edevil.net — the first official launch under your leadership.`,
      img: "/games/erealms-launch.jpg",
    },
    {
      date: "Late March 2014",
      title: "Expansion",
      text: `Custom minigames like Treasure Chest and Block Hunt appeared. 
      You were alone on the server many nights—but building something truly your own.`,
      img: "/games/erealms-minigames.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
      <section className="max-w-4xl mx-auto px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-center mb-8"
        >
          A Block at a Time — The Rise of <span className="text-emerald-400">eRealms</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-300 max-w-2xl mx-auto mb-16"
        >
          In 2014, a young creator built a Minecraft world from nothing but curiosity and determination.
          Those nights spent designing, coding, and hosting laid the foundation for what ETHUB Games is today —
          open access, creativity, and persistence in every line of code.
        </motion.p>

        <div className="space-y-20">
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="md:w-1/2">
                      <Image
                        src={item.img}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="rounded-xl object-cover border border-neutral-700"
                      />
                    </div>
                    <div className="md:w-1/2 space-y-3">
                      <h2 className="text-2xl font-semibold text-emerald-400">
                        {item.date}
                      </h2>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-24">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-semibold mb-4"
          >
            From <span className="text-emerald-400">eRealms</span> to <span className="text-orange-400">ETHUB</span>
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            What began as a teenage dream of building a server became a lifelong pursuit of
            technology, freedom, and creation. The same spark that lit eRealms now powers ETHUB Games —
            giving the next generation of builders the tools you once had to imagine.
          </p>
          <Link href="/portal">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3">
              Visit the Games Portal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
