import { Badge } from "@core/components/ui/badge";
import { Dumbbell, Repeat, NotebookText, Layers } from "lucide-react";
import type { RoutineExercise } from "@modules/routines/types"; // Asumimos que este tipo existirá

interface RoutineExerciseDetailsItemProps {
  item: RoutineExercise;
}

/** Parsea el campo reps de la BD (JSON string) a array de números */
function parseReps(repsJson: string): number[] {
  try {
    const parsed = JSON.parse(repsJson);
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === "number")) {
      return parsed;
    }
  } catch {
    // Fallback para formato legacy "12-10-8"
    const parts = repsJson.split("-").map(Number).filter((n) => !isNaN(n));
    if (parts.length > 0) return parts;
  }
  return [10]; // Default fallback
}

export default function RoutineExerciseDetailsItem({ item }: RoutineExerciseDetailsItemProps) {
  const repsArray = parseReps(item.reps);

  return (
    <div className="p-4 border rounded-lg space-y-3 bg-muted/20">
      {/* Top Row: Name and Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          <p className="font-semibold text-lg">{item.exercise.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.exercise.primaryGroup && <Badge variant="outline">{item.exercise.primaryGroup}</Badge>}
          {item.exercise.equipment && <Badge variant="outline">{item.exercise.equipment}</Badge>}
        </div>
      </div>

      {/* Bottom Row: Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{item.series}</span>
          <span className="text-muted-foreground">series</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Repeat className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{repsArray.join(" / ")}</span>
          <span className="text-muted-foreground">reps</span>
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground pt-1">
          <NotebookText className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="italic">{item.notes}</p>
        </div>
      )}
    </div>
  );
}
