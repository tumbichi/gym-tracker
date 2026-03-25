import { ExerciseForm } from '@core/components/exercise-form'
import { Button } from '@core/components/ui/button'
import { Card, CardContent } from '@core/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@core/components/ui/dialog'
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  Drawer,
} from '@core/components/ui/drawer'
import { Input } from '@core/components/ui/input'
import { Exercise } from '@prisma/client'
import { Plus, Search, Minus } from 'lucide-react'
import React, { useState } from 'react'

export type LastSessionData = {
  weightKg: number
  repsDone: number
}

interface AddExerciseToWorkoutProps {
  onCreateExercise: (newExercise: Exercise) => void
  onAddExercise: (
    exerciseId: number,
    sets: number,
    lastSessionData?: LastSessionData | null
  ) => void
  availableExercises: Exercise[]
  lastSessionData?: Map<number, LastSessionData>
}

function AddExerciseToWorkout({
  availableExercises,
  onAddExercise,
  onCreateExercise,
  lastSessionData = new Map(),
}: AddExerciseToWorkoutProps) {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] =
    useState(false)
  const [search, setSearch] = useState('')
  const [newExerciseSets, setNewExerciseSets] = useState(3)

  const handleAddExercise = (exerciseId: number) => {
    try {
      const lastData = lastSessionData.get(exerciseId) ?? null
      onAddExercise(exerciseId, newExerciseSets, lastData)
      setIsAddExerciseOpen(false)
      setNewExerciseSets(3)
      setSearch('')
    } catch (error) {
      console.error('Error adding exercise:', error)
    }
  }

  const handleExerciseCreated = (newExercise: Exercise) => {
    onCreateExercise(newExercise)
    handleAddExercise(newExercise.id)
    setIsCreateExerciseDialogOpen(false)
  }

  const filteredExercises = availableExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card className='border-dashed'>
      <CardContent className='flex items-center justify-center py-8'>
        <Drawer open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
          <DrawerTrigger asChild>
            <Button
              variant='outline'
              size='lg'
              className='h-14 bg-transparent px-8'
            >
              <Plus className='mr-2 h-5 w-5' />
              Agregar Ejercicio
            </Button>
          </DrawerTrigger>
          <DrawerContent className='max-h-[80vh]'>
            <DrawerHeader>
              <DrawerTitle>Agregar Ejercicio</DrawerTitle>
              <DrawerDescription>
                Busca un ejercicio existente o crea uno nuevo
              </DrawerDescription>
            </DrawerHeader>
            <div className='flex-1 overflow-hidden p-4'>
              <div className='space-y-4'>
                <div className='relative'>
                  <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                  <Input
                    placeholder='Buscar ejercicio...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='h-12 pl-10 text-base'
                  />
                </div>

                <div className='flex items-center gap-3'>
                  <label className='text-sm font-medium'>Series:</label>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setNewExerciseSets(Math.max(1, newExerciseSets - 1))
                      }
                      className='h-10 w-10 p-0'
                    >
                      <Minus className='h-4 w-4' />
                    </Button>
                    <Input
                      type='number'
                      value={newExerciseSets}
                      onChange={(e) =>
                        setNewExerciseSets(
                          Math.max(1, Number.parseInt(e.target.value) || 1)
                        )
                      }
                      className='h-10 w-16 text-center'
                      min='1'
                      max='10'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setNewExerciseSets(Math.min(10, newExerciseSets + 1))
                      }
                      className='h-10 w-10 p-0'
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='max-h-60 overflow-y-auto rounded-lg border'>
                  {filteredExercises.length > 0 ? (
                    <div className='divide-y'>
                      {filteredExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          onClick={() => handleAddExercise(exercise.id)}
                          className='hover:bg-muted/50 w-full p-4 text-left transition-colors'
                        >
                          <div className='font-medium'>{exercise.name}</div>
                          {exercise.primaryGroup && (
                            <div className='text-muted-foreground text-sm'>
                              {exercise.primaryGroup}
                              {exercise.equipment && ` • ${exercise.equipment}`}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className='p-8 text-center'>
                      <div className='text-muted-foreground mb-4'>
                        {search
                          ? `No se encontró "${search}"`
                          : 'No hay ejercicios disponibles'}
                      </div>
                      {search && (
                        <Dialog
                          open={isCreateExerciseDialogOpen}
                          onOpenChange={setIsCreateExerciseDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button>Crear &quot;{search}&quot;</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Crear Nuevo Ejercicio</DialogTitle>
                              <DialogDescription>
                                Agrega un nuevo ejercicio a tu biblioteca
                                personal
                              </DialogDescription>
                            </DialogHeader>
                            <ExerciseForm
                              exercise={{ name: search }}
                              onSuccess={handleExerciseCreated}
                              onFormSubmit={() =>
                                setIsCreateExerciseDialogOpen(false)
                              }
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  )
}

export default AddExerciseToWorkout
