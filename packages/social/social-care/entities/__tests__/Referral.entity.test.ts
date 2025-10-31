// entities/__tests__/Referral.entity.test.ts
import { describe, expect, test } from "bun:test";
import { Referral } from '../Referral.entity'; // Irá falhar
import { Uuid } from '@conecta/uuid';
import { Timestamp } from '../../value-objects/timestamp.valueObject';

const NOW = new Date();
const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);

describe('Referral.entity', () => {
  test('deve criar um Referral válido, que inicia obrigatoriamente com o status PENDING', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      requestingProfessionalId: Uuid.create().unwrap(),
      referredPersonId: Uuid.create().unwrap(),
      destinationService: 'CRAS',
      reason: 'Avaliação para inclusão no CadÚnico.',
    };

    // Act
    const result = Referral.create(props, NOW);

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const referral = result.unwrap();
    expect(referral.id.equals(props.id)).toBe(true);
    expect(referral.status).toBe('PENDING'); // Status inicial deve ser PENDING
    expect(referral.destinationService).toBe('CRAS');
    expect(Object.isFrozen(referral)).toBe(true);
  });

  test('deve falhar ao criar um encaminhamento com data no futuro', () => {
    // Arrange
    const TOMORROW = new Date(NOW.getTime() + 24 * 60 * 60 * 1000);
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: TOMORROW }).unwrap(),
      requestingProfessionalId: Uuid.create().unwrap(),
      referredPersonId: Uuid.create().unwrap(),
      destinationService: 'HEALTH_UNIT',
      reason: 'Consulta médica.',
    };

    // Act
    const result = Referral.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('REF-001'); // Referral error 1
  });

  test('deve falhar ao criar com um reason vazio', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      requestingProfessionalId: Uuid.create().unwrap(),
      referredPersonId: Uuid.create().unwrap(),
      destinationService: 'INSS_BPC',
      reason: ' ', // Inválido
    };

    // Act
    const result = Referral.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('REF-002');
  });

  test('deve permitir a atualização do status para COMPLETED, retornando uma nova instância', () => {
    // Arrange
    const initialReferral = Referral.create({
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      requestingProfessionalId: Uuid.create().unwrap(),
      referredPersonId: Uuid.create().unwrap(),
      destinationService: 'COUNCIL_TUTELAR',
      reason: 'Averiguação de situação de risco.',
    }, NOW).unwrap();

    // Act
    const result = initialReferral.complete();
    
    // Assert
    expect(result.isOk).toBe(true);
    const updatedReferral = result.unwrap();

    expect(updatedReferral.status).toBe('COMPLETED');
    expect(initialReferral.status).toBe('PENDING'); // Imutabilidade
    expect(updatedReferral).not.toBe(initialReferral);
  });

  test('deve falhar ao tentar uma transição de status inválida', () => {
    // Arrange
    const initialProps = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      requestingProfessionalId: Uuid.create().unwrap(),
      referredPersonId: Uuid.create().unwrap(),
      destinationService: 'LEGAL_AID',
      reason: 'Orientação jurídica.',
    };
    const completedReferral = Referral.create(initialProps, NOW).unwrap().complete().unwrap();

    // Act
    const result = completedReferral.cancel(); // Não pode cancelar algo já completado

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('REF-003'); // Erro de transição de status
  });
});
