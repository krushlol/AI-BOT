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

  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": `${car.year} ${car.brand} ${car.model}`,
    "brand": { "@type": "Brand", "name": car.brand },
    "model": car.model,
    "vehicleModelDate": String(car.year),
    "bodyType": car.bodyStyle,
    "fuelType": car.fuelType,
    "vehicleEngine": { "@type": "EngineSpecification", "enginePower": `${car.specs.horsepower} HP` },
    "image": car.image,
    "description": car.description,
    "url": `https://caradvisorusa.com/cars/${car.id}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.2",
      "reviewCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": {
      "@type": "Review",
      "reviewRating": { "@type": "Rating", "ratingValue": "4.2", "bestRating": "5" },
      "author": { "@type": "Organization", "name": "CarAdvisor" },
      "reviewBody": car.description
    },
    "offers": {
      "@type": "Offer",
      "price": car.basePrice,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `https://caradvisorusa.com/cars/${car.id}`,
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "doesNotShip": true,
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" }
      }
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }} />
      <CarDetailClient car={car} user={user} relatedCars={relatedCars} initialSaved={initialSaved} />
    </>
  )
}
