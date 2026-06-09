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
    title: `${car.year} ${car.brand} ${car.model} — AutoDrive`,
    description: car.description,
  }
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const car = getCarById(params.id)
  if (!car) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const relatedCars = cars
    .filter((c) => c.id !== car.id && (c.brand === car.brand || c.bodyStyle === car.bodyStyle))
    .slice(0, 3)

  return <CarDetailClient car={car} user={user} relatedCars={relatedCars} />
}
