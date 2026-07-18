const cache = new Map<string, string | null>()

const SKIP_KEYWORDS = [
  // Non-exterior parts
  "engine","motor","powertrain","drivetrain","interior","dashboard",
  "cockpit","cabin","seat","badge","logo","emblem","headlight","taillight",
  "grille","gauge","instrument","steering","gear","underhood","cutaway",
  "diagram","blueprint","factory","plant","assembly","schematic","prototype",
  // File types / non-photo
  ".djvu",".svg",".tif",".gif","book","page1",
  // Wrong vehicle contexts
  "classic","vintage","historic","oldtimer","retro_classic","heritage","klassik",
  "museum","motorsport","race","rally","nurburgring","concours","btcc","dtm","wtcr","gt3","touring_car",
  "police","polizei","carabinieri","gendarmerie","ambulance","fire_truck","taxi","test_drive",
  // Wrong vehicle types (ATVs, motorcycles, boats etc)
  "atv","quad","dune_buggy","go-kart","go_kart","gokart","buggy","scooter",
  "motorcycle","moto","motorbike","bicycle","bike","tractor","forklift","snowmobile",
  // Old BMW generation codes
  "%28e30%29","(e30)","_e30_",
  "%28e36%29","(e36)","_e36_",
  "%28e46%29","(e46)","_e46_",
  "%28e60%29","(e60)","_e60_",
  "%28e82%29","(e82)","_e82_",
  "%28e90%29","(e90)","_e90_",
  "%28e92%29","(e92)","_e92_",
  "%28f10%29","(f10)","_f10_",
  "%28f30%29","(f30)","_f30_",
  "%28f31%29","(f31)","_f31_",
  "%28f32%29","(f32)","_f32_",
  // Tesla Juniper = 2025 visual redesign — keep this specific, don't block generic "facelift"
  "juniper",
  // Chinese joint-venture brand prefixes — wrong market variant for North American searches
  "gac-honda","gac_honda",
  // Chinese city/province names that appear in CN-market vehicle photo filenames
  "guangdong","dongguan","guangzhou","shanghai","beijing","shenzhen","chengdu","tianjin","_china_","%2c_china",
]

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

// Body style disambiguation terms — appended to searches so "Honda Odyssey" finds the minivan not the ATV
const BODY_TYPE_TERMS: Record<string, string> = {
  "minivan": "minivan",
  "van": "van",
  "pickup": "pickup truck",
  "truck": "pickup truck",
  "sport utility": "SUV",   // API Ninjas: "Sport Utility Vehicle"
  "suv": "SUV",
  "crossover": "SUV crossover",
  "sedan": "sedan",
  "passenger car": "sedan", // API Ninjas: "Passenger Car"
  "coupe": "coupe",
  "convertible": "convertible",
  "hatchback": "hatchback",
  "wagon": "wagon",
}

function getBodyTerm(bodyStyle?: string): string {
  if (!bodyStyle) return ""
  const lower = bodyStyle.toLowerCase()
  for (const [key, term] of Object.entries(BODY_TYPE_TERMS)) {
    if (lower.includes(key)) return term
  }
  return ""
}

function isExteriorImage(url: string): boolean {
  const lower = url.toLowerCase()
  if (!ALLOWED_EXTENSIONS.some(ext => lower.includes(ext))) return false
  return !SKIP_KEYWORDS.some((kw) => lower.includes(kw))
}

function yearFromUrl(url: string): number | null {
  const all = url.match(/(19[5-9]\d|20[0-3]\d)/g)
  if (!all) return null
  return parseInt(all[0])
}

const MAX_YEAR_GAP = 6      // Commons searches
const MAX_WIKI_YEAR_GAP = 5 // Wikipedia thumbnails — slightly stricter so outdated article photos fall through to Commons

function safeDecode(s: string): string {
  try { return decodeURIComponent(s) } catch { return s }
}

// Trailing words that are trim-level identifiers, NOT part of the base model name.
// "4Runner TRD Pro" → strip "TRD Pro" → "4Runner"
// "Continental GT V8" → strip "V8" → "Continental GT"
// "Silverado 1500 LTZ" → strip "LTZ" → "Silverado 1500"
// NOT stripped: "Mach-E", "Lightning", "Cross", "EV" — these define a distinct variant/body
const TRIM_WORD_RE = /^(?:v[468]t?|trd|pro|limited|premium|platinum|xle|xse|sr5|ltz|lt(?!\s)|ls|xlt|z71|at4|rst|denali|laramie|bighorn|rebel|altitude|off-road|awd|fwd|4wd|4x[24]|phev|high|country|night|edition|crew|regular|extended|double|cab|base)$/i

function stripTrimSuffix(model: string): string {
  const words = model.trim().split(/\s+/)
  let len = words.length
  while (len > 1 && TRIM_WORD_RE.test(words[len - 1])) len--
  return words.slice(0, len).join(" ")
}

