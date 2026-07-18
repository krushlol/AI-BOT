import { createClient } from "@/lib/supabase/server"
import QuizClient from "@/components/quiz/quiz-client"
import { cars } from "@/lib/cars/data"

export const metadata = {
  title: "Find My Car — CarAdvisor",
  description: "Answer 6 quick questions about your lifestyle and we'll match you with the perfect car.",
}

export default async function QuizPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  return <QuizClient user={user} allCars={cars} />
}
