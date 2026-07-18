"use server"

import { createClient } from "@/lib/supabase/server"

export async function saveCar(carId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in" }
  const { error } = await supabase.from("saved_cars").insert({ user_id: user.id, car_id: carId })
  if (error) return { error: error.message }
  return {}
}

export async function unsaveCar(carId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in" }
  const { error } = await supabase.from("saved_cars").delete().eq("user_id", user.id).eq("car_id", carId)
  if (error) return { error: error.message }
  return {}
}
