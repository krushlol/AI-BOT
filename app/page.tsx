import { createClient } from "@/lib/supabase/server"
import HomeClient from "@/components/cars/home-client"
import { cars } from "@/lib/cars/data"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const featured = cars.slice(0, 6)

  return <HomeClient user={user} featuredCars={featured} allCars={cars} />
}
