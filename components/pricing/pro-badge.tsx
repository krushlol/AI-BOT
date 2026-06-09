export default function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white tracking-wide ${className}`}>
      PRO
    </span>
  )
}
