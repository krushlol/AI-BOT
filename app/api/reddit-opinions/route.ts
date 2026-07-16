const postCache = new Map<string, { data: RedditPost[]; ts: number }>()
const POST_CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

let tokenCache: { token: string; expires: number } | null = null

export interface RedditPost {
  title: string
  score: number
  numComments: number
  subreddit: string
  url: string
  snippet: string | null
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  if (tokenCache && Date.now() < tokenCache.expires) return tokenCache.token

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "CarAdvisor/1.0 by caradvisor_app",
      },
      body: "grant_type=client_credentials",
    })
    if (!res.ok) return null
    const data = await res.json()
    const token = data.access_token as string
    const expiresIn = (data.expires_in as number) * 1000
    tokenCache = { token, expires: Date.now() + expiresIn - 60_000 }
    return token
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = (searchParams.get("brand") ?? "").trim()
  const model = (searchParams.get("model") ?? "").trim()

  if (!brand || !model) return Response.json({ posts: [], configured: false })

  const cacheKey = `${brand}|${model}`
  const cached = postCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < POST_CACHE_TTL) {
    return Response.json({ posts: cached.data, configured: true })
  }

  const token = await getAccessToken()
  if (!token) return Response.json({ posts: [], configured: false })

  try {
    const query = `${brand} ${model}`
    const subreddits = "cars+whatcarshouldIbuy+askcarsales"
    const apiUrl = `https://oauth.reddit.com/r/${subreddits}/search.json?q=${encodeURIComponent(query)}&sort=top&t=all&limit=10&restrict_sr=1&type=link`

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "CarAdvisor/1.0 by caradvisor_app",
      },
      next: { revalidate: 21600 },
    })

    if (!res.ok) return Response.json({ posts: [], configured: true })

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = data?.data?.children ?? []

    const posts: RedditPost[] = children
      .filter((c) => c.data.score > 5 && !c.data.over_18)
      .slice(0, 5)
      .map((c) => ({
        title: c.data.title,
        score: c.data.score,
        numComments: c.data.num_comments,
        subreddit: c.data.subreddit,
        url: `https://reddit.com${c.data.permalink}`,
        snippet: c.data.selftext
          ? c.data.selftext.replace(/\n+/g, " ").trim().slice(0, 220)
          : null,
      }))

    postCache.set(cacheKey, { data: posts, ts: Date.now() })
    return Response.json({ posts, configured: true })
  } catch {
    return Response.json({ posts: [], configured: true })
  }
}
