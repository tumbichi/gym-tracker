"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/components/ui/alert-dialog";
import { DraftSession } from "../types/draft-session";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface DraftRecoveryModalProps {
  draft: DraftSession | null;
  onRecover: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryModal({
  draft,
  onRecover,
  onDiscard,
}: DraftRecoveryModalProps) {
  if (!draft) {
    return null;
  }

  const completedExercises = draft.exercises.filter(
    (ex) => ex.sets.every((s) => s.completed)
  ).length;
  const totalExercises = draft.exercises.length;

  return (
    <AlertDialog open={!!draft}>
      <AlertDialogContent data-test-id="draft-modal">
        <AlertDialogHeader>
          <AlertDialogTitle>Borrador de sesión encontrado</AlertDialogTitle>
          <AlertDialogDescription>
            Detectamos una sesión de entrenamiento sin finalizar que comenzaste{" "}
            {formatDistanceToNow(new Date(draft.createdAt), {
              addSuffix: true,
              locale: es,
            })}
            .
            <div className="mt-4 text-sm text-foreground">
              <p>
                <strong>Rutina:</strong>{" "}
                {draft.source.routineDayName || "Entrenamiento libre"}
              </p>
              <p>
                <strong>Progreso:</strong> {completedExercises} de {totalExercises}{" "}
                ejercicios completados.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" onClick={onDiscard}>Descartar e iniciar nueva</AlertDialogCancel>
          <AlertDialogAction onClick={onRecover}>Continuar borrador</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
