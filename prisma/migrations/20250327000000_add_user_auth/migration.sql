-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gradeLevel" TEXT,
    "graduationYear" INTEGER,
    "gpa" DOUBLE PRECISION,
    "currentClasses" TEXT[],
    "intendedMajors" TEXT[],
    "intendedIndustry" TEXT,
    "targetColleges" TEXT[],
    "interests" TEXT[],
    "extracurriculars" TEXT[],
    "awards" TEXT[],
    "leadershipExp" TEXT[],
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "hoursPerWeek" DOUBLE PRECISION,
    "constraints" TEXT,
    "goals" TEXT,
    "testScores" JSONB,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "studentSummary" TEXT,
    "strengthsAnalysis" TEXT,
    "gapsAnalysis" TEXT,
    "recommendedExtracurriculars" JSONB,
    "recommendedProjects" JSONB,
    "courseworkSuggestions" JSONB,
    "competitions" JSONB,
    "internshipsPrograms" JSONB,
    "timeline3Month" JSONB,
    "timeline6Month" JSONB,
    "timeline12Month" JSONB,
    "collegeCompetitiveness" JSONB,
    "topActions" JSONB,
    "citations" JSONB,
    "admissionsStrategyOptimizer" JSONB,
    "strategySection" JSONB,
    "essayIdeasSection" JSONB,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_studentId_key" ON "Roadmap"("studentId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
