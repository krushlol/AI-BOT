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
      budgetNote = `\nUser budget: $${budget.toLocaleString()}. Catalog pre-filtered to cars at or under that price.\n`
    } else {
      const closest = [...allCarContext].sort((a, b) => a.basePriceUSD - b.basePriceUSD)[0]
      budgetNote = `\nUser budget: $${budget.toLocaleString()}. No cars fit — tell them honestly. Closest: ${closest.name} at $${closest.basePriceUSD.toLocaleString()}.\n`
      catalog = [closest]
    }
  }

  // Compact one-line format per car to stay within token limits
  const catalogLines = catalog.map((c) => {
    const parts = [c.name, c.id, c.type, c.fuel, `$${c.basePriceUSD.toLocaleString()}`]
    if (c.seating) parts.push(`${c.seating}seats`)
    if (c.mpg) parts.push(`${c.mpg}mpg`)
    if (c.range) parts.push(`${c.range}mi`)
    if (c.towing) parts.push(`tow${c.towing}`)
    return parts.join("|")
  }).join("\n")

  return `You are CarAdvisor, a friendly car-buying assistant. ONLY recommend cars from the catalog below.
${budgetNote}
CATALOG (${catalog.length} cars) — format: name|id|type|fuel|price|seats|mpg/range:
${catalogLines}

RULES:
1. Only recommend cars from this catalog. Never invent cars not listed here.
2. Link cars like: [Toyota Camry 2024](/cars/toyota-camry-2024) using the exact id.
3. Greeting only ("hi", "hey") → reply "Hey! What can I help you with?" — don't ask about cars yet.
4. Recommend 1 car (2 max if tied). Explain WHY it fits them specifically.
5. Keep replies to 2-4 sentences. Warm and conversational.
6. If you need info, ask ONE question.
7. Sound human: use "honestly", "I think", "you'd love".`
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
