"use server"

import { createClient } from "@/lib/supabase/server"

export async function saveCar(carId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { error: "not_signed_in" }
    const { error } = await supabase
      .from("saved_cars")
      .insert({ user_id: session.user.id, car_id: carId })
    if (error) {
      // Ignore duplicate saves (car already saved)
      if (error.code === "23505") return {}
      console.error("[saveCar]", error.message)
      return { error: error.message }
    }
    return {}
  } catch (e) {
    console.error("[saveCar] unexpected:", e)
    return { error: "unexpected" }
  }
}

export async function unsaveCar(carId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { error: "not_signed_in" }
    const { error } = await supabase
      .from("saved_cars")
      .delete()
      .eq("user_id", session.user.id)
      .eq("car_id", carId)
    if (error) {
      console.error("[unsaveCar]", error.message)
      return { error: error.message }
    }
    return {}
  } catch (e) {
    console.error("[unsaveCar] unexpected:", e)
    return { error: "unexpected" }
  }
}
