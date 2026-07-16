"use client"

import { useEffect, useState } from "react"
import { ExternalLink, ArrowUp, MessageSquare } from "lucide-react"

interface RedditPost {
  title: string
  score: number
  numComments: number
  subreddit: string
  url: string
  snippet: string | null
}

interface RedditOpinionsProps {
  brand: string
  model: string
}

const SUBREDDITS = ["cars", "whatcarshouldIbuy", "askcarsales"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSubreddit(query: string, subreddit: string): Promise<any[]> {
  const url = `https://api.pullpush.io/reddit/search/submission/?q=${encodeURIComponent(query)}&subreddit=${subreddit}&size=25`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return []
  const data = await res.json()
  return data?.data ?? []
}

export default function RedditOpinions({ brand, model }: RedditOpinionsProps) {
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const query = `${brand} ${model}`

    Promise.all(SUBREDDITS.map((sub) => fetchSubreddit(query, sub)))
      .then((batches) => {
        if (cancelled) return
        const seen = new Set<string>()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const all: any[] = []
        for (const batch of batches) {
          for (const p of batch) {
            if (!seen.has(p.id) && !p.over_18 && p.score > 2) {
              seen.add(p.id)
              all.push(p)
            }
          }
        }
        all.sort((a, b) => b.score - a.score)
        const mapped: RedditPost[] = all.slice(0, 5).map((p) => ({
          title: p.title,
          score: p.score,
          numComments: p.num_comments ?? 0,
          subreddit: p.subreddit,
          url: `https://reddit.com${p.permalink}`,
          snippet: p.selftext ? p.selftext.replace(/\n+/g, " ").trim().slice(0, 220) : null,
        }))
        setPosts(mapped)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) { setFailed(true); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [brand, model])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (failed || posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <RedditIcon /> What Reddit Says
        </h2>
        <p className="text-sm text-gray-500">No Reddit discussions found for this car right now.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <RedditIcon /> What Reddit Says
        </h2>
        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
          r/cars · r/whatcarshouldIbuy · r/askcarsales
        </span>
      </div>

      <div className="space-y-3">
        {posts.map((post, i) => (
          <a
            key={i}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-100 rounded-xl p-4 hover:border-orange-300 hover:bg-orange-50/30 transition-colors group"
          >
            <p className="text-sm font-medium text-gray-900 leading-snug mb-2 group-hover:text-orange-700">
              {post.title}
            </p>
            {post.snippet && (
              <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                {post.snippet}{post.snippet.length >= 220 ? "…" : ""}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="text-orange-500 font-semibold">r/{post.subreddit}</span>
              <span className="flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" /> {post.score.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5">
                <MessageSquare className="w-3 h-3" /> {post.numComments.toLocaleString()} comments
              </span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Real discussions from Reddit users. Click any post to read the full thread.
      </p>
    </div>
  )
}

function RedditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#FF4500" />
      <path d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.08 2.13.45a1 1 0 1 0 1.07-.98 1 1 0 0 0-.96.68l-2.38-.5a.16.16 0 0 0-.19.12l-.73 3.44a7.14 7.14 0 0 0-3.89 1.24 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .4c0 2.02 2.35 3.66 5.25 3.66s5.25-1.64 5.25-3.66a2.87 2.87 0 0 0 0-.4 1.46 1.46 0 0 0 .63-1.53zM7.5 11a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.56 2.65a3.44 3.44 0 0 1-2.06.56 3.44 3.44 0 0 1-2.06-.56.17.17 0 0 1 .2-.27 3.13 3.13 0 0 0 1.86.49 3.13 3.13 0 0 0 1.86-.49.17.17 0 0 1 .2.27zm-.06-1.65a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" fill="white"/>
    </svg>
  )
}
