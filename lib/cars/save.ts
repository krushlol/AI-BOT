import { createClient } from "@/lib/supabase/client"

/** Toggle a car saved/unsaved in Supabase. Throws if the operation fails. */
export async function toggleSavedCar(userId: string, carId: string, currentlySaved: boolean): Promise<void> {
  const supabase = createClient()
  if (currentlySaved) {
    const { error } = await supabase.from("saved_cars").delete().eq("user_id", userId).eq("car_id", carId)
    if (error) {
      console.error("[toggleSavedCar] delete error:", error)
      throw error
    }
  } else {
    const { error } = await supabase.from("saved_cars").insert({ user_id: userId, car_id: carId })
    if (error) {
      console.error("[toggleSavedCar] insert error:", error)
      throw error
    }
  }
}
