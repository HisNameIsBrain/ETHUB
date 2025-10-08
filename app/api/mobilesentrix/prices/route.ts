
import { NextResponse } from "next/server";
import cheerio from 'cheerio';
/**
 * MobileSentrix price lookup route.
 *
 * Query params:
 * - query=<free text search>    (preferred)
 * - url=<direct product url>    (optional)
 * - part=<part number>          (optional)
 *
 * Behavior:
 * - If MOBILESENTRIX_API_KEY env var is set, attempt a (hypothetical) API lookup.
 * - Otherwise scrape the MobileSentrix search page and extract the first product found.
 *
 * Response shape:
 * {
 *   recommended: { title, image, partPrice, labor, total },
 *   alternative: { title, image, partPrice, labor, total },
 *   source: "api" | "scrape",
 *   raw?: any
 * }
 *
 * Notes:
 * - Scraping is brittle and may break if MobileSentrix changes markup. Prefer using a supplier API.
 * - Labor is added as a fixed fee (default $100). Adjust if you want variable labor per operation.
 */

const DEFAULT_LABOR = 100;

type Item = {
  title?: string;
  image?: string | null;
  partPrice?: number | null;
  labor?: number;
  total?: number | null;
};

function parseMoney(text?: string | null): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9.]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("query") ?? "").trim();
  const productUrl = (url.searchParams.get("url") ?? "").trim();
  const part = (url.searchParams.get("part") ?? "").trim();

  if (!q && !productUrl && !part) {
    return NextResponse.json({ error: "Provide at least one of: query, url, or part" }, { status: 400 });
  }

  // If an official API key exists, prefer it (example stub — replace with real API details)
  const apiKey = process.env.MOBILESENTRIX_API_KEY ?? "";
  if (apiKey) {
    try {
      // Hypothetical API usage — please replace endpoint/params with the real MobileSentrix API if you have access.
      const apiEndpoint = productUrl
        ? `https://api.mobilesentrix.com/v1/product?url=${encodeURIComponent(productUrl)}`
        : `https://api.mobilesentrix.com/v1/search?term=${encodeURIComponent(q || part)}`;

      const res = await fetch(apiEndpoint, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`MobileSentrix API error: ${res.status} ${text}`);
      }

      const json = await res.json();

      // Example mapping logic; adapt fields to the real API shape.
      const first = Array.isArray(json.results) ? json.results[0] : json.product ?? null;
      if (!first) throw new Error("No product found from MobileSentrix API");

      const title = first.title ?? first.name ?? q ?? part;
      const image = first.image ?? first.thumbnail ?? null;
      const rawPrice = first.price ?? first.list_price ?? null;
      const partPrice = parseMoney(String(rawPrice));
      const labor = DEFAULT_LABOR;
      const total = partPrice != null ? partPrice + labor : null;

      const recommended: Item = { title, image, partPrice, labor, total };
      // Alternative — simple heuristic: cheaper aftermarket price if API exposes tiers
      const altPrice = first.aftermarket_price ?? (partPrice != null ? Math.max(25, partPrice * 0.6) : null);
      const alternative: Item = { title: title + " (aftermarket)", image, partPrice: parseMoney(String(altPrice)), labor, total: altPrice != null ? parseMoney(String(altPrice))! + labor : null };

      return NextResponse.json({ recommended, alternative, raw: json, source: "api" }, { status: 200 });
    } catch (err: any) {
      // fallthrough to scraping fallback if API fails
      console.warn("MobileSentrix API lookup failed, falling back to scrape:", err?.message ?? err);
    }
  }

  // Scrape fallback (search page -> first product)
  try {
    const searchTerm = productUrl ? productUrl : q || part;
    const searchUrl = productUrl
      ? productUrl
      : `https://www.mobilesentrix.com/search?term=${encodeURIComponent(searchTerm)}`;

    const res = await fetch(searchUrl, { method: "GET", headers: { "User-Agent": "ETHUB/1.0 (+https://yourdomain.example)" } });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json({ error: "Upstream fetch failed", status: res.status, details: txt }, { status: 502 });
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    // Heuristic parsing — adjust selectors if MobileSentrix markup changes
    // If product URL given and it was a product page, try product selectors; otherwise use search results
    let title = "";
    let image: string | null = null;
    let partPrice: number | null = null;

    if (productUrl) {
      // product page parsing
      title = $("h1.product-title").first().text().trim() || $("meta[property='og:title']").attr("content") || productUrl;
      image = $("img.product-main-image").first().attr("src") || $("meta[property='og:image']").attr("content") || null;
      const priceText = $(".price, .product-price, .woocommerce-Price-amount").first().text().trim() || $("span.price").first().text().trim();
      partPrice = parseMoney(priceText);
    } else {
      // search page -> pick first product tile
      const productTile = $(".product-loop .product").first();
      title = productTile.find(".product__title, .product-title, .product__title a").first().text().trim() || q || part;
      image = productTile.find("img").first().attr("src") || null;
      const priceText = productTile.find(".price, .product__price, .price > span").first().text().trim();
      partPrice = parseMoney(priceText);
      // if not found in quick tile, try first product detail link
      if (!partPrice) {
        const firstLink = productTile.find("a").first().attr("href");
        if (firstLink) {
          const detRes = await fetch(firstLink, { method: "GET", headers: { "User-Agent": "ETHUB/1.0 (+https://yourdomain.example)" } });
          if (detRes.ok) {
            const detHtml = await detRes.text();
            const $$ = cheerio.load(detHtml);
            const pText = $$(".price, .product-price, .woocommerce-Price-amount").first().text().trim();
            partPrice = parseMoney(pText);
            image = image || $$(".product-main-image img").first().attr("src") || $$("meta[property='og:image']").attr("content") || image;
            title = title || $$(".product-title").first().text().trim();
          }
        }
      }
    }

    const labor = DEFAULT_LABOR;
    const total = partPrice != null ? partPrice + labor : null;

    const recommended: Item = { title: title || searchTerm, image, partPrice, labor, total };
    const alternativePartPrice = partPrice != null ? Math.max(25, Math.round(partPrice * 0.6 * 100) / 100) : null;
    const alternative: Item = {
      title: (title || searchTerm) + " (aftermarket)",
      image,
      partPrice: alternativePartPrice,
      labor,
      total: alternativePartPrice != null ? alternativePartPrice + labor : null,
    };

    return NextResponse.json({ recommended, alternative, source: "scrape" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Scrape failed", details: String(err) }, { status: 500 });
  }
}
