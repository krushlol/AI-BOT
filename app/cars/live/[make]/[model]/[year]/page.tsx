import { createClient } from "@/lib/supabase/server"
import { fetchCarSpecs } from "@/lib/cars/api-ninjas"
import { fetchNHTSASafetyRatings } from "@/lib/cars/nhtsa"
import LiveCarDetailClient from "@/components/cars/live-car-detail-client"

interface Params {
  make: string
  model: string
  year: string
}

export async function generateMetadata({ params }: { params: Params }) {
  const model = decodeURIComponent(params.model).replace(/-/g, " ")
  const make = decodeURIComponent(params.make)
  return {
    title: `${params.year} ${make} ${model} — CarAdvisor`,
    description: `Specs, safety ratings, and details for the ${params.year} ${make} ${model}.`,
  }
}

function toTitleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

// Some brands register vehicles with trim-level names in NHTSA/API Ninjas rather than
// the marketing series name. Map marketing names → a representative searchable model.
const MODEL_ALIASES: Record<string, Record<string, string>> = {
  "BMW": {
    "1 Series": "128i", "2 Series": "230i", "3 Series": "330i", "4 Series": "430i",
    "5 Series": "530i", "6 Series": "640i", "7 Series": "740i", "8 Series": "840i",
  },
  "Mercedes-Benz": {
    "C-Class": "C300", "E-Class": "E350", "S-Class": "S500",
    "GLC": "GLC300", "GLE": "GLE350", "GLS": "GLS450", "A-Class": "A220",
  },
}

export default async function LiveCarDetailPage({ params }: { params: Params }) {
  const makeRaw = decodeURIComponent(params.make)
  const modelRaw = decodeURIComponent(params.model).replace(/-/g, " ")
  const year = parseInt(params.year)

  // API Ninjas and NHTSA are case-sensitive — use title case
  const make = toTitleCase(makeRaw)
  const model = toTitleCase(modelRaw)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch both in parallel; fall back to alias model name if primary returns nothing
  const aliasModel = MODEL_ALIASES[make]?.[model]
  const [specs, safety] = await Promise.all([
    fetchCarSpecs(make, model, year).then(r => r ?? (aliasModel ? fetchCarSpecs(make, aliasModel, year) : null)),
    fetchNHTSASafetyRatings(make, model, year).then(r => r ?? (aliasModel ? fetchNHTSASafetyRatings(make, aliasModel, year) : null)),
  ])

  const car = {
    id: `live-${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, "-")}-${year}`,
    brand: make,
    model,
    year,
    isLive: true as const,
    specs: specs ?? undefined,
    safety: safety ?? undefined,
  }

  return <LiveCarDetailClient car={car} user={user} />
}
