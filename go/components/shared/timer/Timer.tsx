import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/shadcn/utils"

interface TimerProps {
  durationInSeconds: number
  totalItems: number
  currentItemNumber: number
  fullCircleAction: () => void
  setResetTimer?: (resetFn: (nextItemNumber?: number | ((prev: number) => number)) => void) => void
  className?: string
  isStopped?: boolean
}

const Timer = ({
  durationInSeconds,
  totalItems,
  currentItemNumber,
  fullCircleAction,
  setResetTimer,
  className,
  isStopped = false,
}: TimerProps) => {
  const [progress, setProgress] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const totalProgressPercentage = 100
  const progressIncrement = totalProgressPercentage / durationInSeconds

  const resetTimer = useCallback(() => {
    setIsResetting(true)
    setTimeout(() => {
      setProgress(0)
      setIsResetting(false)
    }, progressIncrement)
  }, [progressIncrement])

  // Reset timer when reaching 100% progress
  useEffect(() => {
    if (progress >= totalProgressPercentage + progressIncrement) {
      setTimeout(() => {
        setIsResetting(true)
        setProgress(0)
        setIsResetting(false)
        fullCircleAction()
      }, progressIncrement * 2)
    }
  }, [progress, fullCircleAction, totalItems, progressIncrement])

  // Timer counting up logic
  useEffect(() => {
    if (isStopped) return
    const interval = setInterval(() => {
      setProgress(prev => prev + progressIncrement)
    }, 1000)
    return () => clearInterval(interval)
  }, [progressIncrement, isStopped])

  // Provide reset function to parent component if external handling is needed
  useEffect(() => {
    if (setResetTimer) {
      setResetTimer(resetTimer)
    }
  }, [setResetTimer, resetTimer])

  const radius = 19.5
  const circumference = 2 * Math.PI * radius
  const strokeDashOffset = isResetting
    ? circumference // Instantly reset to empty
    : circumference * (1 - progress / totalProgressPercentage) // Normal countdown

  return (
    <div className={cn("relative flex h-[40px] w-[40px] items-center justify-center", className)}>
      <svg className="absolute h-full w-full" viewBox="0 0 40 40">
        {/* Background static circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          className="stroke-background"
          strokeWidth="1"
          fill="none"
        />
        {/* Foreground animated count-up circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          className="stroke-foreground"
          strokeWidth="1"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashOffset}
          transform="rotate(-90 20 20)"
          style={{
            transition: isResetting ? "none" : "stroke-dashoffset 1s linear",
          }}
        />
      </svg>
      <span className="text-foreground font-bold">
        {totalItems > 0 ? `${currentItemNumber}/${totalItems}` : "0/0"}
      </span>
    </div>
  )
}

export default Timer
