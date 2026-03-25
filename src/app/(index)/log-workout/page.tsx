import {
  getRoutines,
  getRecentSessions,
} from '@modules/log-workout/actions/log-workout.actions'
import WorkoutDashboard from '@modules/log-workout/features/workout-dashboard.feature'

export default async function LogWorkoutPage() {
  const routines = await getRoutines()
  const recentSessions = await getRecentSessions()

  return (
    <WorkoutDashboard routines={routines} recentSessions={recentSessions} />
  )
}
