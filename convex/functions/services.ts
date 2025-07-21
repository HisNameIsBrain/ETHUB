import { query, mutation } from "convex/values";

export const getById = query(({ db }, { id }) => {
  return db.get(id);
});

export const update = mutation(({ db }, service) => {
  return db.patch(service.id, service);
});