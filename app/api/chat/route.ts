import Groq from "groq-sdk"
import { cars } from "@/lib/cars/data"

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const carContext = cars.map((c) => ({
  id: c.id,
  name: `${c.brand} ${c.model} ${c.year}`,
  type: c.bodyStyle,
  fuel: c.fuelType,
  price: `$${c.basePrice.toLocaleString()}`,
  seating: c.specs?.seating,
  mpg: c.specs?.mpgCombined,
  range: c.specs?.electricRange,
  towing: c.specs?.towingCapacity,
  pros: c.pros?.slice(0, 3),
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error("Chat API error:", msg)
        controller.enqueue(encoder.encode(`Sorry, I hit an error. Please try again. (${msg.slice(0, 80)})`))

      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
