const cache = new Map<string, ComplaintsResult>()

export interface ComplaintsResult {
  total: number
  categories: { name: string; count: number }[]
  sample: string | null
}

const SKIP_COMPONENTS = new Set(["UNKNOWN OR OTHER", "OTHER"])

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAnd\b/g, "and")
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const make = (searchParams.get("make") ?? "").trim()
  const model = (searchParams.get("model") ?? "").trim()
  const year = (searchParams.get("year") ?? "").trim()

  if (!make || !model || !year) {
    return Response.json({ total: 0, categories: [], sample: null })
  }

  const key = `${make}|${model}|${year}`
  if (cache.has(key)) return Response.json(cache.get(key))

  try {
    const url = `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`NHTSA ${res.status}`)
    const data = await res.json()

    const results: { components: string; summary: string; crash: boolean; fire: boolean }[] =
      data.results ?? []

    // Count complaints per component category
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

    // Pick one representative non-crash complaint summary
    const sample =
      results.find((r) => !r.crash && !r.fire && r.summary?.length > 20)?.summary?.slice(0, 220) ??
      null

    const result: ComplaintsResult = { total: results.length, categories, sample }
    cache.set(key, result)
    return Response.json(result)
  } catch {
    const fallback: ComplaintsResult = { total: 0, categories: [], sample: null }
    return Response.json(fallback)
  }
}
