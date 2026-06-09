import { getMatchLabel } from "@/lib/cars/quiz"

interface MatchBadgeProps {
  score: number
  size?: "sm" | "md"
}

export default function MatchBadge({ score, size = "sm" }: MatchBadgeProps) {
  const { label, color } = getMatchLabel(score)
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  }
  const sizeMap = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colorMap[color]} ${sizeMap[size]}`}>
      <span className="tabular-nums">{score}%</span>
      <span>{label}</span>
    </span>
  )
}
