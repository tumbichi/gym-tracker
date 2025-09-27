'use client';

import { RecentSession, Routine } from "@modules/log-workout/actions/log-workout.actions";
import FreeWorkout from "../components/FreeWorkout";
import RecentSessions from "../components/RecentSessions";
import RoutineSelector from "../components/RoutineSelector";
import TodaysWorkout from "../components/TodaysWorkout";

interface WorkoutDashboardProps {
  routines: Routine[];
  recentSessions: RecentSession[];
}

export default function WorkoutDashboard({ routines, recentSessions }: WorkoutDashboardProps) {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Entrenamiento</h2>
        <p className="text-muted-foreground">Elige una rutina programada o crea una sesión libre</p>
      </div>

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
