import Anthropic from "@anthropic-ai/sdk"
import { cars } from "@/lib/cars/data"

const client = new Anthropic()

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

const SYSTEM_PROMPT = `You are CarAdvisor AI, a friendly and knowledgeable car buying advisor. You help people find their perfect car from CarAdvisor's catalog.

Here is the full catalog of ${cars.length} cars you can recommend (in JSON):
${JSON.stringify(carContext, null, 2)}

Guidelines:
- Be warm, conversational, and concise. Don't be a robot.
- Ask 1-2 clarifying questions if you need more info (budget, family size, use case, fuel preference).
- Once you have enough info, recommend 2-3 specific cars from the catalog above.
- Always link to car pages like this: [Toyota RAV4 2024](/cars/toyota-rav4-2024) — use the car's id field as the slug.
- Mention the starting price and a key reason why it's a good fit.
- If someone asks about a car not in the catalog, be honest and focus them on what's available.
- Keep responses under 200 words. Be opinionated — don't hedge everything.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
          stream: true,
        })

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
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
