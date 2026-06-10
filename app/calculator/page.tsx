import { createClient } from "@/lib/supabase/server"
import CalculatorClient from "@/components/cars/calculator-client"

export const metadata = {
  title: "Loan Payment Calculator — AutoDrive",
  description: "Estimate your monthly car payment. Adjust price, down payment, loan term, and interest rate to find a payment that fits your budget.",
}

export default async function CalculatorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <CalculatorClient user={user} />
}
