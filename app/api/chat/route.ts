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

  return `You are CarAdvisor, a friendly and knowledgeable car-buying assistant — think of yourself as a helpful friend who happens to know everything about cars. You're warm, conversational, and genuinely excited to help people find the right car for their life.
${budgetNote}
Available cars:
${JSON.stringify(catalog, null, 2)}

GUIDELINES:
- If the user says just a greeting ("hi", "hello", "hey", "what's up", etc.), respond warmly and simply — e.g. "Hey! What can I help you with?" Don't interrogate them about cars right away.
- Let the conversation flow naturally. Only ask about car needs when the user clearly wants car help.
- Be warm and conversational, like texting a knowledgeable friend. Use natural language, not bullet points.
- Keep responses concise (2-4 sentences) but friendly — no cold or robotic tone.
- Recommend 1 car (2 if genuinely tied). Explain WHY it fits their life, not just specs.
- Always link cars like this: [Brand Model Year](/cars/car-id) using the id field exactly.
- If you need more info, ask ONE friendly question — never a list of questions.
- Use casual phrases like "honestly", "I think", "you'd love", "the thing is" to sound human.
- Show enthusiasm when a car is a great match!`
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
