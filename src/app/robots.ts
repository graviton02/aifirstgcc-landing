import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/gcc-dashboard/", "/provider/", "/admin/", "/onboarding/"],
      },
    ],
    sitemap: "https://orbys360.com/sitemap.xml",
  };
}
