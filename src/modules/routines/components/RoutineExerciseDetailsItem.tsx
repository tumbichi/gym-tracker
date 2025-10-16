
import type { RoutineDayItem } from "@modules/routines/actions/routines.actions";
import { Badge } from "@core/components/ui/badge";
import { Dumbbell, Repeat, NotebookText, Layers } from "lucide-react";

interface RoutineExerciseDetailsItemProps {
  item: RoutineDayItem;
}

export default function RoutineExerciseDetailsItem({ item }: RoutineExerciseDetailsItemProps) {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-muted/20">
      {/* Top Row: Name and Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          <p className="font-semibold text-lg">{item.exercise.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.exercise.primaryGroup && (
            <Badge variant="outline">{item.exercise.primaryGroup}</Badge>
          )}
          {item.exercise.equipment && (
            <Badge variant="outline">{item.exercise.equipment}</Badge>
          )}
        </div>
      </div>

      {/* Bottom Row: Details */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{item.series}</span>
          <span className="text-muted-foreground">series</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Repeat className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{item.reps}</span>
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
