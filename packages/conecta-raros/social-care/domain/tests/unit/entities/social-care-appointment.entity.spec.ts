// packages/social/social-care/tests/unit/entities/social-care-appointment.entity.spec.ts
import { describe, expect, test } from "bun:test";
import { SocialCareAppointment, Timestamp } from "packages/conecta-raros/social-care";
import { Uuid } from "@conecta/uuid";

const NOW = new Date();
const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);

describe('SocialCareAppointment.entity', () => {
  test('deve criar um SocialCareAppointment válido com dados consistentes', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      professionalInChargeId: Uuid.create().unwrap(),
      type: 'HOME_VISIT',
      summary: 'Paciente apresenta bom estado geral.',
      actionPlan: 'Manter acompanhamento quinzenal.',
    };

    // Act
    const result = SocialCareAppointment.create(props, NOW);

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const appointment = result.unwrap();
    expect(appointment.id.equals(props.id)).toBe(true);
    expect(appointment.date.equals(props.date)).toBe(true);
    expect(appointment.professionalInChargeId.equals(props.professionalInChargeId)).toBe(true);
    expect(appointment.type).toBe('HOME_VISIT');
    expect(appointment.summary).toBe('Paciente apresenta bom estado geral.');
    expect(appointment.actionPlan).toBe('Manter acompanhamento quinzenal.');
    expect(Object.isFrozen(appointment)).toBe(true);
  });

  test('deve falhar ao criar um atendimento com data no futuro', () => {
    // Arrange
    const TOMORROW = new Date(NOW.getTime() + 24 * 60 * 60 * 1000);
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: TOMORROW }).unwrap(),
      professionalInChargeId: Uuid.create().unwrap(),
      type: 'HOME_VISIT',
      summary: 'Resumo válido.',
      actionPlan: 'Plano válido.',
    };

    // Act
    const result = SocialCareAppointment.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('SCA-001'); // SocialCareAppointment error 1
  });

  test('deve falhar ao criar se tanto summary quanto actionPlan estiverem vazios', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      professionalInChargeId: Uuid.create().unwrap(),
      type: 'INDIVIDUAL_SESSION',
      summary: ' ', // Vazio
      actionPlan: ' ', // Vazio
    };

    // Act
    const result = SocialCareAppointment.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('SCA-002');
  });
  
  test('deve falhar ao criar se summary exceder o limite de 500 caracteres', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      professionalInChargeId: Uuid.create().unwrap(),
      type: 'FAMILY_SESSION',
      summary: 'a'.repeat(501), // Excede o limite
      actionPlan: 'Plano válido.',
    };

    // Act
    const result = SocialCareAppointment.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('SCA-003');
  });

  test('deve falhar ao criar se actionPlan exceder o limite de 2000 caracteres', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      professionalInChargeId: Uuid.create().unwrap(),
      type: 'FAMILY_SESSION',
      summary: 'Resumo válido.',
      actionPlan: 'a'.repeat(2001), // Excede o limite
    };

    // Act
    const result = SocialCareAppointment.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('SCA-004');
  });

  test('deve considerar duas instâncias iguais se seus ids forem os mesmos', () => {
    // Arrange
    const id = Uuid.create().unwrap();
    const props1 = {
      id,
      date: Timestamp.create({ value: YESTERDAY }).unwrap(),
      professionalInChargeId: Uuid.create().unwrap(),
      type: 'HOME_VISIT',
      summary: 'Primeiro resumo.',
      actionPlan: 'Primeiro plano.',
    };
    const appointment1 = SocialCareAppointment.create(props1, NOW).unwrap();

    const props2 = { ...props1, summary: 'Resumo atualizado.' };
    const appointment2 = SocialCareAppointment.create(props2, NOW).unwrap();

    // Act & Assert
    expect(appointment1.equals(appointment2)).toBe(true);
  });
});
