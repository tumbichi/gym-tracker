import { useEffect, useState } from 'react'

const useTimer = () => {
  const [isActive, setIsActive] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startDate, setStartDate] = useState<Date | null>(null)

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && startDate) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startDate.getTime())
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, startDate])

  const start = (startTime: Date) => {
    setIsActive(true)
    setStartDate(startTime)
  }

  const reset = () => setElapsedTime(0)

  return { elapsedTime, isActive, startDate, reset, start }
}

export type UseTimerReturn = ReturnType<typeof useTimer>

export default useTimer
