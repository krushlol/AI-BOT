"use client"

import { X, GitCompare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cars } from "@/lib/cars/data"

interface CompareBarProps {
  compareIds: string[]
  onRemove: (id: string) => void
  onClear: () => void
}

export default function CompareBar({ compareIds, onRemove, onClear }: CompareBarProps) {
  const router = useRouter()
  if (compareIds.length === 0) return null

  const selectedCars = compareIds.map((id) => cars.find((c) => c.id === id)).filter(Boolean)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl p-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mr-2">
          <GitCompare className="w-4 h-4" />
          Compare ({compareIds.length}/4)
        </div>
        <div className="flex gap-2 flex-wrap flex-1">
          {selectedCars.map((car) =>
            car ? (
              <div key={car.id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium text-blue-800">
                {car.year} {car.brand} {car.model}
                <button onClick={() => onRemove(car.id)} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClear} className="text-xs">
            Clear
          </Button>
          <Button
            size="sm"
            className="text-xs"
            disabled={compareIds.length < 2}
            onClick={() => router.push(`/compare?ids=${compareIds.join(",")}`)}
          >
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  )
}
