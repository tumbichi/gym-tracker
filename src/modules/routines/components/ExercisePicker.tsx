'use client'

import * as React from 'react'
import { ChevronsUpDown, PlusCircle, X } from 'lucide-react'
import { Button } from '@core/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandDialog,
} from '@core/components/ui/command'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core/components/ui/select'
import type { Exercise } from '@prisma/client'
import type { CreateExerciseData } from '@modules/routines/types'

interface ExercisePickerProps {
  exercises: Exercise[]
  value: number | null
  onSelect: (value: number) => void
  onCreate: (data: CreateExerciseData) => void
}

export function ExercisePicker({
  exercises,
  value,
  onSelect,
  onCreate,
}: ExercisePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [newExerciseName, setNewExerciseName] = React.useState('')
  const [newExerciseGroup, setNewExerciseGroup] = React.useState<
    string | undefined
  >()
  const [newExerciseEquipment, setNewExerciseEquipment] = React.useState<
    string | undefined
  >()

  const selectedExercise = exercises.find((ex) => ex.id === value)

  const filteredExercises = search
    ? exercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
      )
    : exercises

  const handleCreate = () => {
    setOpen(false)
    onCreate({
      name: search.trim(),
    })
  }

  const handleShowCreateForm = () => {
    setShowCreateForm(true)
    setNewExerciseName(search)
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
    setNewExerciseName('')
    setNewExerciseGroup(undefined)
    setNewExerciseEquipment(undefined)
  }

  const handleConfirmCreate = () => {
    if (newExerciseName.trim()) {
      onCreate({
        name: newExerciseName.trim(),
        primaryGroup: newExerciseGroup,
        equipment: newExerciseEquipment,
      })
      setOpen(false)
      handleCancelCreate()
    }
  }

  return (
    <>
      <Button
        variant='outline'
        role='combobox'
        aria-expanded={open}
        className='h-11 w-full justify-between'
        onClick={() => setOpen(true)}
      >
        {selectedExercise ? selectedExercise.name : 'Seleccionar ejercicio'}
        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) {
            // Reset form when closing
            handleCancelCreate()
          }
        }}
        title='Seleccionar ejercicio'
        description='Busca y selecciona un ejercicio de la lista'
        showCloseButton={true}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Buscar ejercicio...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {!showCreateForm ? (
              <CommandEmpty asChild>
                {search ? (
                  <div className='text-muted-foreground p-4 text-center text-sm'>
                    <p>No se encontró &quot;{search}&quot;.</p>
                    <Button
                      variant='link'
                      className='mt-2'
                      onClick={handleShowCreateForm}
                    >
                      <PlusCircle className='mr-2 h-4 w-4' />
                      Crear este ejercicio
                    </Button>
                  </div>
                ) : (
                  <div className='text-muted-foreground p-4 text-center text-sm'>
                    No hay ejercicios.
                  </div>
                )}
              </CommandEmpty>
            ) : (
              <div className='border-b p-4'>
                <div className='mb-4 flex items-center justify-between'>
                  <h4 className='font-medium'>Crear nuevo ejercicio</h4>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleCancelCreate}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='new-exercise-name'>Nombre</Label>
                    <Input
                      id='new-exercise-name'
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder='Nombre del ejercicio'
                      autoFocus
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='new-exercise-group'>Grupo muscular</Label>
                      <Select
                        value={newExerciseGroup}
                        onValueChange={setNewExerciseGroup}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Espalda'>Espalda</SelectItem>
                          <SelectItem value='Pecho'>Pecho</SelectItem>
                          <SelectItem value='Pierna'>Pierna</SelectItem>
                          <SelectItem value='Hombro'>Hombro</SelectItem>
                          <SelectItem value='Bíceps'>Bíceps</SelectItem>
                          <SelectItem value='Tríceps'>Tríceps</SelectItem>
                          <SelectItem value='Core'>Core</SelectItem>
                          <SelectItem value='Glúteo'>Glúteo</SelectItem>
                          <SelectItem value='Cardio'>Cardio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='new-exercise-equipment'>
                        Equipamiento
                      </Label>
                      <Select
                        value={newExerciseEquipment}
                        onValueChange={setNewExerciseEquipment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Barra'>Barra</SelectItem>
                          <SelectItem value='Mancuernas'>Mancuernas</SelectItem>
                          <SelectItem value='Máquina'>Máquina</SelectItem>
                          <SelectItem value='Smith'>Smith</SelectItem>
                          <SelectItem value='Prensa'>Prensa</SelectItem>
                          <SelectItem value='Polea'>Polea</SelectItem>
                          <SelectItem value='Peso corporal'>
                            Peso corporal
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className='w-full'
                    onClick={handleConfirmCreate}
                    disabled={!newExerciseName.trim()}
                  >
                    Crear ejercicio
                  </Button>
                </div>
              </div>
            )}
            {!showCreateForm && (
              <CommandGroup>
                {filteredExercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => {
                      onSelect(exercise.id)
                      setOpen(false)
                    }}
                  >
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
