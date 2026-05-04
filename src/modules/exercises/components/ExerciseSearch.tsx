'use client'

import { Input } from '@core/components/ui/input'
import { SearchIcon, Loader2, X } from 'lucide-react'
import { cn } from '@core/lib/utils'

interface ExerciseSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  loading?: boolean
  onClear?: () => void
  className?: string
}

/**
 * Presentational component for exercise search input with loading state
 * Note: Debouncing should be handled by the parent feature component
 */
export function ExerciseSearch({
  value,
  onChange,
  placeholder = 'Buscar ejercicios...',
  loading = false,
  onClear,
  className,
}: ExerciseSearchProps) {
  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className={cn('relative', className)}>
      <div className='relative'>
        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          type='search'
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='pr-10 pl-9'
          aria-label={placeholder}
        />
        {loading && (
          <Loader2 className='text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin' />
        )}
        {!loading && value && (
          <button
            onClick={handleClear}
            className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors'
            aria-label='Limpiar búsqueda'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  )
}
