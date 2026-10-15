const postCache = new Map<string, { data: RedditPost[]; ts: number }>()
const POST_CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

export interface RedditPost {
  title: string
  score: number
  numComments: number
  subreddit: string
  url: string
  snippet: string | null
}

const SUBREDDITS = "cars+whatcarshouldIbuy+askcarsales"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPosts(json: any): any[] {
  return json?.data?.children?.map((c: any) => c.data) ?? []
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = (searchParams.get("brand") ?? "").trim()
  const model = (searchParams.get("model") ?? "").trim()
  const year  = (searchParams.get("year")  ?? "").trim()

  if (!brand || !model) return Response.json({ posts: [] })

  const cacheKey = `${brand}|${model}|${year}`
  const cached = postCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < POST_CACHE_TTL) {
    return Response.json({ posts: cached.data })
  }

  const headers = {
    "User-Agent": "CarAdvisorUSA/1.0 (caradvisorusa.com)",
    "Accept": "application/json",
  }

  const yearQuery  = encodeURIComponent(`${brand} ${model} ${year}`)
  const baseQuery  = encodeURIComponent(`${brand} ${model}`)
  const base       = `https://www.reddit.com/r/${SUBREDDITS}/search.json`

  try {
    const [r1, r2] = await Promise.all([
      fetch(`${base}?q=${yearQuery}&sort=top&t=all&limit=25&restrict_sr=true`, { headers }),
      fetch(`${base}?q=${baseQuery}&sort=top&t=all&limit=25&restrict_sr=true`, { headers }),
    ])

    const all: any[] = []
    const seen = new Set<string>()

    for (const res of [r1, r2]) {
      if (!res.ok) continue
      for (const p of extractPosts(await res.json())) {
        if (!p.id || p.over_18 || seen.has(p.id)) continue
        const t = (p.title ?? "").toLowerCase()
        if (!t.includes(brand.toLowerCase()) && !t.includes(model.toLowerCase())) continue
        seen.add(p.id)
        all.push(p)
      }
    }

    all.sort((a, b) => (b.num_comments ?? 0) - (a.num_comments ?? 0))

    const posts: RedditPost[] = all.slice(0, 6).map((p) => ({
      title: p.title,
      score: p.score ?? 0,
      numComments: p.num_comments ?? 0,
      subreddit: p.subreddit,
      url: `https://reddit.com${p.permalink}`,
      snippet: p.selftext ? p.selftext.replace(/\n+/g, " ").trim().slice(0, 220) : null,
    }))

    postCache.set(cacheKey, { data: posts, ts: Date.now() })
    return Response.json({ posts })
  } catch (e) {
    console.error("Reddit API error:", e)
    return Response.json({ posts: [] })
  }
}
