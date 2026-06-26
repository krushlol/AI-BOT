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

export default async function LiveCarDetailPage({ params }: { params: Params }) {
  const makeRaw = decodeURIComponent(params.make)
  const modelRaw = decodeURIComponent(params.model).replace(/-/g, " ")
  const year = parseInt(params.year)

  // API Ninjas and NHTSA are case-sensitive — use title case
  const make = toTitleCase(makeRaw)
  const model = toTitleCase(modelRaw)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch both in parallel
  const [specs, safety] = await Promise.all([
    fetchCarSpecs(make, model, year),
    fetchNHTSASafetyRatings(make, model, year),
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
