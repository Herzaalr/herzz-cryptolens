import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://herzz-cryptolens.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/?view=trending`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/?view=picks`, changeFrequency: "daily", priority: 0.8 },
  ];
}
