"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface WorkoutSelectorProps {
  routineId?: number
  dayId?: number
  buttonText: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WorkoutSelector({
  routineId,
  dayId,
  buttonText,
  variant = "default",
  size = "default",
  className,
}: WorkoutSelectorProps) {
  const router = useRouter()

  const handleStartWorkout = () => {
    const params = new URLSearchParams()
    if (routineId) params.set("routineId", routineId.toString())
    if (dayId) params.set("dayId", dayId.toString())

    router.push(`/log-workout/session?${params.toString()}`)
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleStartWorkout}>
      {buttonText}
    </Button>
  )
}
