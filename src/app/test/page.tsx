import { SidebarProvider, SidebarTrigger } from '@core/components/ui/sidebar'
import { AppSidebar } from '@core/components/app-sidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Badge } from '@core/components/ui/badge'
import { PlusCircle, Calendar, Dumbbell, Clock } from 'lucide-react'
import { WorkoutSelector } from '@core/components/workout-selector'
import { prisma } from '@core/lib/prisma'
import {
  Routine as PrismaRoutine,
  RoutineDay as PrismaRoutineDay,
  RoutineExercise as PrismaRoutineExercise,
  Exercise,
} from '@prisma/client'

type RoutineExercise = PrismaRoutineExercise & { exercise: Exercise }
type RoutineDay = PrismaRoutineDay & { items: RoutineExercise[] }
type Routine = PrismaRoutine & { days: RoutineDay[] }

async function getRoutines() {
  return await prisma.routine.findMany({
    include: {
      days: {
        include: {
          items: {
            include: {
              exercise: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })
}

async function getRecentSessions() {
  return await prisma.workoutSession.findMany({
    take: 5,
    include: {
      routine: true,
      workoutExercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })
}

export default async function LogWorkoutPage() {
  const routines = (await getRoutines()) as Routine[]
  const recentSessions = await getRecentSessions()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='flex flex-1 flex-col'>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <div className='flex items-center gap-2'>
            <PlusCircle className='h-5 w-5' />
            <h1 className='text-lg font-semibold'>Registrar Entrenamiento</h1>
          </div>
        </header>

        <div className='flex-1 space-y-6 p-6'>
          {/* Header */}
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Nuevo Entrenamiento
            </h2>
            <p className='text-muted-foreground'>
              Elige una rutina programada o crea una sesión libre
            </p>
          </div>

          <div className='grid gap-6 lg:grid-cols-3'>
            {/* Workout Options */}
            <div className='space-y-6 lg:col-span-2'>
              {/* Quick Start - Today's Workout */}
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
                      {/* Show today's workout from first routine */}
                      {(() => {
                        const today = new Date().getDay()
                        const dayIndex = today === 0 ? 6 : today - 1 // Convert Sunday=0 to Saturday=6
                        const todayWorkout = routines[0]?.days[dayIndex]

                        return todayWorkout ? (
                          <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <h4 className='font-medium'>
                                {todayWorkout.name}
                              </h4>
                              <Badge variant='secondary'>
                                {todayWorkout.items.length} ejercicio
                                {todayWorkout.items.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className='space-y-2'>
                              {todayWorkout.items.slice(0, 3).map((item) => (
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
                                  +{todayWorkout.items.length - 3} ejercicios
                                  más...
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
                        )
                      })()}
                    </div>
                  ) : (
                    <div className='text-muted-foreground py-6 text-center'>
                      <p>No tienes rutinas creadas</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Choose from Routines */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Dumbbell className='h-5 w-5' />
                    Elegir de Rutinas
                  </CardTitle>
                  <CardDescription>
                    Selecciona cualquier día de tus rutinas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {routines.map((routine) => (
                      <div key={routine.id} className='space-y-3'>
                        <h4 className='font-medium'>{routine.name}</h4>
                        <div className='grid gap-2 sm:grid-cols-2'>
                          {routine.days
                            .filter((day) => day.items.length > 0)
                            .map((day) => (
                              <div
                                key={day.id}
                                className='flex items-center justify-between rounded-lg border p-3'
                              >
                                <div>
                                  <p className='text-sm font-medium'>
                                    {day.name}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    {day.items.length} ejercicio
                                    {day.items.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <WorkoutSelector
                                  routineId={routine.id}
                                  dayId={day.id}
                                  buttonText='Iniciar'
                                  variant='outline'
                                  size='sm'
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}

                    {routines.length === 0 && (
                      <div className='text-muted-foreground py-6 text-center'>
                        <Dumbbell className='mx-auto mb-2 h-8 w-8 opacity-50' />
                        <p>No tienes rutinas creadas</p>
                        <p className='text-sm'>
                          Crea una rutina primero para usar esta opción
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Free Workout */}
              <Card>
                <CardHeader>
                  <CardTitle>Entrenamiento Libre</CardTitle>
                  <CardDescription>
                    Crea una sesión personalizada sin rutina
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkoutSelector
                    buttonText='Comenzar Sesión Libre'
                    variant='outline'
                    className='w-full bg-transparent'
                  />
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions Sidebar */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Clock className='h-5 w-5' />
                    Sesiones Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {recentSessions.map((session) => (
                      <div key={session.id} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium'>
                            {session.routine?.name || 'Sesión Libre'}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {session.workoutExercises.reduce(
                            (acc: number, ex: any) => acc + ex.sets.length,
                            0
                          )}{' '}
                          series • {session.workoutExercises.length} ejercicios
                        </div>
                        {session.notes && (
                          <p className='text-muted-foreground text-xs italic'>
                            {session.notes}
                          </p>
                        )}
                      </div>
                    ))}

                    {recentSessions.length === 0 && (
                      <div className='text-muted-foreground py-6 text-center'>
                        <Clock className='mx-auto mb-2 h-6 w-6 opacity-50' />
                        <p className='text-sm'>No hay sesiones recientes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
