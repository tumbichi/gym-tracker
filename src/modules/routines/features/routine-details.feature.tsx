'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Exercise } from '@prisma/client'
import { AlertTriangle, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@core/components/ui/alert'
import { Button } from '@core/components/ui/button'
import { unarchiveRoutine } from '@modules/routines/actions/routines.actions'
import type { Routine } from '@modules/routines/types'

import RoutineDetailsDisplay from '../components/routine-details-display'

interface RoutineDetailsFeatureProps {
  initialRoutine: Routine
  initialExercises: Exercise[]
}

export default function RoutineDetailsFeature({
  initialRoutine,
}: RoutineDetailsFeatureProps) {
  const router = useRouter()
  const [routine, setRoutine] = useState<Routine>(initialRoutine)

  const handleUnarchive = async () => {
    try {
      const unarchived = await unarchiveRoutine(routine.id)
      setRoutine(unarchived)
      toast.success('Rutina desarchivada correctamente.')
    } catch (error) {
      console.error(error)
      toast.error('Error al desarchivar la rutina.')
    }
  }

  const isArchived = routine.archivedAt !== null

  return (
    <>
      <div className='space-y-6'>
        {isArchived && (
          <Alert variant='default'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Rutina Archivada</AlertTitle>
            <AlertDescription className='flex items-center justify-between'>
              <span>
                Esta rutina está archivada y no aparecerá en la lista principal.
              </span>
              <Button variant='secondary' size='sm' onClick={handleUnarchive}>
                Desarchivar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <RoutineDetailsDisplay routine={routine} />
      </div>

      {!isArchived && (
        <div className='fixed right-6 bottom-6'>
          <Button
            onClick={() => router.push(`/routines/${routine.id}/edit`)}
            size='lg'
            className='h-16 w-16 rounded-full shadow-lg'
          >
            <Edit className='h-6 w-6' />
            <span className='sr-only'>Editar Rutina</span>
          </Button>
        </div>
      )}
    </>
  )
}
