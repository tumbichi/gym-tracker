'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/components/ui/card";
import { WorkoutSelector } from "@core/components/workout-selector";

export default function FreeWorkout() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrenamiento Libre</CardTitle>
        <CardDescription>Crea una sesión personalizada sin rutina</CardDescription>
      </CardHeader>
      <CardContent>
        <WorkoutSelector buttonText="Comenzar Sesión Libre" variant="outline" className="w-full bg-transparent" />
      </CardContent>
    </Card>
  );
}
