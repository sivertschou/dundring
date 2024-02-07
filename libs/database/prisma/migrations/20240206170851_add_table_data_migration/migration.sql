-- CreateTable
CREATE TABLE "DataMigration" (
    "name" TEXT NOT NULL,
    "dateApplied" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DataMigration_name_key" ON "DataMigration"("name");
