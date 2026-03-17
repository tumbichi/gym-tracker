"use client";

import * as React from "react";
import { AlertCircle, ArrowDown, ArrowUp, MoreVertical, Trash2 } from "lucide-react";

import { Button } from "@core/components/ui/button";
import { Input } from "@core/components/ui/input";
import { NumberInputStepper } from "@core/components/ui/number-input-stepper";
import { ExercisePicker } from "./ExercisePicker";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@core/components/ui/collapsible";
import type { Exercise } from "@prisma/client";
import type { CreateExerciseData } from "@modules/routines/types";
import { cn } from "@core/lib/utils";

// Tipos locales según RFC hasta que `types/index.ts` esté disponible
interface ExerciseFormItem {
  exerciseId: number | null;
  order: number;
  series: number;
  repsPerSet: number[];
  notes: string;
}

interface ExerciseRowProps {
  item: ExerciseFormItem;
  itemIndex: number;
  isFirst: boolean;
  isLast: boolean;
  exercises: Exercise[];
  onExerciseSelect: (exerciseId: number) => void;
  onSeriesChange: (series: number) => void;
  onRepChange: (setIndex: number, reps: number) => void;
  onNotesChange: (notes: string) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onCreateExercise: (data: CreateExerciseData) => void;
}

export default function ExerciseRow({
  item,
  itemIndex,
  isFirst,
  isLast,
  exercises,
  onExerciseSelect,
  onSeriesChange,
  onRepChange,
  onNotesChange,
  onRemove,
  onMove,
  onCreateExercise,
}: ExerciseRowProps) {
  const [isMoving, setIsMoving] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showNotes, setShowNotes] = React.useState(!!item.notes);
  
  const handleMove = (direction: "up" | "down") => {
    setIsMoving(true);
    onMove(direction);
    // Reset animation state after a short delay
    setTimeout(() => setIsMoving(false), 300);
  };
  
  // Auto-open advanced settings if there are different reps per set
  React.useEffect(() => {
    if (item.repsPerSet.length > 1) {
      const firstRep = item.repsPerSet[0];
      const allSame = item.repsPerSet.every(rep => rep === firstRep);
      if (!allSame) {
        setShowAdvanced(true);
      }
    }
  }, [item.repsPerSet]);

  return (
    <div className={cn(
      "border rounded-lg divide-y transition-all duration-300",
      isMoving && "bg-primary/10"
    )}>
      {/* Header: Exercise Picker + Actions */}
      <div className="p-3 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <ExercisePicker
              exercises={exercises}
              value={item.exerciseId}
              onSelect={onExerciseSelect}
              onCreate={onCreateExercise}
            />
            {item.exerciseId === null && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-destructive">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => handleMove("up")} 
              disabled={isFirst}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Subir
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleMove("down")} 
              disabled={isLast}
              className="flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              Bajar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onRemove} 
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Basic Configuration: Series + Reps */}
      <div className="p-3 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Series:</span>
          <NumberInputStepper
            value={item.series}
            onChange={onSeriesChange}
            min={1}
            max={10}
            className="h-11 w-32"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Reps:</span>
          <NumberInputStepper
            value={item.repsPerSet[0]}
            onChange={(newReps) => {
              // Update all sets to the same value
              onRepChange(0, newReps);
              for (let i = 1; i < item.repsPerSet.length; i++) {
                onRepChange(i, newReps);
              }
            }}
            min={1}
            max={50}
            className="h-11 w-32"
          />
        </div>
      </div>
      
      {/* Advanced Configuration: Reps per Set */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/50">
          <span>Configurar reps por serie</span>
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-transform", showAdvanced && "rotate-180")}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 pt-0 space-y-2">
          {item.repsPerSet.map((reps, setIndex) => (
            <div key={setIndex} className="flex items-center gap-2">
              <span className="text-sm w-16">Serie {setIndex + 1}:</span>
              <NumberInputStepper
                value={reps}
                onChange={(newReps) => onRepChange(setIndex, newReps)}
                min={1}
                max={50}
                className="h-11 w-32"
              />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Notes */}
      <Collapsible open={showNotes} onOpenChange={setShowNotes}>
        <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/50">
          <span>Notas {item.notes && "(1)"}</span>
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-transform", showNotes && "rotate-180")}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 pt-0">
          <Input
            placeholder="Ej: Pausa de 2 seg en el fondo"
            value={item.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            maxLength={500}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
