"use client";

import React from "react";
import { Button } from "./button";
import { Input, type InputProps } from "./input";
import { Minus, Plus } from "lucide-react";

interface NumberInputStepperProps extends Omit<InputProps, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

import { cn } from "@core/lib/utils";

interface NumberInputStepperProps extends Omit<InputProps, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}

export const NumberInputStepper = React.forwardRef<HTMLInputElement, NumberInputStepperProps>(
  ({ value, onChange, step = 1, min, max, suffix, ...props }, ref) => {
    const handleStep = (direction: "up" | "down") => {
      let newValue = value + (direction === "up" ? step : -step);
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);
      onChange(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = e.target.value === "" ? min || 0 : Number.parseFloat(e.target.value);
      if (!Number.isNaN(num)) {
        onChange(num);
      }
    };

    return (
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleStep("down")}
          className="p-0 w-10 h-11 shrink-0"
          disabled={min !== undefined && value <= min}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="relative w-full">
          <Input
            ref={ref}
            type="number"
            value={value}
            onChange={handleChange}
            className={cn("h-11 text-center", suffix && "pr-12")}
            step={step}
            min={min}
            max={max}
            {...props}
          />
          {suffix && (
            <span className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">{suffix}</span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleStep("up")}
          className="p-0 w-10 h-11 shrink-0"
          disabled={max !== undefined && value >= max}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    );
  }
);

NumberInputStepper.displayName = "NumberInputStepper";
