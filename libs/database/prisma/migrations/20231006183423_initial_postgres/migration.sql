-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "mail" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessData" (
    "id" TEXT NOT NULL,
    "ftp" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FitnessData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SteadyWorkoutPart" (
    "index" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "power" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_mail_key" ON "User"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessData_userId_key" ON "FitnessData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SteadyWorkoutPart_index_workoutId_key" ON "SteadyWorkoutPart"("index", "workoutId");

-- AddForeignKey
ALTER TABLE "FitnessData" ADD CONSTRAINT "FitnessData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteadyWorkoutPart" ADD CONSTRAINT "SteadyWorkoutPart_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
