import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cars } from "@/lib/cars/data"
import DashboardClient from "@/components/cars/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in")

  return <DashboardClient user={user} allCars={cars} />
}
