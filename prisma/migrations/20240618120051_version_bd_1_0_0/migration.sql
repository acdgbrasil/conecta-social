-- CreateEnum
CREATE TYPE "EmploymentCondition" AS ENUM ('NAO_TRABALHA', 'TRABALHADOR_CONTA_PROPRIA', 'TRABALHADOR_TEMPORARIO_RURAL', 'EMPREGADO_SEM_CARTEIRA', 'EMPREGADO_COM_CARTEIRA', 'TRABALHADOR_DOMESTICO_SEM_CARTEIRA', 'TRABALHADOR_DOMESTICO_COM_CARTEIRA', 'TRABALHADOR_NAO_REMUNERADO', 'MILITAR_SERVIDOR_PUBLICO', 'EMPREGADOR', 'ESTAGIARIO', 'APRENDIZ');

-- CreateEnum
CREATE TYPE "ServiceProgramProject" AS ENUM ('SERVICO_CONVIVENCIA_CRIANCAS_ADOLESCENTES', 'SERVICO_CONVIVENCIA_IDOSOS', 'GRUPO_ESPECIFICO_PAIF', 'GRUPO_ESPECIFICO_PAEFI', 'PROGRAMAS_ASSISTENCIA_SOCIAL', 'PROGRAMAS_OUTRAS_POLITICAS_SETORIAIS', 'OUTROS');

-- CreateEnum
CREATE TYPE "UnitCode" AS ENUM ('NESTA_PROPRIA_UNIDADE', 'OUTRA_UNIDADE_PUBLICA', 'UNIDADE_PRIVADA');

-- CreateEnum
CREATE TYPE "ViolenceType" AS ENUM ('TRABALHO_INFANTIL', 'EXPLORACAO_SEXUAL', 'ABUSO_VIOLENCIA_SEXUAL', 'VIOLENCIA_FISICA', 'VIOLENCIA_PSICOLOGICA', 'NEGLIGENCIA_CONTRA_IDOSO', 'NEGLIGENCIA_CONTRA_CRIANCA', 'NEGLIGENCIA_CONTRA_PCD', 'TRAJETORIA_DE_RUA', 'TRAFICO_DE_PESSOAS', 'VIOLENCIA_PATRIMONIAL_CONTRA_IDOSO_OU_PCD', 'OUTRAS');

-- CreateEnum
CREATE TYPE "MeasureType" AS ENUM ('LIBERDADE_ASSISTIDA', 'PRESTACAO_SERVICOS_COMUNIDADE', 'ADVERTENCIA', 'OBRIGACAO_REPARAR_DANO', 'SEMI_LIBERDADE', 'INTERNACAO');

-- CreateTable
CREATE TABLE "WorkConditionsAndIncome" (
    "id" SERIAL NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "hasWorkCard" BOOLEAN NOT NULL,
    "employmentCondition" "EmploymentCondition" NOT NULL,
    "hasProfessionalQualification" BOOLEAN NOT NULL,
    "professionalQualification" TEXT,
    "monthlyIncome" INTEGER NOT NULL,
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "WorkConditionsAndIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialConditions" (
    "id" SERIAL NOT NULL,
    "totalFamilyIncome" INTEGER NOT NULL,
    "perCapitaFamilyIncome" INTEGER NOT NULL,
    "receivesSocialProgramIncome" BOOLEAN NOT NULL,
    "bolsaFamiliaAmount" INTEGER,
    "bpcAmount" INTEGER,
    "petiAmount" INTEGER,
    "otherIncome" INTEGER,
    "bpcBeneficiariesOrderNumbers" INTEGER[],
    "hasRetiredOrPensionerMember" BOOLEAN NOT NULL,
    "retireesOrPensionersOrderNumbers" INTEGER[],
    "totalIncomeWithBenefits" INTEGER NOT NULL,
    "perCapitaIncomeWithBenefits" INTEGER NOT NULL,
    "workConditionsAndIncomeId" INTEGER NOT NULL,

    CONSTRAINT "FinancialConditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityEngagement" (
    "id" SERIAL NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "serviceProgramProject" "ServiceProgramProject" NOT NULL,
    "unitCode" "UnitCode" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "CommunityEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolenceAndRightsViolation" (
    "id" SERIAL NOT NULL,
    "violenceType" "ViolenceType" NOT NULL,
    "isOther" BOOLEAN NOT NULL,
    "otherViolenceName" TEXT,
    "situationPersists" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "ViolenceAndRightsViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocioEducationalMeasuresHistory" (
    "id" SERIAL NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "measureType" "MeasureType" NOT NULL,
    "processNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isLAorPSC" BOOLEAN NOT NULL,
    "beingMonitoredByCreas" BOOLEAN NOT NULL,
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "SocioEducationalMeasuresHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observations" (
    "id" SERIAL NOT NULL,
    "observation" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sectionName" TEXT NOT NULL,
    "proficionalId" TEXT NOT NULL,
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionalOrFamilyCareHistory" (
    "id" SERIAL NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "careStartDate" TIMESTAMP(3) NOT NULL,
    "careEndDate" TIMESTAMP(3) NOT NULL,
    "reasonForCare" TEXT NOT NULL,
    "institutionalCareHistory" TEXT,
    "externalGuardHistory" TEXT,
    "hasMemberInPrison" BOOLEAN NOT NULL,
    "hasAdolescentInSocioeducativeInternment" BOOLEAN NOT NULL,
    "referencePersonId" INTEGER NOT NULL,

    CONSTRAINT "InstitutionalOrFamilyCareHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialConditions_workConditionsAndIncomeId_key" ON "FinancialConditions"("workConditionsAndIncomeId");

-- AddForeignKey
ALTER TABLE "WorkConditionsAndIncome" ADD CONSTRAINT "WorkConditionsAndIncome_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialConditions" ADD CONSTRAINT "FinancialConditions_workConditionsAndIncomeId_fkey" FOREIGN KEY ("workConditionsAndIncomeId") REFERENCES "WorkConditionsAndIncome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityEngagement" ADD CONSTRAINT "CommunityEngagement_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolenceAndRightsViolation" ADD CONSTRAINT "ViolenceAndRightsViolation_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocioEducationalMeasuresHistory" ADD CONSTRAINT "SocioEducationalMeasuresHistory_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionalOrFamilyCareHistory" ADD CONSTRAINT "InstitutionalOrFamilyCareHistory_referencePersonId_fkey" FOREIGN KEY ("referencePersonId") REFERENCES "ReferencePerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
