import { NextRequest, NextResponse } from "next/server"
import { fetchNHTSAModels } from "@/lib/cars/nhtsa"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const make = searchParams.get("make")
  const year = searchParams.get("year")

  if (!make || !year) {
    return NextResponse.json({ error: "make and year are required" }, { status: 400 })
  }

  const yearNum = parseInt(year)
  if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
    return NextResponse.json({ error: "invalid year" }, { status: 400 })
  }

  const results = await fetchNHTSAModels(make, yearNum)
  return NextResponse.json({ results })
}
