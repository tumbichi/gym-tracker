'use client'

import { Button } from '@core/components/ui/button'
import { useRouter } from 'next/navigation'
import { loadDraftSession } from '@modules/log-workout/modules/session/utils/draft-session-storage'

interface WorkoutSelectorProps {
  routineId?: number
  dayId?: number
  buttonText: string
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function WorkoutSelector({
  routineId,
  dayId,
  buttonText,
  variant = 'default',
  size = 'default',
  className,
}: WorkoutSelectorProps) {
  const router = useRouter()

  const handleStartWorkout = () => {
    // Check if there's an existing draft in localStorage
    const existingDraft = loadDraftSession()

    const params = new URLSearchParams()
    if (routineId) params.set('routineId', routineId.toString())
    if (dayId) params.set('dayId', dayId.toString())

    if (existingDraft) {
      // If there's a draft, pass forceNew=true to indicate user wants NEW session
      // The session page will show the recovery modal so user can choose:
      // - Continue draft (recover)
      // - Discard and start new
      params.set('forceNew', 'true')
    }

    router.push(`/log-workout/session?${params.toString()}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleStartWorkout}
    >
      {buttonText}
    </Button>
  )
}
