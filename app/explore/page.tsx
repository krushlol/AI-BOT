"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react"
import { cars } from "@/lib/cars/data"
import type { Car } from "@/lib/cars/types"

// ── Colour name → CSS hex ─────────────────────────────────────────────────────
const COLOR_KEYWORDS: [string, string][] = [
  ["midnight","#0d0d1c"],["black","#111114"],["obsidian","#141418"],
  ["white","#f4f4f0"],["pearl","#eeecea"],["platinum","#d8d8d4"],["snow","#ede8e4"],
  ["silver","#a8a8ac"],["gray","#787878"],["grey","#787878"],["titanium","#888890"],
  ["red","#b81c1c"],["scarlet","#b01818"],["crimson","#9a1010"],["ruby","#a01418"],
  ["blue","#1a3a8c"],["navy","#0c1e54"],["sapphire","#1836a0"],["cobalt","#1a44b0"],
  ["teal","#0e6060"],["cyan","#0e7880"],
  ["green","#185020"],["forest","#184020"],["emerald","#0e6040"],
  ["brown","#4a2c14"],["bronze","#6e4820"],["copper","#8c4820"],
  ["gold","#b08c30"],["champagne","#c4b078"],["tan","#a07848"],["beige","#c8b898"],
  ["orange","#c84c14"],["amber","#cc7008"],["yellow","#c8ac00"],
  ["purple","#4c1880"],["violet","#3c1470"],
  ["sand","#b89870"],
]

function nameToHex(name: string): string {
  const lc = name.toLowerCase()
  for (const [kw, hex] of COLOR_KEYWORDS) {
    if (lc.includes(kw)) return hex
  }
  return "#2a2a30"
}

// ── Tab config ────────────────────────────────────────────────────────────────
type Tab = "exterior" | "interior" | "tech" | "safety"
const TABS: { id: Tab; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "tech",     label: "Technology" },
  { id: "safety",   label: "Safety" },
]

function tabFeatures(car: Car, tab: Tab): string[] {
  switch (tab) {
    case "exterior": return car.exteriorFeatures ?? []
    case "interior": return car.interiorFeatures ?? []
    case "tech":     return car.techFeatures ?? []
    case "safety":   return car.safety?.features ?? []
  }
}

