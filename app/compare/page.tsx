import { createClient } from "@/lib/supabase/server"
import { cars } from "@/lib/cars/data"
import CompareClient from "@/components/cars/compare-client"

interface ComparePageProps {
  searchParams: { ids?: string }
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const initialIds = searchParams.ids ? searchParams.ids.split(",").slice(0, 4) : []

  return <CompareClient user={user} allCars={cars} initialIds={initialIds} />
}
