import React from 'react'
import { Card, CardHeader, CardTitle } from '@core/components/ui/card'
import { Badge } from '@core/components/ui/badge'
import { WorkoutExercise } from '@core/types'
import {
  CheckCircle2,
  ListTodo,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react'
import { Button } from '@core/components/ui/button'

interface WorkoutExerciseCompactItemProps {
  exercise: WorkoutExercise
  isCompleted: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  isLastItem: boolean
}

export function WorkoutExerciseCompactItem({
  exercise,
  isCompleted,
  onMoveUp,
  onMoveDown,
  onRemove,
  isLastItem,
}: WorkoutExerciseCompactItemProps) {
  const totalSets = exercise.sets.length
  const completedSets = exercise.sets.filter((s) => s.completed).length

  return (
    <Card className={`overflow-hidden ${isCompleted ? 'bg-muted/40' : ''}`}>
      <CardHeader className='p-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            {isCompleted ? (
              <CheckCircle2 className='h-6 w-6 shrink-0 text-green-500' />
            ) : (
              <ListTodo className='text-muted-foreground h-6 w-6 shrink-0' />
            )}
            <div className='min-w-0 flex-1'>
              <CardTitle className='truncate text-lg leading-tight'>
                {exercise.name}
              </CardTitle>
              <p className='text-muted-foreground truncate text-sm'>
                {isCompleted
                  ? exercise.sets
                      .map((set) => `${set.weightKg}kg x ${set.repsDone}`)
                      .join('  •  ')
                  : `${exercise.targetSeries} x ${exercise.targetReps}${exercise.targetWeight ? ` @ ${exercise.targetWeight}kg` : ''}`}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            {isCompleted ? (
              <Badge
                variant='default'
                className='hidden bg-green-600 sm:inline-flex'
              >
                Completado
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='hidden shrink-0 sm:inline-flex'
              >
                {completedSets}/{totalSets}
              </Badge>
            )}
            <Button
              variant='ghost'
              size='icon'
              onClick={onMoveUp}
              disabled={isCompleted}
            >
              <ArrowUp className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={onMoveDown}
              disabled={isCompleted || isLastItem}
            >
              <ArrowDown className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={onRemove}
              className='text-destructive hover:text-destructive'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
