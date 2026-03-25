'use client'

import { useEffect, useState } from 'react'
import { getAllExercises } from '@modules/routines/actions/routines.actions'
import RoutineEditorFeature from '@modules/routines/features/routine-editor.feature'
import { Button } from '@core/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewRoutinePage() {
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const allExercises = await getAllExercises()
        setExercises(allExercises)
      } catch (error) {
        console.error('Error fetching exercises:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Cargando...
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <div className='bg-background sticky top-0 z-10 border-b p-4'>
        <div className='flex items-center justify-between'>
          <Link href='/routines'>
            <Button variant='ghost' size='sm' className='h-9 px-2'>
              <ArrowLeft className='mr-1 h-4 w-4' />
              Volver
            </Button>
          </Link>
          <h1 className='text-xl font-semibold'>Nueva Rutina</h1>
          <div className='w-20' /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 pb-24'>
        <RoutineEditorFeature
          routine={null}
          exercises={exercises}
          onSaved={(routine) => {
            // Redirect to the routine detail page
            router.push(`/routines/${routine.id}`)
          }}
          onCancel={() => {
            router.push('/routines')
          }}
          onExerciseCreated={() => {
            // Refresh exercises list if needed
          }}
        />
      </div>
    </div>
  )
}
