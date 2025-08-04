// lib/authOptions.ts
import { type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [GitHub],
  pages: {
    signIn: "/login", // Optional
  },
};