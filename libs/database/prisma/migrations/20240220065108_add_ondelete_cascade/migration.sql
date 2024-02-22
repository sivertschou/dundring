-- DropForeignKey
ALTER TABLE "FitnessData" DROP CONSTRAINT "FitnessData_userId_fkey";

-- DropForeignKey
ALTER TABLE "MailAuthentication" DROP CONSTRAINT "MailAuthentication_userId_fkey";

-- DropForeignKey
ALTER TABLE "SteadyWorkoutPart" DROP CONSTRAINT "SteadyWorkoutPart_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "StravaAuthentication" DROP CONSTRAINT "StravaAuthentication_userId_fkey";

-- DropForeignKey
ALTER TABLE "Workout" DROP CONSTRAINT "Workout_userId_fkey";

-- AddForeignKey
ALTER TABLE "FitnessData" ADD CONSTRAINT "FitnessData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteadyWorkoutPart" ADD CONSTRAINT "SteadyWorkoutPart_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailAuthentication" ADD CONSTRAINT "MailAuthentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StravaAuthentication" ADD CONSTRAINT "StravaAuthentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
