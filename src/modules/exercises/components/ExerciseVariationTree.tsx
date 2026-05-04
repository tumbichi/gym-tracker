'use client'

import { ChevronRight, ChevronDown, Dumbbell } from 'lucide-react'
import { Button } from '@core/components/ui/button'
import type { ExerciseDetail, Exercise } from '../types'

interface ExerciseVariationTreeProps {
  exercise: ExerciseDetail
  onSelectVariation: (exercise: Exercise) => void
  selectedId?: string
  isExpanded?: boolean
  onToggleExpand?: () => void
}

/**
 * Tree node component for displaying a single exercise variation
 */
function VariationNode({
  exercise,
  onSelect,
  isSelected,
  level = 0,
}: {
  exercise: Exercise
  onSelect: (exercise: Exercise) => void
  isSelected: boolean
  level?: number
}) {
  const isExpanded = true // Variations are always expanded by default

  return (
    <div
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors ${isSelected ? 'bg-primary/10 border-primary border' : 'hover:bg-muted'} `}
      style={{ marginLeft: `${level * 24}px` }}
      onClick={() => onSelect(exercise)}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(exercise)
        }
      }}
    >
      <Dumbbell className='text-muted-foreground h-4 w-4 shrink-0' />
      <span className='flex-1 text-sm font-medium'>
        {exercise.canonicalName}
      </span>
      {isSelected && (
        <span className='text-primary text-xs font-medium'>Seleccionado</span>
      )}
    </div>
  )
}

/**
 * Presentational component to display exercise variations in a tree structure
 */
export function ExerciseVariationTree({
  exercise,
  onSelectVariation,
  selectedId,
  isExpanded = true,
  onToggleExpand,
}: ExerciseVariationTreeProps) {
  const hasVariations = exercise.variations && exercise.variations.length > 0

  // If this exercise has a base exercise, show that first
  const showBaseExercise =
    exercise.baseExercise !== null && exercise.baseExercise !== undefined

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <h4 className='text-muted-foreground text-sm font-medium'>
          Variaciones
        </h4>
        {hasVariations && onToggleExpand && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onToggleExpand}
            className='h-6 px-2'
          >
            {isExpanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
        )}
      </div>

      {/* Base Exercise (if any) */}
      {showBaseExercise && exercise.baseExercise && (
        <div className='space-y-1'>
          <p className='text-muted-foreground text-xs tracking-wide uppercase'>
            Ejercicio base
          </p>
          <VariationNode
            exercise={exercise.baseExercise as Exercise}
            onSelect={onSelectVariation}
            isSelected={selectedId === String(exercise.baseExercise?.id)}
            level={0}
          />
        </div>
      )}

      {/* Current Exercise */}
      <div className='space-y-1'>
        <p className='text-muted-foreground text-xs tracking-wide uppercase'>
          {showBaseExercise ? 'Esta variación' : 'Ejercicio'}
        </p>
        <VariationNode
          exercise={exercise}
          onSelect={onSelectVariation}
          isSelected={selectedId === String(exercise.id)}
          level={showBaseExercise ? 1 : 0}
        />
      </div>

      {/* Variations (children) */}
      {hasVariations && isExpanded && (
        <div className='space-y-1 pt-2'>
          <p className='text-muted-foreground text-xs tracking-wide uppercase'>
            Variaciones ({exercise.variations.length})
          </p>
          {exercise.variations.map(
            (variation: ExerciseDetail['variations'][number]) => (
              <VariationNode
                key={variation.id}
                exercise={variation}
                onSelect={onSelectVariation}
                isSelected={selectedId === String(variation.id)}
                level={showBaseExercise ? 2 : 1}
              />
            )
          )}
        </div>
      )}

      {/* Empty state */}
      {!showBaseExercise && !hasVariations && (
        <p className='text-muted-foreground text-sm italic'>
          No hay variaciones definidas
        </p>
      )}
    </div>
  )
}
