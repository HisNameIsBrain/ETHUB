"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const Error = () => {
  return ( 
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/error.png"
        height="300"
        width="300"
        alt="Error"
        className="dark:hidden"
      />
      <Image
        src="/error-dark.png"
        height="300"
        width="300"
        alt="Error"
        className="hidden dark:block"
      />
      <h2 className="text-xl font-medium">
        Whoops. How did this happen? Developers are working on it. Hang on tight.
      </h2>
      <Button asChild>
        <Link href="/documents">
          Try again.
        </Link>
      </Button>
    </div>
  );
}
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}