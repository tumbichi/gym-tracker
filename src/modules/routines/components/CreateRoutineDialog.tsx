"use client";

import { Button } from "@core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/components/ui/dialog";
import { Plus } from "lucide-react";
import RoutineEditor from "../features/routine-editor.feature";
import { Exercise } from "@prisma/client";

import { useState } from "react";
import { Routine } from "@modules/routines/actions/routines.actions";

interface CreateRoutineDialogProps {
  allExercises: Exercise[];
  onExercisesUpdate: (exercises: Exercise[]) => void;
  onRoutineCreated: (newRoutine: Routine) => void;
}

export default function CreateRoutineDialog({
  allExercises,
  onExercisesUpdate,
  onRoutineCreated,
}: CreateRoutineDialogProps) {
  const [open, setOpen] = useState(false);

  const handleRoutineCreatedAndClose = (newRoutine: Routine) => {
    onRoutineCreated(newRoutine);
    setOpen(false);
  };

  const handleFormSubmitSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Rutina</DialogTitle>
          <DialogDescription>Diseña una rutina semanal completa con ejercicios para cada día</DialogDescription>
        </DialogHeader>
        <RoutineEditor 
          allExercises={allExercises} 
          onExercisesUpdate={onExercisesUpdate} 
          onRoutineCreated={handleRoutineCreatedAndClose} 
          onFormSubmitSuccess={handleFormSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
