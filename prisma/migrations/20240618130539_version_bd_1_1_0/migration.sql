-- CreateEnum
CREATE TYPE "AccessActivityStatus" AS ENUM ('NAO', 'SIM', 'NAO_SE_APLICA');

-- CreateEnum
CREATE TYPE "FamilyRelationshipStatus" AS ENUM ('CONFLITUOSO_SEM_VIOLENCIA', 'CONFLITUOSO_COM_VIOLENCIA', 'SEM_CONFLITOS_RELEVANTES');

-- CreateTable
CREATE TABLE "FamilyAndCommunityCohabitation" (
    "id" SERIAL NOT NULL,
    "familyAlwaysLivedInState" BOOLEAN NOT NULL,
    "yearsInState" INTEGER,
    "familyAlwaysLivedInCity" BOOLEAN NOT NULL,
    "yearsInCity" INTEGER,
    "familyAlwaysLivedInNeighborhood" BOOLEAN NOT NULL,
    "yearsInNeighborhood" INTEGER,
    "familyVictimOfThreatsOrDiscrimination" BOOLEAN NOT NULL,
    "familyHasSupportiveNeighbors" BOOLEAN NOT NULL,
    "familyMembersParticipateInGroups" BOOLEAN NOT NULL,
    "familyMembersParticipateInMovements" BOOLEAN NOT NULL,
    "childrenWithoutLeisureActivities" "AccessActivityStatus" NOT NULL,
    "elderlyWithoutLeisureActivities" "AccessActivityStatus" NOT NULL,
    "dependentPeopleWithoutAdultCompany" BOOLEAN NOT NULL,
    "maritalRelations" "FamilyRelationshipStatus" NOT NULL,
    "parentChildRelations" "FamilyRelationshipStatus" NOT NULL,
    "siblingRelations" "FamilyRelationshipStatus" NOT NULL,
    "otherConflictRelations" "FamilyRelationshipStatus" NOT NULL,
    "referencePersonId" INTEGER NOT NULL,
    "observations" TEXT[],

    CONSTRAINT "FamilyAndCommunityCohabitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FamilyAndCommunityCohabitation" ADD CONSTRAINT "FamilyAndCommunityCohabitation_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
