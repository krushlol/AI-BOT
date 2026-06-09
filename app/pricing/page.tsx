import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/cars/navbar"
import PricingClient from "./pricing-client"

export const metadata = {
  title: "Pricing — AutoDrive Pro",
  description: "Upgrade to AutoDrive Pro for unlimited comparisons, saved cars, and more.",
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPro = false
  if (user) {
    const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).single()
    isPro = data?.plan === "pro"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <PricingClient user={user} isPro={isPro} />
    </div>
  )
}
