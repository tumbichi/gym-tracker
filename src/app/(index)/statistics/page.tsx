import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/components/ui/select";
import { Badge } from "@core/components/ui/badge";
import { BarChart3, TrendingUp, Award, Target } from "lucide-react";
import { ProgressChart } from "@core/components/progress-chart";
import { VolumeChart } from "@core/components/volume-chart";
import { PersonalRecords } from "@core/components/personal-records";
import { database } from "@core/lib/database";
import { prisma } from "@core/lib/prisma";

async function getWorkoutStats() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get workout sessions this week
  const weekSessions = await database.workoutSession.count({
    where: {
      date: {
        gte: startOfWeek,
      },
    },
  });

  // Get total volume this month
  const monthVolume = await database.setEntry.aggregate({
    where: {
      workoutSession: {
        date: {
          gte: startOfMonth,
        },
      },
    },
    _sum: {
      weightKg: true,
    },
  });

  // Get unique exercises count
  const uniqueExercises = await database.setEntry.groupBy({
    by: ["exerciseId"],
    where: {
      workoutSession: {
        date: {
          gte: startOfMonth,
        },
      },
    },
  });

  const sessions = await prisma.workoutSession.findMany({
    where: {
      date: {
        gte: startOfMonth,
      },
    },
  });

  const avgDuration =
    sessions.length > 0
      ? Math.round(sessions.reduce((sum, session) => sum + /* session.duration || */ 0, 0) / sessions.length)
      : 0;

  return {
    weekSessions,
    monthVolume: monthVolume._sum.weightKg || 0,
    uniqueExercises: uniqueExercises.length,
    avgDuration,
  };
}

async function getExercises() {
  return await database.exercise.findMany();
}

async function getMuscleGroupAnalysis() {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const muscleGroupData = await database.setEntry.findMany({
    where: {
      workoutSession: {
        date: {
          gte: startOfMonth,
        },
      },
    },
    include: {
      exercise: {
        select: {
          primaryGroup: true,
        },
      },
    },
  });

  const groupedData = muscleGroupData.reduce((acc, entry) => {
    const group = entry.exercise?.primaryGroup || "Otros";
    if (!acc[group]) {
      acc[group] = 0;
    }
    acc[group] += entry.weightKg * entry.repsDone;
    return acc;
  }, {} as Record<string, number>);

  const totalVolume = Object.values(groupedData).reduce((sum, volume) => sum + volume, 0);

  return Object.entries(groupedData)
    .map(([group, volume]) => ({
      group,
      volume: Math.round(volume),
      percentage: totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0,
    }))
    .sort((a, b) => b.volume - a.volume);
}

async function getRPETrends() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rpeData = await prisma.setEntry.findMany({
    where: {
      workoutSession: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      rpe: {
        not: null,
      },
    },
    include: {
      exercise: {
        select: {
          name: true,
        },
      },
      workoutSession: {
        select: {
          date: true,
        },
      },
    },
    orderBy: {
      workoutSession: {
        date: "desc",
      },
    },
  });

  const exerciseRPE = rpeData.reduce((acc, entry) => {
    const exerciseName = entry.exercise.name;
    if (!acc[exerciseName]) {
      acc[exerciseName] = [];
    }
    acc[exerciseName].push({
      rpe: entry.rpe!,
      date: entry.workoutSession.date,
    });
    return acc;
  }, {} as Record<string, Array<{ rpe: number; date: Date }>>);

  return Object.entries(exerciseRPE)
    .map(([exercise, rpeEntries]) => {
      const avgRPE = rpeEntries.reduce((sum, entry) => sum + entry.rpe, 0) / rpeEntries.length;

      // Calculate trend by comparing first half vs second half of data
      const midPoint = Math.floor(rpeEntries.length / 2);
      const firstHalf = rpeEntries.slice(0, midPoint);
      const secondHalf = rpeEntries.slice(midPoint);

      const firstHalfAvg =
        firstHalf.length > 0 ? firstHalf.reduce((sum, entry) => sum + entry.rpe, 0) / firstHalf.length : avgRPE;
      const secondHalfAvg =
        secondHalf.length > 0 ? secondHalf.reduce((sum, entry) => sum + entry.rpe, 0) / secondHalf.length : avgRPE;

      let trend: "up" | "down" | "stable" = "stable";
      if (secondHalfAvg > firstHalfAvg + 0.3) trend = "up";
      else if (secondHalfAvg < firstHalfAvg - 0.3) trend = "down";

      return {
        exercise,
        rpe: Number(avgRPE.toFixed(1)),
        trend,
      };
    })
    .sort((a, b) => b.rpe - a.rpe)
    .slice(0, 4); // Top 4 exercises by RPE
}

