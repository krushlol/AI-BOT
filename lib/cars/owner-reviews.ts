export interface OwnerReview {
  name: string
  location: string
  rating: number // 1-5
  title: string
  review: string
  owned: string // e.g. "Owned 14 months"
}

export const ownerReviews: Record<string, OwnerReview[]> = {
  "toyota-camry-2024": [
    { name: "Brian K.", location: "Phoenix, AZ", rating: 5, title: "Best commuter car I've ever owned", review: "80 MPG on my morning commute because it runs electric until the battery dies. Gas barely moves. Quiet, smooth, and the lane assist actually works well on the highway.", owned: "Owned 11 months" },
    { name: "Sandra M.", location: "Charlotte, NC", rating: 4, title: "Reliable as ever, just wish the infotainment was better", review: "Third Toyota in a row for our family. This one is the most refined yet. Only gripe is the touchscreen can be sluggish. Everything else — ride, fuel economy, build quality — is excellent.", owned: "Owned 8 months" },
    { name: "David L.", location: "Denver, CO", rating: 5, title: "Surprised by how fun it is", review: "I expected a boring family sedan, but the hybrid powertrain is genuinely peppy. 0-60 feels quicker than the spec sheet suggests. Great value for the money.", owned: "Owned 6 months" },
  ],
  "tesla-model-3-2024": [
    { name: "Jess R.", location: "Austin, TX", rating: 5, title: "Converted my whole family to EVs", review: "After 9 months I can't imagine going back to gas. Supercharger network is bulletproof, autopilot genuinely reduces fatigue on long drives, and OTA updates keep adding features.", owned: "Owned 9 months" },
    { name: "Marcus T.", location: "Seattle, WA", rating: 4, title: "Love it, but phantom braking is real", review: "Performance and range are everything Tesla promises. My one complaint is autopilot occasionally brakes for no reason on the highway — gets better with updates but still happens.", owned: "Owned 14 months" },
    { name: "Priya N.", location: "San Jose, CA", rating: 5, title: "Best daily driver I've ever had", review: "Charging at home means I never visit a gas station. The minimalist interior took a week to get used to but now I love it. Incredibly efficient in real-world use.", owned: "Owned 18 months" },
  ],
  "ford-f150-2023": [
    { name: "Jake W.", location: "Houston, TX", rating: 5, title: "Does everything I need and then some", review: "Towed my 10,000 lb camper from Texas to Colorado with zero drama. The Pro Power Onboard was a game-changer at our campsite. Best truck I've owned in 20 years of buying F-150s.", owned: "Owned 13 months" },
    { name: "Tom B.", location: "Nashville, TN", rating: 5, title: "Hybrid powertrain is worth every penny", review: "Getting 25 MPG combined in a full-size truck is mind-blowing. The extra torque from the hybrid system makes towing and hauling actually more capable than the old V8.", owned: "Owned 10 months" },
    { name: "Carla S.", location: "Boise, ID", rating: 4, title: "Great truck, big price tag", review: "Feature-packed and seriously capable. Paid more than I wanted but haven't had a single complaint about performance or reliability. The interior quality finally matches the price.", owned: "Owned 7 months" },
  ],
  "honda-crv-2024": [
    { name: "Amy H.", location: "Portland, OR", rating: 5, title: "Perfect family SUV", review: "Three kids, a dog, and groceries — this car handles it all effortlessly. Cargo space is genuinely huge and the PHEV range covers my entire daily commute on electricity only.", owned: "Owned 12 months" },
    { name: "Kevin O.", location: "Boston, MA", rating: 4, title: "Fuel costs dropped by 60%", review: "Commute is 28 miles each way. With PHEV mode I almost never use gas during the week. Charging at work seals the deal. Interior is practical and well-built.", owned: "Owned 9 months" },
    { name: "Rachel T.", location: "Minneapolis, MN", rating: 5, title: "Handles Minnesota winters brilliantly", review: "AWD + heated everything + great ground clearance = perfect winter car. Fuel economy is still great even when it's -10°F. Couldn't be happier.", owned: "Owned 16 months" },
  ],
  "bmw-3series-2025": [
    { name: "Alex V.", location: "Chicago, IL", rating: 5, title: "Every drive feels like an event", review: "I've owned a lot of cars. The 3 Series is the only one that makes the 45-minute commute actually enjoyable. Steering feel and chassis balance are in a different league from the competition.", owned: "Owned 7 months" },
    { name: "Sarah J.", location: "New York, NY", rating: 4, title: "Brilliant driver's car, dealer service could be better", review: "The car itself is a 10/10. The steering response, the exhaust note, the way it handles corners — all exceptional. Bumped one star because dealer service scheduling is frustrating.", owned: "Owned 11 months" },
    { name: "Ryan C.", location: "Los Angeles, CA", rating: 5, title: "Worth every dollar", review: "Comparing it to the Audi A4 and Mercedes C-Class — neither drives as well. BMW's chassis tuning is genuinely superior. Tech is great and the interior feels premium without being fussy.", owned: "Owned 5 months" },
  ],
  "rivian-r1t-2023": [
    { name: "Matt G.", location: "Salt Lake City, UT", rating: 5, title: "This truck changed how I camp", review: "Took it up a forest road that would have destroyed my old truck. Camp Kitchen fed 6 people. The Gear Tunnel is more useful than any truck bed box I've ever had. Absolutely remarkable machine.", owned: "Owned 10 months" },
    { name: "Diane F.", location: "Portland, OR", rating: 5, title: "Best vehicle purchase I've ever made", review: "Yes it's expensive. But the quad-motor performance, the air suspension, the off-road capability — nothing else does all of this. Software updates keep adding features I didn't know I wanted.", owned: "Owned 14 months" },
    { name: "Chris P.", location: "Denver, CO", rating: 4, title: "Incredible but DC fast charging network needs work", review: "The truck itself is a 5-star product. Dinged one star because Rivian's charging network west of Denver is still sparse. Plan longer road trips carefully. Daily use and camping — perfect.", owned: "Owned 8 months" },
  ],
  "hyundai-ioniq5-2024": [
    { name: "Linda K.", location: "San Francisco, CA", rating: 5, title: "Charged from 10% to 80% in 18 minutes", review: "That's not a typo. The 800V charging is insane. Long road trips in this car are stress-free. Interior is spacious, the flat floor is actually useful, and it looks stunning.", owned: "Owned 15 months" },
    { name: "Omar S.", location: "Washington, DC", rating: 5, title: "Best EV for the money by a mile", review: "Compared 8 EVs before buying. Nothing matched the IONIQ 5 on charging speed, interior space, and value. The AWD version in snow is incredible.", owned: "Owned 11 months" },
    { name: "Tanya B.", location: "Atlanta, GA", rating: 4, title: "Love it, minor software quirks", review: "The driving experience and charging speed are best-in-class. A few infotainment bugs that need OTA updates — nothing deal-breaking. Would buy again in a heartbeat.", owned: "Owned 6 months" },
  ],
  "chevrolet-corvette-2022": [
    { name: "Greg T.", location: "Miami, FL", rating: 5, title: "American supercar — actually means it now", review: "Mid-engine layout completely transforms what a Corvette is. Tracks near neutrally, launches like a missile, and the LT2 sound is addictive. Ferrari owners at the track were not happy.", owned: "Owned 18 months" },
    { name: "Paula R.", location: "Scottsdale, AZ", rating: 5, title: "Shocked at how livable this car is", review: "I daily drive mine. Comfortable enough for long trips, great visibility (for a supercar), and the cargo space in front and back actually works for weekend bags. Dream car that's practical.", owned: "Owned 9 months" },
    { name: "Steve N.", location: "Atlanta, GA", rating: 4, title: "Stunning performance, tight interior", review: "Quarter mile times embarrass cars costing 3x as much. My only gripe is it's a tight fit for taller drivers and the center stack design takes some getting used to. Minor complaints on an amazing car.", owned: "Owned 12 months" },
  ],
  "subaru-outback-2023": [
    { name: "Kelly M.", location: "Burlington, VT", rating: 5, title: "Built for Vermont winters", review: "Symmetrical AWD, EyeSight, heated seats and steering, massive cargo area. This car was made for life in New England. Gas mileage is solid and it's never let me down in 3 feet of snow.", owned: "Owned 14 months" },
    { name: "Dan W.", location: "Asheville, NC", rating: 5, title: "Perfect adventure rig", review: "Loaded with camping gear, dogs in back, on a muddy forest road — the Outback was totally composed. Ground clearance is real and X-Mode gives confidence on sketchy terrain.", owned: "Owned 10 months" },
    { name: "Meg F.", location: "Portland, OR", rating: 4, title: "Great car, noisy at highway speeds", review: "Everything about daily driving is excellent. My only complaint is road noise above 70 mph — it's louder than I'd like. Handling, cargo space, fuel economy all excellent.", owned: "Owned 8 months" },
  ],
  "porsche-taycan-2025": [
    { name: "Michael B.", location: "San Francisco, CA", rating: 5, title: "The only EV that drives like a Porsche", review: "I was worried going electric meant giving up driving feel. The Taycan proved me completely wrong. Two-speed transmission is a masterstroke. It feels alive in a way no other EV does.", owned: "Owned 8 months" },
    { name: "Natalie C.", location: "New York, NY", rating: 5, title: "Every detail is perfect", review: "The interior quality is on another level. I've owned a Model S and a Mercedes EQS — neither comes close to the Taycan's fit and finish or driving dynamics. Worth the premium.", owned: "Owned 12 months" },
    { name: "Eric H.", location: "Chicago, IL", rating: 5, title: "Best car I've ever driven, period", review: "Not just best EV. Best car. The regenerative braking is perfectly tuned, the launch control is addictive, and 350kW charging gets me back on the road in minutes.", owned: "Owned 6 months" },
  ],
  "jeep-wrangler-2021": [
    { name: "Tyler D.", location: "Moab, UT", rating: 5, title: "Nothing else does what this does off-road", review: "Rock Krawler, Rubicon package, 35s — this Jeep goes places that make people pull out their phones to film. On-road comfort is a trade-off I gladly make every weekend.", owned: "Owned 20 months" },
    { name: "Ashley R.", location: "Flagstaff, AZ", rating: 4, title: "Trail-capable, highway exhausting", review: "On the trail it's king. At 75 mph on the highway the wind noise and steering wander are real. I knew what I was buying and have zero regrets. Just not for daily highway commuters.", owned: "Owned 15 months" },
    { name: "Carlos M.", location: "Albuquerque, NM", rating: 5, title: "Best decision I ever made", review: "Took the doors and roof off for the first time last spring and never wanted to put them back. This is what driving is supposed to feel like. The freedom this car gives you is unmatched.", owned: "Owned 11 months" },
  ],
  "kia-ev6-2025": [
    { name: "Sophie L.", location: "Seattle, WA", rating: 5, title: "Range anxiety? What range anxiety?", review: "320 mile range covers everything. 800V charging means 10 minutes at a station = 70 miles. I've driven it from Seattle to Portland without planning ahead and it was zero stress.", owned: "Owned 9 months" },
    { name: "Ben A.", location: "Nashville, TN", rating: 5, title: "Gorgeous design, incredible value", review: "I looked at Tesla, VW ID.4, and Hyundai IONIQ 5. The EV6 matched all of them on range and charging but with a better price-to-performance ratio. Interior is stunning.", owned: "Owned 7 months" },
    { name: "Monica H.", location: "Denver, CO", rating: 4, title: "Fast, fun, but software has room to grow", review: "Driving dynamics are genuinely exciting — especially the GT-Line AWD version I have. The infotainment occasionally freezes and navigation isn't best-in-class. Still love the car.", owned: "Owned 13 months" },
  ],
  "mercedes-gle-2024": [
    { name: "Jonathan R.", location: "Greenwich, CT", rating: 5, title: "The quietest ride I've ever experienced", review: "The air suspension absorbs everything. Highway cruising feels like floating. Interior materials are exquisite and the MBUX system is finally intuitive. Worth the premium over a GX or X5.", owned: "Owned 10 months" },
    { name: "Catherine M.", location: "Palm Beach, FL", rating: 4, title: "Luxury and practicality in one", review: "Perfect blend of family utility and prestige. Kids love the back seat space, I love the drive quality. Only minor complaint is the price of options — everything is an add-on.", owned: "Owned 14 months" },
    { name: "Andrew S.", location: "Dallas, TX", rating: 5, title: "Exactly what I wanted from a luxury SUV", review: "Three years of research before buying. The GLE matches or beats the BMW X5 and Audi Q7 at every point that matters to me. Exceptional long-distance cruiser.", owned: "Owned 6 months" },
  ],
  "toyota-rav4prime-2024": [
    { name: "Nina S.", location: "San Diego, CA", rating: 5, title: "40 miles EV, then worry-free gas — perfect", review: "My commute is 35 miles. I essentially never burn gas during the week. Weekend road trips are no problem on gas. It's genuinely the best of both worlds.", owned: "Owned 16 months" },
    { name: "Paul T.", location: "Sacramento, CA", rating: 5, title: "Quickest car I've owned under $50k", review: "The 302 hp combined output is a surprise every time. Quicker than my old V6 SUV by a full second. And it gets 40+ MPG when the battery is gone. This car is a masterpiece.", owned: "Owned 11 months" },
    { name: "Laura G.", location: "Seattle, WA", rating: 4, title: "Great car, dealer inventory was the hard part", review: "Waited 4 months for it to come in. Worth the wait — the car is exceptional. Reliability has been flawless. Just wish it was easier to actually get one.", owned: "Owned 8 months" },
  ],
  "lucid-air-2025": [
    { name: "William F.", location: "Palo Alto, CA", rating: 5, title: "This is what Tesla should have built", review: "Interior quality makes the Model S feel like a rental car. 400+ miles of range means I almost never need to stop. The Surreal Sound audio system is the best I've heard in any car.", owned: "Owned 7 months" },
    { name: "Diana K.", location: "Beverly Hills, CA", rating: 5, title: "Effortless, spacious, and stunning", review: "Got compliments at every valet I've used. Interior is larger than many big SUVs. The ride quality on the air suspension is genuinely magical. Lucid deserves all the recognition it's getting.", owned: "Owned 9 months" },
    { name: "Frank L.", location: "Scottsdale, AZ", rating: 4, title: "Incredible car, charging network still catching up", review: "Range is so good that DC fast charging network gaps matter less than in other EVs. But Lucid's own charging network needs to grow. Car itself is a legitimate S-Class alternative.", owned: "Owned 5 months" },
  ],
  "honda-civic-2022": [
    { name: "Madison P.", location: "Columbus, OH", rating: 5, title: "Best compact car under $30k, full stop", review: "35 MPG in mixed driving, Honda reliability, and it actually looks grown-up now. Lane centering works perfectly, adaptive cruise is smooth. Couldn't ask for more from a commuter car.", owned: "Owned 18 months" },
    { name: "Josh K.", location: "Austin, TX", rating: 5, title: "First new car — zero complaints", review: "Researched for 6 months. The Civic won on every metric: reliability, fuel economy, interior quality, features at price. Zero issues in 18 months of ownership.", owned: "Owned 18 months" },
    { name: "Erin B.", location: "Minneapolis, MN", rating: 4, title: "Great car, wish it had AWD option", review: "For 3.5 seasons it's perfect. Winter in Minnesota reveals the one gap — no AWD option. Otherwise the ride, features, and efficiency are exceptional for the price.", owned: "Owned 12 months" },
  ],
  "tesla-model-y-2023": [
    { name: "Rob H.", location: "Dallas, TX", rating: 5, title: "Best all-around family vehicle I've owned", review: "Third row fits my kids, cargo space is massive, Supercharger network is everywhere in Texas now. Autopilot handles 95% of my highway driving. Wouldn't go back to gas.", owned: "Owned 14 months" },
    { name: "Sarah M.", location: "Denver, CO", rating: 5, title: "Perfect for mountain living", review: "Great in snow, good ground clearance, tons of cargo for ski gear. Supercharger in Vail parking lot sealed the deal. Regenerative braking on mountain descents is a revelation.", owned: "Owned 10 months" },
    { name: "Kevin L.", location: "Phoenix, AZ", rating: 4, title: "Love it but build quality could be better", review: "Performance and efficiency are world-class. Had a couple of panel gaps and a squeaky trim piece that service fixed quickly. Software is brilliant. Overall very happy.", owned: "Owned 16 months" },
  ],
  "ford-mustang-2025": [
    { name: "Mike D.", location: "Charlotte, NC", rating: 5, title: "The V8 is everything the spec sheet promises", review: "The sound from that 5.0 at full throttle is worth the car's entire price. Handling is genuine — took it to a track day and was immediately comfortable pushing it. American legend status maintained.", owned: "Owned 8 months" },
    { name: "Tara N.", location: "Phoenix, AZ", rating: 5, title: "Daily driver + weekend fun machine", review: "Softer suspension tune on my GT makes it comfortable enough daily. Then on weekends I flip to Sport mode and it's a completely different animal. Couldn't ask for more from a $42k car.", owned: "Owned 11 months" },
    { name: "Dave R.", location: "Houston, TX", rating: 4, title: "Great car, fuel economy is what it is", review: "Knew going in the V8 wasn't going to be efficient. Getting 18 MPG combined but I don't care — the performance and sound are worth it. Build quality is the best Mustang I've owned.", owned: "Owned 6 months" },
  ],
  "toyota-tundra-2022": [
    { name: "Jim S.", location: "San Antonio, TX", rating: 5, title: "Toyota reliability in a proper full-size truck", review: "Two F-150s and a Ram before this. The Tundra hybrid is in a different class for long-term reliability. 14,000 lb tow rating handled my 5th wheel with authority. Toyota finally has a serious truck.", owned: "Owned 15 months" },
    { name: "Anna K.", location: "Phoenix, AZ", rating: 4, title: "Great torque, just OK fuel economy", review: "The 583 lb-ft of torque is obscene and genuinely useful for towing. Real-world fuel economy is around 18 MPG, not the 20 EPA rating. Not terrible for a truck this capable.", owned: "Owned 10 months" },
    { name: "Pete M.", location: "Albuquerque, NM", rating: 5, title: "Best looking truck on the road", review: "Huge improvement over the old Tundra inside and out. Interior finally matches the competition. Power and capability match the looks. Toyota took their time on this one.", owned: "Owned 12 months" },
  ],
  "honda-odyssey-2021": [
    { name: "Claire B.", location: "Chicago, IL", rating: 5, title: "Four kids, 10/10 sanity preserved", review: "Rear entertainment, Magic Slide seat that lets you reach the third row, cabin watch camera — Honda thought of everything. Best road trip vehicle ever made for families with kids.", owned: "Owned 22 months" },
    { name: "Mark T.", location: "Dallas, TX", rating: 5, title: "I fought buying a minivan. The minivan won.", review: "Embarrassed to admit how much I love this thing. More cargo space than an SUV, easier loading than an SUV, better fuel economy than an SUV. The stigma is completely undeserved.", owned: "Owned 18 months" },
    { name: "Lisa F.", location: "Portland, OR", rating: 4, title: "Best family vehicle, acceleration is mediocre", review: "For everything it does — space, tech, ride quality — it's flawless. Only complaint is the 3.5L V6 isn't particularly quick. Adequate, not exciting. Not why you buy this car.", owned: "Owned 14 months" },
  ],
  "chevrolet-equinox-ev-2024": [
    { name: "Tyler J.", location: "Columbus, OH", rating: 5, title: "Best value EV on the market by far", review: "After federal tax credit I paid under $30k. 319 miles of EPA range, GM's vast DC fast charge network, wireless CarPlay — this is the car that should convert America to EVs.", owned: "Owned 6 months" },
    { name: "Brenda S.", location: "Detroit, MI", rating: 4, title: "Great car, software has a learning curve", review: "Range and charging are better than I expected. The infotainment took a few weeks to fully understand. Once you're used to it, it's fine. Great value and very comfortable daily driver.", owned: "Owned 9 months" },
    { name: "Carlos R.", location: "San Antonio, TX", rating: 5, title: "My wife and I both fight to drive it", review: "Bought it for her but I keep wanting it. Quiet, smooth, practical, and the driver assist features work better than expected. Best thing GM has built in years.", owned: "Owned 7 months" },
  ],
  "ram-1500-2021": [
    { name: "Bobby H.", location: "Nashville, TN", rating: 5, title: "Smoothest ride of any truck alive", review: "The air suspension in the Laramie is so good that my wife asked if we could use the Ram for road trips instead of our sedan. Quiet, composed, and tows my boat with ease.", owned: "Owned 20 months" },
    { name: "Kim R.", location: "Oklahoma City, OK", rating: 5, title: "Interior is legitimately luxury-level", review: "Level 2 seats, 12-inch infotainment, real wood trim — the Ram Limited feels like a $90k truck inside. Towing and hauling capability is top-class. No regrets at all.", owned: "Owned 13 months" },
    { name: "Lance T.", location: "Dallas, TX", rating: 4, title: "Best ride, average fuel economy", review: "The coil spring rear suspension is what makes this truck special. Ride quality over rough roads is unmatched by F-150 or Silverado. Gets about 18 MPG combined, which is par for the class.", owned: "Owned 9 months" },
  ],
  "volkswagen-id4-2023": [
    { name: "Hans M.", location: "Portland, OR", rating: 4, title: "Solid, practical, not thrilling", review: "Exactly what I wanted: a reliable, comfortable EV for daily life. VW build quality is excellent, range covers my life with room to spare. Doesn't try to be exciting — it's a tool that works.", owned: "Owned 12 months" },
    { name: "Sarah T.", location: "Minneapolis, MN", rating: 4, title: "Great family EV, nothing flashy", review: "AWD version is excellent in Minnesota winters. Interior quality feels premium without being ostentatious. Charging speed isn't class-leading but 135kW is more than adequate for road trips.", owned: "Owned 10 months" },
    { name: "Tom V.", location: "Chicago, IL", rating: 3, title: "Good but software is frustrating", review: "The car itself is comfortable and the range is honest. VW's infotainment has real bugs — took multiple software updates to fix basic things. Once they sorted the software, it's a 4-star car.", owned: "Owned 16 months" },
  ],
  "mazda-cx5-2024": [
    { name: "Julia W.", location: "Boston, MA", rating: 5, title: "Luxury interior at a non-luxury price", review: "The CX-5 Signature's interior embarrasses cars costing $15k more. Heated and ventilated front seats, gorgeous upholstery, and a Bose audio system that's genuinely great. Best value in compact SUVs.", owned: "Owned 11 months" },
    { name: "Tom H.", location: "Seattle, WA", rating: 5, title: "Most fun compact SUV to drive", review: "The steering response is sharp and the chassis feels confidence-inspiring in a way the Honda, Toyota, and Hyundai alternatives don't. It's the driver's choice in this segment.", owned: "Owned 14 months" },
    { name: "Ann P.", location: "Denver, CO", rating: 4, title: "Beautiful and practical, just needs more power", review: "Everything about the CX-5 is excellent except the engine — the naturally aspirated 2.5L feels strained on mountain passes when loaded. Get the turbo version.", owned: "Owned 8 months" },
  ],
  "genesis-gv80-2024": [
    { name: "James L.", location: "Houston, TX", rating: 5, title: "Best kept secret in luxury SUVs", review: "I test drove the BMW X5, Mercedes GLE, and Audi Q7. The GV80 beat them all on interior quality and driving dynamics — at $15k less. Genesis concierge service is unbelievable.", owned: "Owned 9 months" },
    { name: "Diana P.", location: "Atlanta, GA", rating: 5, title: "Turned heads every single day", review: "People constantly ask what it is. The styling is genuinely original and the interior is stunning. Service experience — they pick up and drop off your car — spoiled me for every other brand.", owned: "Owned 13 months" },
    { name: "Victor S.", location: "Dallas, TX", rating: 4, title: "Incredible product, brand still building dealers", review: "The car is a legitimate 5-star product. Knocked one star because Genesis dealer coverage is thinner than German rivals — important for service convenience. That said, you'll rarely need service.", owned: "Owned 7 months" },
  ],
  "ford-bronco-2022": [
    { name: "Zach P.", location: "Flagstaff, AZ", rating: 5, title: "Wrangler killer — there, I said it", review: "Taken it on trails that beat up Wranglers. Better on-road manners, more cargo space, better tech. The modular top is genius. Ford nailed this one on the first try.", owned: "Owned 18 months" },
    { name: "Kim D.", location: "Denver, CO", rating: 5, title: "The personality car of the decade", review: "You don't just own a Bronco — you join a community. Trail difficulty ratings in the nav, HOSS suspension, removable doors — whoever designed this actually goes off-road.", owned: "Owned 14 months" },
    { name: "Steve W.", location: "Austin, TX", rating: 4, title: "Love it, highway manners could improve", review: "Off-road it's flawless. At 75 mph on I-35 it's busy — wind noise and a bit of wander. Typical of this type of vehicle and completely worth the trade-off for what you get on trails.", owned: "Owned 11 months" },
  ],
  "hyundai-tucson-phev-2022": [
    { name: "Kelly B.", location: "Seattle, WA", rating: 5, title: "Best bang for buck in the SUV segment", review: "33 miles of EV range covers my daily commute. When the battery is out, 38 MPG combined is spectacular for an SUV. AWD is confidence-inspiring in PNW rain. Excellent all-around car.", owned: "Owned 13 months" },
    { name: "Frank O.", location: "Chicago, IL", rating: 4, title: "Practical and efficient, nothing to complain about", review: "Exactly what it promises: reasonable EV range for daily use, solid efficiency on gas, comfortable interior. Not exciting, but flawlessly competent at everything it does.", owned: "Owned 10 months" },
    { name: "Maria S.", location: "San Diego, CA", rating: 5, title: "Wish I bought it sooner", review: "Test drove 6 competitors. The Tucson PHEV won on interior space, feature value, and the PHEV range that actually covers my commute. Hyundai quality has genuinely caught up with the best.", owned: "Owned 8 months" },
  ],
  "nissan-ariya-2023": [
    { name: "Jen L.", location: "Los Angeles, CA", rating: 4, title: "Sleek, serene, and surprisingly roomy", review: "The Ariya surprised me. Zero B-pillar interior design creates a living room feel. Range is honest and charging at EVgo stations has been reliable. Very underrated car.", owned: "Owned 9 months" },
    { name: "Tom K.", location: "San Jose, CA", rating: 4, title: "Great daily driver, needs faster charging", review: "Daily use is nearly perfect. Quiet ride, great infotainment, comfortable seats. The 130kW charging max is limiting on long road trips — I usually charge for 30+ minutes at a stop.", owned: "Owned 12 months" },
    { name: "Grace C.", location: "Portland, OR", rating: 5, title: "The EV for people who don't want a Tesla", review: "Wanted an EV but not the Tesla ecosystem or minimalism. The Ariya has physical controls, a warm interior design, and Nissan reliability. Perfect for what I needed.", owned: "Owned 7 months" },
  ],
  "audi-q5-2023": [
    { name: "Peter H.", location: "New York, NY", rating: 5, title: "Exactly what a luxury SUV should be", review: "MMI system is intuitive, quattro AWD is seamless, and the interior quality is exceptional. Audi's attention to detail — lighting, materials, ergonomics — is unmatched in this price range.", owned: "Owned 10 months" },
    { name: "Lena F.", location: "Washington, DC", rating: 5, title: "Smooth, quiet, and sophisticated", review: "After 6 months I love it more than when I bought it. The ride quality is excellent, cabin is whisper-quiet, and the virtual cockpit is genuinely useful. Worth every penny.", owned: "Owned 10 months" },
    { name: "Derek W.", location: "Chicago, IL", rating: 4, title: "Great SUV, fuel economy disappoints", review: "The Q5 excels at almost everything. Getting 25 MPG combined where the EPA claims 28 — not terrible, but worth knowing. All other aspects of ownership have been superb.", owned: "Owned 15 months" },
  ],
  "mercedes-glc-2024": [
    { name: "Robert F.", location: "Miami, FL", rating: 5, title: "Worth every dollar of the premium", review: "The MBUX infotainment is miles ahead of competitors. Interior quality is flawless — every surface you touch feels expensive. The 258hp turbo is plenty refined for daily luxury use.", owned: "Owned 12 months" },
    { name: "Diane W.", location: "Dallas, TX", rating: 5, title: "My favorite car I've ever owned", review: "Upgraded from a BMW X3 and the GLC feels more refined in every way. The ride is smoother, the interior is more beautiful, and the Hey Mercedes voice assistant actually listens.", owned: "Owned 8 months" },
    { name: "Evan B.", location: "Chicago, IL", rating: 4, title: "Amazing car, prepare for options cost shock", review: "The base GLC is already great, but adding desirable features like the Burmester audio, heated rear seats, and 360 cameras inflated my sticker by $12K. Budget carefully.", owned: "Owned 10 months" },
  ],
  "volvo-xc60-2024": [
    { name: "Nadia M.", location: "Seattle, WA", rating: 5, title: "The safest car I've ever driven and the most serene", review: "Pilot Assist on the highway is the most natural semi-autonomous system I've used. The PHEV range covers my commute 4 days out of 5 on electricity alone. Volvo has a lifelong customer.", owned: "Owned 16 months" },
    { name: "Anders L.", location: "Minneapolis, MN", rating: 5, title: "Scandinavian perfection in SUV form", review: "The interior design is unlike anything else on the market. Calm, beautiful, and free of unnecessary clutter. Built-in Google Maps is fantastic. This is a thoughtful car for thoughtful people.", owned: "Owned 13 months" },
    { name: "Claire D.", location: "Portland, OR", rating: 4, title: "Outstanding PHEV, screen is a bit small", review: "The 9-inch screen feels small in 2024 when others have 14-inch screens. The rest of the car — ride quality, safety tech, EV range — is truly top-tier. Minor complaint on a great car.", owned: "Owned 11 months" },
  ],
  "jeep-wrangler-2024": [
    { name: "Jake O.", location: "Moab, UT", rating: 5, title: "Rubicon on trails = cheating in the best way", review: "Took the Rubicon on trails rated 7-8 difficulty. Electronic locking diffs and disconnecting sway bar made obstacles that stumped other vehicles trivial. There is literally nothing else like it.", owned: "Owned 20 months" },
    { name: "Sara L.", location: "Denver, CO", rating: 4, title: "Iconic and worth the trade-offs", review: "Wind noise on the highway is real. Fuel economy is mediocre. None of that matters when you're on a mountain trail with the doors off and the top down feeling completely free.", owned: "Owned 15 months" },
    { name: "Marcus B.", location: "Phoenix, AZ", rating: 4, title: "Great for what it is, daily driving has compromises", review: "If you use it as a trail machine, it's a 10/10. As a daily highway commuter it's a 6/10. Know what you're buying. I use mine 70% trails and 30% highway — absolutely love it.", owned: "Owned 18 months" },
  ],
  "lexus-rx-2024": [
    { name: "Patricia H.", location: "Scottsdale, AZ", rating: 5, title: "Best redesign in recent memory", review: "The new RX is completely transformed — modern styling, the largest touchscreen Lexus has offered, and a new engine that's actually exciting to drive. It justified my loyalty to the brand.", owned: "Owned 10 months" },
    { name: "William C.", location: "Houston, TX", rating: 5, title: "Toyota reliability in a luxury wrapper", review: "This is my 4th RX. They just don't break down. Every single year the interior gets better and the tech catches up. The 450h+ PHEV is worth the premium — 37 miles EV for my commute.", owned: "Owned 7 months" },
    { name: "Helen B.", location: "San Diego, CA", rating: 4, title: "Luxurious and reliable, fuel economy lags", review: "The F Sport handling is genuinely sporty — I wasn't expecting that. Adaptive suspension makes a real difference. Only wish: the non-hybrid gets better fuel economy than 24 MPG combined.", owned: "Owned 12 months" },
  ],
  "chevrolet-bolt-euv-2023": [
    { name: "Chris A.", location: "Sacramento, CA", rating: 5, title: "Under $27K with Super Cruise? Insane value", review: "I could not believe the Bolt EUV existed at this price. Super Cruise on the Premier trim works flawlessly on 400,000 miles of mapped highway. Range is honest — I consistently get 240+.", owned: "Owned 14 months" },
    { name: "Rachel K.", location: "Columbus, OH", rating: 4, title: "Perfect first EV for most people", review: "My wife was skeptical of EVs. 6 months in she refuses to go back. Affordable to charge, comfortable for daily use, and no range anxiety in our city. The DC fast charging is a bit slow though.", owned: "Owned 13 months" },
    { name: "Tony L.", location: "Austin, TX", rating: 4, title: "Brilliant value, don't let the Chevy badge fool you", review: "People laugh at a $26K EV and then sit inside one. The interior is genuinely comfortable, the tech is up to date, and 247 miles is real-world sufficient. This should sell 10x what it does.", owned: "Owned 9 months" },
  ],
  "ford-explorer-2024": [
    { name: "Beth M.", location: "Nashville, TN", rating: 5, title: "Perfect family SUV, full stop", review: "7 seats, tows our boat, gets 27 MPG highway, and my kids have plenty of room. SYNC 4 is the easiest infotainment system I've used. Ford built exactly what a family needs.", owned: "Owned 11 months" },
    { name: "Gary P.", location: "Phoenix, AZ", rating: 4, title: "ST model is a hidden performance bargain", review: "400hp in a family SUV that seats 7 is absolutely mental. The ST keeps up with sports cars at a stoplight and then I fold down seats to move furniture. Best of both worlds.", owned: "Owned 9 months" },
    { name: "Lisa R.", location: "Charlotte, NC", rating: 4, title: "Great value, third row is tight", review: "For 5 adults and cargo the Explorer is excellent. Third row fits kids comfortably but adults will feel cramped on long trips. For our family of 4+2 occasional kids it's absolutely perfect.", owned: "Owned 14 months" },
  ],
  "nissan-altima-2024": [
    { name: "Maria V.", location: "Minneapolis, MN", rating: 5, title: "Only AWD sedan under $30K — sold", review: "Moved from Phoenix to Minneapolis and needed AWD. The Altima SR AWD was the only sedan option under $30K. Winter driving has been flawless. Fuel economy exceeds EPA estimates too.", owned: "Owned 16 months" },
    { name: "Brian C.", location: "Denver, CO", rating: 4, title: "Comfortable, efficient, no frills", review: "Does everything a midsize sedan should do without drama. ProPILOT Assist on the SL is a genuine highway companion. Gets 35+ MPG in mixed driving. Dependable and honest.", owned: "Owned 12 months" },
    { name: "Susan K.", location: "Salt Lake City, UT", rating: 4, title: "Reliable workhorse with AWD advantage", review: "No rivals at this price offer AWD in a sedan. The CVT is smooth once you're used to it. Interior quality is a step below Honda but the AWD value proposition wins every comparison.", owned: "Owned 10 months" },
  ],
  "honda-accord-2024": [
    { name: "Kevin H.", location: "Portland, OR", rating: 5, title: "The gold standard of midsize sedans", review: "46 MPG in a car this size and this refined is almost offensive to competitors. Google built-in means I haven't touched my phone in the car since buying it. Honda knocked this one out of the park.", owned: "Owned 13 months" },
    { name: "Angela T.", location: "Chicago, IL", rating: 5, title: "Upgraded from Camry and can't believe the difference", review: "The Google integration, the quieter cabin, and the slightly more athletic feel make the Accord feel like the premium choice. Honda Sensing 360 on the EX-L is genuinely useful every day.", owned: "Owned 9 months" },
    { name: "David M.", location: "Austin, TX", rating: 5, title: "Best hybrid value in any car segment", review: "I cross-shopped every hybrid sedan. The Accord beats them on MPG, technology, and interior quality while being priced below many competitors. It's not even close. Buy this car.", owned: "Owned 11 months" },
  ],
  "toyota-sienna-2024": [
    { name: "Ashley R.", location: "Phoenix, AZ", rating: 5, title: "Best vehicle ever made for parents of 3+", review: "Three kids, all in car seats. The Sienna is the only vehicle that makes this manageable AND gets 36 MPG on road trips. The behind-seat refrigerator is worth the Platinum price alone.", owned: "Owned 15 months" },
    { name: "Mark T.", location: "Seattle, WA", rating: 5, title: "Skeptic turned full believer", review: "I thought minivans were for giving up. I was wrong. AWD in Seattle winters, 36 MPG hybrid economy, and space for everything our family throws at it. It makes our lives genuinely better.", owned: "Owned 18 months" },
    { name: "Jennifer L.", location: "Denver, CO", rating: 4, title: "Practical perfection with one styling wish", review: "It does absolutely everything right. The only thing I can complain about is the exterior styling is conservative. But when you're loading in 4 bikes and driving 600 miles on one tank, you stop caring.", owned: "Owned 12 months" },
  ],
}
