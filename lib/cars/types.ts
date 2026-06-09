export type FuelType = "gasoline" | "diesel" | "hybrid" | "plug-in hybrid" | "electric"
export type BodyStyle = "sedan" | "suv" | "truck" | "coupe" | "hatchback" | "van" | "convertible" | "wagon"
export type DriveType = "FWD" | "RWD" | "AWD" | "4WD"

export interface TrimLevel {
  name: string
  price: number
  highlights: string[]
}

export interface SafetyFeatures {
  rating?: string
  ratingSource?: string
  features: string[]
}

export interface CarSpecs {
  horsepower: number
  torque: number
  engine: string
  transmission: string
  driveType: DriveType
  zeroToSixty: number | null
  topSpeed: number | null
  mpgCity?: number
  mpgHighway?: number
  mpgCombined?: number
  electricRange?: number
  totalRange?: number
  batteryCapacity?: number
  chargingTime?: string
  cargo: number
  seating: number
  towingCapacity?: number
  payloadCapacity?: number
}

export interface Car {
  id: string
  brand: string
  model: string
  year: number
  bodyStyle: BodyStyle
  fuelType: FuelType
  basePrice: number
  maxPrice: number
  image: string
  interiorImage: string
  tagline: string
  description: string
  specs: CarSpecs
  trimLevels: TrimLevel[]
  safety: SafetyFeatures
  interiorFeatures: string[]
  exteriorFeatures: string[]
  techFeatures: string[]
  pros: string[]
  cons: string[]
  coolFeatures: string[]
  colors: string[]
}
