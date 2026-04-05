import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3B82F6' }}
        />
        <Loader2 className="absolute inset-0 m-auto h-5 w-5 text-blue-400 animate-spin" />
      </div>
      <p className="text-slate-400 text-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
        Analyzing...
      </p>
    </div>
  )
}
