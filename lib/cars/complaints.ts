export interface ComplaintsResult {
  total: number
  categories: { name: string; count: number }[]
  sample: string | null
}

const SKIP_COMPONENTS = new Set(["UNKNOWN OR OTHER", "OTHER"])

// In-memory cache — survives warm serverless invocations; combined with Next.js fetch cache for persistence
const memCache = new Map<string, ComplaintsResult>()

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAnd\b/g, "and")
}

export async function fetchComplaints(make: string, model: string, year: number): Promise<ComplaintsResult> {
  const fallback: ComplaintsResult = { total: 0, categories: [], sample: null }
  if (!make || !model || !year) return fallback

  const key = `${make}|${model}|${year}`
  if (memCache.has(key)) return memCache.get(key)!

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s — server→NHTSA is fast
    const url = `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`
    const res = await fetch(url, { next: { revalidate: 86400 }, signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return fallback
    const data = await res.json()
    const results: { components: string; summary: string; crash: boolean; fire: boolean }[] = data.results ?? []

    const counts = new Map<string, number>()
    for (const r of results) {
      const comp = (r.components ?? "").toUpperCase().trim()
      if (!comp || SKIP_COMPONENTS.has(comp)) continue
      counts.set(comp, (counts.get(comp) ?? 0) + 1)
    }

    const categories = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name: toTitleCase(name), count }))

    const sample =
      results.find((r) => !r.crash && !r.fire && r.summary?.length > 20)?.summary?.slice(0, 220) ?? null

    const result: ComplaintsResult = { total: results.length, categories, sample }
    memCache.set(key, result)
    return result
  } catch {
    return fallback
  }
}
