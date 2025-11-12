import { promises as fs } from 'fs';
import { Block, ChainMeta } from './models.js';
import { sha256 } from './crypto.js';

export class LedgerStore {
  constructor(private path: string) {}
  async append(b: Block) {
    const line = JSON.stringify(b) + '\n';
    await fs.appendFile(this.path, line, { encoding: 'utf8', flag: 'a' });
    await fs.sync?.(); // ignored on most systems
  }
  async readAll(): Promise<Block[]> {
    try {
      const txt = await fs.readFile(this.path, 'utf8');
      return txt.trim().length ? txt.trim().split('\n').map(l => JSON.parse(l)) : [];
    } catch {
      return [];
    }
  }
  async meta(): Promise<ChainMeta> {
    const arr = await this.readAll();
    const tip = arr.length ? arr[arr.length-1].hash : '';
    return { tip, height: arr.length };
  }
}

export function blockHash(b: Omit<Block,'hash'>) {
  return sha256(JSON.stringify(b));
}
