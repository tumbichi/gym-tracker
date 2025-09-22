"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DialogClose } from "@/components/ui/dialog"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { createRoutine, updateRoutine } from "@/app/actions/routines"

interface RoutineFormProps {
  routine?: any // We'll type this properly later
}

const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export function RoutineForm({ routine }: RoutineFormProps) {
  const [formData, setFormData] = useState({
    name: routine?.name || "",
    weeks: routine?.weeks || 1,
    days:
      routine?.days ||
      weekDays.map((day, index) => ({
        name: day,
        order: index + 1,
        items: [],
      })),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (routine) {
      await updateRoutine(routine.id, formData)
    } else {
      await createRoutine(formData)
    }
  }

  const addExerciseToDay = (dayIndex: number) => {
    const newDays = [...formData.days]
    newDays[dayIndex].items.push({
      exerciseId: null,
      order: newDays[dayIndex].items.length + 1,
      series: 3,
      reps: "10-12",
      targetWeight: null,
      notes: "",
    })
    setFormData({ ...formData, days: newDays })
  }

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...formData.days]
    newDays[dayIndex].items.splice(exerciseIndex, 1)
    // Reorder remaining items
    newDays[dayIndex].items.forEach((item, index) => {
      item.order = index + 1
    })
    setFormData({ ...formData, days: newDays })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Rutina</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ej. Push/Pull/Legs"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weeks">Duración (semanas)</Label>
          <Select
            value={formData.weeks.toString()}
            onValueChange={(value) => setFormData({ ...formData, weeks: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 6, 8, 12].map((weeks) => (
                <SelectItem key={weeks} value={weeks.toString()}>
                  {weeks} semana{weeks > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Days Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configuración Semanal</h3>

        <div className="grid gap-4">
          {formData.days.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{day.name}</CardTitle>
                  <Badge variant="secondary">
                    {day.items.length} ejercicio{day.items.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.items.map((item, exerciseIndex) => (
                  <div key={exerciseIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />

                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Ejercicio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="press-banca">Press de Banca</SelectItem>
                          <SelectItem value="sentadilla">Sentadilla</SelectItem>
                          <SelectItem value="peso-muerto">Peso Muerto</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input type="number" placeholder="Series" value={item.series} min="1" max="10" />

                      <Input placeholder="Reps" value={item.reps} />

                      <Input type="number" placeholder="Peso (kg)" value={item.targetWeight || ""} step="0.5" />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExerciseFromDay(dayIndex, exerciseIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addExerciseToDay(dayIndex)}
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ejercicio
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <DialogClose asChild>
          <Button variant="outline" type="button" className="bg-transparent">
            Cancelar
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="submit">{routine ? "Actualizar" : "Crear"} Rutina</Button>
        </DialogClose>
      </div>
    </form>
  )
}
