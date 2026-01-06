import { describe, expect, test, spyOn } from "bun:test";
import { ok, err } from "@conecta/result";
import { Uuid } from "@conecta/uuid";

// @ts-ignore
import { AddFamilyMemberUseCase } from "../../../../application/use-cases/add-family-member.use-case";
// @ts-ignore
import { PatientRepositoryProtocol } from "../../../../application/repository/patient.repository.protocol";
import { EventBusProtocol } from "@conecta/protocols";

describe("UseCase: AddFamilyMember", () => {
  const patientId = Uuid.create().unwrap();
  
  const mockRepository: any = {
    findById: async () => ok({ 
      // Mock simplificado do agregado Patient
      id: patientId,
      addFamilyMember: () => ok({
        pullDomainEvents: () => [{ name: "FamilyMemberAdded" }]
      })
    }),
    save: async () => ok(undefined),
  };

  const mockEventBus: any = {
    publish: async () => ok(undefined),
  };

  test("deve adicionar um membro da família ao paciente e publicar o evento", async () => {
    const useCase = new AddFamilyMemberUseCase(mockRepository, mockEventBus);
    
    const input = {
      patientId: patientId.toString(),
      member: {
        relationship: "FILHO",
        personId: "person-456",
        isPrimaryCaregiver: false,
        residesWithPatient: true
      }
    };

    const findByIdSpy = spyOn(mockRepository, "findById");
    const saveSpy = spyOn(mockRepository, "save");
    const publishSpy = spyOn(mockEventBus, "publish");

    const result = await useCase.execute(input);

    expect(result.isOk).toBe(true);
    expect(findByIdSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
    expect(publishSpy).toHaveBeenCalled();
  });

  test("deve falhar se o paciente não for encontrado", async () => {
    const emptyRepo = {
      ...mockRepository,
      findById: async () => err({ message: "Paciente não encontrado" }),
    };
    const useCase = new AddFamilyMemberUseCase(repoWithConflict, mockEventBus);

    const result = await useCase.execute({
      patientId: "inexistente",
      member: { relationship: "IRMÃO" }
    });

    expect(result.isErr).toBe(true);
  });
});
