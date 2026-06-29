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
]

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

// Body style disambiguation terms — appended to searches so "Honda Odyssey" finds the minivan not the ATV
const BODY_TYPE_TERMS: Record<string, string> = {
  "minivan": "minivan",
  "van": "van",
  "pickup": "pickup truck",
  "truck": "pickup truck",
  "suv": "SUV",
  "crossover": "SUV crossover",
  "sedan": "sedan",
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

const MAX_YEAR_GAP = 6

function safeDecode(s: string): string {
  try { return decodeURIComponent(s) } catch { return s }
}

function isModelRelevant(thumbUrl: string, model: string): boolean {
  const parts = thumbUrl.split("/")
  const filename = safeDecode(parts[parts.length - 1]).toLowerCase()
  const m = model.toLowerCase()
  const withUnderscore = m.replace(/[\s-]+/g, "_")
  const withHyphen = m.replace(/[\s_]+/g, "-")
  if (filename.includes(withUnderscore) || filename.includes(withHyphen) || filename.includes(m)) return true
  // Also check base model name without trim suffix numbers (e.g. "Silverado 1500" → "Silverado")
  const base = m.replace(/\s+\d+$/, "").trim()
  if (base !== m) {
    const baseUnderscore = base.replace(/[\s-]+/g, "_")
    if (filename.includes(baseUnderscore) || filename.includes(base)) return true
  }
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
    const pages = Object.values(imgData.query?.pages ?? {}) as { imageinfo?: { thumburl?: string; url?: string; mime?: string }[] }[]

    const candidates: { url: string; yearDiff: number }[] = []
    for (const page of pages) {
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
const WIKI_EXTRA_SKIP = ["facelift", "_lci_", "mk2", "mk3", "second_generation", "third_generation"]

async function wikiTitleLookup(title: string, targetYear?: number): Promise<string | null> {
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
      if (targetYear) {
        const y = yearFromUrl(thumb)
        // 15-year window rejects old ATVs (1979 Odyssey for 2021 search) while allowing modern cars
        if (y && Math.abs(y - targetYear) > 15) continue
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

  const cacheKey = `${brand}|${model}|${requestedYear}`
  if (cache.has(cacheKey)) return Response.json({ imageUrl: cache.get(cacheKey) })

  const currentYear = new Date().getFullYear()
  const sy = Math.min(requestedYear, currentYear)
  const bodyTerm = getBodyTerm(bodyStyle) // e.g. "minivan" for Honda Odyssey
  // Base model strips trailing trim numbers: "Silverado 1500" → "Silverado", "F-150" stays "F-150"
  const baseModel = model.replace(/\s+\d{3,4}$/, "").trim()

  let imageUrl: string | null = null

  // Strategy 1: Wikipedia article thumbnail — curated current-gen image
  // Use body term for disambiguation: "Honda Odyssey minivan" not just "Honda Odyssey"
  imageUrl = await wikiTitleLookup(bodyTerm ? `${brand} ${model} (${bodyTerm})` : `${brand} ${model}`, requestedYear)
  if (!imageUrl) imageUrl = await wikiTitleLookup(`${brand} ${model}`, requestedYear)

  // Strategy 2+3: Year-targeted Commons with body type disambiguation
  if (!imageUrl && bodyTerm) {
    imageUrl = await searchCommons(`${sy} ${brand} ${model} ${bodyTerm}`, requestedYear, model)
  }
  if (!imageUrl) imageUrl = await searchCommons(`${sy} ${brand} ${model} front`, requestedYear, model)
  if (!imageUrl) imageUrl = await searchCommons(`${sy} ${brand} ${model}`, requestedYear, model)

  // Walk back up to 6 years — covers 2026 models where no current-year photos exist yet
  for (let back = 1; back <= 6 && !imageUrl; back++) {
    if (bodyTerm) imageUrl = await searchCommons(`${sy - back} ${brand} ${model} ${bodyTerm}`, requestedYear, model)
    if (!imageUrl) imageUrl = await searchCommons(`${sy - back} ${brand} ${model}`, requestedYear, model)
    // Also try base model name (e.g. "Silverado" for "Silverado 1500")
    if (!imageUrl && baseModel !== model) imageUrl = await searchCommons(`${sy - back} ${brand} ${baseModel}`, requestedYear, baseModel)
  }

  // Also try Wikipedia with base model name for models like "Chevrolet Silverado 1500"
  if (!imageUrl && baseModel !== model) imageUrl = await wikiTitleLookup(`${brand} ${baseModel}`, requestedYear)

  // Last resort: any model-relevant photo, no year restriction
  if (!imageUrl && bodyTerm) imageUrl = await searchCommons(`${brand} ${model} ${bodyTerm}`, requestedYear, model, false)
  if (!imageUrl) imageUrl = await searchCommons(`${brand} ${model} automobile`, requestedYear, model, false)
  if (!imageUrl && baseModel !== model) imageUrl = await searchCommons(`${brand} ${baseModel} automobile`, requestedYear, baseModel, false)
  if (!imageUrl) imageUrl = await searchCommons(`${brand} ${model} car`, requestedYear, model, false)

  // Only cache hits — null may succeed on retry
  if (imageUrl) cache.set(cacheKey, imageUrl)
  return Response.json({ imageUrl })
}
