"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Exercise } from "@prisma/client";
import { Calendar, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@core/components/ui/button";
import { Card, CardContent } from "@core/components/ui/card";
import { deleteRoutine } from "@modules/routines/actions/routines.actions";
import type { Routine } from "@modules/routines/types";

import RoutineCard from "../components/RoutineCard";

interface RoutineListFeatureProps {
  initialRoutines: Routine[];
  initialExercises: Exercise[];
}

export default function RoutineListFeature({ initialRoutines, initialExercises }: RoutineListFeatureProps) {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (routineId: number) => {
    setDeletingId(routineId);
    try {
      const result = await deleteRoutine(routineId);
      if (result.deleted) {
        toast.success("Rutina eliminada correctamente.");
      } else if (result.archived) {
        toast.info("Rutina archivada. Tenía sesiones de entrenamiento asociadas.");
      }
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la rutina.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Rutinas</h1>
        <Button onClick={() => router.push("/routines/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Crear rutina
        </Button>
      </div>

      {routines.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onDelete={handleDelete}
              isDeleting={deletingId === routine.id}
            />
          ))}
        </div>
      ) : (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tenés rutinas creadas</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Creá tu primera rutina para empezar a organizar tus entrenamientos.
            </p>
            <Button onClick={() => router.push("/routines/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera rutina
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