async function getWeeklyVolume() {
  const today = new Date();
  const eightWeeksAgo = new Date(today.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);

  const setEntries = await database.setEntry.findMany({
    where: {
      workoutSession: {
        date: {
          gte: eightWeeksAgo,
        },
      },
    },
    include: {
      workoutSession: true,
    },
  });

  const weeklyVolume: { [key: string]: number } = {};

  for (const entry of setEntries) {
    if (entry.workoutSession?.date) {
      const date = new Date(entry.workoutSession.date);
      const dayOfWeek = date.getDay();
      const weekStart = new Date(date.setDate(date.getDate() - dayOfWeek));
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyVolume[weekKey]) {
        weeklyVolume[weekKey] = 0;
      }
      weeklyVolume[weekKey] += entry.weightKg * entry.repsDone;
    }
  }

  const data = Object.entries(weeklyVolume)
    .map(([week, volume]) => ({
      week: new Date(week).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      volume: Math.round(volume),
    }))
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

  return data;
}

async function getExerciseProgress(exerciseSlug: string) {
  const setEntries = await prisma.setEntry.findMany({
    where: {
      exercise: {
        slug: exerciseSlug,
      },
    },
    include: {
      workoutSession: true,
      exercise: true,
    },
    orderBy: {
      workoutSession: {
        date: "asc",
      },
    },
  });

  const progressData: { [key: string]: number } = {};

  for (const entry of setEntries) {
    const date = new Date(entry.workoutSession.date).toISOString().split("T")[0];
    if (!progressData[date] || entry.weightKg > progressData[date]) {
      progressData[date] = entry.weightKg;
    }
  }

  const data = Object.entries(progressData).map(([date, weight]) => ({
    date,
    weight,
  }));

  return data;
}

export default async function StatisticsPage() {
  const stats = await getWorkoutStats();
  const exercises = await getExercises();
  const muscleGroupAnalysis = await getMuscleGroupAnalysis();
  const rpeTrends = await getRPETrends();
  const weeklyVolume = await getWeeklyVolume();
  const exerciseProgress = await getExerciseProgress(exercises[0]?.slug || "press-de-banca");

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Análisis de Progreso</h2>
          <p className="text-muted-foreground">Visualiza tu evolución y rendimiento en el gimnasio</p>
        </div>
        <Select defaultValue="3months">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Último mes</SelectItem>
            <SelectItem value="3months">Últimos 3 meses</SelectItem>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="1year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Entrenamientos esta semana</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.weekSessions >= 3 ? "+1 desde la semana pasada" : "Objetivo: 3 por semana"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Volumen total (kg)</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ejercicios únicos</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueExercises}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Duración promedio</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration} min</div>
            <p className="text-xs text-muted-foreground">Por sesión</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Ejercicio</CardTitle>
            <CardDescription>Evolución del peso máximo por ejercicio</CardDescription>
            <Select defaultValue={exercises[0]?.slug || "press-de-banca"}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exercises.slice(0, 5).map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.slug}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ProgressChart data={exerciseProgress} />
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Volumen Semanal</CardTitle>
            <CardDescription>Volumen total de entrenamiento por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeChart data={weeklyVolume} />
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      <PersonalRecords />

      {/* Detailed Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Grupo Muscular</CardTitle>
            <CardDescription>Distribución del volumen de entrenamiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {muscleGroupAnalysis.length > 0 ? (
                muscleGroupAnalysis.map((item) => (
                  <div key={item.group} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">{item.group}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{item.volume} kg</span>
                      <Badge variant="secondary">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay datos de volumen disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencias de RPE</CardTitle>
            <CardDescription>Esfuerzo percibido promedio por ejercicio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rpeTrends.length > 0 ? (
                rpeTrends.map((item) => (
                  <div key={item.exercise} className="flex items-center justify-between">
                    <span className="font-medium">{item.exercise}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">RPE {item.rpe}</Badge>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.trend === "up" ? "bg-red-500" : item.trend === "down" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay datos de RPE disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
