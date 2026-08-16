import { Car } from "./types"

export interface BestForTag {
  label: string
}

export function getBestForTags(car: Car): BestForTag[] {
  const tags: BestForTag[] = []

  if (car.fuelType === "electric" && car.basePrice < 45000) {
    tags.push({ label: "Best Value EV" })
  }
  if (car.specs.seating >= 7 || (car.specs.seating >= 5 && parseInt(car.safety?.rating ?? "0") >= 4)) {
    tags.push({ label: "Family Pick" })
  }
  if ((car.specs.towingCapacity ?? 0) >= 10000) {
    tags.push({ label: "Best Towing" })
  }
  if ((car.specs.electricRange ?? 0) >= 300) {
    tags.push({ label: "Range Leader" })
  }
  if ((car.fuelType === "hybrid" || car.fuelType === "plug-in hybrid") && (car.specs.mpgCombined ?? 0) >= 40) {
    tags.push({ label: "Eco Choice" })
  }
  if ((car.specs.zeroToSixty ?? Infinity) <= 4.5) {
    tags.push({ label: "Performance" })
  }

  return tags.slice(0, 2) // show max 2 tags
}
