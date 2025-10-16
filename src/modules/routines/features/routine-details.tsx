'use client';

import { useState } from 'react';
import type { Exercise } from '@prisma/client';
import type { Routine } from '@modules/routines/actions/routines.actions';
import RoutineDetailsDisplay from '../components/routine-details-display';

interface RoutineDetailsProps {
  initialRoutine: Routine;
  initialExercises: Exercise[]; // Keep if needed for future editing, otherwise remove
}

export default function RoutineDetails({
  initialRoutine,
  initialExercises,
}: RoutineDetailsProps) {
  const [routine, setRoutine] = useState<Routine>(initialRoutine);
  // If you plan to add an edit button that switches to RoutineEditor, keep allExercises state.
  // For now, we'll keep it as it's passed down from the server.
  const [allExercises, setAllExercises] = useState<Exercise[]>(initialExercises);

  // Handlers for updating the routine or exercises if an edit mode is introduced later
  const handleRoutineUpdated = (updatedRoutine: Routine) => {
    setRoutine(updatedRoutine);
  };

  const handleExercisesUpdate = (updatedExercises: Exercise[]) => {
    setAllExercises(updatedExercises);
  };

  return (
    <div className="p-6">
      <RoutineDetailsDisplay routine={routine} />
      {/* Potentially add an edit button here that switches to a RoutineEditor component */}
    </div>
  );
}
