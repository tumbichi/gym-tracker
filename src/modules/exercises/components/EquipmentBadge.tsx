import { Badge } from '@core/components/ui/badge'
import type { Equipment, EquipmentCategory } from '../types'

interface EquipmentBadgeProps {
  equipment: Equipment
  showCategory?: boolean
}

/**
 * Returns a color based on the equipment category for visual differentiation
 */
function getCategoryColor(category: EquipmentCategory): string {
  switch (category) {
    case 'BARBELL':
      return 'bg-slate-500/10 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-800'
    case 'DUMBBELL':
      return 'bg-zinc-500/10 text-zinc-700 border-zinc-200 dark:bg-zinc-500/20 dark:text-zinc-300 dark:border-zinc-800'
    case 'MACHINE':
      return 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-800'
    case 'CABLE':
      return 'bg-cyan-500/10 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-800'
    case 'BODYWEIGHT':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-800'
    case 'KETTLEBELL':
      return 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800'
    case 'SMITH':
      return 'bg-rose-500/10 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-800'
    case 'MEDICINE_BALL':
      return 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-800'
    case 'RESISTANCE_BAND':
      return 'bg-pink-500/10 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-800'
    case 'OTHER':
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-800'
  }
}

/**
 * Presentational component to display equipment information
 */
export function EquipmentBadge({
  equipment,
  showCategory = false,
}: EquipmentBadgeProps) {
  const categoryClass = getCategoryColor(equipment.category)

  if (showCategory) {
    return (
      <Badge className={`border ${categoryClass} gap-1`}>
        <span>{equipment.name}</span>
        <span className='text-xs opacity-70'>
          ({formatCategory(equipment.category)})
        </span>
      </Badge>
    )
  }

  return (
    <Badge variant='outline' className='gap-1'>
      {equipment.name}
    </Badge>
  )
}

/**
 * Format equipment category for display
 */
function formatCategory(category: EquipmentCategory): string {
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
