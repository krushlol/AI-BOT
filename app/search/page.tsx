import { createClient } from "@/lib/supabase/server"
import SearchClient from "@/components/cars/search-client"
import { cars, brands, bodyStyles, fuelTypes } from "@/lib/cars/data"

interface SearchPageProps {
  searchParams: {
    q?: string
    brand?: string
    bodyStyle?: string
    fuelType?: string
    minPrice?: string
    maxPrice?: string
    seating?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  let initialSavedIds: string[] = []
  if (user) {
    const { data } = await supabase.from("saved_cars").select("car_id").eq("user_id", user.id)
    initialSavedIds = (data ?? []).map((r: { car_id: string }) => r.car_id)
  }

  return (
    <SearchClient
      user={user}
      allCars={cars}
      brands={brands}
      bodyStyles={bodyStyles}
      fuelTypes={fuelTypes}
      initialParams={searchParams}
      initialSavedIds={initialSavedIds}
    />
  )
}
