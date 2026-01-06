import { describe, expect, test, spyOn } from "bun:test";
import { ok, err } from "@conecta/result";
import { ImutableListFactory } from "@conecta/fn";

// Nota: Estes caminhos e nomes de classe são o que eu espero que você implemente.
// Você pode ajustar conforme sua preferência, mas o teste segue este contrato.

import { RegisterNewPatientUseCase } from "../../../../application/use-cases/register-patient.use-case";
//import { PatientRepositoryProtocol } from "../../../../application/repository/patient.repository.protocol";
//import { EventBusProtocol } from "@conecta/protocols";

describe("UseCase: RegisterNewPatient", () => {
  // Setup de Mocks
  const mockRepository: any = {
    save: async () => ok(undefined),
    existsByPersonId: async () => false,
  };

  const mockEventBus: any = {
    publish: async () => ok(undefined),
  };

  test("deve registrar um novo paciente com sucesso e publicar eventos", async () => {
    const useCase = new RegisterNewPatientUseCase(mockRepository, mockEventBus);
    
    const input = {
      personId: "person-123",
      initialDiagnoses: [
        { 
          icdCode: "A00.0", 
          description: "Diagnóstico inicial", 
          date: new Date().toISOString() 
        }
      ]
    };

    const saveSpy = spyOn(mockRepository, "save");
    const publishSpy = spyOn(mockEventBus, "publish");

    const result = await useCase.execute(input);

    expect(result.isOk).toBe(true);
    expect(saveSpy).toHaveBeenCalled();
    expect(publishSpy).toHaveBeenCalled();
    
    // Verifica se os eventos publicados vieram do agregado
    const publishedEvents = publishSpy.mock.calls[0][0];
    expect(Array.isArray(publishedEvents)).toBe(true);
    expect(publishedEvents[0].name).toBe("PatientCreated");
  });

  test("deve falhar se o PersonId já existir no repositório", async () => {
    const repoWithConflict = {
      ...mockRepository,
      existsByPersonId: async () => true,
    };
    const useCase = new RegisterNewPatientUseCase(repoWithConflict, mockEventBus);

    const result = await useCase.execute({
      personId: "duplicado",
      initialDiagnoses: []
    });

    expect(result.isErr).toBe(true);
  });
});
