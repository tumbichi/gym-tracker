import { Badge } from '@core/components/ui/badge'
import { Dumbbell, Repeat, NotebookText, Layers } from 'lucide-react'
import type { RoutineExercise } from '@modules/routines/types' // Asumimos que este tipo existirá

interface RoutineExerciseDetailsItemProps {
  item: RoutineExercise
}

/** Parsea el campo reps de la BD (JSON string) a array de números */
function parseReps(repsJson: string): number[] {
  try {
    const parsed = JSON.parse(repsJson)
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
      return parsed
    }
  } catch {
    // Fallback para formato legacy "12-10-8"
    const parts = repsJson
      .split('-')
      .map(Number)
      .filter((n) => !isNaN(n))
    if (parts.length > 0) return parts
  }
  return [10] // Default fallback
}

export default function RoutineExerciseDetailsItem({
  item,
}: RoutineExerciseDetailsItemProps) {
  const repsArray = parseReps(item.reps)

  return (
    <div className='bg-muted/20 space-y-3 rounded-lg border p-4'>
      {/* Top Row: Name and Badges */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2'>
          <Dumbbell className='text-primary h-5 w-5' />
          <p className='text-lg font-semibold'>{item.exercise.name}</p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          {item.exercise.primaryGroup && (
            <Badge variant='outline'>{item.exercise.primaryGroup}</Badge>
          )}
          {item.exercise.equipment && (
            <Badge variant='outline'>{item.exercise.equipment}</Badge>
          )}
        </div>
      </div>

      {/* Bottom Row: Details */}
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div className='flex items-center gap-1.5'>
          <Layers className='text-muted-foreground h-4 w-4' />
          <span className='font-medium'>{item.series}</span>
          <span className='text-muted-foreground'>series</span>
        </div>
        <div className='flex flex-wrap items-center gap-1.5'>
          <Repeat className='text-muted-foreground h-4 w-4' />
          <span className='font-medium'>{repsArray.join(' / ')}</span>
          <span className='text-muted-foreground'>reps</span>
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <div className='text-muted-foreground flex items-start gap-2 pt-1 text-sm'>
          <NotebookText className='mt-0.5 h-4 w-4 shrink-0' />
          <p className='italic'>{item.notes}</p>
        </div>
      )}
    </div>
  )
}
