'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface AssessmentTimerProps {
  timeLimitMinutes: number
  onTimeUp: () => void
}

export default function AssessmentTimer({ timeLimitMinutes, onTimeUp }: AssessmentTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) { onTimeUp(); return }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1
        if (next <= 300) setIsWarning(true)
        if (next <= 0) { clearInterval(timer); onTimeUp(); return 0 }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft, onTimeUp])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${isWarning ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-[#1a1a24] text-white'}`}>
      {isWarning ? <AlertTriangle size={18} /> : <Clock size={18} />}
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
