import { promises as fs } from 'fs';
import { exec as cbExec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(cbExec);

export async function anchorToFile(dir: string, hash: string) {
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(`${dir}/${ts}.anchor`, hash, 'utf8');
}

export async function anchorToGit(hash: string) {
  try {
    await exec('git rev-parse --git-dir');
    const tag = `ledger-${Date.now()}`;
    await exec(`git tag -a ${tag} -m ${hash}`);
    return tag;
  } catch {
    return null;
  }
}
