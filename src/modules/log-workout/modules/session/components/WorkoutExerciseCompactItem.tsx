
import React from "react";
import { Card, CardHeader, CardTitle } from "@core/components/ui/card";
import { Badge } from "@core/components/ui/badge";
import { WorkoutExercise } from "@core/types";
import { CheckCircle2, ListTodo, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@core/components/ui/button";

interface WorkoutExerciseCompactItemProps {
  exercise: WorkoutExercise;
  isCompleted: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  isLastItem: boolean;
}

export function WorkoutExerciseCompactItem({
  exercise,
  isCompleted,
  onMoveUp,
  onMoveDown,
  onRemove,
  isLastItem,
}: WorkoutExerciseCompactItemProps) {
  const totalSets = exercise.sets.length;
  const completedSets = exercise.sets.filter((s) => s.completed).length;

  return (
    <Card className={`overflow-hidden ${isCompleted ? "bg-muted/40" : ""}`}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center flex-1 gap-3 min-w-0">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
            ) : (
              <ListTodo className="w-6 h-6 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight truncate">{exercise.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">
                {isCompleted
                  ? exercise.sets.map((set) => `${set.weightKg}kg x ${set.repsDone}`).join("  •  ")
                  : `${exercise.targetSeries} x ${exercise.targetReps}${exercise.targetWeight ? ` @ ${exercise.targetWeight}kg` : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isCompleted ? (
              <Badge variant="default" className="hidden bg-green-600 sm:inline-flex">
                Completado
              </Badge>
            ) : (
              <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                {completedSets}/{totalSets}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={isCompleted}>
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={isCompleted || isLastItem}>
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
