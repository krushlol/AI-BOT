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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = (searchParams.get("brand") ?? "").trim()
  const model = (searchParams.get("model") ?? "").trim()

  if (!brand || !model) return Response.json({ posts: [] })

  const cacheKey = `${brand}|${model}`
  const cached = postCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < POST_CACHE_TTL) {
    return Response.json({ posts: cached.data })
  }

  const query = `${brand} ${model}`
  const subreddits = ["cars", "whatcarshouldIbuy", "askcarsales"]

  try {
    // Fetch from each subreddit in parallel, take best scored post from each
    const results = await Promise.all(
      subreddits.map(async (sub) => {
        try {
          const url = `https://api.pullpush.io/reddit/search/submission/?q=${encodeURIComponent(query)}&subreddit=${sub}&size=25`
          const res = await fetch(url, {
            headers: { "User-Agent": "CarAdvisor/1.0" },
            next: { revalidate: 21600 },
          })
          if (!res.ok) return []
          const data = await res.json()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (data?.data ?? []) as any[]
        } catch {
          return []
        }
      })
    )

    // Flatten, deduplicate by id, sort by score descending
    const seen = new Set<string>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const all: any[] = []
    for (const batch of results) {
      for (const post of batch) {
        if (!seen.has(post.id) && !post.over_18 && post.score > 3) {
          seen.add(post.id)
          all.push(post)
        }
      }
    }
    all.sort((a, b) => b.score - a.score)

    const posts: RedditPost[] = all.slice(0, 5).map((p) => ({
      title: p.title,
      score: p.score,
      numComments: p.num_comments ?? 0,
      subreddit: p.subreddit,
      url: `https://reddit.com${p.permalink}`,
      snippet: p.selftext
        ? p.selftext.replace(/\n+/g, " ").trim().slice(0, 220)
        : null,
    }))

    postCache.set(cacheKey, { data: posts, ts: Date.now() })
    return Response.json({ posts })
  } catch {
    return Response.json({ posts: [] })
  }
}
