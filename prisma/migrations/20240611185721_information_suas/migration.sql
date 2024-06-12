-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('URBAN', 'RURAL');

-- CreateEnum
CREATE TYPE "ResidenceType" AS ENUM ('OWNED', 'RENTED', 'PROVIDED', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "WallMaterial" AS ENUM ('BRICK_OR_WOOD', 'WOOD', 'RECYCLED_WOOD', 'MUD_OR_POOR_MATERIAL');

-- CreateEnum
CREATE TYPE "AccessElectricity" AS ENUM ('OWN_METER', 'SHARED_METER', 'HAS_METER', 'NO_ELECTRICITY');

-- CreateEnum
CREATE TYPE "WaterSupply" AS ENUM ('PUBLIC_NETWORK', 'WELL_OR_SPRING', 'RAINWATER_CISTERN', 'WATER_TRUCK', 'OTHER');

-- CreateEnum
CREATE TYPE "SewageDisposal" AS ENUM ('PUBLIC_NETWORK', 'SEPTIC_TANK', 'RUDIMENTARY_PIT', 'DIRECT_DISCHARGE', 'NO_BATHROOM');

-- CreateEnum
CREATE TYPE "GarbageCollection" AS ENUM ('DIRECT_COLLECTION', 'INDIRECT_COLLECTION', 'NO_COLLECTION');

-- CreateEnum
CREATE TYPE "Accessibility" AS ENUM ('FULL', 'PARTIAL', 'NONE');

-- CreateEnum
CREATE TYPE "KinshipCode" AS ENUM ('PERSON_OF_REFERENCE', 'SPOUSE', 'CHILD', 'STEPCHILD', 'GRANDCHILD', 'PARENT', 'PARENT_IN_LAW', 'SIBLING', 'SON_IN_LAW', 'OTHER_RELATIVE', 'NON_RELATIVE');

-- CreateEnum
CREATE TYPE "FamilySpecificity" AS ENUM ('STREET_SITUATION', 'QUILOMBOLA', 'RIVERINE', 'GYPSY', 'INDIGENOUS_RESIDENT', 'INDIGENOUS_NON_RESIDENT', 'OTHER', 'SHELTER');

-- CreateTable
CREATE TABLE "ReferencePerson" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "socialName" TEXT,
    "motherName" TEXT NOT NULL,
    "nis" TEXT,
    "cpf" TEXT NOT NULL,
    "rgNumber" TEXT NOT NULL,
    "rgIssuer" TEXT NOT NULL,
    "rgState" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "addressNumber" TEXT NOT NULL,
    "addressExtra" TEXT,
    "neighborhood" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "orderNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferencePerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirstContactForm" (
    "id" SERIAL NOT NULL,
    "spontaneousDemand" BOOLEAN NOT NULL,
    "activeSearch" BOOLEAN NOT NULL,
    "referralFromBasicSocialProtection" BOOLEAN NOT NULL,
    "referralFromSpecialSocialProtection" BOOLEAN NOT NULL,
    "referralFromHealth" BOOLEAN NOT NULL,
    "referralFromEducation" BOOLEAN NOT NULL,
    "referralFromOtherSectors" BOOLEAN NOT NULL,
    "referralFromTutelarCouncil" BOOLEAN NOT NULL,
    "referralFromJudiciary" BOOLEAN NOT NULL,
    "referralFromRightsGuaranteeSystem" BOOLEAN NOT NULL,
    "otherReferrals" BOOLEAN NOT NULL,
    "wasReferral" BOOLEAN,
    "referrerName" TEXT,
    "referrerContact" TEXT,
    "referralReasons" TEXT,
    "serviceDemands" TEXT NOT NULL,
    "hasFamilyGrant" BOOLEAN NOT NULL,
    "hasBPC" BOOLEAN NOT NULL,
    "hasPETI" BOOLEAN NOT NULL,
    "other" TEXT,
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "FirstContactForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyComposition" (
    "id" SERIAL NOT NULL,
    "referencePersonId" INTEGER NOT NULL,
    "orderNumber" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "kinshipCode" "KinshipCode" NOT NULL,
    "hasDisability" BOOLEAN NOT NULL,

    CONSTRAINT "FamilyComposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportantDocuments" (
    "id" SERIAL NOT NULL,
    "cn" TEXT,
    "rg" TEXT,
    "ctps" TEXT,
    "cpf" TEXT,
    "te" TEXT,
    "familyCompositionId" INTEGER NOT NULL,

    CONSTRAINT "ImportantDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilySpecifics" (
    "referencePersonId" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "specifics" "FamilySpecificity" NOT NULL,
    "isStreetSituation" BOOLEAN NOT NULL,
    "residenceType" "ResidenceType",
    "wallMaterial" "WallMaterial",
    "hasElectricity" "AccessElectricity",
    "hasRunningWater" BOOLEAN,
    "waterSupply" "WaterSupply",
    "sewageDisposal" "SewageDisposal",
    "garbageCollection" "GarbageCollection",
    "totalRooms" INTEGER,
    "totalBedrooms" INTEGER,
    "peoplePerBedroom" INTEGER,
    "hasAccessibility" "Accessibility",
    "isRiskArea" BOOLEAN,
    "isHardAccessArea" BOOLEAN,
    "isConflictArea" BOOLEAN,
    "observations" TEXT,

    CONSTRAINT "FamilySpecifics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferencePerson_id_key" ON "ReferencePerson"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ReferencePerson_nis_key" ON "ReferencePerson"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "ReferencePerson_cpf_key" ON "ReferencePerson"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "ReferencePerson_orderNumber_key" ON "ReferencePerson"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FirstContactForm_referencePersonId_key" ON "FirstContactForm"("referencePersonId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyComposition_orderNumber_key" ON "FamilyComposition"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ImportantDocuments_familyCompositionId_key" ON "ImportantDocuments"("familyCompositionId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilySpecifics_referencePersonId_key" ON "FamilySpecifics"("referencePersonId");

-- AddForeignKey
ALTER TABLE "FirstContactForm" ADD CONSTRAINT "FirstContactForm_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyComposition" ADD CONSTRAINT "FamilyComposition_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportantDocuments" ADD CONSTRAINT "ImportantDocuments_familyCompositionId_fkey" FOREIGN KEY ("familyCompositionId") REFERENCES "FamilyComposition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilySpecifics" ADD CONSTRAINT "FamilySpecifics_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