function isModelRelevant(thumbUrl: string, model: string): boolean {
  const filename = safeDecode((thumbUrl.split("/").pop() ?? "")).toLowerCase()
  const m = model.toLowerCase().trim()

  function matchSep(s: string): boolean {
    if (!s) return false
    const allU = s.replace(/[\s\-]+/g, "_")   // all separators → underscore
    const allH = s.replace(/[\s_]+/g, "-")     // space/underscore → hyphen
    const mixU = s.replace(/\s+/g, "_")        // space→underscore, keep hyphens (handles "Mach-E")
    return filename.includes(allU) || filename.includes(allH) || filename.includes(mixU) || filename.includes(s)
  }

  // 1. Full model name (various separator forms)
  if (matchSep(m)) return true

  // 2. Trim-suffix stripped: "4Runner TRD Pro" → "4runner" (only strips known trim words)
  //    Does NOT strip meaningful variant words like "Lightning", "Cross", "EV", "Mach-E"
  const trimmed = stripTrimSuffix(m)
  if (trimmed !== m && matchSep(trimmed)) return true

  // 3. Trailing 3-4 digit number stripped: "GLE 350" → "gle", "Silverado 1500" → "silverado"
  const numStripped = m.replace(/\s+\d{3,4}$/, "").trim()
  if (numStripped !== m && numStripped.length >= 2 && matchSep(numStripped)) return true

  return false
}

// Cache Wikimedia responses on disk for 24h — prevents rate limiting when many cards load at once
const WIKI_FETCH_OPTS = { next: { revalidate: 86400 } } as RequestInit

async function searchCommons(query: string, targetYear: number, model: string, strict = true): Promise<string | null> {
  try {
    const res = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=15&format=json&origin=*`,
      WIKI_FETCH_OPTS
    )
    const data = await res.json()
    const results: { title: string }[] = data.query?.search ?? []
    if (!results.length) return null

    const joined = results.map(r => encodeURIComponent(r.title)).join("|")
    const imgRes = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${joined}&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=800&format=json&origin=*`,
      WIKI_FETCH_OPTS
    )
    const imgData = await imgRes.json()
    // Build title→page map, then iterate in original search-result order so
    // relevance ranking is preserved (Object.values order is by page-ID, not rank)
    const pageByTitle = new Map<string, { title?: string; imageinfo?: { thumburl?: string; url?: string; mime?: string }[] }>()
    for (const page of Object.values(imgData.query?.pages ?? {}) as { title?: string; imageinfo?: { thumburl?: string; url?: string; mime?: string }[] }[]) {
      if (page.title) pageByTitle.set(page.title, page)
    }

    const candidates: { url: string; yearDiff: number }[] = []
    for (const result of results) {
      const page = pageByTitle.get(result.title) ?? pageByTitle.get(decodeURIComponent(result.title))
      if (!page) continue
      const info = page.imageinfo?.[0]
      const mime = info?.mime ?? ""
      if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/webp") continue
      const thumbUrl = info?.thumburl ?? info?.url ?? ""
      if (!thumbUrl || !isExteriorImage(thumbUrl)) continue
      if (!isModelRelevant(thumbUrl, model)) continue
      const y = yearFromUrl(thumbUrl)
      const yearDiff = y !== null ? Math.abs(y - targetYear) : 999
      candidates.push({ url: thumbUrl, yearDiff })
    }
    if (!candidates.length) return null
    candidates.sort((a, b) => a.yearDiff - b.yearDiff)
    if (strict && candidates[0].yearDiff > MAX_YEAR_GAP) return null
    return candidates[0].url
  } catch {
    return null
  }
}

// Extra skip terms for Wikipedia strategy — Wikipedia always shows the LATEST gen,
// so facelift/refresh photos may be wrong generation for older model year searches
const WIKI_EXTRA_SKIP = ["_lci_", "mk2", "mk3", "second_generation", "third_generation"]

