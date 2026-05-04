'use client'

import { Badge } from '@core/components/ui/badge'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import type { ExerciseAlias } from '../types'

interface ExerciseAliasListProps {
  aliases: ExerciseAlias[]
  newAlias: string
  isAdding: boolean
  onNewAliasChange: (value: string) => void
  onAddAlias: (alias: string) => Promise<void>
  onRemoveAlias: (aliasId: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Presentational component to display and manage exercise aliases
 */
export function ExerciseAliasList({
  aliases,
  newAlias,
  isAdding,
  onNewAliasChange,
  onAddAlias,
  onRemoveAlias,
  isLoading = false,
}: ExerciseAliasListProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlias.trim() || isAdding) return

    await onAddAlias(newAlias.trim())
  }

  const handleRemove = async (aliasId: string) => {
    await onRemoveAlias(aliasId)
  }

  return (
    <div className='space-y-4'>
      {/* Existing Aliases */}
      <div className='space-y-2'>
        <h4 className='text-muted-foreground text-sm font-medium'>
          Alias ({aliases.length})
        </h4>
        {aliases.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>
            No hay alias definidos
          </p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {aliases.map((alias) => (
              <Badge
                key={alias.id}
                variant={alias.isPrimary ? 'default' : 'secondary'}
                className='flex items-center gap-1 pr-1'
              >
                {alias.alias}
                {alias.isPrimary && (
                  <span className='ml-1 text-xs opacity-70'>(principal)</span>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  className='hover:bg-destructive/20 h-auto p-1'
                  onClick={() => handleRemove(alias.id)}
                  disabled={isLoading}
                  aria-label={`Eliminar alias ${alias.alias}`}
                >
                  <Trash2 className='text-destructive h-3 w-3' />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Add New Alias */}
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <Input
          placeholder='Nuevo alias...'
          value={newAlias}
          onChange={(e) => onNewAliasChange(e.target.value)}
          disabled={isAdding}
          className='flex-1'
        />
        <Button type='submit' size='sm' disabled={!newAlias.trim() || isAdding}>
          {isAdding ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Plus className='h-4 w-4' />
          )}
          <span className='ml-1'>Agregar</span>
        </Button>
      </form>
    </div>
  )
}
