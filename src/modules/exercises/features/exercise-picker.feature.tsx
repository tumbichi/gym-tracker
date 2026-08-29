'use client'

import { useState } from 'react'
import { Button } from '@core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@core/components/ui/dialog'
import { Input } from '@core/components/ui/input'
import { ScrollArea } from '@core/components/ui/scroll-area'
import { Loader2, Search, Check } from 'lucide-react'
import { ExerciseCard } from '../components/ExerciseCard'
import { ExerciseFiltersComponent } from '../components/ExerciseFilters'
import { useExercisesPaginated } from '../hooks/useExercises'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { useExerciseFilterOptions } from '../hooks/useExerciseFilterOptions'
import type { Exercise, ExerciseFilters } from '../types'

interface ExercisePickerFeatureProps {
  onSelect: (exercise: Exercise) => void
  selectedId?: string
  filters?: ExerciseFilters
  trigger?: React.ReactNode
}

/**
 * Exercise Picker Feature - Smart component for selecting exercises in a dialog
 * Used by routines and workout logging modules
 */
export function ExercisePickerFeature({
  onSelect,
  selectedId,
  filters,
  trigger,
}: ExercisePickerFeatureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )

  const {
    filters: activeFilters,
    page,
    pageSize,
    updateFilters,
    updatePage,
    clearFilters,
    hasActiveFilters,
  } = useExerciseFilters()

  // Fetch filter lookup data
  const {
    bodyParts,
    muscleGroups,
    equipment,
    isLoading: isFilterLoading,
  } = useExerciseFilterOptions()

  // Merge provided filters with active filters
  const mergedFilters = { ...activeFilters, ...filters }

  const { data, pagination, isLoading, isError, refetch } =
    useExercisesPaginated({ page, pageSize }, mergedFilters)

  const handleSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise)
  }

  const handleConfirm = () => {
    if (selectedExercise) {
      onSelect(selectedExercise)
      setIsOpen(false)
      setSelectedExercise(null)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    refetch()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant='outline'>Seleccionar Ejercicio</Button>}
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Seleccionar Ejercicio</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Search */}
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Buscar ejercicios...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className='pl-9'
            />
          </div>

          {/* Filters */}
          <ExerciseFiltersComponent
            filters={mergedFilters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            bodyParts={bodyParts}
            muscleGroups={muscleGroups}
            equipment={equipment}
            isLoading={isFilterLoading}
          />

          {/* Loading State */}
          {isLoading && (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='text-primary h-6 w-6 animate-spin' />
            </div>
          )}

          {/* Exercise List */}
          {!isLoading && (
            <ScrollArea className='h-[400px]'>
              <div className='grid gap-3 sm:grid-cols-2'>
                {data.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`relative cursor-pointer rounded-lg border transition-all ${
                      selectedExercise?.id === exercise.id ||
                      selectedId === String(exercise.id)
                        ? 'border-primary ring-primary/20 ring-2'
                        : 'hover:border-primary/50'
                    } `}
                    onClick={() => handleSelect(exercise)}
                  >
                    {(selectedExercise?.id === exercise.id ||
                      selectedId === String(exercise.id)) && (
                      <div className='absolute top-2 right-2'>
                        <div className='bg-primary rounded-full p-1'>
                          <Check className='text-primary-foreground h-3 w-3' />
                        </div>
                      </div>
                    )}
                    <ExerciseCard exercise={exercise} />
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {data.length === 0 && (
                <div className='text-muted-foreground py-8 text-center'>
                  No se encontraron ejercicios
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className='flex items-center justify-center gap-2 pt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => updatePage(page - 1)}
                    disabled={page <= 1}
                  >
                    Anterior
                  </Button>
                  <span className='text-muted-foreground text-sm'>
                    {page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => updatePage(page + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-2 border-t pt-4'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedExercise}>
              Confirmar Selección
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