async function wikiTitleLookup(title: string, targetYear?: number, model?: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages&pithumbsize=800&format=json&origin=*`,
      WIKI_FETCH_OPTS
    )
    const data = await res.json()
    const pages = data.query?.pages ?? {}
    for (const page of Object.values(pages) as Record<string, unknown>[]) {
      const thumb = (page as { thumbnail?: { source?: string } }).thumbnail?.source
      if (!thumb || !isExteriorImage(thumb)) continue
      const lower = thumb.toLowerCase()
      if (WIKI_EXTRA_SKIP.some(kw => lower.includes(kw))) continue
      // If a model name is supplied, reject thumbnails that clearly belong to a different model
      if (model && !isModelRelevant(thumb, model)) continue
      if (targetYear) {
        const y = yearFromUrl(thumb)
        // Only reject if there IS a year in the URL and it's out of range.
        // Year-less filenames are fine — Wikipedia article thumbnails are curated for the current gen.
        if (y !== null && (y < targetYear - MAX_WIKI_YEAR_GAP || y > targetYear + 1)) continue
      }
      return thumb
    }
  } catch { /* */ }
  return null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = (searchParams.get("brand") ?? "").trim()
  const model = (searchParams.get("model") ?? "").trim()
  const bodyStyle = (searchParams.get("bodyStyle") ?? "").trim()
  const requestedYear = parseInt(searchParams.get("year") ?? "0") || new Date().getFullYear()

  if (!brand || !model) return Response.json({ imageUrl: null })

  const cacheKey = `${brand}|${model}|${requestedYear}|${bodyStyle}`
  if (cache.has(cacheKey)) return Response.json({ imageUrl: cache.get(cacheKey) })

  const currentYear = new Date().getFullYear()
  const sy = Math.min(requestedYear, currentYear)
  const bodyTerm = getBodyTerm(bodyStyle) // e.g. "minivan" for Honda Odyssey
  // Base model strips trailing trim numbers: "Silverado 1500" → "Silverado", "F-150" stays "F-150"
  const baseModel = model.replace(/\s+\d{3,4}$/, "").trim()
  // Short model strips trailing trim descriptors for search query fallbacks
  const _shortModelFull = stripTrimSuffix(model)
  const shortModel = _shortModelFull !== model ? _shortModelFull : ""

  let imageUrl: string | null = null

  // Strategy 1: Wikipedia article thumbnail — curated current-gen image
  // Use body term for disambiguation: "Honda Odyssey minivan" not just "Honda Odyssey"
  imageUrl = await wikiTitleLookup(bodyTerm ? `${brand} ${model} (${bodyTerm})` : `${brand} ${model}`, requestedYear, model)
  if (!imageUrl) imageUrl = await wikiTitleLookup(`${brand} ${model}`, requestedYear, model)
  // Strategy 1b: Wikipedia with short model — handles NHTSA trim names ("4Runner TRD Pro" → "Toyota 4Runner")
  if (!imageUrl && shortModel) imageUrl = await wikiTitleLookup(`${brand} ${shortModel}`, requestedYear, shortModel)

  // Strategy 2+3: Year-targeted Commons with body type disambiguation
  if (!imageUrl && bodyTerm) {
    imageUrl = await searchCommons(`${sy} ${brand} ${model} ${bodyTerm}`, requestedYear, model)
  }
  if (!imageUrl) imageUrl = await searchCommons(`${sy} ${brand} ${model} front`, requestedYear, model)

  // Fallback: "(North America)" Wikipedia — catches models where the base article is wrong
  // (e.g. "Honda Odyssey" → ATV, but "Honda Odyssey (North America)" → the minivan)
  // Placed after the "front" Commons search so a year-specific Commons photo wins if found
  if (!imageUrl) imageUrl = await wikiTitleLookup(`${brand} ${model} (North America)`, requestedYear, model)

  if (!imageUrl) imageUrl = await searchCommons(`${sy} ${brand} ${model}`, requestedYear, model)

  // Walk back up to 6 years — covers 2026 models where no current-year photos exist yet
  for (let back = 1; back <= 6 && !imageUrl; back++) {
    if (bodyTerm) imageUrl = await searchCommons(`${sy - back} ${brand} ${model} ${bodyTerm}`, requestedYear, model)
    if (!imageUrl) imageUrl = await searchCommons(`${sy - back} ${brand} ${model}`, requestedYear, model)
    // Try short model name (NHTSA trim stripped: "4Runner TRD Pro" → "4Runner")
    if (!imageUrl && shortModel) imageUrl = await searchCommons(`${sy - back} ${brand} ${shortModel}`, requestedYear, shortModel)
    // Also try base model name (e.g. "Silverado" for "Silverado 1500")
    if (!imageUrl && baseModel !== model) imageUrl = await searchCommons(`${sy - back} ${brand} ${baseModel}`, requestedYear, baseModel)
  }

  // Also try Wikipedia with short/base model names
  if (!imageUrl && shortModel) imageUrl = await wikiTitleLookup(`${brand} ${shortModel}`, requestedYear, shortModel)
  if (!imageUrl && baseModel !== model) imageUrl = await wikiTitleLookup(`${brand} ${baseModel}`, requestedYear, baseModel)

  // Last resort: any model-relevant photo, no year restriction
  if (!imageUrl && bodyTerm) imageUrl = await searchCommons(`${brand} ${model} ${bodyTerm}`, requestedYear, model, false)
  if (!imageUrl) imageUrl = await searchCommons(`${brand} ${model} automobile`, requestedYear, model, false)
  if (!imageUrl && shortModel) imageUrl = await searchCommons(`${brand} ${shortModel} automobile`, requestedYear, shortModel, false)
  if (!imageUrl && baseModel !== model) imageUrl = await searchCommons(`${brand} ${baseModel} automobile`, requestedYear, baseModel, false)
  if (!imageUrl) imageUrl = await searchCommons(`${brand} ${model} car`, requestedYear, model, false)

  // Only cache hits — null may succeed on retry
  if (imageUrl) cache.set(cacheKey, imageUrl)
  return Response.json({ imageUrl })
}
