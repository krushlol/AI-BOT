import { LiveCarSpecs } from "./live-types"

const EPA_BASE = "https://fueleconomy.gov/ws/rest"

// EPA returns XML for list endpoints; parse it with regex (no external XML dep needed)
function parseXMLMenuItems(xml: string): { text: string; value: string }[] {
  const items: { text: string; value: string }[] = []
  const re = /<menuItem><text>([^<]*)<\/text><value>([^<]*)<\/value><\/menuItem>/g
  let m
  while ((m = re.exec(xml)) !== null) {
    items.push({ text: m[1], value: m[2] })
  }
  return items
}

function normalizeDrive(d: string | undefined): string | undefined {
  if (!d) return undefined
  const s = d.toLowerCase()
  if (s.includes("front")) return "FWD"
  if (s.includes("rear")) return "RWD"
  if (s.includes("all") || s.includes("awd")) return "AWD"
  if (s.includes("4wd") || s.includes("4-wheel")) return "4WD"
  if (s.includes("part")) return "AWD"
  return d
}

function normalizeTransmission(t: string | undefined): string | undefined {
  if (!t) return undefined
  const s = t.toLowerCase()
  if (s.includes("variable") || s.includes("cvt") || s.includes("av-")) return "CVT"
  if (s.includes("auto")) return "Automatic"
  if (s.includes("man")) return "Manual"
  return t
}

async function findBestEPAModel(make: string, model: string, year: number): Promise<string | null> {
  try {
    const res = await fetch(
      `${EPA_BASE}/vehicle/menu/model?year=${year}&make=${encodeURIComponent(make)}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const xml = await res.text()
    const items = parseXMLMenuItems(xml)
    if (!items.length) return null

    const m = model.toLowerCase()
    // Prefer exact prefix match (e.g. "Civic 4Dr" starts with "civic")
    const byPrefix = items.find(i => i.value.toLowerCase().startsWith(m))
    if (byPrefix) return byPrefix.value
    // Fall back to contains match
    const byContains = items.find(i => i.value.toLowerCase().includes(m))
    if (byContains) return byContains.value
    return null
  } catch {
    return null
  }
}

export async function fetchEPASpecs(
  make: string,
  model: string,
  year: number
): Promise<Partial<LiveCarSpecs> | null> {
  try {
    const epaModel = await findBestEPAModel(make, model, year)
    if (!epaModel) return null

    const optRes = await fetch(
      `${EPA_BASE}/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(epaModel)}`,
      { next: { revalidate: 86400 } }
    )
    if (!optRes.ok) return null
    const optXml = await optRes.text()
    const opts = parseXMLMenuItems(optXml)
    if (!opts.length) return null

    const vehicleId = opts[0].value
    const detailRes = await fetch(
      `${EPA_BASE}/vehicle/${vehicleId}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 604800 } }
    )
    if (!detailRes.ok) return null
    const r = await detailRes.json()

    const mpgCity = Number(r.city08) || undefined
    const mpgHighway = Number(r.highway08) || undefined
    const mpgCombined = Number(r.comb08) || undefined

    return {
      mpgCity,
      mpgHighway,
      mpgCombined,
      cylinders: Number(r.cylinders) || undefined,
      displacement: Number(r.displ) || undefined,
      driveType: normalizeDrive(r.drive),
      fuelType: r.fuelType1 ?? r.fuelType ?? undefined,
      transmission: normalizeTransmission(r.trany),
      bodyClass: r.VClass ?? undefined,
    }
  } catch {
    return null
  }
}
