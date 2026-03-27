import { useContext } from 'react'
import WorkoutSessionContext from '..'

function useWorkoutSessionContext() {
  const context = useContext(WorkoutSessionContext)

  if (context === undefined) {
    throw new Error(
      'useWorkoutSessionContext must be used within a WorkoutSessionProvider'
    )
  }

  return context
}
export default useWorkoutSessionContext
