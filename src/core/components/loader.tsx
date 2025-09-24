import { Activity } from "lucide-react";
import React from "react";

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {/* Animate lucide-react icon with tailwind */}
      <Activity className="w-6 h-6 animate-pulse" />
      <p className="text-sm">Cargando</p>
    </div>
  );
}

export default Loader;
