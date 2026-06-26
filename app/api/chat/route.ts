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

const SYSTEM_PROMPT = `You are CarAdvisor AI. You help people find their perfect car. Be brief, friendly, and direct.

Catalog (only recommend cars from this list):
${JSON.stringify(carContext, null, 2)}

Rules:
- Max 3 sentences per response. Never ramble.
- Recommend 1-3 cars max. Pick the best ones, don't list everything.
- Link cars like this: [Toyota RAV4 2024](/cars/toyota-rav4-2024) using the id field as the slug.
- If you don't have enough info, ask ONE short question.
- Never mention cars not in the catalog. Never say "this isn't in the catalog" — just recommend what you have.
- Never think out loud or show uncertainty. Be confident and concise.
- Do not repeat car names multiple times in one response.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
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
