import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cars } from "@/lib/cars/data"
import DashboardClient from "@/components/cars/dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in")

  const { data: savedRows } = await supabase
    .from("saved_cars")
    .select("car_id")
    .eq("user_id", user.id)

  const savedCarIds = (savedRows ?? []).map((r: { car_id: string }) => r.car_id)

  return <DashboardClient user={user} allCars={cars} initialSavedIds={savedCarIds} />
}
