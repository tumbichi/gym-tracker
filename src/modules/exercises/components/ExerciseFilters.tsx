'use client'

import { Button } from '@core/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core/components/ui/select'
import { X, SlidersHorizontal } from 'lucide-react'
import type { ExerciseFilters, MuscleGroup, Equipment } from '../types'

export interface BodyPartOption {
  value: string
  label: string
}

interface ExerciseFiltersProps {
  filters: ExerciseFilters
  onFilterChange: (filters: Partial<ExerciseFilters>) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  bodyParts: BodyPartOption[]
  muscleGroups: MuscleGroup[]
  equipment: Equipment[]
  isLoading?: boolean
}

/**
 * Presentational component for exercise filter controls
 */
export function ExerciseFiltersComponent({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  bodyParts = [],
  muscleGroups = [],
  equipment = [],
  isLoading = false,
}: ExerciseFiltersProps) {
  const handleFilterChange = (key: keyof ExerciseFilters, value: string) => {
    onFilterChange({ [key]: value === 'all' ? undefined : value })
  }

  if (isLoading) {
    return (
      <div className='text-muted-foreground flex items-center gap-2 text-sm'>
        <SlidersHorizontal className='h-4 w-4' />
        Cargando filtros...
      </div>
    )
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <SlidersHorizontal className='text-muted-foreground h-4 w-4' />

      {/* Body Part Filter — Primary filter */}
      <Select
        value={filters.bodyPart || 'all'}
        onValueChange={(value) => handleFilterChange('bodyPart', value)}
      >
        <SelectTrigger className='h-9 w-[160px]'>
          <SelectValue placeholder='Zona corporal' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Todas las zonas</SelectItem>
          {bodyParts.map((bp) => (
            <SelectItem key={bp.value} value={bp.value}>
              {bp.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Muscle Group Filter */}
      <Select
        value={filters.muscleGroupId || 'all'}
        onValueChange={(value) => handleFilterChange('muscleGroupId', value)}
      >
        <SelectTrigger className='h-9 w-[160px]'>
          <SelectValue placeholder='Músculo' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Todos los músculos</SelectItem>
          {muscleGroups.map((mg) => (
            <SelectItem key={mg.id} value={mg.id}>
              {mg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Equipment Filter */}
      <Select
        value={filters.equipmentId || 'all'}
        onValueChange={(value) => handleFilterChange('equipmentId', value)}
      >
        <SelectTrigger className='h-9 w-[160px]'>
          <SelectValue placeholder='Equipamiento' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Todo el equipo</SelectItem>
          {equipment.map((eq) => (
            <SelectItem key={eq.id} value={eq.id}>
              {eq.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Exercise Type Filter */}
      <Select
        value={filters.exerciseType || 'all'}
        onValueChange={(value) => handleFilterChange('exerciseType', value)}
      >
        <SelectTrigger className='h-9 w-[160px]'>
          <SelectValue placeholder='Tipo' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Todos los tipos</SelectItem>
          <SelectItem value='COMPOUND'>Compuesto</SelectItem>
          <SelectItem value='ISOLATION'>Aislamiento</SelectItem>
          <SelectItem value='CARDIO'>Cardio</SelectItem>
          <SelectItem value='MOBILITY'>Movilidad</SelectItem>
          <SelectItem value='PLYOMETRIC'>Pliométrico</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant='ghost' size='sm' onClick={onClearFilters}>
          <X className='mr-1 h-4 w-4' />
          Limpiar
        </Button>
      )}
    </div>
  )
}
