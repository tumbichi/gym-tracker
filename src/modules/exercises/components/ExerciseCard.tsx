import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Badge } from '@core/components/ui/badge'
import { MuscleGroupBadge } from './MuscleGroupBadge'
import { EquipmentBadge } from './EquipmentBadge'
import { stripParenthetical } from '../utils/exercise-helpers'
import type {
  ExerciseCard as ExerciseCardType,
  DifficultyLevel,
} from '../types'

const BODY_PART_LABELS: Record<string, string> = {
  CHEST: 'Pecho',
  BACK: 'Espalda',
  SHOULDERS: 'Hombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  LEGS: 'Piernas',
  CORE: 'Core',
  OTHER: 'Otro',
}

interface ExerciseCardProps {
  exercise: ExerciseCardType
  onClick?: () => void
  selected?: boolean
}

/**
 * Get color class for difficulty level
 */
function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'BEGINNER':
      return 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300'
    case 'INTERMEDIATE':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300'
    case 'ADVANCED':
      return 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300'
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200'
  }
}

/**
 * Get display name for difficulty
 */
function getDifficultyLabel(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'BEGINNER':
      return 'Principiante'
    case 'INTERMEDIATE':
      return 'Intermedio'
    case 'ADVANCED':
      return 'Avanzado'
    default:
      return difficulty
  }
}

/**
 * Presentational component to display exercise summary for list views
 */
export function ExerciseCard({
  exercise,
  onClick,
  selected = false,
}: ExerciseCardProps) {
  const displayName = stripParenthetical(exercise.canonicalName)

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selected ? 'border-primary ring-primary/20 ring-2' : ''} ${onClick ? 'hover:border-primary/50' : ''} `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='line-clamp-2 text-lg font-semibold'>
            {displayName}
          </CardTitle>
          {exercise.difficulty && (
            <Badge
              className={`shrink-0 text-xs ${getDifficultyColor(exercise.difficulty)}`}
            >
              {getDifficultyLabel(exercise.difficulty)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {/* Primary Muscle + Body Part */}
        {exercise.primaryMuscle && (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>Músculo:</span>
            <MuscleGroupBadge muscleGroup={exercise.primaryMuscle} />
            {exercise.primaryMuscle.bodyPart && (
              <Badge variant='secondary' className='text-xs'>
                {BODY_PART_LABELS[exercise.primaryMuscle.bodyPart] ??
                  exercise.primaryMuscle.bodyPart}
              </Badge>
            )}
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>Equipamiento:</span>
            <div className='flex flex-wrap gap-1'>
              {exercise.equipment.map((eq) => (
                <EquipmentBadge key={eq.id} equipment={eq} />
              ))}
            </div>
          </div>
        )}

        {/* Aliases (if any) */}
        {exercise.aliases && exercise.aliases.length > 0 && (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>
              También conocido como:
            </span>
            <div className='flex flex-wrap gap-1'>
              {exercise.aliases
                .slice(0, 3)
                .map((alias: ExerciseCardType['aliases'][number]) => (
                  <Badge key={alias.id} variant='secondary' className='text-xs'>
                    {alias.alias}
                  </Badge>
                ))}
              {exercise.aliases.length > 3 && (
                <Badge variant='secondary' className='text-xs'>
                  +{exercise.aliases.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {exercise.tags && exercise.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 pt-1'>
            {exercise.tags.map((tag: string) => (
              <Badge key={tag} variant='outline' className='text-xs'>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
