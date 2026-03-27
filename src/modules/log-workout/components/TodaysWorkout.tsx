'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Badge } from '@core/components/ui/badge'
import { Calendar } from 'lucide-react'
import { WorkoutSelector } from '@core/components/workout-selector'
import {
  Routine,
  RoutineExercise,
} from '@modules/log-workout/actions/log-workout.actions'

interface TodaysWorkoutProps {
  routines: Routine[]
}

export default function TodaysWorkout({ routines }: TodaysWorkoutProps) {
  const today = new Date().getDay()
  const dayIndex = today === 0 ? 6 : today - 1 // Convert Sunday=0 to Saturday=6
  const todayWorkout = routines[0]?.days[dayIndex]

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          Entrenamiento de Hoy
        </CardTitle>
        <CardDescription>Basado en tu rutina actual</CardDescription>
      </CardHeader>
      <CardContent>
        {routines.length > 0 ? (
          <div className='space-y-4'>
            {todayWorkout ? (
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium'>{todayWorkout.name}</h4>
                  <Badge variant='secondary'>
                    {todayWorkout.items.length} ejercicio
                    {todayWorkout.items.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className='space-y-2'>
                  {todayWorkout.items
                    .slice(0, 3)
                    .map((item: RoutineExercise) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between text-sm'
                      >
                        <span>{item.exercise.name}</span>
                        <span className='text-muted-foreground'>
                          {item.series} x {item.reps}
                        </span>
                      </div>
                    ))}
                  {todayWorkout.items.length > 3 && (
                    <div className='text-muted-foreground text-sm'>
                      +{todayWorkout.items.length - 3} ejercicios más...
                    </div>
                  )}
                </div>
                <WorkoutSelector
                  routineId={routines[0].id}
                  dayId={todayWorkout.id}
                  buttonText='Comenzar Entrenamiento de Hoy'
                  variant='default'
                />
              </div>
            ) : (
              <div className='text-muted-foreground py-6 text-center'>
                <Calendar className='mx-auto mb-2 h-8 w-8 opacity-50' />
                <p>Hoy es día de descanso</p>
              </div>
            )}
          </div>
        ) : (
          <div className='text-muted-foreground py-6 text-center'>
            <p>No tienes rutinas creadas</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
