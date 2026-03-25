'use client';

import { useEffect, useState } from "react";
import { RecentSession, Routine } from "@modules/log-workout/actions/log-workout.actions";
import FreeWorkout from "../components/FreeWorkout";
import RecentSessions from "../components/RecentSessions";
import RoutineSelector from "../components/RoutineSelector";
import TodaysWorkout from "../components/TodaysWorkout";
import { loadDraftSession } from "../modules/session/utils/draft-session-storage";
import { Button } from "@core/components/ui/button";
import { Play, Clock } from "lucide-react";
import formatTime from "@core/lib/utils/formatters/formatTime";

interface WorkoutDashboardProps {
  routines: Routine[];
  recentSessions: RecentSession[];
}

export default function WorkoutDashboard({ routines, recentSessions }: WorkoutDashboardProps) {
  const [draft, setDraft] = useState<ReturnType<typeof loadDraftSession>>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const loadedDraft = loadDraftSession();
    setDraft(loadedDraft);
    
    // Calculate initial elapsed time from draft's startDate
    if (loadedDraft?.timer?.startDate) {
      const startTime = new Date(loadedDraft.timer.startDate).getTime();
      setElapsedTime(Date.now() - startTime);
    }
  }, []);

  // Update timer every second
  useEffect(() => {
    const startDate = draft?.timer?.startDate;
    if (!startDate) return;
    
    const interval = setInterval(() => {
      const startTime = new Date(startDate).getTime();
      setElapsedTime(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [draft]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Entrenamiento</h2>
        <p className="text-muted-foreground">Elige una rutina programada o crea una sesión libre</p>
      </div>

      {/* Resume Active Session Button */}
      {draft && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium">Sesión Activa Detectada</p>
              <p className="text-sm text-muted-foreground">
                Tienes un entrenamiento sin completar
              </p>
              {draft.timer?.startDate && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(elapsedTime)}</span>
                </div>
              )}
            </div>
            <Button asChild size="lg" className="min-w-[200px]">
              <a href="/log-workout/session?recover=true">
                <Play className="w-4 h-4 mr-2" />
                Reanudar Sesión Activa
              </a>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TodaysWorkout routines={routines} />
          <RoutineSelector routines={routines} />
          <FreeWorkout />
        </div>

        <div className="space-y-6">
          <RecentSessions sessions={recentSessions} />
        </div>
      </div>
    </div>
  );
}
