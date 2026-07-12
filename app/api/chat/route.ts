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

  const carNames = catalog.map(c => `${c.name} (id: ${c.id})`).join(", ")

  return `You are CarAdvisor, a friendly car-buying assistant for this website. You ONLY recommend cars from the catalog below — never suggest any car not in this list, even if it seems like a good fit.
${budgetNote}
CATALOG (${catalog.length} cars available on this site):
${JSON.stringify(catalog, null, 2)}

Valid car ids you may link to: ${carNames}

RULES — follow these exactly:
1. ONLY recommend cars whose id appears in the catalog above. Never invent or mention cars not in this list (e.g. Honda Accord, Mazda CX-5, etc. — if they're not in the catalog, don't mention them).
2. When recommending a car, ALWAYS link it like this: [Toyota Camry 2024](/cars/toyota-camry-2024) — use the exact id from the catalog.
3. If the user says just a greeting ("hi", "hello", "hey"), respond warmly: "Hey! What can I help you with?" — don't ask about cars yet.
4. Let conversation flow naturally. Only give car recommendations when the user clearly wants them.
5. Recommend 1 car (2 max if genuinely tied). Explain WHY it fits their life specifically.
6. Keep it to 2-4 sentences. Warm and conversational, like texting a knowledgeable friend.
7. If you need more info, ask ONE question — never a list.
8. Use phrases like "honestly", "I think", "you'd love" to sound human, not robotic.`
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
