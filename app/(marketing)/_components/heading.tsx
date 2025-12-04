"use client";

import * as React from "react";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";

const HEADLINE = "Every🌍, Electronic 📱, for Everyone👥. This is ETECHHUB";
const SUBS = [
  "Intelligent databases with AI-driven insights.",
  "Guiding minds through the ever-turning wheel of learning.",
  "Ongoing growth aligned with evolving innovation.",
  "Stay legally compliant, audit skills and competencies.",
  "Adapting to the rhythm of technology’s unfolding.",
  "Professional-grade tools for efficient communication.",
  "Operating with integrity and trust.",
  "Honoring the collective through shared momentum.",
];

export function Heading() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const [titleText, setTitleText] = React.useState("");
  const [titleIndex, setTitleIndex] = React.useState(0);

  const [subText, setSubText] = React.useState("");
  const [subIndex, setSubIndex] = React.useState(0);
  const [subCharIndex, setSubCharIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // headline typewriter
  React.useEffect(() => {
    if (titleIndex < HEADLINE.length) {
      const t = setTimeout(() => {
        setTitleText(HEADLINE.slice(0, titleIndex + 1));
        setTitleIndex((n) => n + 1);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [titleIndex]);

  // rotating subline typewriter
  React.useEffect(() => {
    const current = SUBS[subIndex];
    const typing = isDeleting ? 28 : 55;
    const hold = 1200;

    const t = setTimeout(() => {
      if (!isDeleting && subCharIndex < current.length) {
        setSubText(current.slice(0, subCharIndex + 1));
        setSubCharIndex((n) => n + 1);
      } else if (!isDeleting && subCharIndex === current.length) {
        setIsDeleting(true);
      } else if (isDeleting && subCharIndex > 0) {
        setSubText(current.slice(0, subCharIndex - 1));
        setSubCharIndex((n) => n - 1);
      } else if (isDeleting && subCharIndex === 0) {
        setIsDeleting(false);
        setSubIndex((i) => (i + 1) % SUBS.length);
      }
    }, !isDeleting && subCharIndex === current.length ? hold : typing);

    return () => clearTimeout(t);
  }, [subIndex, subCharIndex, isDeleting]);

  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-3xl px-4 pt-12 md:pt-16 text-center">
        <h1
          className="font-bold leading-[1.1] tracking-tight text-4xl md:text-5xl"
          aria-live="polite"
        >
          {titleText}
          <span className="animate-pulse" aria-hidden="true">|</span>
        </h1>

        <p
          className="mt-4 text-base md:text-lg text-muted-foreground min-h-[2.25rem]"
          aria-live="polite"
        >
          {subText}
          <span className="animate-pulse" aria-hidden="true">|</span>
        </p>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          {isLoading ? (
            <div className="inline-flex items-center justify-center rounded-xl border px-5 py-3">
              <Spinner size="lg" />
            </div>
          ) : isAuthenticated ? (
            <Button asChild className="px-6 py-3">
              <Link href="/documents">
                Access workspace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button className="px-6 py-3">
                Get access
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Optional illustration row – keep your existing asset here */}
      <div className="mx-auto mt-12 max-w-4xl px-4 flex justify-center">
        {/* <img src="/illustrations/hero-figure.svg" alt="Illustration" className="w-full max-w-md opacity-90" /> */}
      </div>
    </section>
  );
}
