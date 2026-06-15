export interface MagazineReview {
  magazine: string
  rating: string
  quote: string
}

// Keys must match car IDs in data.ts exactly
export const magazineReviews: Record<string, MagazineReview[]> = {
  "toyota-camry-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The Camry hybrid is remarkably refined — smooth, quiet, and genuinely fuel-efficient in the real world." },
    { magazine: "Motor Trend", rating: "4.5/5", quote: "Toyota's best-selling sedan earns its reputation with class-leading reliability and a newly sporty edge." },
  ],
  "tesla-model-3-2024": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The Model 3 remains the benchmark for electric sedans — effortless performance and over-the-air updates keep it fresh." },
    { magazine: "Edmunds", rating: "8.8/10", quote: "A genuinely complete car: fast, efficient, and packed with tech. Range anxiety barely applies here." },
  ],
  "ford-f150-2023": [
    { magazine: "Car and Driver", rating: "9/10", quote: "America's best-selling truck earns the title — it does everything, hauls everything, and the hybrid powertrain is brilliant." },
    { magazine: "Motor Trend", rating: "Truck of the Year", quote: "An engineering tour de force. The PowerBoost hybrid delivers more torque and better MPG than any rival." },
  ],
  "honda-crv-2024": [
    { magazine: "Car and Driver", rating: "8/10", quote: "The CR-V PHEV makes a compelling case as a family SUV — spacious, efficient, and unfailingly practical." },
    { magazine: "Edmunds", rating: "8.5/10", quote: "A top pick in its class: excellent cargo space, comfortable ride, and strong real-world efficiency." },
  ],
  "bmw-3series-2025": [
    { magazine: "Car and Driver", rating: "9.5/10", quote: "Still the gold standard for sport sedans. The 3 Series balances driving pleasure and daily usability better than anything else." },
    { magazine: "Road & Track", rating: "9/10", quote: "Precise steering, a willing engine, and a chassis that rewards skilled drivers. BMW hasn't lost the plot." },
  ],
  "rivian-r1t-2023": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The R1T is genuinely brilliant — it hauls, tows, and off-roads while feeling more car-like than any truck." },
    { magazine: "Motor Trend", rating: "Truck of the Year", quote: "Rivian rewrote the truck rulebook. The R1T is adventurous, innovative, and wickedly quick." },
  ],
  "hyundai-ioniq5-2024": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The IONIQ 5 is the EV to get if you want ultra-fast charging, a comfortable ride, and a design that turns heads." },
    { magazine: "Motor Trend", rating: "SUV of the Year", quote: "Best-in-class 800V charging means you're back on the road in 18 minutes. A genuine game-changer." },
  ],
  "chevrolet-corvette-2022": [
    { magazine: "Car and Driver", rating: "10/10", quote: "The mid-engine Corvette is America's supercar, full stop. Stunning performance at a price that embarrasses Ferrari." },
    { magazine: "Road & Track", rating: "9.5/10", quote: "The C8 does things that cost three times as much elsewhere. GM's halo car has never shone brighter." },
  ],
  "subaru-outback-2023": [
    { magazine: "Car and Driver", rating: "7.5/10", quote: "The Outback is the adventure wagon par excellence — standard AWD, serious ground clearance, and a spacious interior." },
    { magazine: "Edmunds", rating: "8/10", quote: "Subaru's formula still works. The Outback strikes a sweet spot between ruggedness and refinement." },
  ],
  "porsche-taycan-2025": [
    { magazine: "Car and Driver", rating: "10/10", quote: "The Taycan is the most satisfying EV to drive, period. It makes electricity feel genuinely exciting." },
    { magazine: "Road & Track", rating: "10/10", quote: "Porsche's first EV doesn't compromise. Blistering performance, gorgeous interior, unmatched driving feel." },
  ],
  "jeep-wrangler-2021": [
    { magazine: "Car and Driver", rating: "7/10", quote: "No off-roader matches the Wrangler's combination of open-air freedom, trail capability, and cult following." },
    { magazine: "Motor Trend", rating: "4/5", quote: "It's rough-edged and impractical — and that's exactly the point. The Wrangler remains king of the trail." },
  ],
  "kia-ev6-2025": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The EV6 is legitimately quick and a fantastic daily driver with style to spare. Kia's best car ever." },
    { magazine: "Motor Trend", rating: "Car of the Year", quote: "Kia's arrival as a world-class automaker is complete. The EV6 is stunning, efficient, and a joy to drive." },
  ],
  "mercedes-gle-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The GLE offers a luxurious cocoon that isolates you beautifully from the outside world. Impeccably refined." },
    { magazine: "Edmunds", rating: "8.5/10", quote: "Top-tier interior quality and a silky ride — the GLE is everything you'd expect from a Mercedes luxury SUV." },
  ],
  "toyota-rav4prime-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The RAV4 Prime is the sweet spot: plug in for 42 miles of EV range, then drive anywhere on gas. Nearly perfect." },
    { magazine: "Edmunds", rating: "9/10", quote: "Best of both worlds. The RAV4 Prime is quicker than a V6 truck and more efficient than a hybrid. Outstanding value." },
  ],
  "lucid-air-2025": [
    { magazine: "Car and Driver", rating: "9.5/10", quote: "The Lucid Air holds the range record for EVs and drives with a smoothness that makes rivals feel crude." },
    { magazine: "Motor Trend", rating: "Car of the Year", quote: "516 miles of range and a cabin more spacious than a Mercedes S-Class. Lucid redefined the EV game." },
  ],
  "honda-civic-2022": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The Civic is the best compact car you can buy — refined, sporty, and packed with tech for its price." },
    { magazine: "Motor Trend", rating: "Car of the Year", quote: "Honda raised the bar with the 11th-gen Civic. It looks great, drives brilliantly, and undercuts the competition on price." },
  ],
  "tesla-model-y-2023": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "America's best-selling vehicle earns it. The Model Y is practical, quick, and offers genuinely impressive range." },
    { magazine: "Edmunds", rating: "8.5/10", quote: "The Model Y nails the sweet spot between performance and everyday usability. The Supercharger network seals the deal." },
  ],
  "ford-mustang-2025": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The Mustang is an American icon done right — massive V8 power, rear-wheel drama, and an accessible price." },
    { magazine: "Road & Track", rating: "8/10", quote: "Few cars deliver this much theater and speed for this price. The Dark Horse variant is a revelation." },
  ],
  "toyota-tundra-2022": [
    { magazine: "Car and Driver", rating: "8/10", quote: "The Tundra hybrid is a genuinely improved truck — torquier, more efficient, and finally competitive with domestic rivals." },
    { magazine: "Motor Trend", rating: "4.5/5", quote: "Toyota reinvented the Tundra with a twin-turbo hybrid V6 that makes staggering torque. A serious truck at last." },
  ],
  "honda-odyssey-2021": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The best minivan you can buy. The Odyssey balances practicality, comfort, and driving dynamics better than any rival." },
    { magazine: "Edmunds", rating: "8.5/10", quote: "If you have kids and value your sanity, the Odyssey is the answer. Clever storage, excellent ride, great infotainment." },
  ],
  "chevrolet-equinox-ev-2024": [
    { magazine: "Car and Driver", rating: "8/10", quote: "Chevy cracked the code: an electric SUV under $35k that's genuinely good. The Equinox EV is a watershed moment." },
    { magazine: "Edmunds", rating: "8.5/10", quote: "Best value in EVs right now. Great range, solid tech, and an affordable price — GM finally has a winner." },
  ],
  "ram-1500-2021": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The Ram 1500 sets the standard for truck refinement. Its air suspension makes rivals feel agricultural." },
    { magazine: "Motor Trend", rating: "Truck of the Year", quote: "Nothing rides like a Ram. The 1500 is so car-like on the highway that you'll forget you're in a full-size pickup." },
  ],
  "volkswagen-id4-2023": [
    { magazine: "Car and Driver", rating: "7.5/10", quote: "The ID.4 is a pleasant, capable electric crossover — practical, comfortable, and refined if not particularly thrilling." },
    { magazine: "Edmunds", rating: "7.8/10", quote: "The ID.4 appeals with its VW-quality interior and all-weather AWD option. A solid family EV." },
  ],
  "mazda-cx5-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The CX-5 is the enthusiast's compact SUV — more engaging to drive and better built than anything at its price." },
    { magazine: "Edmunds", rating: "9/10", quote: "The CX-5 punches so far above its price in interior quality and driving feel that it embarrasses some luxury brands." },
  ],
  "genesis-gv80-2024": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The GV80 quietly upstaged BMW, Mercedes, and Audi at a lower price. Genesis has officially arrived." },
    { magazine: "Motor Trend", rating: "4.5/5", quote: "Stunning looks, impeccable interior, and a refined twin-turbo engine. The GV80 is luxury done right." },
  ],
  "ford-bronco-2022": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "Ford built a true Jeep-fighter and it worked. The Bronco is off-road royalty with enough on-road manners to daily drive." },
    { magazine: "Road & Track", rating: "8.5/10", quote: "The Bronco is a cultural phenomenon and a legitimate off-road weapon. It looks the part and then backs it up." },
  ],
  "hyundai-tucson-phev-2022": [
    { magazine: "Car and Driver", rating: "7.5/10", quote: "The Tucson PHEV makes a smart case for plug-in efficiency — 33 miles of electric range and strong overall fuel economy." },
    { magazine: "Edmunds", rating: "8/10", quote: "Hyundai's PHEV formula works well. The Tucson is practical, comfortable, and impressively economical." },
  ],
  "nissan-ariya-2023": [
    { magazine: "Car and Driver", rating: "7.5/10", quote: "The Ariya is a refined, stylish EV crossover that delivers a calm, comfortable experience with competitive range." },
    { magazine: "Edmunds", rating: "7.8/10", quote: "Nissan's stunning EV crossover has a premium feel that belies its price. Effortless to live with every day." },
  ],
  "audi-q5-2023": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The Q5 wraps Audi luxury around a capable platform. Polished, premium, and practical in equal measure." },
    { magazine: "Edmunds", rating: "8.5/10", quote: "For luxury SUV buyers, the Q5 delivers. Whisper-quiet cabin and unmistakable Audi quality throughout." },
  ],
  "kia-ev6-2024": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The EV6 is a knockout — striking to look at, exciting to drive, and the 800V fast-charging is a genuine game-changer." },
    { magazine: "Motor Trend", rating: "EV of the Year", quote: "Kia's EV6 redefines what a mainstream electric car can be. Fast, beautiful, and phenomenally practical." },
  ],
  "mercedes-glc-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The GLC's all-new design inside and out is a major step forward. The MBUX system is the best infotainment in the segment." },
    { magazine: "Edmunds", rating: "8.8/10", quote: "The GLC sets the luxury compact SUV benchmark. Superb ride quality, beautiful interior, and tech that actually works." },
  ],
  "volvo-xc60-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The XC60 Recharge is a serene, stylish PHEV that prioritizes safety and Scandinavian design above all else." },
    { magazine: "Road & Track", rating: "9/10", quote: "Volvo's XC60 is a masterclass in understatement — effortlessly beautiful, wonderfully quiet, and devastatingly safe." },
  ],
  "jeep-wrangler-2024": [
    { magazine: "Car and Driver", rating: "7.5/10", quote: "The Wrangler makes no apologies for what it is — a trail icon that has added enough tech to make the daily commute bearable." },
    { magazine: "Off-Road Magazine", rating: "10/10", quote: "Nothing built for the street comes close to the Wrangler Rubicon on the trail. It's simply in a class of its own." },
  ],
  "lexus-rx-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The all-new RX is a revelation — sharper styling, a more powerful engine, and the best interior Lexus has ever built." },
    { magazine: "Edmunds", rating: "9/10", quote: "Lexus knocked it out of the park with the new RX. It's more luxurious, more tech-forward, and more fun than before." },
  ],
  "chevrolet-bolt-euv-2023": [
    { magazine: "Car and Driver", rating: "7.5/10", quote: "After the price cut, the Bolt EUV is perhaps the greatest EV value in America. 247 miles, Super Cruise, under $27K." },
    { magazine: "Edmunds", rating: "8/10", quote: "Chevrolet's Bolt EUV is a no-brainer for budget-conscious EV buyers. It's practical, comfortable, and genuinely affordable." },
  ],
  "ford-explorer-2024": [
    { magazine: "Car and Driver", rating: "7.5/10", quote: "The Explorer is a solid three-row family SUV. Its EcoBoost engines are punchy and the ST model is legitimately quick." },
    { magazine: "Edmunds", rating: "7.8/10", quote: "Ford's Explorer remains a family favorite with its practical three-row layout, strong towing, and easy SYNC 4 infotainment." },
  ],
  "nissan-altima-2024": [
    { magazine: "Car and Driver", rating: "7/10", quote: "The Altima's AWD offering at this price point is unique. It won't wow you dynamically, but it will serve you faithfully." },
    { magazine: "Edmunds", rating: "7.5/10", quote: "Nissan's Altima is a sensible choice with the bonus of all-wheel drive — a spec no competitor offers at this price." },
  ],
  "honda-accord-2024": [
    { magazine: "Car and Driver", rating: "9/10", quote: "The Accord Hybrid is the best midsize sedan you can buy. It's efficient, refined, feature-packed, and genuinely fun to drive." },
    { magazine: "Motor Trend", rating: "Car of the Year Finalist", quote: "Honda's Accord Hybrid represents the pinnacle of the midsize sedan — unmatched value, refinement, and tech integration." },
  ],
  "toyota-sienna-2024": [
    { magazine: "Car and Driver", rating: "8.5/10", quote: "The Sienna's hybrid AWD is a masterstroke. The only minivan with all-wheel drive that also gets 36 MPG? That's unbeatable." },
    { magazine: "Edmunds", rating: "9/10", quote: "For families, the Sienna Hybrid is the uncontested champion. Enormous interior, genuine fuel economy, and Toyota reliability." },
  ],
}
