const cache = new Map<string, string | null>()

const SKIP_KEYWORDS = [
  "engine","motor","powertrain","drivetrain","interior","dashboard",
  "cockpit","cabin","seat","badge","logo","emblem","headlight","taillight",
  "grille","gauge","instrument","steering","gear","underhood","cutaway",
  "diagram","blueprint","factory","plant","assembly","schematic","prototype",
  "classic","vintage","historic","oldtimer","retro_classic","heritage","klassik",
  "museum","motorsport","race","rally","nurburgring","concours","btcc","dtm","wtcr","gt3","touring_car",
  // Old BMW generation codes — URL-encoded form (%28E36%29) and decoded form ((e36))
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
  // Refresh/facelift generations look different from base model year
  "juniper","facelift","_lci_","_mk2_","_mk3_","second_generation","third_generation",
  ".djvu",".svg",".tif",".gif","book","page1",
]

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

function isExteriorImage(url: string): boolean {
  const lower = url.toLowerCase()
  if (!ALLOWED_EXTENSIONS.some(ext => lower.includes(ext))) return false
  return !SKIP_KEYWORDS.some((kw) => lower.includes(kw))
}

// Extract 4-digit year from a URL — returns the FIRST year-like value found (leftmost)
// The leftmost year in a filename like "2005_Honda_Civic..._05-23-2024" is the car year, not the photo date
function yearFromUrl(url: string): number | null {
  const all = url.match(/(19[5-9]\d|20[0-3]\d)/g)
  if (!all) return null
  return parseInt(all[0])
}

// Max acceptable year gap between photo and target year
// 6 allows 2021 G22 440i photo to be used for a 2026 model year
const MAX_YEAR_GAP = 6

// Check if the filename contains the model name as a phrase
// e.g. model="3 Series" → checks for "3_series" in filename
// Prevents "BMW 7 Series" photos when searching "BMW 3 Series"
function safeDecode(s: string): string {
  try { return decodeURIComponent(s) } catch { return s }
}

function isModelRelevant(thumbUrl: string, model: string): boolean {
  const parts = thumbUrl.split("/")
  const filename = safeDecode(parts[parts.length - 1]).toLowerCase()
  const m = model.toLowerCase()
  const withUnderscore = m.replace(/[\s-]+/g, "_")
  const withHyphen = m.replace(/[\s_]+/g, "-")
  return filename.includes(withUnderscore) || filename.includes(withHyphen) || filename.includes(m)
}

// Search Wikimedia Commons for image files matching query, return best exterior shot
async function searchCommons(query: string, targetYear: number, model?: string): Promise<string | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=10&format=json&origin=*`
  try {
    const res = await fetch(url, {})
    const data = await res.json()
    const results: { title: string }[] = data.query?.search ?? []
    if (!results.length) return null

    // Get actual image URLs — use raw pipe separator (NOT encodeURIComponent for multi-values)
    const titles = results.map(r => encodeURIComponent(r.title)).join("|")
    const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${titles}&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=800&format=json&origin=*`
    const imgRes = await fetch(imgUrl, {})
    const imgData = await imgRes.json()
    const pages = Object.values(imgData.query?.pages ?? {}) as { imageinfo?: { thumburl?: string; url?: string; mime?: string }[] }[]

    // Collect candidates: only jpg/png exterior shots
    const candidates: { url: string; yearDiff: number }[] = []
    for (const page of pages) {
      const info = page.imageinfo?.[0]
      const mime = info?.mime ?? ""
      if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/webp") continue
      const thumbUrl = info?.thumburl ?? info?.url ?? ""
      if (!thumbUrl || !isExteriorImage(thumbUrl)) continue
      if (model && !isModelRelevant(thumbUrl, model)) continue
      const y = yearFromUrl(thumbUrl)
      // Dateless photos get yearDiff=999 so they can't win over dated ones in year-targeted strategies
      const yearDiff = y !== null ? Math.abs(y - targetYear) : 999
      candidates.push({ url: thumbUrl, yearDiff })
    }
    if (!candidates.length) return null
    candidates.sort((a, b) => a.yearDiff - b.yearDiff)
    // Reject if the best match is too far from the target year
    if (candidates[0].yearDiff > MAX_YEAR_GAP) return null
    return candidates[0].url
  } catch {
    return null
  }
}

// Wikipedia article title lookup (follows redirects)
// Returns the article's main thumbnail if it passes exterior and year checks
async function wikiTitleLookup(title: string, targetYear?: number): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages&pithumbsize=800&format=json&origin=*`
  try {
    const res = await fetch(url, {})
    const data = await res.json()
    const pages = data.query?.pages ?? {}
    for (const page of Object.values(pages) as Record<string, unknown>[]) {
      const thumb = (page as { thumbnail?: { source?: string } }).thumbnail?.source
      if (!thumb || !isExteriorImage(thumb)) continue
      if (targetYear) {
        const y = yearFromUrl(thumb)
        // Reject if photo year is clearly older than the target (> 6 year gap)
        if (y && Math.abs(y - targetYear) > MAX_YEAR_GAP) return null
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
  const requestedYear = parseInt(searchParams.get("year") ?? "0") || new Date().getFullYear()

  if (!brand || !model) return Response.json({ imageUrl: null })

  const cacheKey = `${brand}|${model}|${requestedYear}`
  if (cache.has(cacheKey)) return Response.json({ imageUrl: cache.get(cacheKey) })

  // Cap search year to current year — future model years don't have Commons photos yet
  const currentYear = new Date().getFullYear()
  const searchYear = Math.min(requestedYear, currentYear)

  let imageUrl: string | null = null

  // Strategy 1: Wikipedia article thumbnail — most reliable for current-generation photos
  // (Wikipedia editors maintain the main article image to show the current gen model)
  imageUrl = await wikiTitleLookup(`${brand} ${model}`, requestedYear)

  // Strategy 2: Commons search with capped year + "front" for clearest exterior shots
  if (!imageUrl) imageUrl = await searchCommons(`${searchYear} ${brand} ${model} front`, requestedYear, model)

  // Strategy 3: Commons without "front"
  if (!imageUrl) imageUrl = await searchCommons(`${searchYear} ${brand} ${model}`, requestedYear, model)

  // Strategies 4-7: Try years 1-4 back (covers 2025/2026 models with 2021-2024 photos on Commons)
  for (let back = 1; back <= 4 && !imageUrl; back++) {
    imageUrl = await searchCommons(`${searchYear - back} ${brand} ${model}`, requestedYear, model)
  }

  // Strategy 8: Generic Commons search — requires image to have a year in filename
  if (!imageUrl) {
    const generic = await searchCommons(`${brand} ${model} automobile`, requestedYear, model)
    if (generic && yearFromUrl(generic) !== null) imageUrl = generic
  }

  // Only cache successful lookups — null results may succeed on retry (rate limit, transient error)
  if (imageUrl !== null) cache.set(cacheKey, imageUrl)
  return Response.json({ imageUrl })
}
