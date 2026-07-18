import { createClient } from "@/lib/supabase/server"
import HomeClient from "@/components/cars/home-client"
import { cars } from "@/lib/cars/data"

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  let initialSavedIds: string[] = []
  if (user) {
    const { data } = await supabase.from("saved_cars").select("car_id").eq("user_id", user.id)
    initialSavedIds = (data ?? []).map((r: { car_id: string }) => r.car_id)
  }

  const featured = cars.slice(0, 6)

  return <HomeClient user={user} featuredCars={featured} allCars={cars} initialSavedIds={initialSavedIds} />
}
