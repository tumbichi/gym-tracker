"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@core/components/ui/button";
import { Input } from "@core/components/ui/input";
import { Label } from "@core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/components/ui/select";
import { Separator } from "@core/components/ui/separator";
import { DialogClose } from "@core/components/ui/dialog";
import { createRoutine, updateRoutine, RoutineFormData } from "@modules/routines/actions/routines.actions";
import { Exercise } from "@prisma/client";
import { RoutineDayCard } from "../components/RoutineDayCard";

// The form now uses the single source of truth for the type from actions

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@core/components/ui/dialog";
import { ExerciseForm } from "@core/components/exercise-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RoutineEditorProps {
  routine?: any;
  allExercises: Exercise[];
  onExercisesUpdate: (exercises: Exercise[]) => void;
  onRoutineCreated?: (newRoutine: Routine) => void;
  onFormSubmitSuccess?: () => void;
}

const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function RoutineEditor({
  routine,
  allExercises,
  onExercisesUpdate,
  onRoutineCreated,
  onRoutineUpdated,
  onFormSubmitSuccess,
}: RoutineEditorProps) {
  const [formData, setFormData] = useState<RoutineFormData>({
    name: routine?.name || "",
    weeks: routine?.weeks || 1,
    days:
      routine?.days ||
      weekDays.map((day, index) => ({
        name: day,
        order: index + 1,
        items: [],
      })),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateExerciseOpen, setCreateExerciseOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [dayIndexForNewExercise, setDayIndexForNewExercise] = useState<number | null>(null);
  const [itemIndexForNewExercise, setItemIndexForNewExercise] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (routine) {
        await updateRoutine(routine.id, formData)
          .then((updatedRoutine) => {
            console.log('Updated routine from server action:', updatedRoutine);
            toast.success("Rutina actualizada con éxito.");
            if (onRoutineUpdated) {
              onRoutineUpdated(updatedRoutine);
            }
            if (onFormSubmitSuccess) {
              onFormSubmitSuccess();
            }
          })
          .catch((error) => {
            console.error("Error al actualizar rutina:", error);
            toast.error(error.message || "Error desconocido al actualizar la rutina.");
          });
      } else {
        const newRoutine = await createRoutine(formData)
          .then((createdRoutine) => {
            toast.success("Rutina creada con éxito.");
            if (onRoutineCreated) {
              onRoutineCreated(createdRoutine);
            }
            if (onFormSubmitSuccess) {
              onFormSubmitSuccess();
            }
          })
          .catch((error) => {
            console.error("Error al crear rutina:", error);
            toast.error(error.message || "Error desconocido al crear la rutina.");
          });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayItemChange = (dayIndex: number, itemIndex: number, field: string, value: any) => {
    const newDays = [...formData.days];
    const item = newDays[dayIndex].items[itemIndex];
    (item as any)[field] = value;
    setFormData({ ...formData, days: newDays });
  };

  const addExerciseToDay = (dayIndex: number) => {
    const newDays = [...formData.days];
    newDays[dayIndex].items.push({
      exerciseId: null,
      order: newDays[dayIndex].items.length + 1,
      series: 3,
      reps: "12-12-10-8",
      targetWeight: null,
      notes: "",
    });
    setFormData({ ...formData, days: newDays });
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    const newDays = [...formData.days];
    newDays[dayIndex].items.splice(exerciseIndex, 1);
    // Reorder remaining items
    newDays[dayIndex].items.forEach((item, index) => {
      item.order = index + 1;
    });
    setFormData({ ...formData, days: newDays });
  };

  const moveExerciseInDay = (dayIndex: number, itemIndex: number, direction: "up" | "down") => {
    const newDays = [...formData.days];
    const day = newDays[dayIndex];
    const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;

    if (newIndex < 0 || newIndex >= day.items.length) return;

    // Swap items
    const temp = day.items[itemIndex];
    day.items[itemIndex] = day.items[newIndex];
    day.items[newIndex] = temp;

    // Update order property
    day.items.forEach((item, index) => {
      item.order = index + 1;
    });

    setFormData({ ...formData, days: newDays });
  };

  const handleCreateExercise = (name: string, dayIndex: number, itemIndex: number) => {
    setNewExerciseName(name);
    setDayIndexForNewExercise(dayIndex);
    setItemIndexForNewExercise(itemIndex);
    setCreateExerciseOpen(true);
  };

  const handleExerciseCreated = (newExercise: Exercise) => {
    onExercisesUpdate([...allExercises, newExercise]);
    if (dayIndexForNewExercise !== null && itemIndexForNewExercise !== null) {
      const newDays = [...formData.days];
      newDays[dayIndexForNewExercise].items[itemIndexForNewExercise].exerciseId = newExercise.id;
      setFormData({ ...formData, days: newDays });
    }
    setCreateExerciseOpen(false);
  };

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
            value={formData.weeks?.toString()}
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
            <RoutineDayCard
              key={dayIndex}
              day={day}
              dayIndex={dayIndex}
              allExercises={allExercises}
              onDayItemChange={(itemIndex, field, value) => handleDayItemChange(dayIndex, itemIndex, field, value)}
              onAddExercise={() => addExerciseToDay(dayIndex)}
              onRemoveExercise={(itemIndex) => removeExerciseFromDay(dayIndex, itemIndex)}
              onMoveExercise={(itemIndex, direction) => moveExerciseInDay(dayIndex, itemIndex, direction)}
              onCreateExercise={(name, itemIndex) => handleCreateExercise(name, dayIndex, itemIndex)}
            />
          ))}
        </div>
      </div>

      {/* Create Exercise Dialog */}
      <Dialog open={isCreateExerciseOpen} onOpenChange={setCreateExerciseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Ejercicio</DialogTitle>
            <DialogDescription>Agrega un nuevo ejercicio a tu biblioteca personal.</DialogDescription>
          </DialogHeader>
          <ExerciseForm
            exercise={{ name: newExerciseName }}
            onSuccess={handleExerciseCreated}
            onFormSubmit={() => setCreateExerciseOpen(false)}
          />
        </DialogContent>

        <div className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button" className="bg-transparent">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
              </>
            ) : routine ? (
              "Actualizar"
            ) : (
              "Crear"
            )}{" "}
            Rutina
          </Button>
        </div>
      </Dialog>
    </form>
  );
}
