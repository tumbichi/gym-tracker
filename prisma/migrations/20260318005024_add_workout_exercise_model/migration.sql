/*
  Warnings:

  - You are about to drop the column `sessionId` on the `SetEntry` table. All the data in the column will be lost.
  - Added the required column `workoutExerciseId` to the `SetEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SetEntry" DROP CONSTRAINT "SetEntry_sessionId_fkey";

-- AlterTable
ALTER TABLE "public"."SetEntry" DROP COLUMN "sessionId",
ADD COLUMN     "workoutExerciseId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."WorkoutExercise" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutExercise_sessionId_idx" ON "public"."WorkoutExercise"("sessionId");

-- CreateIndex
CREATE INDEX "WorkoutExercise_sessionId_order_idx" ON "public"."WorkoutExercise"("sessionId", "order");

-- CreateIndex
CREATE INDEX "SetEntry_workoutExerciseId_idx" ON "public"."SetEntry"("workoutExerciseId");

-- AddForeignKey
ALTER TABLE "public"."WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SetEntry" ADD CONSTRAINT "SetEntry_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "public"."WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
