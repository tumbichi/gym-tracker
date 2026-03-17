/*
  Warnings:

  - You are about to alter the column `name` on the `Routine` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `RoutineDay` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the column `targetWeight` on the `RoutineExercise` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Routine` table without a default value. This is not possible if the table is not empty.

*/
-- Migrar reps de formato string a JSON array
UPDATE "RoutineExercise"
SET reps = CASE
  WHEN reps LIKE '[%' THEN reps
  WHEN reps LIKE '%-%' THEN '[' || REPLACE(reps, '-', ',') || ']'
  WHEN reps ~ '^\d+$' THEN '[' || ARRAY_TO_STRING(ARRAY_FILL(reps::int, ARRAY[series]), ',') || ']'
  ELSE '[0]'
END;

-- Sincronizar series con la longitud real del array
UPDATE "RoutineExercise"
SET series = JSONB_ARRAY_LENGTH(reps::jsonb)
WHERE reps LIKE '[%';

-- DropForeignKey
ALTER TABLE "public"."RoutineDay" DROP CONSTRAINT "RoutineDay_routineId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoutineExercise" DROP CONSTRAINT "RoutineExercise_routineDayId_fkey";

-- AlterTable
ALTER TABLE "public"."Routine" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."RoutineDay" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."RoutineExercise" DROP COLUMN "targetWeight";

-- CreateIndex
CREATE INDEX "Routine_userId_idx" ON "public"."Routine"("userId");

-- CreateIndex
CREATE INDEX "Routine_userId_archivedAt_idx" ON "public"."Routine"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "RoutineDay_routineId_idx" ON "public"."RoutineDay"("routineId");

-- CreateIndex
CREATE INDEX "RoutineExercise_routineDayId_idx" ON "public"."RoutineExercise"("routineDayId");

-- AddForeignKey
ALTER TABLE "public"."RoutineDay" ADD CONSTRAINT "RoutineDay_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "public"."Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoutineExercise" ADD CONSTRAINT "RoutineExercise_routineDayId_fkey" FOREIGN KEY ("routineDayId") REFERENCES "public"."RoutineDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
