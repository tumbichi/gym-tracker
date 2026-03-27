'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Badge } from '@core/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@core/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@core/components/ui/dialog'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { ExerciseForm } from '@core/components/exercise-form'
import type { Exercise } from '@core/lib/db'

interface ExercisesClientProps {
  initialExercises: Exercise[]
}

export function ExercisesClient({ initialExercises }: ExercisesClientProps) {
  const [exercises, setExercises] = useState(initialExercises)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )

  const handleCreateSuccess = (newExercise: Exercise) => {
    setExercises((prev) => [...prev, newExercise])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateSuccess = () => {
    // For now, just refetch all exercises. A more optimized approach would be to update the specific exercise in the state.
    // This requires the update action to return the updated exercise.
    window.location.reload() // Simple solution for now
  }

  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Header Actions */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Gestión de Ejercicios
          </h2>
          <p className='text-muted-foreground'>
            Administra tu biblioteca de ejercicios personalizada
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Nuevo Ejercicio
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ejercicio</DialogTitle>
              <DialogDescription>
                Agrega un nuevo ejercicio a tu biblioteca personal
              </DialogDescription>
            </DialogHeader>
            <ExerciseForm
              onSuccess={handleCreateSuccess}
              onFormSubmit={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Ejercicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-2'>
            <Search className='text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Buscar por nombre, grupo muscular o equipamiento...'
              className='flex-1'
            />
            <Button variant='outline' className='bg-transparent'>
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercises Table */}
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Ejercicios</CardTitle>
          <CardDescription>
            {exercises.length} ejercicios en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Grupo Muscular</TableHead>
                <TableHead>Equipamiento</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className='text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className='font-medium'>{exercise.name}</TableCell>
                  <TableCell>
                    {exercise.primaryGroup && (
                      <Badge variant='secondary'>{exercise.primaryGroup}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {exercise.equipment && (
                      <Badge variant='outline'>{exercise.equipment}</Badge>
                    )}
                  </TableCell>
                  <TableCell className='max-w-[200px] truncate'>
                    {exercise.notes || '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <Dialog
                        open={
                          isEditDialogOpen &&
                          selectedExercise?.id === exercise.id
                        }
                        onOpenChange={(isOpen) => {
                          setIsEditDialogOpen(isOpen)
                          if (!isOpen) {
                            setSelectedExercise(null)
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setSelectedExercise(exercise)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-[600px]'>
                          <DialogHeader>
                            <DialogTitle>Editar Ejercicio</DialogTitle>
                            <DialogDescription>
                              Modifica los detalles del ejercicio
                            </DialogDescription>
                          </DialogHeader>
                          <ExerciseForm
                            exercise={selectedExercise!}
                            onSuccess={handleUpdateSuccess}
                            onFormSubmit={() => setIsEditDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-destructive'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
