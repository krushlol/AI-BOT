import { createClient } from "@/lib/supabase/server"
import { getCarById, cars } from "@/lib/cars/data"
import { notFound } from "next/navigation"
import CarDetailClient from "@/components/cars/car-detail-client"

interface CarDetailPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: CarDetailPageProps) {
  const car = getCarById(params.id)
  if (!car) return {}
  return {
    title: `${car.year} ${car.brand} ${car.model} — CarAdvisor`,
    description: car.description,
  }
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const car = getCarById(params.id)
  if (!car) notFound()

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const relatedCars = cars
    .filter((c) => c.id !== car.id && (c.brand === car.brand || c.bodyStyle === car.bodyStyle))
    .slice(0, 3)

  let initialSaved = false
  if (user) {
    const { data } = await supabase
      .from("saved_cars")
      .select("id")
      .eq("user_id", user.id)
      .eq("car_id", car.id)
      .single()
    initialSaved = !!data
  }

  return <CarDetailClient car={car} user={user} relatedCars={relatedCars} initialSaved={initialSaved} />
}
