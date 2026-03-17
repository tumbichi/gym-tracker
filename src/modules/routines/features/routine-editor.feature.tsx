"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Exercise } from "@prisma/client";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@core/components/ui/button";
import { Input } from "@core/components/ui/input";
import { Label } from "@core/components/ui/label";
import { createExercise, createRoutine, updateRoutine } from "@modules/routines/actions/routines.actions";
import type { CreateExercisePayload, CreateExerciseData, Routine, RoutineFormData } from "@modules/routines/types";
import { formDataToPayload, routineToFormData } from "@modules/routines/types";

import DayEditor from "../components/DayEditor";

interface RoutineEditorFeatureProps {
  routine: Routine | null;
  exercises: Exercise[];
  onSaved: (routine: Routine) => void;
  onCancel: () => void;
  onExerciseCreated: (exercise: Exercise) => void;
}

export default function RoutineEditorFeature({
  routine,
  exercises,
  onSaved,
  onCancel,
  onExerciseCreated,
}: RoutineEditorFeatureProps) {
  const [formData, setFormData] = useState<RoutineFormData>(
    routine ? routineToFormData(routine) : { name: "", days: [{ name: "Día 1", order: 1, items: [] }] }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para manejar la creación inline de ejercicios

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  };

  const handleAddDay = () => {
    if (formData.days.length >= 7) {
      toast.error("Máximo 7 días por rutina.");
      return;
    }
    setFormData((prev) => {
      const newDay = {
        name: `Día ${prev.days.length + 1}`,
        order: prev.days.length + 1,
        items: [],
      };
      return { ...prev, days: [...prev.days, newDay] };
    });
  };

  const handleRemoveDay = (dayIndex: number) => {
    if (formData.days[dayIndex].items.length > 0) {
      toast.error("Elimina los ejercicios del día antes de borrarlo.");
      return;
    }
    setFormData((prev) => {
      const newDays = prev.days.filter((_, i) => i !== dayIndex).map((day, i) => ({ ...day, order: i + 1 }));
      return { ...prev, days: newDays };
    });
  };

  const handleDayNameChange = (dayIndex: number, name: string) => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      newDays[dayIndex].name = name;
      return { ...prev, days: newDays };
    });
  };

  const handleAddExercise = (dayIndex: number) => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      const day = newDays[dayIndex];
      const newExercise = {
        exerciseId: null,
        order: day.items.length + 1,
        series: 3,
        repsPerSet: [10, 10, 10],
        notes: "",
      };
      day.items.push(newExercise);
      return { ...prev, days: newDays };
    });
  };

  const handleRemoveExercise = (dayIndex: number, itemIndex: number) => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      const day = newDays[dayIndex];
      day.items = day.items
        .filter((_, i) => i !== itemIndex)
        .map((item, i) => ({ ...item, order: i + 1 }));
      return { ...prev, days: newDays };
    });
  };

  const handleMoveExercise = (dayIndex: number, itemIndex: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      const items = newDays[dayIndex].items;
      const targetIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;

      if (targetIndex < 0 || targetIndex >= items.length) return prev;

      // Swap
      [items[itemIndex], items[targetIndex]] = [items[targetIndex], items[itemIndex]];

      // Recalculate orders
      items.forEach((item, i) => (item.order = i + 1));

      return { ...prev, days: newDays };
    });
  };

  const handleExerciseSelect = (dayIndex: number, itemIndex: number, exerciseId: number) => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      newDays[dayIndex].items[itemIndex].exerciseId = exerciseId;
      return { ...prev, days: newDays };
    });
  };

  const handleSeriesChange = (dayIndex: number, itemIndex: number, newSeries: number) => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      const item = newDays[dayIndex].items[itemIndex];
      const currentReps = item.repsPerSet;
      const currentLength = currentReps.length;

      if (newSeries > currentLength) {
        const lastRep = currentReps[currentLength - 1] ?? 10;
        const newReps = Array(newSeries - currentLength).fill(lastRep);
        item.repsPerSet.push(...newReps);
      } else if (newSeries < currentLength) {
        item.repsPerSet = currentReps.slice(0, newSeries);
      }
      item.series = newSeries; // Aunque se deriva, lo mantenemos por consistencia

      return { ...prev, days: newDays };
    });
  };

  const handleRepChange = (dayIndex: number, itemIndex: number, setIndex: number, reps: number) => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      newDays[dayIndex].items[itemIndex].repsPerSet[setIndex] = reps;
      return { ...prev, days: newDays };
    });
  };

  const handleNotesChange = (dayIndex: number, itemIndex: number, notes: string) => {
    setFormData((prev) => {
      const newDays = structuredClone(prev.days);
      newDays[dayIndex].items[itemIndex].notes = notes;
      return { ...prev, days: newDays };
    });
  };

  const handleCreateExerciseRequest = async (dayIndex: number, itemIndex: number, data: CreateExerciseData) => {
    try {
      // Crear ejercicio con todos los datos proporcionados
      const payload: CreateExercisePayload = {
        name: data.name.trim(),
        primaryGroup: data.primaryGroup,
        equipment: data.equipment,
      };
      
      const newExercise = await createExercise(payload);
      toast.success(`Ejercicio "${newExercise.name}" creado.`);

      setFormData((prev) => {
        const newDays = structuredClone(prev.days);
        newDays[dayIndex].items[itemIndex].exerciseId = newExercise.id;
        return { ...prev, days: newDays };
      });

      onExerciseCreated(newExercise);
    } catch (error) {
      toast.error("Error al crear el ejercicio.");
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = formDataToPayload(formData);
      let result: Routine;

      if (routine) {
        result = await updateRoutine(routine.id, payload);
        toast.success("Rutina actualizada correctamente.");
      } else {
        result = await createRoutine(payload);
        toast.success("Rutina creada correctamente.");
      }
      onSaved(result);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Ocurrió un error al guardar la rutina.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 pb-24">
        <div className="space-y-2">
          <Label htmlFor="routine-name">Nombre de la rutina</Label>
          <Input
            id="routine-name"
            placeholder="Ej: Tren superior, Lunes de Pecho, etc."
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={100}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-4">
          {formData.days.map((day, dayIndex) => (
            <DayEditor
              key={dayIndex}
              day={day}
              dayIndex={dayIndex}
              exercises={exercises}
              isOnlyDay={formData.days.length === 1}
              onNameChange={(name) => handleDayNameChange(dayIndex, name)}
              onRemove={() => handleRemoveDay(dayIndex)}
              onAddExercise={() => handleAddExercise(dayIndex)}
              onRemoveExercise={(itemIndex) => handleRemoveExercise(dayIndex, itemIndex)}
              onMoveExercise={(itemIndex, direction) => handleMoveExercise(dayIndex, itemIndex, direction)}
              onExerciseSelect={(itemIndex, exerciseId) => handleExerciseSelect(dayIndex, itemIndex, exerciseId)}
              onSeriesChange={(itemIndex, series) => handleSeriesChange(dayIndex, itemIndex, series)}
              onRepChange={(itemIndex, setIndex, reps) => handleRepChange(dayIndex, itemIndex, setIndex, reps)}
              onNotesChange={(itemIndex, notes) => handleNotesChange(dayIndex, itemIndex, notes)}
              onCreateExercise={(itemIndex, data) => handleCreateExerciseRequest(dayIndex, itemIndex, data)}
            />
          ))}
        </div>

        {/* Spacer para el footer fijo */}
        <div className="h-20" />
      </div>

      {/* Footer sticky con acciones */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleAddDay} 
            disabled={formData.days.length >= 7 || isSubmitting}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar día
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : routine ? "Guardar cambios" : "Crear rutina"}
          </Button>
        </div>
      </div>
    </>
  );
}
