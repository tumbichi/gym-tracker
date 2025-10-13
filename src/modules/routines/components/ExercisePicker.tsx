"use client";

import * as React from "react";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import { Button } from "@core/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@core/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@core/components/ui/dialog";

interface ExercisePickerProps {
  exercises: Exercise[];
  value: number | null;
  onSelect: (value: number) => void;
  onCreate: (name: string) => void;
}

export function ExercisePicker({ exercises, value, onSelect, onCreate }: ExercisePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedExercise = exercises.find((ex) => ex.id === value);

  const filteredExercises = search
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()))
    : exercises;

  const handleSelect = (exerciseId: number) => {
    onSelect(exerciseId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-11">
          {selectedExercise ? selectedExercise.name : "Seleccionar ejercicio"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Ejercicio</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Buscar ejercicio..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty asChild>
              {search ? (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  <p>No se encontró "{search}".</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => {
                      setOpen(false);
                      onCreate(search);
                    }}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Crear este ejercicio
                  </Button>
                </div>
              ) : (
                <div className="p-4 text-sm text-center text-muted-foreground">No hay ejercicios.</div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredExercises.map((exercise) => (
                <CommandItem key={exercise.id} value={exercise.name} onSelect={() => handleSelect(exercise.id)}>
                  {exercise.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
