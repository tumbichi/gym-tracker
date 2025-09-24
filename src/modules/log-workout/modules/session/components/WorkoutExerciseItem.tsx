import { Badge } from "@core/components/ui/badge";
import { Button } from "@core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/components/ui/card";
import { Input } from "@core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/components/ui/select";
import { WorkoutExercise } from "@core/types";
import { ArrowUp, ArrowDown, Trash2, Check, X, Minus, Plus } from "lucide-react";
import React from "react";
import { useWorkoutSessionActions } from "../contexts/WorkoutSessionContext";

interface WorkoutExerciseItemProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  isLastItem?: boolean;
}

function WorkoutExerciseItem({ exercise, exerciseIndex, isLastItem }: WorkoutExerciseItemProps) {
  const { adjustReps, adjustWeight, moveExercise, removeExercise, updateSet } = useWorkoutSessionActions();

  return (
    <Card key={exercise.id} className="overflow-hidden border-primary border-2">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-xl leading-tight">{exercise.name}</CardTitle>
            {exercise.notes && <p className="mt-1 text-sm text-muted-foreground">{exercise.notes}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0">
              {exercise.sets.filter((s) => s.completed).length}/{exercise.sets.length}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveExercise(exerciseIndex, "up")}
              disabled={true}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveExercise(exerciseIndex, "down")}
              disabled={isLastItem}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeExercise(exercise.id)}
              className="w-8 h-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {exercise.sets.map((set) => (
          <div key={set.id} className="p-4 space-y-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">Serie {set.setNumber}</div>
                {set.targetWeight && (
                  <div className="text-sm text-muted-foreground">
                    Objetivo: {set.targetReps} @ {set.targetWeight}kg
                  </div>
                )}
              </div>
              <Button
                variant={set.completed ? "default" : "outline"}
                size="lg"
                onClick={() => updateSet(exercise.id, set.id, { completed: !set.completed })}
                className="w-12 h-12 p-0"
              >
                {set.completed ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-muted-foreground">Peso (kg)</label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustWeight(exercise.id, set.id, -2.5)}
                    className="p-0 text-lg font-bold h-14 w-14 shrink-0"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      step="0.5"
                      value={set.weightKg}
                      onChange={(e) =>
                        updateSet(exercise.id, set.id, {
                          weightKg: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-2xl font-bold text-center border-2 h-14 bg-background"
                    />
                    <span className="absolute text-sm font-normal -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                      kg
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustWeight(exercise.id, set.id, 2.5)}
                    className="p-0 text-lg font-bold h-14 w-14 shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-muted-foreground">Repeticiones</label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustReps(exercise.id, set.id, -1)}
                    className="p-0 text-lg font-bold h-14 w-14 shrink-0"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={set.repsDone}
                      onChange={(e) =>
                        updateSet(exercise.id, set.id, {
                          repsDone: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-2xl font-bold text-center border-2 h-14 bg-background"
                    />
                    <span className="absolute text-sm font-normal -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                      reps
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustReps(exercise.id, set.id, 1)}
                    className="p-0 text-lg font-bold h-14 w-14 shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">RPE</label>
                <Select
                  value={set.rpe?.toString() || ""}
                  onValueChange={(value) =>
                    updateSet(exercise.id, set.id, {
                      rpe: value ? Number.parseInt(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-12 text-lg">
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

              <div>
                <label className="text-sm font-medium text-muted-foreground">Notas</label>
                <Input
                  placeholder="Notas..."
                  value={set.notes || ""}
                  onChange={(e) => updateSet(exercise.id, set.id, { notes: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default WorkoutExerciseItem;
