import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/shadcn/utils"

interface TimerProps {
  durationInSeconds: number
  totalItems: number
  currentItemNumber: number
  fullCircleAction: () => void
  setResetTimer?: (resetFn: (nextItemNumber?: number | ((prev: number) => number)) => void) => void
  className?: string
}

const Timer = ({
  durationInSeconds,
  totalItems,
  currentItemNumber,
  fullCircleAction,
  setResetTimer,
  className,
}: TimerProps) => {
  const [progress, setProgress] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const delayBetweenResets = 100 / durationInSeconds

  const resetTimer = useCallback(() => {
    setIsResetting(true)
    setTimeout(() => {
      setProgress(0)
      setIsResetting(false)
    }, delayBetweenResets)
  }, [delayBetweenResets])

  useEffect(() => {
    if (progress >= 100 + delayBetweenResets) {
      setTimeout(() => {
        setIsResetting(true)
        setProgress(0)
        setIsResetting(false)
        fullCircleAction()
      }, delayBetweenResets * 2)
    }
  }, [progress, fullCircleAction, totalItems, delayBetweenResets])

  // Timer counting up logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => prev + delayBetweenResets)
    }, 1000)
    return () => clearInterval(interval)
  }, [delayBetweenResets, durationInSeconds])

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
    : circumference * (1 - progress / 100) // Normal countdown

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
      <span className="text-foreground font-bold">{`${currentItemNumber}/${totalItems}`}</span>
    </div>
  )
}

export default Timer
