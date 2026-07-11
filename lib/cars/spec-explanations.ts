import { Car } from "./types"

export interface SpecExplanation {
  label: string
  value: string
  explanation: string
}

function explainHorsepower(hp: number): string {
  if (hp < 150) return "Fine for city errands, but highway passing takes patience"
  if (hp < 200) return "Handles daily driving comfortably — no complaints on the highway"
  if (hp < 300) return "Plenty of power for confident passing and highway merging"
  if (hp < 400) return "Strong engine — noticeably quick when you need it"
  return "Performance-level power — fast by any measure"
}

function explainTorque(torque: number): string {
  if (torque < 150) return "Low torque — fine for everyday city errands"
  if (torque < 250) return "Good for daily driving; handles light hills without strain"
  if (torque < 400) return "Generous torque — confident acceleration when you need it"
  return "High torque — immediate muscle for passing, loading, or demanding conditions"
}

function explainZeroToSixty(sec: number): string {
  if (sec > 9) return "Leisurely pace — prioritizes comfort over speed"
  if (sec > 7) return "Average for this class — not slow, not quick"
  if (sec > 5.5) return "Brisk acceleration — feels confident merging onto highways"
  if (sec > 4) return "Quick — sporty feel in everyday driving"
  return "Very fast — supercar-level acceleration"
}

function explainMpgCombined(mpg: number): string {
  if (mpg < 20) return "Heavy fuel use — budget around $250–$350/month at average miles"
  if (mpg < 28) return "Average fuel economy for this class"
  if (mpg < 38) return "Good fuel economy — noticeably cheaper to fill up"
  if (mpg < 50) return "Excellent fuel economy — saves hundreds per year vs. average"
  return "Outstanding efficiency — among the best you can buy"
}

function explainElectricRange(miles: number, isFullEV: boolean): string {
  if (!isFullEV) return `${miles} miles on electric before the gas engine kicks in`
  if (miles < 150) return "Good for daily commutes — charge every night like your phone"
  if (miles < 250) return "Covers most weekly driving without charging anxiety"
  if (miles < 350) return "Enough for day trips and most road trips with a stop or two"
  return "Long-range — handles road trips with minimal charging stops"
}

function explainCargo(cuFt: number): string {
  if (cuFt < 10) return "Compact — fits a couple of carry-on bags"
  if (cuFt < 15) return "Average — fits 2 large suitcases"
  if (cuFt < 25) return "Generous — fits a stroller, Costco run, or road trip gear"
  if (cuFt < 50) return "Large — fits 4 large suitcases with room to spare"
  return "Massive — van-level hauling capacity"
}

function explainSeating(seats: number): string {
  if (seats <= 2) return "Two-seater — driver-focused, no back seat"
  if (seats <= 5) return "Fits a family of 4 comfortably, or 5 in a pinch"
  if (seats <= 7) return "Third row available — fits the whole crew"
  return "Full capacity — great for large families or carpools"
}

function explainDriveType(drive: string): string {
  if (drive === "FWD") return "Front-wheel drive — efficient, handles well in light rain"
  if (drive === "RWD") return "Rear-wheel drive — sporty feel, less ideal in heavy snow"
  if (drive === "AWD") return "All-wheel drive — extra grip in rain, snow, and light off-road"
  if (drive === "4WD") return "Four-wheel drive — built for off-road and tough conditions"
  return drive
}

function explainTowing(lbs: number): string {
  if (lbs < 2000) return "Light towing — a small trailer, bikes, or jet ski"
  if (lbs < 5000) return "Mid-range — handles a boat, small camper, or utility trailer"
  if (lbs < 10000) return "Heavy towing — RV, horse trailer, or large boat"
  return "Maximum towing — built for serious commercial or off-road work"
}

function explainTopSpeed(mph: number): string {
  if (mph < 110) return "Capped for efficiency — more than enough for legal highway speeds"
  if (mph < 130) return "Adequate top speed — comfortable on the highway"
  if (mph < 155) return "High top speed — typical of performance-oriented trims"
  return "Electronically limited at a very high speed — sports car territory"
}

