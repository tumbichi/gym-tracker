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
  isFirst: boolean;
  isLast: boolean;
  allExercises: Exercise[];
  onItemChange: (field: string, value: any) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onCreateExercise: (name: string) => void;
}

export function RoutineExerciseItem({
  item,
  itemIndex,
  isFirst,
  isLast,
  allExercises,
  onItemChange,
  onRemove,
  onMove,
  onCreateExercise,
}: RoutineExerciseItemProps) {
  return (
    <div className="flex items-start gap-2 p-3 -mx-3 border-transparent rounded-lg hover:bg-muted/50">
      <div className="flex flex-col items-center gap-1 mt-1">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 space-y-2">
        {/* Row 1: Actions */}
        <div className="flex justify-end items-center -mt-2 -mr-2">
            <Button variant="ghost" size="icon" onClick={() => onMove("up")} disabled={isFirst}>
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onMove("down")} disabled={isLast}>
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive">
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

        {/* Row 3: Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
          <Input
            placeholder="Notas (opcional)"
            value={item.notes || ""}
            onChange={(e) => onItemChange("notes", e.target.value)}
            className="h-11 col-span-2 md:col-span-1"
          />
        </div>
      </div>
    </div>
  );
}
