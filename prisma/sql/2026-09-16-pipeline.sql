-- Casements CRM — pipeline discipline migration
-- Generated 2026-09-16 from prisma/schema.prisma.
--
-- PURELY ADDITIVE. Every statement is ADD COLUMN / ADD VALUE / CREATE INDEX /
-- ADD FOREIGN KEY. Nothing is dropped, no column is altered, and no existing
-- lead row is rewritten. Existing leads keep every value they hold and simply
-- gain empty pipeline fields, which the CRM then surfaces as 'needs attention'.
--
-- Apply with either:
--   npx prisma db push          (Prisma applies the same changes)
--   psql $DATABASE_URL -f prisma/sql/2026-09-16-pipeline.sql

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE_FORM', 'WEBSITE_CHAT', 'PHONE_CALL', 'WHATSAPP', 'WALK_IN', 'REFERRAL', 'REPEAT_CLIENT', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'EXHIBITION', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadStatus" ADD VALUE 'QUALIFIED';
ALTER TYPE "LeadStatus" ADD VALUE 'DISQUALIFIED';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "actorId" TEXT,
ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "outcome" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "contactAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dealValue" BIGINT,
ADD COLUMN     "duplicateOfId" TEXT,
ADD COLUMN     "firstResponseAt" TIMESTAMP(3),
ADD COLUMN     "lastContactedAt" TIMESTAMP(3),
ADD COLUMN     "lossDetail" TEXT,
ADD COLUMN     "lossReason" TEXT,
ADD COLUMN     "nextAction" TEXT,
ADD COLUMN     "nextActionDate" TIMESTAMP(3),
ADD COLUMN     "qualBudget" TEXT,
ADD COLUMN     "qualDecision" TEXT,
ADD COLUMN     "qualLocation" TEXT,
ADD COLUMN     "qualNeed" TEXT,
ADD COLUMN     "qualUrgency" TEXT,
ADD COLUMN     "qualifiedAt" TIMESTAMP(3),
ADD COLUMN     "qualifiedById" TEXT,
ADD COLUMN     "quotationRef" TEXT,
ADD COLUMN     "quotationUrl" TEXT,
ADD COLUMN     "quotedAt" TIMESTAMP(3),
ADD COLUMN     "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE_FORM',
ADD COLUMN     "sourceDetail" TEXT,
ADD COLUMN     "wonAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Activity_leadId_createdAt_idx" ON "Activity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "Lead_nextActionDate_idx" ON "Lead"("nextActionDate");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

