'use client'

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogClose } from "@/components/ui/dialog"
import { createExercise, updateExercise } from "@/app/actions/exercises"
import type { Exercise } from "@/lib/db"
import { toast } from "sonner"

interface ExerciseFormProps {
  exercise?: Partial<Exercise>
  onSuccess?: (exercise: Exercise) => void
  onFormSubmit?: () => void
}

const muscleGroups = ["Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Glúteos", "Pantorrillas"]

const equipmentTypes = [
  "Barra",
  "Mancuernas",
  "Máquina",
  "Smith",
  "Prensa",
  "Peso Corporal",
  "Cables",
  "Kettlebell",
  "Bandas Elásticas",
]

export function ExerciseForm({ exercise, onSuccess, onFormSubmit }: ExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    primaryGroup: exercise?.primaryGroup || "",
    equipment: exercise?.equipment || "",
    notes: exercise?.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const slug = formData.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")

    if (exercise?.id) {
      const result = await updateExercise(exercise.id, {
        ...formData,
        slug,
      })
      if (result.success) {
        toast.success("Ejercicio actualizado con éxito")
      } else {
        toast.error(result.error)
      }
    } else {
      const result = await createExercise({
        ...formData,
        slug,
      })
      if (result.success && result.exercise) {
        toast.success("Ejercicio creado con éxito")
        if (onSuccess) {
          onSuccess(result.exercise)
        }
      } else {
        toast.error(result.error)
      }
    }
    if (onFormSubmit) {
      onFormSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Ejercicio</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej. Press de Banca"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryGroup">Grupo Muscular Principal</Label>
          <Select
            value={formData.primaryGroup}
            onValueChange={(value) => setFormData({ ...formData, primaryGroup: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment">Equipamiento</Label>
        <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar equipamiento" />
          </SelectTrigger>
          <SelectContent>
            {equipmentTypes.map((equipment) => (
              <SelectItem key={equipment} value={equipment}>
                {equipment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (Opcional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Instrucciones, consejos de forma, variaciones..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <DialogClose asChild>
          <Button variant="outline" type="button" className="bg-transparent">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">{exercise?.id ? "Actualizar" : "Crear"} Ejercicio</Button>
      </div>
    </form>
  )
}
