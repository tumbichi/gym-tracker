'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Textarea } from '@core/components/ui/textarea'
import { Label } from '@core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core/components/ui/select'
import { Checkbox } from '@core/components/ui/checkbox'
import { Separator } from '@core/components/ui/separator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@core/components/ui/card'
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useDuplicateDetection } from '../hooks/useExerciseSearch'
import { ExerciseAliasList } from '../components/ExerciseAliasList'
import { useToast } from '@core/components/ui/use-toast'
import type {
  Exercise,
  MuscleGroup,
  Equipment,
  CreateExercisePayload,
  ExerciseType,
  ForceVector,
  BodyRegion,
} from '../types'

interface ExerciseFormFeatureProps {
  exercise?: Exercise
  onSuccess?: (exercise?: Exercise) => void
  onFormSubmit?: () => void
}

/**
 * Exercise Form Feature - Smart component for creating/editing exercises
 */
export function ExerciseFormFeature({
  exercise,
  onSuccess,
  onFormSubmit,
}: ExerciseFormFeatureProps) {
  const router = useRouter()
  const isEditing = !!exercise
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    canonicalName: exercise?.canonicalName || '',
    description: exercise?.description || '',
    instructions: exercise?.instructions || '',
    primaryMuscleId: exercise?.primaryMuscleId || '',
    secondaryMuscleIds: [] as string[],
    exerciseType: exercise?.exerciseType || '',
    forceVector: exercise?.forceVector || '',
    equipmentIds: [] as string[],
    videoUrl: exercise?.videoUrl || '',
    imageUrl: exercise?.imageUrl || '',
    tags: exercise?.tags?.join(', ') || '',
    baseExerciseId: exercise?.baseExerciseId || '',
  })

  // Lookup data
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [aliases, setAliases] = useState<
    { id: string; alias: string; isPrimary: boolean }[]
  >([])

  // Form state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Duplicate detection
  const {
    duplicateCheck,
    isChecking,
    name: duplicateName,
    setName: setDuplicateName,
  } = useDuplicateDetection(500)

  // Fetch lookup data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [muscleGroupsAction, equipmentAction] = await Promise.all([
          import('../actions/exercises.actions').then((m) =>
            m.getMuscleGroups()
          ),
          import('../actions/exercises.actions').then((e) => e.getEquipment()),
        ])
        setMuscleGroups(muscleGroupsAction)
        setEquipment(equipmentAction)

        // If editing, fetch existing aliases
        if (isEditing && exercise) {
          const { getExerciseById } =
            await import('../actions/exercises.actions')
          const fullExercise = await getExerciseById(String(exercise.id))
          if (fullExercise?.aliases) {
            setAliases(fullExercise.aliases)
          }
        }
      } catch (error) {
        console.error('Failed to fetch lookup data:', error)
      }
    }

    fetchData()
  }, [isEditing, exercise])

  // Handle duplicate detection
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, canonicalName: value }))
    setDuplicateName(value)
  }

  // Handle form changes
  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle equipment toggle
  const handleEquipmentToggle = (equipmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      equipmentIds: prev.equipmentIds.includes(equipmentId)
        ? prev.equipmentIds.filter((id) => id !== equipmentId)
        : [...prev.equipmentIds, equipmentId],
    }))
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (duplicateCheck.isDuplicate) {
      setError('Este ejercicio ya existe. Por favor, usa otro nombre.')
      return
    }

    // Client-side validation for required fields
    if (!formData.primaryMuscleId) {
      toast({
        variant: 'destructive',
        title: 'Campo requerido',
        description: 'Debes seleccionar el músculo principal.',
      })
      return
    }
    if (!formData.exerciseType) {
      toast({
        variant: 'destructive',
        title: 'Campo requerido',
        description: 'Debes seleccionar el tipo de ejercicio.',
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        createExercise,
        updateExercise,
        addExerciseAlias,
        removeExerciseAlias,
      } = await import('../actions/exercises.actions')

      const payload: CreateExercisePayload = {
        canonicalName: formData.canonicalName,
        description: formData.description || undefined,
        instructions: formData.instructions || undefined,
        primaryMuscleId: formData.primaryMuscleId,
        secondaryMuscleIds:
          formData.secondaryMuscleIds.length > 0
            ? formData.secondaryMuscleIds
            : undefined,
        movementPattern: 'ISOLATION',
        exerciseType: formData.exerciseType as ExerciseType,
        forceVector: (formData.forceVector as ForceVector) || undefined,
        equipmentIds:
          formData.equipmentIds.length > 0 ? formData.equipmentIds : undefined,
        videoUrl: formData.videoUrl || undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t: string) => t.trim())
              .filter((t: string) => Boolean(t))
          : undefined,
        baseExerciseId: (formData.baseExerciseId as string) || undefined,
      }

      let result
      if (isEditing && exercise) {
        result = await updateExercise({ id: String(exercise.id), ...payload })
      } else {
        result = await createExercise(payload)
      }

      if (result.success) {
        onSuccess?.(result.data)
        onFormSubmit?.()
        router.push('/exercises')
      } else {
        setError(result.error || 'Error al guardar el ejercicio')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  // Group muscle groups by body region
  const muscleGroupsByRegion = muscleGroups.reduce<
    Record<BodyRegion, MuscleGroup[]>
  >(
    (acc, mg) => {
      if (!acc[mg.bodyRegion]) {
        acc[mg.bodyRegion] = []
      }
      acc[mg.bodyRegion].push(mg)
      return acc
    },
    {} as Record<BodyRegion, MuscleGroup[]>
  )

  return (
    <div className='p-6'>
      <div className='mx-auto max-w-2xl space-y-6'>
        {/* Breadcrumb / Back */}
        <div>
          <Link
            href='/exercises'
            className='text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Ejercicios
          </Link>
          <h1 className='text-2xl font-bold'>
            {isEditing ? 'Editar Ejercicio' : 'Nuevo ejercicio'}
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            {isEditing
              ? 'Actualiza los datos del ejercicio.'
              : 'Añade un ejercicio a la biblioteca. Los ejercicios son compartidos por todos los usuarios.'}
          </p>
        </div>

        <Separator />

        {/* Error Message */}
        {error && (
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive'>{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Name */}
              <div className='space-y-2'>
                <Label htmlFor='canonicalName'>Nombre del Ejercicio *</Label>
                <Input
                  id='canonicalName'
                  value={formData.canonicalName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder='Ej: Press de Banca'
                  required
                />
                {/* Duplicate detection feedback */}
                {duplicateCheck.isDuplicate && (
                  <div className='text-destructive flex items-center gap-2 text-sm'>
                    <AlertTriangle className='h-4 w-4' />
                    <span>
                      Este ejercicio ya existe como &quot;
                      {duplicateCheck.matchedExercise?.canonicalName}
                      &quot;
                    </span>
                  </div>
                )}
                {isChecking && (
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Verificando...</span>
                  </div>
                )}
                {!duplicateCheck.isDuplicate &&
                  !isChecking &&
                  duplicateName.length >= 3 && (
                    <div className='flex items-center gap-2 text-sm text-green-600'>
                      <CheckCircle2 className='h-4 w-4' />
                      <span>Nombre disponible</span>
                    </div>
                  )}
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Label htmlFor='description'>Descripción</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder='Descripción breve del ejercicio...'
                  rows={3}
                />
              </div>

              {/* Instructions */}
              <div className='space-y-2'>
                <Label htmlFor='instructions'>Instrucciones</Label>
                <Textarea
                  id='instructions'
                  value={formData.instructions}
                  onChange={(e) => handleChange('instructions', e.target.value)}
                  placeholder='Instrucciones paso a paso...'
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Clasificación</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Primary Muscle */}
              <div className='space-y-2'>
                <Label>Músculo Principal *</Label>
                <Select
                  value={formData.primaryMuscleId}
                  onValueChange={(value) =>
                    handleChange('primaryMuscleId', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar músculo' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(muscleGroupsByRegion).map(
                      ([region, groups]) => (
                        <div key={region}>
                          <div className='text-muted-foreground px-2 py-1.5 text-xs font-semibold uppercase'>
                            {region.replace('_', ' ')}
                          </div>
                          {groups.map((mg) => (
                            <SelectItem key={mg.id} value={mg.id}>
                              {mg.name}
                            </SelectItem>
                          ))}
                        </div>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Exercise Type */}
              <div className='space-y-2'>
                <Label>Tipo de Ejercicio *</Label>
                <Select
                  value={formData.exerciseType}
                  onValueChange={(value) => handleChange('exerciseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='COMPOUND'>Compuesto</SelectItem>
                    <SelectItem value='ISOLATION'>Aislamiento</SelectItem>
                    <SelectItem value='CARDIO'>Cardio</SelectItem>
                    <SelectItem value='MOBILITY'>Movilidad</SelectItem>
                    <SelectItem value='PLYOMETRIC'>Pliométrico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Force Vector */}
              <div className='space-y-2'>
                <Label>Vector de Fuerza</Label>
                <Select
                  value={formData.forceVector}
                  onValueChange={(value) => handleChange('forceVector', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar vector (opcional)' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PUSH_HORIZONTAL'>
                      Empuje Horizontal
                    </SelectItem>
                    <SelectItem value='PUSH_VERTICAL'>
                      Empuje Vertical
                    </SelectItem>
                    <SelectItem value='PULL_HORIZONTAL'>
                      Tracción Horizontal
                    </SelectItem>
                    <SelectItem value='PULL_VERTICAL'>
                      Tracción Vertical
                    </SelectItem>
                    <SelectItem value='ISOMETRIC'>Isométrico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle>Equipamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {equipment.map((eq) => (
                  <div
                    key={eq.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                      formData.equipmentIds.includes(eq.id)
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-muted'
                    } `}
                    onClick={() => handleEquipmentToggle(eq.id)}
                  >
                    <Checkbox
                      checked={formData.equipmentIds.includes(eq.id)}
                      onCheckedChange={() => handleEquipmentToggle(eq.id)}
                    />
                    <span className='text-sm'>{eq.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Multimedia</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='videoUrl'>URL del Video</Label>
                <Input
                  id='videoUrl'
                  value={formData.videoUrl}
                  onChange={(e) => handleChange('videoUrl', e.target.value)}
                  placeholder='https://youtube.com/...'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='imageUrl'>URL de la Imagen</Label>
                <Input
                  id='imageUrl'
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  placeholder='https://...'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='tags'>Etiquetas (separadas por coma)</Label>
                <Input
                  id='tags'
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder='fuerza, pecho, tracción'
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className='flex justify-end gap-4 pb-8'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isLoading || isChecking || duplicateCheck.isDuplicate}
            >
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEditing ? 'Guardar Cambios' : 'Crear Ejercicio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
