import { GripVertical, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { Exercise } from "@prisma/client";
import type { RoutineDayItem } from "@modules/routines/actions/routines.actions";
import { ExercisePicker } from "./ExercisePicker";
import { NumberInputStepper } from "@core/components/ui/number-input-stepper";
import { Button } from "@core/components/ui/button";
import { Input } from "@core/components/ui/input";

interface RoutineExerciseItemProps {
  item: RoutineDayItem;
  itemIndex: number;
  totalItems: number;
  allExercises: Exercise[];
  onItemChange: (field: string, value: any) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onCreateExercise: (name: string) => void;
}

export function RoutineExerciseItem({
  item,
  itemIndex,
  totalItems,
  allExercises,
  onItemChange,
  onRemove,
  onMove,
  onCreateExercise,
}: RoutineExerciseItemProps) {
  return (
    <div className="flex items-start gap-2 p-3 -mx-3 border-transparent rounded-lg hover:bg-muted/50">
      <GripVertical className="w-4 h-4 mt-3 text-muted-foreground" />

      <div className="flex-1 space-y-3">
        {/* Row 1: Actions */}
        <div className="flex items-center justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={() => onMove("up")} disabled={itemIndex === 0}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => onMove("down")} disabled={itemIndex === totalItems - 1}>
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Row 2: Exercise Picker */}
        <ExercisePicker
          exercises={allExercises}
          value={item.exerciseId}
          onSelect={(id) => onItemChange("exerciseId", id)}
          onCreate={onCreateExercise}
        />

        {/* Row 3: Series, Reps, Weight */}
        <div className="grid grid-cols-3 gap-2">
          <NumberInputStepper
            value={item.series}
            onChange={(value) => onItemChange("series", value)}
            min={1}
            max={10}
            placeholder="Series"
            suffix="reps"
          />
          <Input
            placeholder="Reps"
            value={item.reps}
            onChange={(e) => onItemChange("reps", e.target.value)}
            className="h-11 text-center"
          />
          <NumberInputStepper
            value={item.targetWeight || 0}
            onChange={(value) => onItemChange("targetWeight", value)}
            step={2.5}
            min={0}
            placeholder="Peso (kg)"
            suffix="kg"
          />
        </div>

        {/* Row 4: Notes */}
        <Input
          placeholder="Notas (opcional)"
          value={item.notes || ""}
          onChange={(e) => onItemChange("notes", e.target.value)}
          className="h-11"
        />
      </div>
    </div>
  );
}
