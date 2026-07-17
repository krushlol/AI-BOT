import Link from "next/link"
import { Search, RotateCcw, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/cars/navbar"

export const metadata = { title: "No Matches Found — CarAdvisor" }

export default async function NoResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">No exact matches</h1>
        <p className="text-gray-500 text-lg mb-8">
          Your filters are a bit too specific. Try relaxing one or two — like fuel type or
          vehicle style — to open up more options.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/quiz">
            <Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">
              <RotateCcw className="w-4 h-4" /> Adjust filters
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" /> Browse all cars
            </Button>
          </Link>
        </div>

        <p className="mt-10 text-sm text-gray-400">
          Not sure where to start?{" "}
          <Link href="/search" className="text-orange-500 hover:underline inline-flex items-center gap-1">
            See our top picks <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  )
}
