import Header from "@core/components/header";
import { Dumbbell } from "lucide-react";
import React, { PropsWithChildren } from "react";

function RoutineDetailLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header icon={Dumbbell} title="Rutina" />
      {children}
    </>
  );
}

export default RoutineDetailLayout;
