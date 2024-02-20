-- CreateTable
CREATE TABLE "StravaAuthentication" (
    "athleteId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "readScope" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "StravaAuthentication_athleteId_key" ON "StravaAuthentication"("athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "StravaAuthentication_userId_key" ON "StravaAuthentication"("userId");

-- AddForeignKey
ALTER TABLE "StravaAuthentication" ADD CONSTRAINT "StravaAuthentication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
