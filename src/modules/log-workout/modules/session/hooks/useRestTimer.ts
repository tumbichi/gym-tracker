import { useEffect, useState } from 'react'

export type UseRestTimerReturn = {
  restTimer: number
  isResting: boolean
  start: () => void
  stop: () => void
}

const useRestTimer = (): UseRestTimerReturn => {
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restStartTime, setRestStartTime] = useState<Date | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - restStartTime.getTime()
        setRestTimer(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restStartTime])

  const start = () => {
    setIsResting(true)
    setRestStartTime(new Date())
    setRestTimer(0)
  }

  const stop = () => {
    setIsResting(false)
    setRestStartTime(null)
    setRestTimer(0)
  }

  return { restTimer, isResting, start, stop }
}

export default useRestTimer
