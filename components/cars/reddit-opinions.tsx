"use client"

import { useEffect, useRef, useState } from "react"
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
  year: number
}

async function fetchRedditPosts(brand: string, model: string, year: number): Promise<RedditPost[]> {
  const params = new URLSearchParams({ brand, model, year: String(year) })
  const res = await fetch(`/api/reddit-opinions?${params}`, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) return []
  const data = await res.json()
  return data?.posts ?? []
}

export default function RedditOpinions({ brand, model, year }: RedditOpinionsProps) {
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const cacheKey = `reddit:${brand}:${model}:${year}`

    function doFetch() {
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          setPosts(JSON.parse(cached))
          setLoading(false)
          return
        }
      } catch { /* ignore */ }

      fetchRedditPosts(brand, model, year)
        .then((result) => {
          if (cancelled) return
          try { sessionStorage.setItem(cacheKey, JSON.stringify(result)) } catch { /* ignore */ }
          setPosts(result)
          setLoading(false)
        })
        .catch(() => {
          if (!cancelled) { setFailed(true); setLoading(false) }
        })
    }

    // Only start fetching when the section scrolls into view
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { observer.disconnect(); doFetch() }
    }, { rootMargin: "200px" })
    observer.observe(el)

    return () => { cancelled = true; observer.disconnect() }
  }, [brand, model, year])

  if (loading) {
    return (
      <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <RedditIcon />
          <span className="text-sm font-medium text-gray-500 animate-pulse">Loading Reddit reviews…</span>
        </div>
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
