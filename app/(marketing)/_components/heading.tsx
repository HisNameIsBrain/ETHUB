"use client";

import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";

const headline = "Every🌎, Electronic📱, for Everyone🫂. This is ETECHHUB";

const subMessages = [
  "Intelligent databases with AI-driven insights",
  "Guiding minds through the ever-turning wheel of learning, where skill becomes wisdom through shared experience.",
  "Ongoing growth through alignment with evolving knowledge and innovation.",
  "Stay legally compliant, audit skills and competencies.",
  "Embracing change as a path to relevance, adapting to the rhythm of technology’s unfolding.",
  "Professional-grade tools for clear, efficient communication.",
  "Operating with integrity, where responsibility guides action and trust is the foundation of service.",
  "Honoring the collective, where each participant contributes to a shared momentum of growth and mutual uplift.",
];

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const [titleText, setTitleText] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);

  const [subText, setSubText] = useState("");
  const [subIndex, setSubIndex] = useState(0);
  const [subCharIndex, setSubCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter for headline (h1)
  useEffect(() => {
    if (titleIndex < headline.length) {
      const timeout = setTimeout(() => {
        setTitleText(headline.slice(0, titleIndex + 1));
        setTitleIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [titleIndex]);

  // Typewriter for subMessages (h3)
  useEffect(() => {
    const current = subMessages[subIndex];
    const typingSpeed = isDeleting ? 30 : 60;
    const pause = 1400;

    const timeout = setTimeout(() => {
      if (!isDeleting && subCharIndex < current.length) {
        setSubText(current.slice(0, subCharIndex + 1));
        setSubCharIndex((prev) => prev + 1);
      } else if (!isDeleting && subCharIndex === current.length) {
        setIsDeleting(true);
      } else if (isDeleting && subCharIndex > 0) {
        setSubText(current.slice(0, subCharIndex - 1));
        setSubCharIndex((prev) => prev - 1);
      } else if (isDeleting && subCharIndex === 0) {
        setIsDeleting(false);
        setSubIndex((prev) => (prev + 1) % subMessages.length);
      }
    }, !isDeleting && subCharIndex === current.length ? pause : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subCharIndex, isDeleting, subIndex]);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold min-h-[4rem]">
        {titleText}
        <span className="animate-pulse">|</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium min-h-[4rem]">
        {subText}
        <span className="animate-pulse">|</span>
      </h3>

      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && isAuthenticated && (
        <Button asChild>
          <Link href="/documents">
            Access workspace
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}

      {!isLoading && !isAuthenticated && (
        <SignInButton mode="modal">
          <Button>
            Get access
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
