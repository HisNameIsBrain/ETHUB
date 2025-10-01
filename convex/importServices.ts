export const importServices = mutation(async ({ db }, { services }) => {
  for (const svc of services) {
    await db.insert("services", svc);
  }
  return { count: services.length };
});
