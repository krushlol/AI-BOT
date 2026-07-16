import { createClient } from "@/lib/supabase/server"
import { cars } from "@/lib/cars/data"
import DepreciationPageClient from "@/components/cars/depreciation-page-client"

export const metadata = {
  title: "Resale Value & Depreciation — CarAdvisor",
  description: "See how much any car loses per day, and what it will be worth in 1, 3, and 5 years. Powered by real segment depreciation data.",
}

export default async function DepreciationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <DepreciationPageClient user={user} cars={cars} />
}
