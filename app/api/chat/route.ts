import Groq from "groq-sdk"
import { cars } from "@/lib/cars/data"

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const carContext = cars.map((c) => ({
  id: c.id,
  brand: c.brand,
  model: c.model,
  year: c.year,
  bodyStyle: c.bodyStyle,
  fuelType: c.fuelType,
  basePrice: c.basePrice,
  maxPrice: c.maxPrice,
  seating: c.specs?.seating,
  mpgCombined: c.specs?.mpgCombined,
  electricRange: c.specs?.electricRange,
  towingCapacity: c.specs?.towingCapacity,
  pros: c.pros,
  cons: c.cons,
  tagline: c.tagline,
}))

const SYSTEM_PROMPT = `You are CarAdvisor AI. Help people find their perfect car. Be brief and direct.

Catalog:
${JSON.stringify(carContext, null, 2)}

Rules:
- Max 2-3 sentences. Never ramble or repeat yourself.
- Recommend 1-2 cars max. Pick the very best match, not a list.
- Link cars: [Toyota RAV4 2024](/cars/toyota-rav4-2024) using the id field.
- Need more info? Ask ONE short question only.
- Only recommend cars in the catalog above. Never say "not in catalog."
- Be confident. No hedging, no thinking out loud.`

export async function POST(req: Request) {
  const { messages: allMessages } = await req.json()
  const messages = allMessages.slice(-6)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 200,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        })

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content ?? ""
          if (text) controller.enqueue(encoder.encode(text))
        }
      } catch (err) {
        console.error("Chat API error:", err)
        controller.enqueue(encoder.encode("Sorry, something went wrong."))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
