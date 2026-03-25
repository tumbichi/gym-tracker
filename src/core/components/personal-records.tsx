import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/components/ui/card"
import { Badge } from "@core/components/ui/badge"
import { Trophy, TrendingUp, Calendar } from "lucide-react"
import { prisma } from "@core/lib/prisma"
import { SetEntry, Exercise, WorkoutExercise, WorkoutSession } from "@prisma/client"

type SetEntryWithRelations = SetEntry & {
  exercise: Exercise;
  workoutExercise: WorkoutExercise & {
    session: WorkoutSession;
  };
}

async function getPersonalRecords() {
  const setEntries = await prisma.setEntry.findMany({
    include: {
      exercise: true,
      workoutExercise: {
        include: {
          session: true,
        },
      },
    },
  })

  const recordsByExercise: { [key: number]: SetEntryWithRelations } = {}

  for (const entry of setEntries) {
    if (!recordsByExercise[entry.exerciseId]) {
      recordsByExercise[entry.exerciseId] = entry as SetEntryWithRelations
      continue
    }

    const currentRecord = recordsByExercise[entry.exerciseId]

    if (entry.weightKg > currentRecord.weightKg) {
      recordsByExercise[entry.exerciseId] = entry as SetEntryWithRelations
    } else if (entry.weightKg === 0 && entry.repsDone > currentRecord.repsDone) {
      recordsByExercise[entry.exerciseId] = entry as SetEntryWithRelations
    }
  }

  const records = Object.values(recordsByExercise).map((record: SetEntryWithRelations) => {
    const improvement = "+5kg"
    const isRecent = record.workoutExercise?.session?.date 
      ? new Date(record.workoutExercise.session.date).getTime() > new Date().getTime() - 30 * 24 * 60 * 60 * 1000
      : false

    return {
      exercise: record.exercise.name,
      weight: record.weightKg,
      reps: record.repsDone,
      date: record.workoutExercise?.session?.date?.toISOString() ?? new Date().toISOString(),
      improvement,
      isRecent,
    }
  })

  return records
}

export async function PersonalRecords() {
  const records = await getPersonalRecords()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Records Personales
        </CardTitle>
        <CardDescription>Tus mejores marcas en cada ejercicio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div key={record.exercise} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">{record.exercise}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {record.weight > 0 ? `${record.weight} kg` : ""} {record.reps} rep{record.reps > 1 ? "s" : ""}
                  </span>
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(record.date).toLocaleDateString("es-ES")}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {record.isRecent && <Badge variant="secondary">Nuevo</Badge>}
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>{record.improvement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
