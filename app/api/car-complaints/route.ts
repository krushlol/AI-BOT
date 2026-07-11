import { fetchComplaints } from "@/lib/cars/complaints"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const make = (searchParams.get("make") ?? "").trim()
  const model = (searchParams.get("model") ?? "").trim()
  const year = parseInt(searchParams.get("year") ?? "0")
  const result = await fetchComplaints(make, model, year)
  return Response.json(result)
}
