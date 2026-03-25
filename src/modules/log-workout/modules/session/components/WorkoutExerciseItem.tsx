'use client'

import { Badge } from '@core/components/ui/badge'
import { Button } from '@core/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Input } from '@core/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core/components/ui/select'
import { NumberInputStepper } from '@core/components/ui/number-input-stepper'
import { SetEntry, WorkoutExercise } from '@core/types'
import { cn } from '@core/lib/utils'
import { ArrowDown, ArrowUp, Check, Plus, Trash2, Undo2 } from 'lucide-react'

interface WorkoutExerciseItemProps {
  exercise: WorkoutExercise
  exerciseIndex: number
  isLastItem: boolean
  isActive: boolean
  completedSets: number
  totalSets: number
  previousWeight?: number
  canUndo: boolean
  onUpdateSet: (setId: string, updates: Partial<SetEntry>) => void
  onAddSet: () => void
  onRemoveSet: (setId: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onUndo: () => void
}

// Helper function to normalize exercise name for data-test-id (remove accents and special chars)
function normalizeExerciseNameForTestId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, '') // Remove any remaining special characters
}

function WorkoutExerciseItem({
  exercise,
  exerciseIndex,
  isLastItem,
  isActive,
  completedSets,
  totalSets,
  previousWeight,
  canUndo,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUndo,
}: WorkoutExerciseItemProps) {
  const testIdExerciseName = normalizeExerciseNameForTestId(exercise.name)

  return (
    <Card
      key={exercise.id}
      data-test-id={`exercise-section-${testIdExerciseName}`}
      className={cn('overflow-hidden', isActive && 'border-primary border-2')}
    >
      <CardHeader className='pt-3 pb-2 sm:pb-4'>
        <div className='flex items-start justify-between gap-2 sm:gap-3'>
          <div className='min-w-0 flex-1'>
            <CardTitle className='truncate text-base leading-tight sm:text-lg md:text-xl'>
              {exercise.name}
            </CardTitle>
            {previousWeight && previousWeight > 0 ? (
              <p className='text-muted-foreground mt-1 text-xs sm:text-sm'>
                Última sesión: {previousWeight}kg
              </p>
            ) : null}
            {exercise.notes && (
              <p className='text-muted-foreground mt-1 line-clamp-2 text-xs sm:text-sm'>
                {exercise.notes}
              </p>
            )}
          </div>
          <div className='flex flex-shrink-0 items-center gap-1 sm:gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={onMoveUp}
              disabled={exerciseIndex === 0}
              className='h-8 w-8'
            >
              <ArrowUp className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={onMoveDown}
              disabled={isLastItem}
              className='h-8 w-8'
            >
              <ArrowDown className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={onRemove}
              className='text-destructive hover:text-destructive h-8 w-8 p-0'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-3 sm:space-y-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='default'
            className='px-3 py-1.5 text-sm sm:py-2 sm:text-base'
          >
            Serie {Math.min(completedSets + 1, totalSets)} de {totalSets}
          </Badge>
          <Button
            variant='ghost'
            size='sm'
            onClick={onUndo}
            disabled={!canUndo}
            className='h-8'
          >
            <Undo2 className='mr-1 h-4 w-4' />
            <span className='hidden sm:inline'>Deshacer</span>
          </Button>
        </div>

        {exercise.sets.map((set) => (
          <div
            key={set.id}
            data-test-id={`set-row-${set.setNumber}`}
            className={cn(
              'space-y-3 rounded-lg p-3 transition-colors sm:space-y-4 sm:p-4',
              set.completed
                ? 'bg-primary/10 border-primary/20 border'
                : 'bg-muted/30'
            )}
          >
            {/* Header: serie número + botón completar - en móvil layout más compacto */}
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-3'>
                <div className='text-base font-bold sm:text-lg'>
                  Serie {set.setNumber}
                </div>
                {set.completed && (
                  <Badge
                    variant='secondary'
                    className='text-xs'
                    data-test-id='completed-set-indicator'
                  >
                    Completada
                  </Badge>
                )}
              </div>
              <Button
                variant={set.completed ? 'secondary' : 'default'}
                size='lg'
                onClick={() =>
                  onUpdateSet(set.id, { completed: !set.completed })
                }
                className='h-11 w-full sm:h-12 sm:w-auto sm:min-w-[100px]'
                data-test-id='complete-set-button'
              >
                <Check className='h-4 w-4 sm:mr-2 sm:h-5 sm:w-5' />
                <span className='text-sm sm:text-base'>
                  {set.completed ? 'Editar' : 'Hecho'}
                </span>
              </Button>
            </div>

            {/* Mobile: stacked layout (peso y reps en filas separadas) */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
              <div>
                <label className='text-muted-foreground mb-1.5 block text-sm font-medium'>
                  Peso (kg)
                </label>
                <NumberInputStepper
                  value={set.weightKg}
                  onChange={(value) => onUpdateSet(set.id, { weightKg: value })}
                  step={2.5}
                  min={0}
                  suffix='kg'
                  data-test-id='weight-input'
                  className='w-full'
                />
              </div>

              <div>
                <label className='text-muted-foreground mb-1.5 block text-sm font-medium'>
                  Reps
                </label>
                <NumberInputStepper
                  value={set.repsDone}
                  onChange={(value) => onUpdateSet(set.id, { repsDone: value })}
                  min={0}
                  suffix='reps'
                  data-test-id='reps-input'
                  className='w-full'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-2 pt-2 sm:gap-3'>
              <div>
                <label className='text-muted-foreground text-xs font-medium sm:text-sm'>
                  RPE
                </label>
                <Select
                  value={set.rpe?.toString() || ''}
                  onValueChange={(value) =>
                    onUpdateSet(set.id, {
                      rpe: value ? Number.parseInt(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger className='h-10 text-sm sm:h-12 sm:text-base'>
                    <SelectValue placeholder='RPE' />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((rpe) => (
                      <SelectItem key={rpe} value={rpe.toString()}>
                        {rpe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='flex justify-end pt-1'>
              <Button
                variant='link'
                size='sm'
                className='text-destructive h-8 text-xs sm:text-sm'
                onClick={() => onRemoveSet(set.id)}
              >
                <Trash2 className='h-3 w-3 sm:mr-1 sm:h-4 sm:w-4' />
                <span className='hidden sm:inline'>Eliminar serie</span>
                <span className='sm:hidden'>Eliminar</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className='pb-3 sm:pb-4'>
        <Button variant='outline' size='sm' onClick={onAddSet} className='h-10'>
          <Plus className='mr-1 h-4 w-4' />
          Agregar serie
        </Button>
      </CardFooter>
    </Card>
  )
}

export default WorkoutExerciseItem
