'use client'

import React from 'react'
import { Input } from './input'
import { Button } from './button'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@core/lib/utils'

// Omit onChange from the standard input attributes to avoid conflict
interface NumberInputStepperProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export const NumberInputStepper = React.forwardRef<
  HTMLInputElement,
  NumberInputStepperProps
>(({ value, onChange, step = 1, min, max, suffix, ...props }, ref) => {
  const handleStep = (direction: 'up' | 'down') => {
    let newValue = value + (direction === 'up' ? step : -step)
    if (min !== undefined) newValue = Math.max(min, newValue)
    if (max !== undefined) newValue = Math.min(max, newValue)
    onChange(newValue)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num =
      e.target.value === '' ? min || 0 : Number.parseFloat(e.target.value)
    if (!Number.isNaN(num)) {
      onChange(num)
    }
  }

  return (
    <div className='flex items-center gap-1'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => handleStep('down')}
        className='h-11 w-10 shrink-0 p-0'
        disabled={min !== undefined && value <= min}
      >
        <Minus className='h-4 w-4' />
      </Button>
      <div className='relative w-full'>
        <Input
          ref={ref}
          type='number'
          value={value}
          onChange={handleChange}
          className={cn('h-11 text-center', suffix && 'pr-12')}
          step={step}
          min={min}
          max={max}
          {...props}
        />
        {suffix && (
          <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
            {suffix}
          </span>
        )}
      </div>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => handleStep('up')}
        className='h-11 w-10 shrink-0 p-0'
        disabled={max !== undefined && value >= max}
      >
        <Plus className='h-4 w-4' />
      </Button>
    </div>
  )
})

NumberInputStepper.displayName = 'NumberInputStepper'
