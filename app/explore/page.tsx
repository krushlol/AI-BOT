"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cars } from "@/lib/cars/data"
import type { Car } from "@/lib/cars/types"

// ── Scenes ───────────────────────────────────────────────────────────────────
const SCENES = ["Meet", "Performance", "Interior", "Tech & Safety", "Yours"]
const TOTAL = SCENES.length

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined, suffix = "") {
  return n != null ? `${n.toLocaleString()}${suffix}` : "—"
}
function money(n: number) { return "$" + n.toLocaleString() }

function primaryPerfStat(car: Car): { big: string; label: string } {
  if (car.fuelType === "electric")
    return { big: fmt(car.specs.electricRange, " mi"), label: "electric range" }
  if (car.fuelType === "hybrid" || car.fuelType === "plug-in hybrid")
    return { big: fmt(car.specs.mpgCombined, " MPGe"), label: "combined efficiency" }
  return { big: fmt(car.specs.horsepower, " hp"), label: "horsepower" }
}

// ── Animated number ticker ────────────────────────────────────────────────────
function useTick(target: number, duration = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    setVal(0)
    const steps = 40
    const inc = target / steps
    let i = 0
    const id = setInterval(() => {
      i++
      setVal(Math.min(Math.round(inc * i), target))
      if (i >= steps) clearInterval(id)
    }, duration / steps)
    return () => clearInterval(id)
  }, [target, duration])
  return val
}

// ── Scene components ──────────────────────────────────────────────────────────

function SceneMeet({ car }: { car: Car }) {
  return (
    <div className="flex flex-col items-center justify-between h-full py-8 px-6 text-center select-none">
      {/* Badge */}
      <p className="text-xs tracking-[.26em] uppercase text-white/30">
        {car.year} · {car.bodyStyle} · {car.fuelType}
      </p>

      {/* Car image – the hero */}
      <div className="flex-1 flex items-center justify-center w-full max-w-3xl py-4 relative">
        {/* Soft glow under image */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-24 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(ellipse at center, #f97316, transparent)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={car.id}
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="max-h-[42vh] w-auto object-contain relative z-10"
          style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,.9))" }}
        />
      </div>

      {/* Name */}
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-none">
          {car.brand}
        </h1>
        <h2 className="text-5xl sm:text-6xl font-light text-white/40 tracking-tight leading-none mt-1">
          {car.model}
        </h2>
        {car.tagline && (
          <p className="mt-4 text-sm text-white/30 italic max-w-sm mx-auto">&ldquo;{car.tagline}&rdquo;</p>
        )}
        <p className="mt-3 text-sm text-white/50">
          Starting at <span className="text-white font-semibold">{money(car.basePrice)}</span>
        </p>
      </div>
    </div>
  )
}

