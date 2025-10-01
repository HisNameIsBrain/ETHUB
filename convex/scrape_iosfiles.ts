import { action } from "./_generated/server";
import { api } from "./_generated/api";
import * as cheerio from "cheerio";

export const importIosfiles = action({
  args: {},
  handler: async (ctx) => {
    const html = await fetch("https://iosfiles.com/imei-services").then(r => r.text());
    const $ = cheerio.load(html);

    const services: any[] = [];

    $("a[href*='/imei-service/']").each((_i, el) => {
      const title = $(el).text().trim();
      const href = new URL($(el).attr("href") ?? "", "https://iosfiles.com").toString();
      if (!title) return;

      services.push({
        name: title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        price: 0, // parse from nearby text if available
        deliveryTime: "Varies",
        description: "",
        isPublic: true,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sourceUrl: href,
      });
    });

    for (const s of services) {
      await ctx.runMutation(api.services.upsert, s);
    }

    return { imported: services.length };
  },
});
