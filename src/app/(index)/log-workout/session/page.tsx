'use server'

import { getRoutineDay } from '@app/actions/workouts'
import { database } from '@core/lib/database'
import { WorkoutSessionProvider } from '@modules/log-workout/modules/session/contexts/WorkoutSessionContext'
import { WorkoutSession } from '@modules/log-workout/modules/session/features/workout-session'
import {
  getLastSessionForExercise,
  type ExerciseLastSessionData,
} from '@modules/log-workout/actions/log-workout.actions'
import { notFound } from 'next/navigation'

interface WorkoutSessionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WorkoutSessionPage({
  searchParams,
}: WorkoutSessionPageProps) {
  const {
    routineId: _routineId,
    dayId: _dayId,
    forceNew: _forceNew,
  } = await searchParams

  const routineId = _routineId ? Number.parseInt(_routineId as string) : null
  const dayId = _dayId ? Number.parseInt(_dayId as string) : null
  const forceNew = _forceNew === 'true'

  // Detect free workout: no routineId/dayId parameters
  const isFreeWorkout = !routineId && !dayId

  let routineDay = null
  if (routineId && dayId) {
    try {
      routineDay = await getRoutineDay(routineId, dayId)
      console.log('fetched routine day', routineDay)
    } catch (error) {
      return notFound()
    }
  }

  const allExercises = (await database.exercise.findMany({
    orderBy: { canonicalName: 'asc' },
  })) as any

  // Pre-fetch last session data for routine exercises
  let lastSessionDataByExercise = new Map<string, ExerciseLastSessionData>()
  if (routineDay?.items) {
    const exerciseIds = routineDay.items.map((item: any) => item.exercise.id)
    const promises = exerciseIds.map(async (exerciseId: string) => {
      const data = await getLastSessionForExercise(exerciseId)
      return { exerciseId, data }
    })
    const results = await Promise.all(promises)
    results.forEach(
      ({
        exerciseId,
        data,
      }: {
        exerciseId: string
        data: ExerciseLastSessionData | null
      }) => {
        if (data) {
          lastSessionDataByExercise.set(exerciseId, data)
        }
      }
    )
  }

  return (
    <WorkoutSessionProvider
      routineDay={routineDay}
      initialAvailableExercises={allExercises}
      isFreeWorkout={isFreeWorkout}
      forceNew={forceNew}
      lastSessionDataByExercise={lastSessionDataByExercise}
    >
      <WorkoutSession />
    </WorkoutSessionProvider>
  )
}
