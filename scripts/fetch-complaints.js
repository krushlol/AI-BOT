// Run: node scripts/fetch-complaints.js
// Fetches NHTSA complaint data for all curated cars and writes lib/cars/complaints-static.json

const fs = require("fs")
const path = require("path")

const SKIP_COMPONENTS = new Set(["UNKNOWN OR OTHER", "OTHER"])

// NHTSA sometimes uses different model names — map overrides here
const MODEL_OVERRIDES = {
  "Honda Accord Hybrid 2024": { model: "Accord" },
  "Toyota RAV4 Prime 2024": { model: "RAV4 Prime" },
  "Hyundai Tucson PHEV 2022": { model: "Tucson" },
  "Hyundai IONIQ 5 2024": { model: "IONIQ 5" },
  "Chevrolet Equinox EV 2024": { model: "Equinox EV" },
  "Chevrolet Bolt EUV 2023": { model: "BOLT EUV" },
  "Volkswagen ID.4 2023": { model: "ID.4" },
  "Mercedes-Benz GLE 2024": { brand: "Mercedes-Benz", model: "GLE 450" },
  "Mercedes-Benz GLC 300 2024": { brand: "Mercedes-Benz", model: "GLC 300" },
  "BMW 3 Series 2025": { model: "3 Series" },
  "Lexus RX 350 2024": { model: "RX 350" },
  "Kia EV6 2025": { model: "EV6" },
  "Lucid Air 2025": { model: "Air" },
  "Genesis GV80 2024": { model: "GV80" },
}

const CARS = [
  { id: "toyota-camry-2024", brand: "Toyota", model: "Camry", year: 2024 },
  { id: "tesla-model-3-2024", brand: "Tesla", model: "Model 3", year: 2024 },
  { id: "ford-f150-2023", brand: "Ford", model: "F-150", year: 2023 },
  { id: "honda-crv-2024", brand: "Honda", model: "CR-V", year: 2024 },
  { id: "bmw-3series-2025", brand: "BMW", model: "3 Series", year: 2025 },
  { id: "rivian-r1t-2023", brand: "Rivian", model: "R1T", year: 2023 },
  { id: "hyundai-ioniq5-2024", brand: "Hyundai", model: "IONIQ 5", year: 2024 },
  { id: "chevrolet-corvette-2022", brand: "Chevrolet", model: "Corvette", year: 2022 },
  { id: "subaru-outback-2023", brand: "Subaru", model: "Outback", year: 2023 },
  { id: "porsche-taycan-2025", brand: "Porsche", model: "Taycan", year: 2025 },
  { id: "jeep-wrangler-2021", brand: "Jeep", model: "Wrangler", year: 2021 },
  { id: "kia-ev6-2025", brand: "Kia", model: "EV6", year: 2025 },
  { id: "mercedes-gle-2024", brand: "Mercedes-Benz", model: "GLE", year: 2024 },
  { id: "toyota-rav4prime-2024", brand: "Toyota", model: "RAV4 Prime", year: 2024 },
  { id: "lucid-air-2025", brand: "Lucid", model: "Air", year: 2025 },
  { id: "honda-civic-2022", brand: "Honda", model: "Civic", year: 2022 },
  { id: "tesla-model-y-2023", brand: "Tesla", model: "Model Y", year: 2023 },
  { id: "ford-mustang-2025", brand: "Ford", model: "Mustang", year: 2025 },
  { id: "toyota-tundra-2022", brand: "Toyota", model: "Tundra", year: 2022 },
  { id: "honda-odyssey-2021", brand: "Honda", model: "Odyssey", year: 2021 },
  { id: "chevrolet-equinox-ev-2024", brand: "Chevrolet", model: "Equinox EV", year: 2024 },
  { id: "ram-1500-2021", brand: "Ram", model: "1500", year: 2021 },
  { id: "volkswagen-id4-2023", brand: "Volkswagen", model: "ID.4", year: 2023 },
  { id: "mazda-cx5-2024", brand: "Mazda", model: "CX-5", year: 2024 },
  { id: "genesis-gv80-2024", brand: "Genesis", model: "GV80", year: 2024 },
  { id: "ford-bronco-2022", brand: "Ford", model: "Bronco", year: 2022 },
  { id: "hyundai-tucson-phev-2022", brand: "Hyundai", model: "Tucson PHEV", year: 2022 },
  { id: "nissan-ariya-2023", brand: "Nissan", model: "Ariya", year: 2023 },
  { id: "audi-q5-2023", brand: "Audi", model: "Q5", year: 2023 },
  { id: "mercedes-glc-2024", brand: "Mercedes-Benz", model: "GLC 300", year: 2024 },
  { id: "volvo-xc60-2024", brand: "Volvo", model: "XC60", year: 2024 },
  { id: "jeep-wrangler-2024", brand: "Jeep", model: "Wrangler", year: 2024 },
  { id: "lexus-rx-2024", brand: "Lexus", model: "RX 350", year: 2024 },
  { id: "chevrolet-bolt-euv-2023", brand: "Chevrolet", model: "Bolt EUV", year: 2023 },
  { id: "ford-explorer-2024", brand: "Ford", model: "Explorer", year: 2024 },
  { id: "nissan-altima-2024", brand: "Nissan", model: "Altima", year: 2024 },
  { id: "honda-accord-2024", brand: "Honda", model: "Accord Hybrid", year: 2024 },
  { id: "toyota-sienna-2024", brand: "Toyota", model: "Sienna", year: 2024 },
]

function toTitleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAnd\b/g, "and")
}

async function fetchOne(brand, model, year) {
  const key = `${brand} ${model} ${year}`
  const override = MODEL_OVERRIDES[key] ?? {}
  const fetchBrand = override.brand ?? brand
  const fetchModel = override.model ?? model

  const url = `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(fetchBrand)}&model=${encodeURIComponent(fetchModel)}&modelYear=${year}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
    if (!res.ok) return { total: 0, categories: [], sample: null }
    const data = await res.json()
    const results = data.results ?? []

    const counts = new Map()
    for (const r of results) {
      const comp = (r.components ?? "").toUpperCase().trim()
      if (!comp || SKIP_COMPONENTS.has(comp)) continue
      counts.set(comp, (counts.get(comp) ?? 0) + 1)
    }

    const categories = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name: toTitleCase(name), count }))

    const sample =
      results.find((r) => !r.crash && !r.fire && r.summary?.length > 20)?.summary?.slice(0, 220) ?? null

    return { total: results.length, categories, sample }
  } catch (e) {
    console.error(`  ERROR: ${e.message}`)
    return { total: 0, categories: [], sample: null }
  }
}

async function main() {
  console.log(`Fetching NHTSA complaints for ${CARS.length} cars...\n`)
  const out = {}

  for (const car of CARS) {
    process.stdout.write(`  ${car.brand} ${car.model} ${car.year}... `)
    const result = await fetchOne(car.brand, car.model, car.year)
    out[car.id] = result
    console.log(`${result.total} complaints`)
    await new Promise((r) => setTimeout(r, 5000))
  }

  const outPath = path.join(__dirname, "../lib/cars/complaints-static.json")
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`\nDone → lib/cars/complaints-static.json`)

  const zeros = Object.entries(out).filter(([, v]) => v.total === 0).map(([k]) => k)
  if (zeros.length) console.log(`\nZero results (may need model name fix): ${zeros.join(", ")}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
