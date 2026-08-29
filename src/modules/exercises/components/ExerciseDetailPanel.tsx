import Image from 'next/image'

import { Badge } from '@core/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Separator } from '@core/components/ui/separator'
import { MuscleGroupBadge } from './MuscleGroupBadge'
import { EquipmentBadge } from './EquipmentBadge'
import { stripParenthetical } from '../utils/exercise-helpers'
import type { ExerciseDetail } from '../types'

interface ExerciseDetailPanelProps {
  exercise: ExerciseDetail
}

/**
 * Convert a YouTube watch URL to an embed URL.
 * Handles both youtube.com/watch?v=ID and youtu.be/ID formats.
 * Returns the original URL unchanged if it is not a recognizable YouTube URL.
 */
function toYouTubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Already an embed URL
    if (parsed.pathname.startsWith('/embed/')) return url
    // youtu.be short link
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1)
      return `https://www.youtube.com/embed/${videoId}`
    }
    // youtube.com/watch?v=VIDEO_ID
    if (
      (parsed.hostname === 'www.youtube.com' ||
        parsed.hostname === 'youtube.com') &&
      parsed.pathname === '/watch'
    ) {
      const videoId = parsed.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }
  } catch {
    // Not a valid URL — return as-is
  }
  return url
}

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

/**
 * Get display label for exercise type
 */
function getExerciseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    COMPOUND: 'Compuesto',
    ISOLATION: 'Aislamiento',
    CARDIO: 'Cardio',
    MOBILITY: 'Movilidad',
    PLYOMETRIC: 'Pliométrico',
  }
  return labels[type] || type
}

/**
 * Presentational component to display full exercise details
 */
export function ExerciseDetailPanel({ exercise }: ExerciseDetailPanelProps) {
  const displayName = stripParenthetical(exercise.canonicalName)

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>{displayName}</h2>

        {/* Key metadata badges row */}
        <div className='mt-3 flex flex-wrap gap-2'>
          {exercise.primaryMuscle?.bodyPart && (
            <Badge variant='secondary'>
              {BODY_PART_LABELS[exercise.primaryMuscle.bodyPart] ??
                exercise.primaryMuscle.bodyPart}
            </Badge>
          )}
          {exercise.exerciseType && (
            <Badge variant='outline'>
              {getExerciseTypeLabel(exercise.exerciseType)}
            </Badge>
          )}
          {exercise.primaryMuscle && (
            <MuscleGroupBadge muscleGroup={exercise.primaryMuscle} />
          )}
        </div>

        {exercise.description && (
          <p className='text-muted-foreground mt-3 leading-relaxed'>
            {exercise.description}
          </p>
        )}
      </div>

      {/* Muscles Card */}
      {(exercise.primaryMuscle ||
        (exercise.secondaryMuscles &&
          exercise.secondaryMuscles.length > 0)) && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Músculos</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {exercise.primaryMuscle && (
              <div className='space-y-1.5'>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                  Principal
                </p>
                <div className='flex flex-wrap items-center gap-2'>
                  <MuscleGroupBadge muscleGroup={exercise.primaryMuscle} />
                  {exercise.primaryMuscle.bodyPart && (
                    <Badge variant='secondary' className='text-xs'>
                      {BODY_PART_LABELS[exercise.primaryMuscle.bodyPart] ??
                        exercise.primaryMuscle.bodyPart}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {exercise.secondaryMuscles &&
              exercise.secondaryMuscles.length > 0 && (
                <div className='space-y-1.5'>
                  <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    Secundarios
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {exercise.secondaryMuscles.map(
                      (muscle: ExerciseDetail['secondaryMuscles'][number]) => (
                        <MuscleGroupBadge
                          key={muscle.id}
                          muscleGroup={muscle}
                          variant='secondary'
                        />
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Card */}
      {exercise.equipment && exercise.equipment.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Equipamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {exercise.equipment.map((eq) => (
                <EquipmentBadge key={eq.id} equipment={eq} showCategory />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {exercise.instructions && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm leading-7 whitespace-pre-wrap'>
              {exercise.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video */}
      {exercise.videoUrl && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='aspect-video w-full overflow-hidden rounded-lg bg-black'>
              <iframe
                src={toYouTubeEmbedUrl(exercise.videoUrl)}
                className='h-full w-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                title='Video instructivo'
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image (only if no video) */}
      {exercise.imageUrl && !exercise.videoUrl && (
        <div className='relative h-56 w-full overflow-hidden rounded-xl'>
          <Image
            src={exercise.imageUrl}
            alt={displayName}
            fill
            className='object-cover'
          />
        </div>
      )}

      {/* Tags */}
      {exercise.tags && exercise.tags.length > 0 && (
        <>
          <Separator />
          <div className='flex flex-wrap gap-2'>
            {exercise.tags.map((tag: string) => (
              <Badge key={tag} variant='outline' className='text-xs'>
                {tag}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
