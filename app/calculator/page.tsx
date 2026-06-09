import { createClient } from "@/lib/supabase/server"
import CalculatorClient from "@/components/cars/calculator-client"
import CalculatorGate from "@/components/cars/calculator-gate"

export const metadata = {
  title: "Loan Payment Calculator — AutoDrive",
  description: "Estimate your monthly car payment. Adjust price, down payment, loan term, and interest rate to find a payment that fits your budget.",
}

export default async function CalculatorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check Pro status server-side
  let isPro = false
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()
    isPro = data?.plan === "pro"
  }

  if (!isPro) {
    return <CalculatorGate user={user} />
  }

  return <CalculatorClient user={user} />
}
