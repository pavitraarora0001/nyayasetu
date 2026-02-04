-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "analysis" TEXT NOT NULL,
    "caseId" TEXT,
    "category" TEXT,
    "priority" TEXT,
    "location" TEXT,
    "timestamp" DATETIME,
    "imageUrl" TEXT,
    "officerId" TEXT,
    "officerName" TEXT,
    "policeStation" TEXT,
    "firDraft" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Incident_caseId_key" ON "Incident"("caseId");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt");

-- CreateIndex
CREATE INDEX "Incident_category_idx" ON "Incident"("category");
