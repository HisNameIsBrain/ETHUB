import { execSync } from "node:child_process";

export function resolveGitAnchor(): string | null {
  try {
    const sha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    return `git:${sha}`;
  } catch (_err) {
    return null;
  }
}
