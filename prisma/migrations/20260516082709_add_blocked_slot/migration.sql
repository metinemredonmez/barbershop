-- CreateTable
CREATE TABLE "BlockedSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'break',
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "BlockedSlot_startAt_idx" ON "BlockedSlot"("startAt");

-- CreateIndex
CREATE INDEX "BlockedSlot_endAt_idx" ON "BlockedSlot"("endAt");
