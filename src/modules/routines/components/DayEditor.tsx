"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@core/components/ui/badge";
import { Button } from "@core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/components/ui/card";
import { Input } from "@core/components/ui/input";
import ExerciseRow from "./ExerciseRow";
import type { Exercise } from "@prisma/client";
import type { CreateExerciseData } from "@modules/routines/types";

// Tipos locales según RFC
interface ExerciseFormItem {
  exerciseId: number | null;
  order: number;
  series: number;
  repsPerSet: number[];
  notes: string;
}

interface DayFormData {
  name: string;
  order: number;
  items: ExerciseFormItem[];
}

interface DayEditorProps {
  day: DayFormData;
  dayIndex: number;
  exercises: Exercise[];
  isOnlyDay: boolean;
  onNameChange: (name: string) => void;
  onRemove: () => void;
  onAddExercise: () => void;
  onRemoveExercise: (itemIndex: number) => void;
  onMoveExercise: (itemIndex: number, direction: "up" | "down") => void;
  onExerciseSelect: (itemIndex: number, exerciseId: number) => void;
  onSeriesChange: (itemIndex: number, series: number) => void;
  onRepChange: (itemIndex: number, setIndex: number, reps: number) => void;
  onNotesChange: (itemIndex: number, notes: string) => void;
  onCreateExercise: (itemIndex: number, data: CreateExerciseData) => void;
}

export default function DayEditor({
  day,
  dayIndex,
  exercises,
  isOnlyDay,
  onNameChange,
  onRemove,
  onAddExercise,
  onRemoveExercise,
  onMoveExercise,
  onExerciseSelect,
  onSeriesChange,
  onRepChange,
  onNotesChange,
  onCreateExercise,
}: DayEditorProps) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  
  const canDeleteDay = !isOnlyDay && day.items.length === 0;
  
  const handleNameEditClick = () => {
    setIsEditingName(true);
  };
  
  const handleNameSave = () => {
    setIsEditingName(false);
  };
  
  // Focus the input when editing starts
  React.useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex-1 mr-4">
          {isEditingName ? (
            <Input
              ref={nameInputRef}
              value={day.name}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNameSave();
                }
              }}
              maxLength={50}
              className="text-2xl font-bold border-b-2 border-primary focus-visible:ring-0 p-2"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{day.name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNameEditClick}
                className="h-8 px-2"
              >
                <Pencil className="h-4 w-4" />
                <span className="ml-1 text-xs">Editar</span>
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{day.items.length} ejercicios</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canDeleteDay}
            title={!canDeleteDay ? "Eliminá los ejercicios de este día para poder borrarlo" : "Eliminar día"}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {day.items.map((item, itemIndex) => (
          <ExerciseRow
            key={itemIndex}
            item={item}
            itemIndex={itemIndex}
            isFirst={itemIndex === 0}
            isLast={itemIndex === day.items.length - 1}
            exercises={exercises}
            onExerciseSelect={(exerciseId) => onExerciseSelect(itemIndex, exerciseId)}
            onSeriesChange={(series) => onSeriesChange(itemIndex, series)}
            onRepChange={(setIndex, reps) => onRepChange(itemIndex, setIndex, reps)}
            onNotesChange={(notes) => onNotesChange(itemIndex, notes)}
            onRemove={() => onRemoveExercise(itemIndex)}
            onMove={(direction) => onMoveExercise(itemIndex, direction)}
            onCreateExercise={(data) => onCreateExercise(itemIndex, data)}
          />
        ))}
        <Button variant="outline" className="w-full" onClick={onAddExercise}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar ejercicio
        </Button>
      </CardContent>
    </Card>
  );
}
