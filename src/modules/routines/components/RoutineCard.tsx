"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/components/ui/card";
import { cn } from "@core/lib/utils";
import { Button } from "@core/components/ui/button";
import { Badge } from "@core/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@core/components/ui/alert-dialog";
import { Edit, Trash2, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { Routine } from "@modules/routines/actions/routines.actions";
import RoutineEditor from "../features/routine-editor.feature";
import { toast } from "sonner";
import { useState } from "react";

interface RoutineCardProps {
  routine: Routine;
  allExercises: Exercise[];
  onDelete: (routineId: number) => void;
  onRoutineUpdated: (updatedRoutine: Routine) => void;
}

export default function RoutineCard({ routine, allExercises, onDelete, onRoutineUpdated }: RoutineCardProps) {
  console.log('RoutineCard rendering for:', routine.id, 'Name:', routine.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExiting, setIsExiting] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    // Start exit animation

    setIsExiting(true);

    // Wait for animation to finish before deleting from state

    setTimeout(async () => {
      try {
        await onDelete(routine.id);

        // No need to set isDeleting to false as the component will unmount
      } catch (error) {
        console.error("Failed to delete routine:", error);

        toast.error("No se pudo eliminar la rutina.");

        // If deletion fails, revert the animation state

        setIsExiting(false);

        setIsDeleting(false);
      }
    }, 300); // Duration should match the CSS transition
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",

        isExiting && "opacity-0 scale-95 h-0 p-0 m-0 border-0"
      )}
    >
      <Card key={routine.id} className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{routine.name}</CardTitle>

            <Badge variant="secondary">
              {routine.weeks} semana{routine.weeks > 1 ? "s" : ""}
            </Badge>
          </div>

          <CardDescription>{routine.days.filter((day) => day.items.length > 0).length} días activos</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Days Preview */}

          <div className="space-y-2">
            {routine.days.slice(0, 3).map((day) => (
              <div key={day.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{day.name}</span>

                <span className="text-muted-foreground">
                  {day.items.length} ejercicio{day.items.length !== 1 ? "s" : ""}
                </span>
              </div>
            ))}

            {routine.days.length > 3 && (
              <div className="text-sm text-muted-foreground">+{routine.days.length - 3} días más...</div>
            )}
          </div>

          {/* Actions */}

          <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href={`/routines/${routine.id}`}>
                <Play className="h-4 w-4 mr-2" />
                Ver Rutina
              </Link>
            </Button>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Rutina</DialogTitle>

                  <DialogDescription>Modifica tu rutina de entrenamiento</DialogDescription>
                </DialogHeader>

                <RoutineEditor
                  routine={routine}
                  allExercises={allExercises}
                                    onExercisesUpdate={() => { /* No update needed here for exercises */ }}
                                    onFormSubmitSuccess={handleEditSuccess}
                                    onRoutineUpdated={onRoutineUpdated} // Pass the new prop
                                  />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive bg-transparent hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>

                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente la rutina y todos sus datos
                    asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>

                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

                    {isDeleting ? "Eliminando..." : "Continuar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
