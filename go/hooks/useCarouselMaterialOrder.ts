import { useEffect, useRef, useState } from "react"

import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { WorkId } from "@/lib/types/ids"

export type CarouselMaterialOrder = ReturnType<typeof useCarouselMaterialOrder>

export default function useCarouselMaterialOrder(
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
) {
  const [materialOrder, setMaterialOrder] = useState<WorkId[]>([])
  const [currentItemNumber, setCurrentItemNumber] = useState<number>(1)
  const resetTimerRef = useRef<
    ((nextItemNumber?: number | ((prev: number) => number)) => void) | null
  >(null)

  const moveToNextMaterial = () => {
    setMaterialOrder(prev => [...prev.slice(1), prev[0]])
    setCurrentItemNumber(prev => (prev === materialOrder.length ? 1 : prev + 1))
    resetTimerRef.current?.(prev => (prev % materialOrder.length) + 1)
  }

  const moveToPreviousMaterial = () => {
    setMaterialOrder(prev => [prev[prev.length - 1], ...prev.slice(0, -1)])
    setCurrentItemNumber(prev => (prev === 1 ? materialOrder.length : prev - 1))
    resetTimerRef.current?.()
  }

  useEffect(() => {
    if (!!works) {
      setMaterialOrder(works.map(work => work.workId as WorkId))
    }
  }, [works])

  return {
    materialOrder,
    currentItemNumber,
    resetTimerRef,
    moveToNextMaterial,
    moveToPreviousMaterial,
  }
}