function ScenePerformance({ car }: { car: Car }) {
  const stat = primaryPerfStat(car)
  const rawNum = parseInt(stat.big.replace(/[^0-9]/g, "")) || 0
  const ticked = useTick(rawNum)
  const sixtyNum = car.specs.zeroToSixty ?? 0
  const sixtyTick = useTick(Math.round(sixtyNum * 10)) // tenths

  const items = [
    { label: "Engine",       value: car.specs.engine },
    { label: "Transmission", value: car.specs.transmission },
    { label: "Drive",        value: car.specs.driveType },
    { label: "Torque",       value: fmt(car.specs.torque, " lb-ft") },
    ...(car.specs.topSpeed ? [{ label: "Top speed", value: fmt(car.specs.topSpeed, " mph") }] : []),
    ...(car.specs.mpgCity ? [{ label: "City / Hwy", value: `${car.specs.mpgCity} / ${car.specs.mpgHighway} MPG` }] : []),
    ...(car.specs.electricRange ? [{ label: "Range", value: fmt(car.specs.electricRange, " mi") }] : []),
  ]

  return (
    <div className="flex flex-col h-full px-6 py-8 max-w-2xl mx-auto w-full">
      <p className="text-xs tracking-[.26em] uppercase text-white/25 mb-8">Performance</p>

      {/* Big stat */}
      <div className="mb-10">
        <div className="text-[80px] sm:text-[100px] font-bold leading-none text-white tabular-nums">
          {ticked.toLocaleString()}
          <span className="text-[32px] font-light text-white/30 ml-2">
            {stat.big.replace(/[0-9,]/g, "").trim()}
          </span>
        </div>
        <p className="text-sm text-white/30 tracking-widest uppercase mt-1">{stat.label}</p>
      </div>

      {/* 0-60 bar */}
      {car.specs.zeroToSixty && (
        <div className="mb-10">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-orange-400 tabular-nums">
              {(sixtyTick / 10).toFixed(1)}s
            </span>
            <span className="text-xs text-white/30 tracking-widest uppercase">0 – 60 mph</span>
          </div>
          <div className="h-1 bg-white/8 rounded-full overflow-hidden w-full max-w-xs">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-[900ms] ease-out"
              style={{ width: `${Math.min((sixtyTick / 10 / 12) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-white/18 mt-1 max-w-xs">
            <span>0s</span><span>6s</span><span>12s</span>
          </div>
        </div>
      )}

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {items.map(it => (
          <div key={it.label}>
            <p className="text-[10px] text-white/25 tracking-widest uppercase">{it.label}</p>
            <p className="text-sm text-white/70 mt-0.5">{it.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SceneInterior({ car }: { car: Car }) {
  const features = car.interiorFeatures ?? []
  const half = Math.ceil(features.length / 2)

  return (
    <div className="flex flex-col h-full px-6 py-8 max-w-2xl mx-auto w-full">
      <p className="text-xs tracking-[.26em] uppercase text-white/25 mb-6">Interior</p>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Seat & space stats */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-6xl font-bold text-white leading-none">{car.specs.seating}</div>
            <p className="text-xs text-white/30 tracking-widest uppercase mt-1">Seats</p>
          </div>
          <div>
            <div className="text-6xl font-bold text-white leading-none">{fmt(car.specs.cargo)}</div>
            <p className="text-xs text-white/30 tracking-widest uppercase mt-1">cu-ft cargo</p>
          </div>
          {car.specs.towingCapacity && (
            <div>
              <div className="text-4xl font-bold text-orange-400 leading-none">
                {fmt(car.specs.towingCapacity)}
              </div>
              <p className="text-xs text-white/30 tracking-widest uppercase mt-1">lb towing</p>
            </div>
          )}
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-2.5 overflow-hidden">
          <p className="text-xs text-white/25 tracking-widest uppercase mb-1">Features</p>
          {features.slice(0, 9).map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0" />
              <p className="text-xs text-white/55 leading-snug">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SceneTechSafety({ car }: { car: Car }) {
  const tech   = car.techFeatures ?? []
  const safety = car.safety?.features ?? []
  const rating = car.safety?.rating

  return (
    <div className="flex flex-col h-full px-6 py-8 max-w-2xl mx-auto w-full">
      <p className="text-xs tracking-[.26em] uppercase text-white/25 mb-8">Tech & Safety</p>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Tech */}
        <div>
          <p className="text-xs text-white/25 tracking-widest uppercase mb-3">Technology</p>
          <div className="flex flex-col gap-2.5">
            {tech.slice(0, 8).map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400/60 flex-shrink-0" />
                <p className="text-xs text-white/55 leading-snug">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety */}
        <div>
          {rating && (
            <div className="mb-5">
              <div className="text-5xl font-bold text-emerald-400 leading-none">{rating}</div>
              <p className="text-xs text-white/30 tracking-widest uppercase mt-1">
                {car.safety.ratingSource ?? "Safety rating"}
              </p>
            </div>
          )}
          <p className="text-xs text-white/25 tracking-widest uppercase mb-3">Driver Aids</p>
          <div className="flex flex-col gap-2.5">
            {safety.slice(0, 7).map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400/60 flex-shrink-0" />
                <p className="text-xs text-white/55 leading-snug">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SceneYours({ car }: { car: Car }) {
  const trims = car.trimLevels ?? []

  return (
    <div className="flex flex-col h-full px-6 py-8 max-w-2xl mx-auto w-full">
      <p className="text-xs tracking-[.26em] uppercase text-white/25 mb-6">Make it yours</p>

      {/* Price range */}
      <div className="mb-8">
        <div className="flex items-baseline gap-4">
          <div>
            <div className="text-4xl font-bold text-white">{money(car.basePrice)}</div>
            <p className="text-xs text-white/25 uppercase tracking-widest mt-1">Base price</p>
          </div>
          <div className="text-white/20 text-2xl">→</div>
          <div>
            <div className="text-4xl font-bold text-white/50">{money(car.maxPrice)}</div>
            <p className="text-xs text-white/25 uppercase tracking-widest mt-1">As tested</p>
          </div>
        </div>
      </div>

      {/* Trim levels */}
      {trims.length > 0 && (
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-white/25 tracking-widest uppercase mb-3">Trim levels</p>
          <div className="flex flex-col gap-3">
            {trims.slice(0, 5).map((trim, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/6 pb-3">
                <div>
                  <p className="text-sm text-white/70 font-medium">{trim.name}</p>
                  {trim.highlights?.[0] && (
                    <p className="text-xs text-white/30 mt-0.5">{trim.highlights[0]}</p>
                  )}
                </div>
                <p className="text-sm text-white/50 tabular-nums flex-shrink-0 ml-4">
                  {money(trim.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-6">
        <Link
          href={`/cars/${car.id}`}
          className="block text-center py-3.5 rounded-full font-semibold text-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          View Full Details
        </Link>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [carIdx,   setCarIdx]   = useState(0)
  const [scene,    setScene]    = useState(0)
  const [dir,      setDir]      = useState<1 | -1>(1)
  const [animKey,  setAnimKey]  = useState(0)

  const car = cars[carIdx]

  const goScene = useCallback((delta: 1 | -1) => {
    setScene(s => {
      const next = s + delta
      if (next < 0 || next >= TOTAL) return s
      setDir(delta)
      setAnimKey(k => k + 1)
      return next
    })
  }, [])

  const goCar = useCallback((delta: 1 | -1) => {
    setCarIdx(i => (i + delta + cars.length) % cars.length)
    setScene(0)
    setAnimKey(k => k + 1)
  }, [])

  // Keyboard nav
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goScene(1)
      else if (e.key === "ArrowLeft") goScene(-1)
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [goScene])

  // Scene backgrounds — each scene has a slightly different tint
  const sceneBg: Record<number, string> = {
    0: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(249,115,22,.06) 0%, transparent 70%), #060608",
    1: "radial-gradient(ellipse 60% 50% at 20% 80%, rgba(249,115,22,.08) 0%, transparent 60%), #060608",
    2: "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(59,130,246,.06) 0%, transparent 60%), #060608",
    3: "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(16,185,129,.05) 0%, transparent 60%), #060608",
    4: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,.05) 0%, transparent 70%), #060608",
  }

  return (
    <div
      className="fixed inset-0 z-10 flex flex-col overflow-hidden"
      style={{ background: sceneBg[scene] ?? "#060608", transition: "background 0.6s ease", color: "#fff" }}
    >
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 z-10">
        <Link href="/" className="text-white/25 hover:text-white/60 transition-colors text-sm flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> CarAdvisor
        </Link>

        {/* Car switcher */}
        <div className="flex items-center gap-2">
          <button onClick={() => goCar(-1)} className="text-white/20 hover:text-white/60 transition-colors p-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <select
            value={carIdx}
            onChange={e => { setCarIdx(Number(e.target.value)); setScene(0); setAnimKey(k => k + 1) }}
            className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 outline-none text-white/60 cursor-pointer max-w-[200px] truncate"
          >
            {cars.map((c, i) => (
              <option key={c.id} value={i} style={{ background: "#0d0d18" }}>
                {c.brand} {c.model} {c.year}
              </option>
            ))}
          </select>
          <button onClick={() => goCar(1)} className="text-white/20 hover:text-white/60 transition-colors p-1">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-20" /> {/* spacer */}
      </div>

      {/* ── Scene ──────────────────────────────────────────────────────────── */}
      <div key={animKey} className="flex-1 overflow-hidden" style={{ animation: "fadeSlide .35s ease both" }}>
        {scene === 0 && <SceneMeet        car={car} />}
        {scene === 1 && <ScenePerformance car={car} />}
        {scene === 2 && <SceneInterior    car={car} />}
        {scene === 3 && <SceneTechSafety  car={car} />}
        {scene === 4 && <SceneYours       car={car} />}
      </div>

      {/* ── Bottom nav ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 pb-5 px-5 z-10">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {SCENES.map((label, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > scene ? 1 : -1); setScene(i); setAnimKey(k => k + 1) }}
              className="group flex flex-col items-center gap-1"
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: scene === i ? 24 : 6,
                  height: 6,
                  background: scene === i ? "#f97316" : "rgba(255,255,255,.18)",
                }}
              />
              <span className="text-[8px] tracking-widest uppercase transition-colors duration-200"
                style={{ color: scene === i ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.14)" }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => goScene(-1)}
            disabled={scene === 0}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/60 disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {scene > 0 ? SCENES[scene - 1] : ""}
          </button>
          <button
            onClick={() => goScene(1)}
            disabled={scene === TOTAL - 1}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/60 disabled:opacity-0 transition-all"
          >
            {scene < TOTAL - 1 ? SCENES[scene + 1] : ""}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
