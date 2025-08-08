export type Product = { id: string; name: string; price?: number };

// Placeholder; replace with Convex query in the future.
export async function getProducts(): Promise<Product[]> {
  return [];
}

const db: any = {};
export default db;
export { db };
