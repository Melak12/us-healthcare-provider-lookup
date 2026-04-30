-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "lookups" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "queryType" TEXT NOT NULL,
    "npi" TEXT,
    "resultJson" JSONB,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lookups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lookups_queryType_idx" ON "lookups"("queryType");

-- CreateIndex
CREATE INDEX "lookups_timestamp_idx" ON "lookups"("timestamp");
