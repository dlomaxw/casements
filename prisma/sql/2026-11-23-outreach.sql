-- CreateTable
CREATE TABLE "OutreachEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Food',
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "location" TEXT,
    "happenedOn" TIMESTAMP(3) NOT NULL,
    "peopleReached" INTEGER NOT NULL DEFAULT 0,
    "items" JSONB,
    "image" TEXT NOT NULL,
    "gallery" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutreachEntry_published_happenedOn_idx" ON "OutreachEntry"("published", "happenedOn");

