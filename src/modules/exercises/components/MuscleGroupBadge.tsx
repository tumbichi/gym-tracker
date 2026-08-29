import { Badge } from '@core/components/ui/badge'
import type { MuscleGroup, BodyRegion } from '../types'

interface MuscleGroupBadgeProps {
  muscleGroup: MuscleGroup
  variant?: 'default' | 'secondary'
}

/**
 * Returns a color based on the body region for visual differentiation
 */
function getRegionColor(region: BodyRegion): string {
  switch (region) {
    case 'UPPER_BODY':
      return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800'
    case 'LOWER_BODY':
      return 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800'
    case 'CORE':
      return 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800'
    case 'FULL_BODY':
      return 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-800'
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200'
  }
}

/**
 * Presentational component to display muscle group information
 */
export function MuscleGroupBadge({
  muscleGroup,
  variant = 'default',
}: MuscleGroupBadgeProps) {
  const regionClass = getRegionColor(muscleGroup.bodyRegion)

  if (variant === 'secondary') {
    return (
      <Badge variant='secondary' className='gap-1'>
        <span>{muscleGroup.name}</span>
        <span className='text-xs opacity-70'>
          ({muscleGroup.bodyRegion.replace('_', ' ')})
        </span>
      </Badge>
    )
  }

  return (
    <Badge className={`border ${regionClass} gap-1`}>
      <span>{muscleGroup.name}</span>
      {muscleGroup.muscleType && (
        <span className='text-xs opacity-70'>
          ({muscleGroup.muscleType.toLowerCase()})
        </span>
      )}
    </Badge>
  )
}
