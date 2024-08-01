/*
  Warnings:

  - You are about to drop the `CommunityEngagement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EducationalConditions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FamilyAndCommunityCohabitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FamilyComposition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FamilySpecifics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinancialConditions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FirstContactForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImportantDocuments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstitutionalOrFamilyCareHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferencePerson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocioEducationalMeasuresHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ViolenceAndRightsViolation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkConditionsAndIncome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `observations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CommunityEngagement" DROP CONSTRAINT "CommunityEngagement_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "EducationalConditions" DROP CONSTRAINT "EducationalConditions_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyAndCommunityCohabitation" DROP CONSTRAINT "FamilyAndCommunityCohabitation_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyComposition" DROP CONSTRAINT "FamilyComposition_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "FamilySpecifics" DROP CONSTRAINT "FamilySpecifics_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "FinancialConditions" DROP CONSTRAINT "FinancialConditions_workConditionsAndIncomeId_fkey";

-- DropForeignKey
ALTER TABLE "FirstContactForm" DROP CONSTRAINT "FirstContactForm_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "ImportantDocuments" DROP CONSTRAINT "ImportantDocuments_familyCompositionId_fkey";

-- DropForeignKey
ALTER TABLE "InstitutionalOrFamilyCareHistory" DROP CONSTRAINT "InstitutionalOrFamilyCareHistory_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "SocioEducationalMeasuresHistory" DROP CONSTRAINT "SocioEducationalMeasuresHistory_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "ViolenceAndRightsViolation" DROP CONSTRAINT "ViolenceAndRightsViolation_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "WorkConditionsAndIncome" DROP CONSTRAINT "WorkConditionsAndIncome_referencePersonId_fkey";

-- DropForeignKey
ALTER TABLE "observations" DROP CONSTRAINT "observations_referencePersonId_fkey";

-- DropTable
DROP TABLE "CommunityEngagement";

-- DropTable
DROP TABLE "EducationalConditions";

-- DropTable
DROP TABLE "FamilyAndCommunityCohabitation";

-- DropTable
DROP TABLE "FamilyComposition";

-- DropTable
DROP TABLE "FamilySpecifics";

-- DropTable
DROP TABLE "FinancialConditions";

-- DropTable
DROP TABLE "FirstContactForm";

-- DropTable
DROP TABLE "ImportantDocuments";

-- DropTable
DROP TABLE "InstitutionalOrFamilyCareHistory";

-- DropTable
DROP TABLE "ReferencePerson";

-- DropTable
DROP TABLE "SocioEducationalMeasuresHistory";

-- DropTable
DROP TABLE "ViolenceAndRightsViolation";

-- DropTable
DROP TABLE "WorkConditionsAndIncome";

-- DropTable
DROP TABLE "observations";

-- DropEnum
DROP TYPE "AccessActivityStatus";

-- DropEnum
DROP TYPE "AccessElectricity";

-- DropEnum
DROP TYPE "Accessibility";

-- DropEnum
DROP TYPE "EducationLevel";

-- DropEnum
DROP TYPE "EmploymentCondition";

-- DropEnum
DROP TYPE "FamilyRelationshipStatus";

-- DropEnum
DROP TYPE "FamilySpecificity";

-- DropEnum
DROP TYPE "GarbageCollection";

-- DropEnum
DROP TYPE "KinshipCode";

-- DropEnum
DROP TYPE "LocationType";

-- DropEnum
DROP TYPE "MeasureType";

-- DropEnum
DROP TYPE "NoncomplianceEffect";

-- DropEnum
DROP TYPE "ResidenceType";

-- DropEnum
DROP TYPE "ServiceProgramProject";

-- DropEnum
DROP TYPE "SewageDisposal";

-- DropEnum
DROP TYPE "UnitCode";

-- DropEnum
DROP TYPE "ViolenceType";

-- DropEnum
DROP TYPE "WallMaterial";

-- DropEnum
DROP TYPE "WaterSupply";

-- CreateTable
CREATE TABLE "adm" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adm_email_key" ON "adm"("email");
