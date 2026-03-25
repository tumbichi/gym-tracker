"use client";

import { Badge } from "@core/components/ui/badge";
import { Button } from "@core/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@core/components/ui/card";
import { Input } from "@core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/components/ui/select";
import { NumberInputStepper } from "@core/components/ui/number-input-stepper";
import { SetEntry, WorkoutExercise } from "@core/types";
import { cn } from "@core/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Plus,
  Trash2,
  Undo2,
} from "lucide-react";

interface WorkoutExerciseItemProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  isLastItem: boolean;
  isActive: boolean;
  completedSets: number;
  totalSets: number;
  previousWeight?: number;
  canUndo: boolean;
  onUpdateSet: (setId: string, updates: Partial<SetEntry>) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onUndo: () => void;
}

// Helper function to normalize exercise name for data-test-id (remove accents and special chars)
function normalizeExerciseNameForTestId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, ''); // Remove any remaining special characters
}

function WorkoutExerciseItem({
  exercise,
  exerciseIndex,
  isLastItem,
  isActive,
  completedSets,
  totalSets,
  previousWeight,
  canUndo,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUndo,
}: WorkoutExerciseItemProps) {
  const testIdExerciseName = normalizeExerciseNameForTestId(exercise.name);
  
  return (
    <Card
      key={exercise.id}
      data-test-id={`exercise-section-${testIdExerciseName}`}
      className={cn(
        "overflow-hidden",
        isActive && "border-primary border-2"
      )}
    >
      <CardHeader className="pb-2 pt-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg md:text-xl leading-tight truncate">
              {exercise.name}
            </CardTitle>
            {previousWeight && previousWeight > 0 ? (
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Última sesión: {previousWeight}kg
              </p>
            ) : null}
            {exercise.notes && (
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {exercise.notes}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={exerciseIndex === 0}
              className="h-8 w-8"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={isLastItem}
              className="h-8 w-8"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="text-sm sm:text-base px-3 py-1.5 sm:py-2">
            Serie {Math.min(completedSets + 1, totalSets)} de {totalSets}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="h-8">
            <Undo2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Deshacer</span>
          </Button>
        </div>

        {exercise.sets.map((set) => (
          <div
            key={set.id}
            data-test-id={`set-row-${set.setNumber}`}
            className={cn(
              "p-3 sm:p-4 space-y-3 sm:space-y-4 rounded-lg transition-colors",
              set.completed
                ? "bg-primary/10 border border-primary/20"
                : "bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-base sm:text-lg font-bold">Serie {set.setNumber}</div>
                {set.completed && (
                  <Badge variant="secondary" className="mt-1 text-xs" data-test-id="completed-set-indicator">
                    Completada
                  </Badge>
                )}
              </div>
              <Button
                variant={set.completed ? "secondary" : "default"}
                size="lg"
                onClick={() => onUpdateSet(set.id, { completed: !set.completed })}
                className="min-w-[80px] sm:w-24 h-12"
                data-test-id="complete-set-button"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="text-sm sm:text-base">{set.completed ? "Editar" : "Hecho"}</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-muted-foreground">
                  Peso (kg)
                </label>
                <NumberInputStepper
                  value={set.weightKg}
                  onChange={(value) => onUpdateSet(set.id, { weightKg: value })}
                  step={2.5}
                  min={0}
                  suffix="kg"
                  data-test-id="weight-input"
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-muted-foreground">
                  Reps
                </label>
                <NumberInputStepper
                  value={set.repsDone}
                  onChange={(value) => onUpdateSet(set.id, { repsDone: value })}
                  min={0}
                  suffix="reps"
                  data-test-id="reps-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:gap-3 pt-2">
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  RPE
                </label>
                <Select
                  value={set.rpe?.toString() || ""}
                  onValueChange={(value) =>
                    onUpdateSet(set.id, {
                      rpe: value ? Number.parseInt(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue placeholder="RPE" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((rpe) => (
                      <SelectItem key={rpe} value={rpe.toString()}>
                        {rpe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                variant="link"
                size="sm"
                className="text-destructive h-8 text-xs sm:text-sm"
                onClick={() => onRemoveSet(set.id)}
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Eliminar serie</span>
                <span className="sm:hidden">Eliminar</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pb-3 sm:pb-4">
        <Button variant="outline" size="sm" onClick={onAddSet} className="h-10">
          <Plus className="w-4 h-4 mr-1" />
          Agregar serie
        </Button>
      </CardFooter>
    </Card>
  );
}

export default WorkoutExerciseItem;
