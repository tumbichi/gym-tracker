'use client';

import { useState, useEffect } from 'react';
import { getRoutineById, getAllExercises } from "@modules/routines/actions/routines.actions";
import RoutineEditor from "@modules/routines/features/routine-editor.feature";
import type { Exercise } from '@prisma/client';

// Helper to get initial data
async function getInitialData(routineId: number) {
  const routine = await getRoutineById(routineId);
  const exercises = await getAllExercises();
  return { routine, exercises };
}

export default function RoutineDetailPage({ params }: { params: { id: string } }) {
  const [routine, setRoutine] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const routineId = Number.parseInt(params.id);
    if (isNaN(routineId)) return;

    getInitialData(routineId).then(data => {
      setRoutine(data.routine);
      setExercises(data.exercises);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return <div>Cargando...</div>; // Replace with a proper loader
  }

  // For now, we directly render the editor. We can switch between detail and editor later.
  return <RoutineEditor routine={routine} allExercises={exercises} onExercisesUpdate={setExercises} />;
}