// ── Primary stat ──────────────────────────────────────────────────────────────
function primaryStat(car: Car) {
  if (car.fuelType === "electric")
    return { value: `${car.specs.electricRange ?? "—"}`, unit: "mi range" }
  if (car.fuelType === "hybrid" || car.fuelType === "plug-in hybrid")
    return { value: `${car.specs.mpgCombined ?? car.specs.mpgHighway ?? "—"}`, unit: "MPGe" }
  return { value: `${car.specs.horsepower}`, unit: "hp" }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [idx, setIdx]         = useState(0)
  const [tab, setTab]         = useState<Tab>("exterior")
  const [colorIdx, setColorIdx] = useState(0)
  const [loaded, setLoaded]   = useState(false)

  const car = cars[idx]
  const colors = car.colors ?? []
  const accentHex = colors[colorIdx] ? nameToHex(colors[colorIdx]) : "#f97316"
  const stat = primaryStat(car)
  const features = tabFeatures(car, tab)

  // Reset colour & tab when car changes
  useEffect(() => { setColorIdx(0); setTab("exterior"); setLoaded(false) }, [idx])

  const prev = () => setIdx(i => (i - 1 + cars.length) % cars.length)
  const next = () => setIdx(i => (i + 1) % cars.length)

  return (
    <div className="min-h-screen" style={{ background: "#050508", color: "#fff" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 relative z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          CarAdvisor
        </Link>

        {/* Car picker */}
        <select
          value={idx}
          onChange={e => setIdx(Number(e.target.value))}
          className="text-sm bg-white/5 border border-white/10 rounded-full px-4 py-1.5 outline-none text-white/70 hover:border-white/20 transition-colors cursor-pointer max-w-[240px] truncate"
          style={{ appearance: "auto" }}
        >
          {cars.map((c, i) => (
            <option key={c.id} value={i} style={{ background: "#0d0d18" }}>
              {c.brand} {c.model} {c.year}
            </option>
          ))}
        </select>

        <Link
          href={`/cars/${car.id}`}
          className="flex items-center gap-1 text-sm text-white/30 hover:text-white/70 transition-colors"
        >
          Details <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Stage ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: "60svh" }}>

        {/* Spotlight glow — tinted by selected colour */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: `
              radial-gradient(ellipse 75% 55% at 50% 82%, ${accentHex}22 0%, transparent 65%),
              radial-gradient(ellipse 50% 35% at 50% 100%, rgba(255,255,255,.03) 0%, transparent 50%)
            `,
          }}
        />

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          aria-label="Previous car"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          aria-label="Next car"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Car photo */}
        <div className="flex items-end justify-center px-16 pt-4 pb-0" style={{ minHeight: "52svh" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={car.id}
            src={car.image}
            alt={`${car.brand} ${car.model} ${car.year}`}
            onLoad={() => setLoaded(true)}
            className="relative z-10 max-h-[48svh] w-auto object-contain transition-opacity duration-500"
            style={{
              opacity: loaded ? 1 : 0,
              filter: "drop-shadow(0 24px 64px rgba(0,0,0,.85))",
            }}
          />
        </div>

        {/* Floor fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, #050508 10%, transparent)" }}
        />
      </div>

      {/* ── Identity ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-4 pt-6 pb-8">
        <p
          className="text-xs tracking-[.24em] uppercase mb-3 transition-colors duration-700"
          style={{ color: `${accentHex}cc` }}
        >
          {car.year} · {car.bodyStyle} · {car.fuelType}
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
          {car.brand} <span className="font-light text-white/50">{car.model}</span>
        </h1>
        <p className="mt-4 text-white/40 text-base">
          Starting at{" "}
          <span className="text-white/80 font-semibold">
            ${car.basePrice.toLocaleString()}
          </span>
        </p>

        {/* Tagline */}
        {car.tagline && (
          <p className="mt-3 text-sm text-white/30 italic max-w-md mx-auto">
            &ldquo;{car.tagline}&rdquo;
          </p>
        )}
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border-t border-b border-white/5 mx-0">
        {[
          { value: stat.value, label: stat.unit },
          { value: car.specs.zeroToSixty != null ? `${car.specs.zeroToSixty}s` : "—", label: "0–60 mph" },
          { value: car.specs.seating ?? "—", label: "Seats" },
          { value: `$${Math.round(car.basePrice / 100) / 10}k`, label: "Starting MSRP" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-[#050508] flex flex-col items-center py-6 gap-1">
            <span
              className="text-3xl font-bold transition-colors duration-700"
              style={{ color: `${accentHex}ee` }}
            >
              {value}
            </span>
            <span className="text-xs text-white/30 tracking-widest uppercase">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Colour picker ───────────────────────────────────────────────────── */}
      {colors.length > 0 && (
        <div className="px-6 py-8 border-b border-white/5">
          <p className="text-xs tracking-[.2em] uppercase text-white/30 mb-4">Colour</p>
          <div className="flex flex-wrap gap-3 items-center">
            {colors.map((name, i) => {
              const hex = nameToHex(name)
              const active = i === colorIdx
              return (
                <button
                  key={name}
                  onClick={() => setColorIdx(i)}
                  title={name}
                  className="group flex flex-col items-center gap-1.5 transition-all"
                >
                  <span
                    className="block w-7 h-7 rounded-full border-2 transition-all duration-200"
                    style={{
                      background: hex,
                      borderColor: active ? "#fff" : "transparent",
                      boxShadow: active ? `0 0 0 2px ${hex}55` : "none",
                    }}
                  />
                  <span
                    className="text-[9px] tracking-wide uppercase transition-colors duration-200 hidden sm:block"
                    style={{ color: active ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.2)" }}
                  >
                    {name.split(" ")[0]}
                  </span>
                </button>
              )
            })}
          </div>
          {colors[colorIdx] && (
            <p className="mt-3 text-sm text-white/40">{colors[colorIdx]}</p>
          )}
        </div>
      )}

      {/* ── Feature tabs ────────────────────────────────────────────────────── */}
      <div className="px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-0 border-b border-white/8 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="pb-3 px-4 text-sm font-medium transition-all relative"
              style={{ color: tab === t.id ? "#fff" : "rgba(255,255,255,.28)" }}
            >
              {t.label}
              {tab === t.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors duration-700"
                  style={{ background: accentHex }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Feature list */}
        {features.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 max-w-2xl">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/55">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-700"
                  style={{ background: accentHex }}
                />
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/20">No features listed for this category.</p>
        )}
      </div>

      {/* ── CTA row ─────────────────────────────────────────────────────────── */}
      <div className="px-6 pb-16 flex flex-col sm:flex-row gap-3 max-w-md">
        <Link
          href={`/cars/${car.id}`}
          className="flex-1 text-center py-3 rounded-full text-sm font-semibold text-white transition-all duration-300"
          style={{ background: accentHex }}
        >
          View Full Details
        </Link>
        <Link
          href="/search"
          className="flex-1 text-center py-3 rounded-full text-sm font-medium text-white/60 border border-white/10 hover:border-white/25 transition-colors"
        >
          Browse All Cars
        </Link>
      </div>

    </div>
  )
}
