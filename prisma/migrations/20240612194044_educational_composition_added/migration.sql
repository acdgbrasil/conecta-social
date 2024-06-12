-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NEVER_ATTENDED', 'DAYCARE', 'KINDERGARTEN', 'FIRST_GRADE', 'SECOND_GRADE', 'THIRD_GRADE', 'FOURTH_GRADE', 'FIFTH_GRADE', 'SIXTH_GRADE', 'SEVENTH_GRADE', 'EIGHTH_GRADE', 'NINTH_GRADE', 'FIRST_YEAR_HIGH_SCHOOL', 'SECOND_YEAR_HIGH_SCHOOL', 'THIRD_YEAR_HIGH_SCHOOL', 'INCOMPLETE_HIGHER_EDUCATION', 'COMPLETE_HIGHER_EDUCATION', 'ADULT_EDUCATION_ELEMENTARY', 'ADULT_EDUCATION_HIGH', 'OTHER');

-- CreateEnum
CREATE TYPE "NoncomplianceEffect" AS ENUM ('WARNING', 'BLOCK', 'SUSPENSION', 'CANCELLATION');

-- CreateTable
CREATE TABLE "EducationalConditions" (
    "id" SERIAL NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "canReadOrWrite" BOOLEAN NOT NULL,
    "currentlyAttendingSchool" BOOLEAN NOT NULL,
    "educationLevel" "EducationLevel" NOT NULL,
    "schoolVulnerabilityCalculation" TEXT NOT NULL,
    "hadConditionalityNoncompliance" BOOLEAN NOT NULL,
    "occurrenceDate" TIMESTAMP(3),
    "suspensionRequested" BOOLEAN,
    "noncomplianceEffect" "NoncomplianceEffect",
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "EducationalConditions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EducationalConditions" ADD CONSTRAINT "EducationalConditions_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
