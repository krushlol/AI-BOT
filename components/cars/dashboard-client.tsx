"use client"

import { useState } from "react"
import { Heart, Search, User, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "./navbar"
import CarCard from "./car-card"
import { Car } from "@/lib/cars/types"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface DashboardClientProps {
  user: { id?: string; email?: string }
  allCars: Car[]
  initialSavedIds: string[]
}

interface SavedSearch {
  id: string
  name: string
  query: string
  date: string
}

export default function DashboardClient({ user, allCars, initialSavedIds }: DashboardClientProps) {
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    { id: "1", name: "Electric SUVs", query: "/search?fuelType=electric&bodyStyle=suv", date: "2 days ago" },
    { id: "2", name: "Family Cars under $50k", query: "/search?maxPrice=50000&seating=5", date: "1 week ago" },
    { id: "3", name: "Hybrid Sedans", query: "/search?fuelType=hybrid&bodyStyle=sedan", date: "2 weeks ago" },
  ])

  const savedCars = allCars.filter((c) => savedIds.includes(c.id))

  const removeSaved = async (id: string) => {
    // Optimistic update
    setSavedIds((prev) => prev.filter((i) => i !== id))
    if (user.id) {
      const supabase = createClient()
      await supabase.from("saved_cars").delete().eq("user_id", user.id).eq("car_id", id)
    }
  }
  const removeSearch = (id: string) => setSavedSearches(savedSearches.filter((s) => s.id !== id))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{savedCars.length}</p>
              <p className="text-xs text-gray-500">Saved Cars</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
              <p className="text-xs text-gray-500">Saved Searches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Comparisons</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="saved-cars">
          <TabsList className="mb-6">
            <TabsTrigger value="saved-cars" className="gap-2">
              <Heart className="w-4 h-4" />
              Saved Cars ({savedCars.length})
            </TabsTrigger>
            <TabsTrigger value="saved-searches" className="gap-2">
              <Search className="w-4 h-4" />
              Saved Searches ({savedSearches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved-cars">
            {savedCars.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Heart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No saved cars yet</h3>
                <p className="text-gray-500 text-sm mb-4">Browse cars and tap the heart icon to save them here</p>
                <Link href="/search">
                  <Button>Browse Cars</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCars.map((car) => (
                  <div key={car.id} className="relative">
                    <CarCard
                      car={car}
                      savedCarIds={savedIds}
                      onSave={removeSaved}
                      isLoggedIn
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved-searches">
            {savedSearches.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No saved searches yet</h3>
                <p className="text-gray-500 text-sm mb-4">Save your search filters to quickly revisit them</p>
                <Link href="/search">
                  <Button>Start Searching</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div key={search.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Search className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{search.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Saved {search.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={search.query}>
                        <Button variant="outline" size="sm">View Results</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeSearch(search.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
