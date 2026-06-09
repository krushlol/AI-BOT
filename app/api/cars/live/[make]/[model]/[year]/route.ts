import { NextRequest, NextResponse } from "next/server"
import { fetchCarSpecs } from "@/lib/cars/api-ninjas"
import { fetchNHTSASafetyRatings } from "@/lib/cars/nhtsa"

interface Params {
  make: string
  model: string
  year: string
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { make, model, year } = params
  const yearNum = parseInt(year)

  const [specs, safety] = await Promise.all([
    fetchCarSpecs(make, model, yearNum),
    fetchNHTSASafetyRatings(make, model, yearNum),
  ])

  return NextResponse.json({
    id: `live-${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, "-")}-${year}`,
    brand: make,
    model,
    year: yearNum,
    isLive: true,
    specs: specs ?? undefined,
    safety: safety ?? undefined,
  })
}
