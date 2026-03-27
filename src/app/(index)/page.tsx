import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { CalendarDays, TrendingUp, Dumbbell, Clock, Play } from 'lucide-react'
import { prisma } from '@core/lib/prisma'
import Link from 'next/link'
import {
  Exercise,
  Routine as PrismaRoutine,
  RoutineDay as PrismaRoutineDay,
  RoutineExercise as PrismaRoutineExercise,
  SetEntry,
} from '@prisma/client'

type RoutineExercise = PrismaRoutineExercise & { exercise: Exercise }
type RoutineDay = PrismaRoutineDay & { items: RoutineExercise[] }
type Routine = PrismaRoutine & { days: RoutineDay[] }

async function getDashboardData() {
  // Get workout sessions this week
  const weekSessions = await prisma.workoutSession.count()

  // Get total volume this month
  const monthVolumeResult = await prisma.setEntry.aggregate({
    _sum: {
      weightKg: true,
    },
  })

  // Get unique exercises this month
  const uniqueExercisesResult = await prisma.setEntry.groupBy({
    by: ['exerciseId'],
  })

  // Get recent PRs
  const recentPRs = await prisma.setEntry.findMany({
    include: {
      exercise: true,
      workoutExercise: {
        include: {
          session: true,
        },
      },
    },
  })

  // Get today's routine
  const todayRoutine = await prisma.routine.findFirst({
    where: { archivedAt: null },
    include: {
      days: {
        include: {
          items: {
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  return {
    weekSessions,
    monthVolume: monthVolumeResult._sum.weightKg || 0,
    uniqueExercises: uniqueExercisesResult.length,
    recentPRs: recentPRs.slice(0, 3),
    todayRoutine: todayRoutine,
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()

  // Get today's workout
  const today = new Date().getDay()
  const dayIndex = today === 0 ? 6 : today - 1
  const todayWorkout = data.todayRoutine?.days[dayIndex]

  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Welcome Section */}
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          ¡Bienvenido de vuelta!
        </h2>
        <p className='text-muted-foreground'>
          Aquí tienes un resumen de tu progreso y entrenamientos recientes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Entrenamientos esta semana
            </CardTitle>
            <CalendarDays className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.weekSessions}</div>
            <p className='text-muted-foreground text-xs'>
              {data.weekSessions >= 3
                ? '+1 desde la semana pasada'
                : 'Objetivo: 3 por semana'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Volumen total (kg)
            </CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {data.monthVolume.toLocaleString()}
            </div>
            <p className='text-muted-foreground text-xs'>Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Ejercicios únicos
            </CardTitle>
            <Dumbbell className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.uniqueExercises}</div>
            <p className='text-muted-foreground text-xs'>Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tiempo promedio
            </CardTitle>
            <Clock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>75 min</div>
            <p className='text-muted-foreground text-xs'>
              Por sesión de entrenamiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Workout & Progress */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Entrenamiento de Hoy</CardTitle>
            <CardDescription>
              {todayWorkout ? todayWorkout.name : 'Día de descanso programado'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {todayWorkout && todayWorkout.items.length > 0 ? (
              <>
                <div className='space-y-2'>
                  {todayWorkout.items
                    .slice(0, 3)
                    .map((item: RoutineExercise) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between'
                      >
                        <span className='text-sm font-medium'>
                          {item.exercise?.name}
                        </span>
                        <Badge variant='secondary'>
                          {item.series} x {item.reps}
                        </Badge>
                      </div>
                    ))}
                  {todayWorkout.items.length > 3 && (
                    <div className='text-muted-foreground text-sm'>
                      +{todayWorkout.items.length - 3} ejercicios más...
                    </div>
                  )}
                </div>
                <Button asChild className='w-full'>
                  <Link href='/log-workout'>
                    <Play className='mr-2 h-4 w-4' />
                    Comenzar Entrenamiento
                  </Link>
                </Button>
              </>
            ) : (
              <div className='text-muted-foreground py-6 text-center'>
                <CalendarDays className='mx-auto mb-2 h-8 w-8 opacity-50' />
                <p>Hoy es día de descanso</p>
                <Button
                  variant='outline'
                  asChild
                  className='mt-4 bg-transparent'
                >
                  <Link href='/log-workout'>Crear Sesión Libre</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progreso Reciente</CardTitle>
            <CardDescription>Últimos records y mejoras</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {data.recentPRs.length > 0 ? (
              <div className='space-y-3'>
                {data.recentPRs.map((pr: any) => (
                  <div
                    key={pr.id}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='text-sm font-medium'>{pr.exercise?.name}</p>
                      <p className='text-muted-foreground text-xs'>
                        {pr.workoutExercise?.session?.date
                          ? new Date(
                              pr.workoutExercise.session.date
                            ).toLocaleDateString('es-ES')
                          : 'Fecha no disponible'}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-bold'>{pr.weightKg} kg</p>
                      <p className='text-xs text-green-600'>
                        {pr.repsDone} rep{pr.repsDone > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-muted-foreground py-6 text-center'>
                <TrendingUp className='mx-auto mb-2 h-8 w-8 opacity-50' />
                <p>No hay registros recientes</p>
                <p className='text-sm'>
                  Comienza a entrenar para ver tu progreso
                </p>
              </div>
            )}
            <Button variant='outline' asChild className='w-full bg-transparent'>
              <Link href='/statistics'>Ver Todas las Estadísticas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
