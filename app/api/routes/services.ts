import { query, mutation } from 'convex/edge';

// Fetch a service by ID
export const getById = query(({ db }, { id }: { id: string }) => {
  return db.services.get(id);
});

// Update a service by ID
export const update = mutation(({ db }, { id, data }: { id: string; data: { name: string; deliveryTime: string; price: number } }) => {
  return db.services.update(id, data);
});