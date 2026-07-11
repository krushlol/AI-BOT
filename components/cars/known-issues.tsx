"use client"

import { useEffect, useState } from "react"
import { MessageSquare, ExternalLink } from "lucide-react"
import staticData from "@/lib/cars/complaints-static.json"

interface ComplaintsResult {
  total: number
  categories: { name: string; count: number }[]
  sample: string | null
}

interface KnownIssuesProps {
  brand: string
  model: string
  year: number
  carId?: string
}

export default function KnownIssues({ brand, model, year, carId }: KnownIssuesProps) {
  const preloaded = carId ? (staticData as Record<string, ComplaintsResult>)[carId] ?? null : null

  const [data, setData] = useState<ComplaintsResult | null>(preloaded)
  const [loading, setLoading] = useState(!preloaded)
  const [failed, setFailed] = useState(false)

  const nhtsaUrl = `https://www.google.com/search?q=${encodeURIComponent(`${year} ${brand} ${model} NHTSA complaints site:nhtsa.gov`)}`

  useEffect(() => {
    if (preloaded) return // already have static data, skip fetch

    let cancelled = false
    const url = `/api/car-complaints?make=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${year}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("non-200")
        return r.json()
      })
      .then((d) => {
        clearTimeout(timeout)
        if (!cancelled) { setData(d); setLoading(false) }
      })
      .catch(() => {
        clearTimeout(timeout)
        if (!cancelled) { setFailed(true); setLoading(false) }
      })

    return () => { cancelled = true; controller.abort() }
  }, [brand, model, year, preloaded])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 animate-pulse">
          <div className="h-4 bg-amber-200 rounded w-48 mb-3" />
          <div className="space-y-2">
            <div className="h-3 bg-amber-100 rounded w-full" />
            <div className="h-3 bg-amber-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (failed || !data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">👤 What Owners Say</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800 mb-3">
            Owner complaint data couldn&apos;t be loaded right now.
          </p>
          <a
            href={nhtsaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium"
          >
            View {year} {brand} {model} complaints on NHTSA.gov
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    )
  }

  const noComplaints = data.total === 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        👤 What Owners Say
      </h2>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
            <h3 className="font-semibold text-amber-900 text-sm">
              A few things owners have flagged
            </h3>
          </div>
          <span className="text-xs text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
            NHTSA Database
          </span>
        </div>

        {noComplaints ? (
          <p className="text-sm text-amber-800">
            No complaints filed with NHTSA for this model year — a good sign. 🎉
          </p>
        ) : (
          <>
            <p className="text-xs text-amber-700 mb-3">
              Owners have filed <span className="font-semibold">{data.total} complaint{data.total !== 1 ? "s" : ""}</span> with the US government — here&apos;s what came up most
            </p>

            {data.categories.length > 0 && (
              <div className="space-y-2 mb-3">
                {data.categories.map(({ name, count }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="flex-1 bg-amber-100 rounded-full h-1.5">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (count / data.total) * 100 * 2)}%` }}
                      />
                    </div>
                    <span className="text-xs text-amber-800 w-40 shrink-0">{name}</span>
                    <span className="text-xs font-semibold text-amber-700 w-6 text-right shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            )}

            {data.sample && (
              <blockquote className="text-xs text-amber-700 italic border-l-2 border-amber-300 pl-3 mb-3 leading-relaxed">
                &ldquo;{data.sample}{data.sample.length >= 220 ? "…" : ""}&rdquo;
              </blockquote>
            )}
          </>
        )}

        <a
          href={nhtsaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium mt-1"
        >
          {noComplaints ? "View NHTSA record" : `See all ${data.total} complaints`} on NHTSA.gov
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
