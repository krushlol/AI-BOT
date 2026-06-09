export interface LiveCarSpecs {
  horsepower?: number
  torque?: number
  cylinders?: number
  displacement?: number
  transmission?: string
  driveType?: string
  mpgCity?: number
  mpgHighway?: number
  mpgCombined?: number
  fuelType?: string
  bodyClass?: string
  seating?: number
}

export interface LiveCarSafety {
  overallRating?: number
  frontCrashRating?: number
  sideCrashRating?: number
  rolloverRating?: number
  complaintsCount?: number
  recallsCount?: number
  hasESC?: boolean
  hasFCW?: boolean
  hasLDW?: boolean
  nhtsaVehicleId?: string
}

export interface LiveCar {
  id: string
  brand: string
  model: string
  year: number
  isLive: true
  bodyStyle?: string
  fuelType?: string
  image?: string
  specs?: LiveCarSpecs
  safety?: LiveCarSafety
}
