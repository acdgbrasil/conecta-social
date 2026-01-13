// packages/social/social-care/tests/unit/entities/referral.entity.spec.ts
import { describe, expect, test } from "bun:test";
import { Referral, type ReferralProps, Timestamp, RE } from "packages/conecta-raros/social-care";
import { Uuid } from "@conecta/uuid";

/**
 * 💡 O que este teste ensina:
 *
 * Esta é uma Entidade Filha com um ciclo de vida e máquina de estados.
 * Ela é criada (sempre como 'PENDING') e pode transitar
 * para outros estados ('COMPLETED', 'CANCELLED') através de métodos
 * de negócio ('complete()', 'cancel()').
 *
 * Os testes validam:
 * 1. Regras de criação (data, campos obrigatórios).
 * 2. O estado inicial obrigatório ('PENDING').
 * 3. Transições de estado válidas (PENDING -> COMPLETED).
 * 4. Transições de estado inválidas (COMPLETED -> CANCELLED).
 * 5. Imutabilidade (transições de estado retornam uma nova instância).
 */
describe('Referral.entity', () => {

  const NOW = new Date();
  const YESTERDAY_TS = Timestamp.create({ value: new Date(NOW.getTime() - 24 * 60 * 60 * 1000) }).unwrap();

  // Helper para props válidas
  const createValidProps = (overrides: Partial<ReferralProps> = {}) => ({
    id: Uuid.create().unwrap(),
    date: YESTERDAY_TS,
    requestingProfessionalId: Uuid.create().unwrap(),
    referredPersonId: Uuid.create().unwrap(),
    destinationService: 'CRAS',
    reason: 'Avaliação para inclusão no CadÚnico.',
    ...overrides,
  });

  describe('Criação (Factory)', () => {

    test('deve criar um Referral válido e iniciar com status PENDING', () => {
      // Arrange
      const props = createValidProps();

      // Act
      const result = Referral.create(props, NOW);

      // Assert
      expect(result.isOk).toBe(true);
      const referral = result.unwrap();
      
      expect(referral.id.equals(props.id)).toBe(true);
      expect(referral.status).toBe('PENDING'); // Estado inicial obrigatório
      expect(referral.destinationService).toBe('CRAS');
      expect(Object.isFrozen(referral)).toBe(true);
    });

    test('deve FALHAR ao criar com data no futuro (regra REF-001)', () => {
      // Arrange
      const TOMORROW_TS = Timestamp.create({ value: new Date(NOW.getTime() + 24 * 60 * 60 * 1000) }).unwrap();
      const props = createValidProps({ date: TOMORROW_TS });

      // Act
      const result = Referral.create(props, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      //
      expect(result.unwrapErr().code).toBe(RE.DateInFuture().code); // REF-001
    });

    test('deve FALHAR ao criar com um "reason" vazio (regra REF-002)', () => {
      // Arrange
      const props = createValidProps({ reason: ' ' }); // Deve falhar com string vazia

      // Act
      const result = Referral.create(props, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      //
      expect(result.unwrapErr().code).toBe(RE.ReasonMissing().code); // REF-002
    });
  });

  describe('Máquina de Estados (Transições)', () => {

    test('deve transitar de PENDING para COMPLETED e manter imutabilidade', () => {
      // Arrange
      const initialReferral = Referral.create(createValidProps(), NOW).unwrap();
      expect(initialReferral.status).toBe('PENDING');

      // Act
      const result = initialReferral.complete();
      
      // Assert
      expect(result.isOk).toBe(true);
      const updatedReferral = result.unwrap();

      expect(updatedReferral.status).toBe('COMPLETED');
      
      // Valida imutabilidade
      expect(initialReferral.status).toBe('PENDING'); // Original não deve mudar
      expect(updatedReferral).not.toBe(initialReferral); // Deve ser uma nova instância
    });

    test('deve transitar de PENDING para CANCELLED e manter imutabilidade', () => {
      // Arrange
      const initialReferral = Referral.create(createValidProps(), NOW).unwrap();
      expect(initialReferral.status).toBe('PENDING');

      // Act
      const result = initialReferral.cancel();
      
      // Assert
      expect(result.isOk).toBe(true);
      const updatedReferral = result.unwrap();

      expect(updatedReferral.status).toBe('CANCELLED');
      
      // Valida imutabilidade
      expect(initialReferral.status).toBe('PENDING');
      expect(updatedReferral).not.toBe(initialReferral);
    });

    test('deve FALHAR ao tentar transição inválida (ex: COMPLETED -> CANCELLED)', () => {
      // Arrange
      // Cria um encaminhamento e o completa
      const completedReferral = Referral.create(createValidProps(), NOW).unwrap()
        .complete().unwrap();
        
      expect(completedReferral.status).toBe('COMPLETED');

      // Act
      // Tenta cancelar algo já completado
      const result = completedReferral.cancel(); 

      // Assert
      expect(result.isErr).toBe(true);
      //
      expect(result.unwrapErr().code).toBe(RE.InvalidStatusTransition("COMPLETED", "CANCELLED").code); // REF-003
      expect(result.unwrapErr().message).toContain("Não é permitido mover o encaminhamento de COMPLETED para CANCELLED");
    });
    
    test('deve FALHAR ao tentar transição inválida (ex: CANCELLED -> COMPLETED)', () => {
      // Arrange
      const cancelledReferral = Referral.create(createValidProps(), NOW).unwrap()
        .cancel().unwrap();
        
      expect(cancelledReferral.status).toBe('CANCELLED');

      // Act
      const result = cancelledReferral.complete();

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(RE.InvalidStatusTransition("CANCELLED", "COMPLETED").code); // REF-003
      expect(result.unwrapErr().message).toContain("Não é permitido mover o encaminhamento de CANCELLED para COMPLETED");
    });
  });
});
