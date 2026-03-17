"use client";

import { useEffect, useState } from "react";
import { getRoutineById, getAllExercises } from "@modules/routines/actions/routines.actions";
import RoutineEditorFeature from "@modules/routines/features/routine-editor.feature";
import { Button } from "@core/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";

export default function EditRoutinePage({ params }: { params: { id: string } }) {
  const [routine, setRoutine] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const routineId = Number.parseInt(params.id);
        if (isNaN(routineId)) {
          router.push("/not-found");
          return;
        }

        const [fetchedRoutine, allExercises] = await Promise.all([
          getRoutineById(routineId),
          getAllExercises(),
        ]);

        if (!fetchedRoutine) {
          router.push("/not-found");
          return;
        }

        setRoutine(fetchedRoutine);
        setExercises(allExercises);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <Link href={`/routines/${routine.id}`}>
            <Button variant="ghost" size="sm" className="h-9 px-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Editar Rutina</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <RoutineEditorFeature
          routine={routine}
          exercises={exercises}
          onSaved={(updatedRoutine) => {
            // Redirect to the routine detail page
            router.push(`/routines/${updatedRoutine.id}`);
          }}
          onCancel={() => {
            router.push(`/routines/${routine.id}`);
          }}
          onExerciseCreated={() => {
            // Refresh exercises list if needed
          }}
        />
      </div>
    </div>
  );
}