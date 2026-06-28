import Groq from "groq-sdk"
import { cars } from "@/lib/cars/data"

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const allCarContext = cars.map((c) => ({
  id: c.id,
  name: `${c.brand} ${c.model} ${c.year}`,
  type: c.bodyStyle,
  fuel: c.fuelType,
  basePriceUSD: c.basePrice,
  seating: c.specs?.seating,
  mpg: c.specs?.mpgCombined,
  range: c.specs?.electricRange,
  towing: c.specs?.towingCapacity,
  pros: c.pros?.slice(0, 3),
  tagline: c.tagline,
}))

function extractBudget(messages: { role: string; content: string }[]): number | null {
  // Scan all user messages for budget mentions, use the most recent one
  const userTexts = messages.filter((m) => m.role === "user").map((m) => m.content).reverse()
  for (const text of userTexts) {
    // Match: $20k, $20,000, 20k, 20000, under $20k, budget of $20,000, etc.
    const match = text.match(/\$?\s*(\d[\d,]*)\s*k\b/i) || text.match(/\$\s*(\d[\d,]+)/i)
    if (match) {
      const raw = match[1].replace(/,/g, "")
      const val = parseInt(raw) * (match[0].toLowerCase().includes("k") ? 1000 : 1)
      if (val >= 1000 && val <= 500000) return val
    }
  }
  return null
}

function buildSystemPrompt(budget: number | null): string {
  let catalog = allCarContext
  let budgetNote = ""

  if (budget !== null) {
    const eligible = allCarContext.filter((c) => c.basePriceUSD <= budget)
    if (eligible.length > 0) {
      catalog = eligible
      budgetNote = `\nThe user's budget is $${budget.toLocaleString()}. The catalog below has been pre-filtered to only cars at or under that price. Only recommend from this list.\n`
    } else {
      const closest = [...allCarContext].sort((a, b) => a.basePriceUSD - b.basePriceUSD)[0]
      budgetNote = `\nThe user's budget is $${budget.toLocaleString()}. NO cars in our catalog fit that budget. Tell them honestly, and mention the closest option: ${closest.name} at $${closest.basePriceUSD.toLocaleString()}. Do not recommend it as a fit — just acknowledge the gap.\n`
      catalog = [closest]
    }
  }

  return `You are CarAdvisor AI. Help people find their perfect car.
${budgetNote}
Available cars:
${JSON.stringify(catalog, null, 2)}

RULES:
- Be brief: 1-3 sentences. No rambling, no repeating yourself.
- Recommend exactly 1 car (2 only if genuinely tied). Pick the best match.
- Always link: [Brand Model Year](/cars/car-id) using the id field exactly.
- If you need clarification, ask ONE short question.
- Be direct and confident.`
}

export async function POST(req: Request) {
  const { messages: allMessages } = await req.json()
  const messages = allMessages.slice(-8)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 200,
          messages: [
            { role: "system", content: buildSystemPrompt(extractBudget(messages)) },
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
