-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('focus', 'short', 'long');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerState" (
    "userId" TEXT NOT NULL,
    "phase" "Phase" NOT NULL DEFAULT 'focus',
    "remaining" INTEGER NOT NULL,
    "endAt" TIMESTAMP(3),
    "round" INTEGER NOT NULL DEFAULT 1,
    "oranges" INTEGER NOT NULL DEFAULT 0,
    "day" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimerState_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phase" "Phase" NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "seconds" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_clientId_key" ON "Session"("clientId");

-- CreateIndex
CREATE INDEX "Session_userId_day_idx" ON "Session"("userId", "day");

-- AddForeignKey
ALTER TABLE "TimerState" ADD CONSTRAINT "TimerState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
