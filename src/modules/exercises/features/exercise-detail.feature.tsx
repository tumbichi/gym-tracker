'use client'

import { useState, useEffect } from 'react'
import { Button } from '@core/components/ui/button'
import { Separator } from '@core/components/ui/separator'
import { Loader2, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ExerciseDetailPanel } from '../components/ExerciseDetailPanel'
import { ExerciseAliasList } from '../components/ExerciseAliasList'
import { ExerciseVariationTree } from '../components/ExerciseVariationTree'
import type { ExerciseDetail, Exercise } from '../types'

interface ExerciseDetailFeatureProps {
  exerciseId?: string
  slug?: string
}

/**
 * Exercise Detail Feature - Smart component that orchestrates the exercise detail view
 */
export function ExerciseDetailFeature({
  exerciseId,
  slug,
}: ExerciseDetailFeatureProps) {
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId && !slug) {
        setError(new Error('Se requiere exerciseId o slug'))
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const { getExerciseById, getExerciseBySlug } =
          await import('../actions/exercises.actions')

        let data
        if (exerciseId) {
          data = await getExerciseById(exerciseId)
        } else if (slug) {
          data = await getExerciseBySlug(slug)
        }

        if (!data) {
          setError(new Error('Ejercicio no encontrado'))
        } else {
          setExercise(data as ExerciseDetail)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Error al cargar el ejercicio')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchExercise()
  }, [exerciseId, slug])

  const [newAlias, setNewAlias] = useState('')
  const [isAddingAlias, setIsAddingAlias] = useState(false)

  const handleAddAlias = async (alias: string) => {
    if (!exercise) return

    setIsAddingAlias(true)
    try {
      const { addExerciseAlias } = await import('../actions/exercises.actions')
      const result = await addExerciseAlias({
        exerciseId: String(exercise.id),
        alias,
      })

      if (result.success && result.data) {
        setExercise((prev: ExerciseDetail | null) => {
          if (!prev) return prev
          return {
            ...prev,
            aliases: [...prev.aliases, result.data!],
          }
        })
        setNewAlias('')
      }
    } catch (error) {
      console.error('Failed to add alias:', error)
    } finally {
      setIsAddingAlias(false)
    }
  }

  const handleRemoveAlias = async (aliasId: string) => {
    if (!exercise) return

    try {
      const { removeExerciseAlias } =
        await import('../actions/exercises.actions')
      const result = await removeExerciseAlias(aliasId)

      if (result.success) {
        setExercise((prev: ExerciseDetail | null) => {
          if (!prev) return prev
          return {
            ...prev,
            aliases: prev.aliases.filter(
              (a: { id: string }) => a.id !== aliasId
            ),
          }
        })
      }
    } catch (error) {
      console.error('Failed to remove alias:', error)
    }
  }

  const handleSelectVariation = (selectedExercise: Exercise) => {
    window.location.href = `/exercises/${selectedExercise.slug || selectedExercise.id}`
  }

  // State for UI toggles
  const [isExpanded, setIsExpanded] = useState(true)

  // Loading State
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    )
  }

  // Error State
  if (error || !exercise) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-12'>
        <p className='text-destructive'>
          {error?.message || 'Ejercicio no encontrado'}
        </p>
        <Link href='/exercises'>
          <Button variant='outline'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a ejercicios
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='flex-1 px-4 py-6 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Breadcrumb / Back */}
        <div className='flex items-center justify-between'>
          <Link
            href='/exercises'
            className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver a ejercicios
          </Link>
          <div className='flex gap-2'>
            <Link href={`/exercises/${exercise.slug || exercise.id}/edit`}>
              <Button variant='outline' size='sm'>
                <Pencil className='mr-2 h-4 w-4' />
                Editar
              </Button>
            </Link>
            <Button variant='outline' size='sm'>
              <Trash2 className='mr-2 h-4 w-4' />
              Eliminar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Main Content */}
        <div className='grid gap-6 lg:grid-cols-[1fr_300px]'>
          {/* Left Column - Detail Panel */}
          <div>
            <ExerciseDetailPanel exercise={exercise} />
          </div>

          {/* Right Column - Aliases and Variations */}
          <div className='space-y-6'>
            {/* Aliases */}
            <div className='rounded-lg border p-4'>
              <ExerciseAliasList
                aliases={exercise.aliases}
                newAlias={newAlias}
                isAdding={isAddingAlias}
                onNewAliasChange={setNewAlias}
                onAddAlias={handleAddAlias}
                onRemoveAlias={handleRemoveAlias}
              />
            </div>

            {/* Variations */}
            <div className='rounded-lg border p-4'>
              <ExerciseVariationTree
                exercise={exercise}
                onSelectVariation={handleSelectVariation}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
