'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ExerciseCard, DuplicateCheckResult } from '../types'

/**
 * Hook for debounced exercise search
 * Note: Requires searchExercises server action
 */
export function useExerciseSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<ExerciseCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce the query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debounceMs])

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Dynamic import to avoid SSR issues
        const { searchExercises } = await import('../actions/exercises.actions')
        const data = await searchExercises(debouncedQuery)
        setResults(data)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to search exercises')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  return {
    query,
    setQuery,
    results,
    isLoading,
    isError: !!error,
    error,
  }
}

/**
 * Hook for duplicate detection during exercise creation
 * Note: Requires checkDuplicateExercise server action
 */
export function useDuplicateDetection(debounceMs: number = 500) {
  const [name, setName] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult>({
    isDuplicate: false,
    similarity: 0,
  })
  const [isChecking, setIsChecking] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce the name
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedName(name)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [name, debounceMs])

  // Check for duplicates when debounced name changes
  useEffect(() => {
    const checkDuplicate = async () => {
      if (debouncedName.length < 3) {
        setDuplicateCheck({ isDuplicate: false, similarity: 0 })
        return
      }

      try {
        setIsChecking(true)

        // Dynamic import to avoid SSR issues
        const { checkDuplicateExercise } =
          await import('../actions/exercises.actions')
        const result = await checkDuplicateExercise(debouncedName)
        setDuplicateCheck(result)
      } catch {
        // Silently fail - duplicate check is not critical
        setDuplicateCheck({ isDuplicate: false, similarity: 0 })
      } finally {
        setIsChecking(false)
      }
    }

    checkDuplicate()
  }, [debouncedName])

  return {
    name,
    setName,
    duplicateCheck,
    isChecking,
  }
}
