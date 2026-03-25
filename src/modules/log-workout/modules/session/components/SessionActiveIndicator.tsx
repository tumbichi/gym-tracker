"use client";

import { useEffect, useState } from "react";
import { Badge } from "@core/components/ui/badge";
import { Dumbbell } from "lucide-react";
import { loadDraftSession } from "@modules/log-workout/modules/session/utils/draft-session-storage";

export function SessionActiveIndicator() {
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    // Check initially
    const draft = loadDraftSession();
    setHasActiveSession(!!draft);

    // Poll for changes (needed because this component is outside the workout session page)
    const interval = setInterval(() => {
      const currentDraft = loadDraftSession();
      setHasActiveSession(!!currentDraft);
    }, 1000);

    // Listen for storage events (fires when localStorage changes in other tabs/pages)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gym-tracker:draft-session") {
        setHasActiveSession(!!e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!hasActiveSession) {
    return null;
  }

  return (
    <Badge variant="default" className="animate-pulse ml-auto">
      <Dumbbell className="w-3 h-3 mr-1" />
      Activa
    </Badge>
  );
}
