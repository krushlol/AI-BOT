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
  const { data: { user } } = await supabase.auth.getUser()

  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

  return (
    <SearchClient
      user={user}
      allCars={cars}
      brands={brands}
      bodyStyles={bodyStyles}
      fuelTypes={fuelTypes}
      initialParams={searchParams}
      unsplashKey={unsplashKey}
    />
  )
}
