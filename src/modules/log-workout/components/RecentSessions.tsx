'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Clock } from 'lucide-react'
import formatDatetime from '@core/lib/utils/formatters/formatDatetime'
import { RecentSession } from '@modules/log-workout/actions/log-workout.actions'

interface RecentSessionsProps {
  sessions: RecentSession[]
}

export default function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='h-5 w-5' />
          Sesiones Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {sessions.map((session) => (
            <div key={session.id} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium'>
                  {session.routine?.name || 'Sesión Libre'}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {formatDatetime(new Date(session.date))}
                </p>
              </div>
              <div className='text-muted-foreground text-xs'>
                {session.workoutExercises.reduce(
                  (acc, ex) => acc + ex.sets.length,
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

          {sessions.length === 0 && (
            <div className='text-muted-foreground py-6 text-center'>
              <Clock className='mx-auto mb-2 h-6 w-6 opacity-50' />
              <p className='text-sm'>No hay sesiones recientes</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