export function getSpecExplanations(car: Car): SpecExplanation[] {
  const s = car.specs
  const isFullEV = car.fuelType === "electric"
  const isPHEV = car.fuelType === "plug-in hybrid"

  const specs: SpecExplanation[] = [
    {
      label: "Horsepower",
      value: `${s.horsepower} hp`,
      explanation: explainHorsepower(s.horsepower),
    },
    {
      label: "Torque",
      value: `${s.torque} lb-ft`,
      explanation: explainTorque(s.torque),
    },
  ]

  if (s.zeroToSixty) {
    specs.push({
      label: "0–60 mph",
      value: `${s.zeroToSixty}s`,
      explanation: explainZeroToSixty(s.zeroToSixty),
    })
  }

  if (s.topSpeed) {
    specs.push({
      label: "Top Speed",
      value: `${s.topSpeed} mph`,
      explanation: explainTopSpeed(s.topSpeed),
    })
  }

  if (isFullEV && s.electricRange) {
    specs.push({
      label: "Electric Range",
      value: `${s.electricRange} mi`,
      explanation: explainElectricRange(s.electricRange, true),
    })
  } else if (isPHEV && s.electricRange) {
    specs.push({
      label: "EV Range",
      value: `${s.electricRange} mi`,
      explanation: explainElectricRange(s.electricRange, false),
    })
    if (s.totalRange) {
      specs.push({
        label: "Total Range",
        value: `${s.totalRange} mi`,
        explanation: "Full range on gas + electric combined",
      })
    }
  } else {
    if (s.mpgCity) specs.push({ label: "MPG City", value: `${s.mpgCity}`, explanation: "In stop-and-go urban driving" })
    if (s.mpgHighway) specs.push({ label: "MPG Hwy", value: `${s.mpgHighway}`, explanation: "At steady highway speeds" })
    if (s.mpgCombined) {
      specs.push({
        label: "MPG Combined",
        value: `${s.mpgCombined}`,
        explanation: explainMpgCombined(s.mpgCombined),
      })
    }
  }

  specs.push(
    {
      label: "Seating",
      value: `${s.seating} passengers`,
      explanation: explainSeating(s.seating),
    },
    {
      label: "Cargo Space",
      value: `${s.cargo} cu.ft.`,
      explanation: explainCargo(s.cargo),
    },
    {
      label: "Drive Type",
      value: s.driveType,
      explanation: explainDriveType(s.driveType),
    },
    {
      label: "Transmission",
      value: s.transmission,
      explanation: s.transmission.includes("CVT")
        ? "Smooth, fuel-efficient automatic — no gear shifts to feel"
        : s.transmission.includes("Automatic")
        ? "Traditional automatic — reliable and widely understood"
        : s.transmission.includes("Manual")
        ? "Manual — you control the gears; more engaging to drive"
        : "Dual-clutch — fast, sporty shifts",
    }
  )

  if (s.towingCapacity) {
    specs.push({
      label: "Towing Capacity",
      value: `${s.towingCapacity.toLocaleString()} lbs`,
      explanation: explainTowing(s.towingCapacity),
    })
  }

  if (s.batteryCapacity) {
    specs.push({
      label: "Battery",
      value: `${s.batteryCapacity} kWh`,
      explanation: `Larger battery = more range. ${s.batteryCapacity >= 100 ? "This is a big pack." : s.batteryCapacity >= 75 ? "Good-sized pack for most drivers." : "Smaller pack — suited for daily commutes."}`,
    })
  }

  if (s.chargingTime) {
    specs.push({
      label: "Charge Time",
      value: s.chargingTime,
      explanation: "Time to charge from low to full — varies by charger speed",
    })
  }

  if (s.engine) {
    specs.push({
      label: "Engine",
      value: s.engine,
      explanation: "",
    })
  }

  return specs
}
