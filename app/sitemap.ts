import { MetadataRoute } from "next"
import { cars } from "@/lib/cars/data"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://caradvisorusa.com"
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/quiz`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/depreciation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]

  const carPages: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${base}/cars/${car.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticPages, ...carPages]
}
