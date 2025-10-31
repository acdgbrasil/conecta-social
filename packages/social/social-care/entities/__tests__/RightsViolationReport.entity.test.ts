// entities/__tests__/RightsViolationReport.entity.test.ts
import { describe, expect, test } from "bun:test";
import { RightsViolationReport, ViolationType } from '../RightsViolationReport.entity'; // Irá falhar
import { Uuid } from '@conecta/uuid';
import { Timestamp } from '../../value-objects/timestamp.valueObject';

const NOW = new Date();
const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
const TWO_DAYS_AGO = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);

describe('RightsViolationReport.entity', () => {
  test('deve criar um RightsViolationReport válido com todos os dados obrigatórios', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      reportDate: Timestamp.create({ value: YESTERDAY }).unwrap(),
      incidentDate: Timestamp.create({ value: TWO_DAYS_AGO }).unwrap(),
      victimId: Uuid.create().unwrap(),
      violationType: ViolationType.NEGLECT,
      descriptionOfFact: 'Criança encontrada sozinha em casa por longos períodos.',
      actionsTaken: 'Conselho Tutelar foi notificado via ofício nº 123.',
    };

    // Act
    const result = RightsViolationReport.create(props, NOW);

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const report = result.unwrap();
    expect(report.id.equals(props.id)).toBe(true);
    expect(report.violationType).toBe('NEGLECT');
    expect(report.actionsTaken).toContain('Conselho Tutelar');
    expect(Object.isFrozen(report)).toBe(true);
  });

  test('deve falhar ao criar um relato com reportDate no futuro', () => {
    // Arrange
    const TOMORROW = new Date(NOW.getTime() + 24 * 60 * 60 * 1000);
    const props = {
      id: Uuid.create().unwrap(),
      reportDate: Timestamp.create({ value: TOMORROW }).unwrap(),
      incidentDate: Timestamp.create({ value: YESTERDAY }).unwrap(),
      victimId: Uuid.create().unwrap(),
      violationType: ViolationType.PHYSICAL_VIOLENCE,
      descriptionOfFact: 'Relato de agressão.',
      actionsTaken: '',
    };

    // Act
    const result = RightsViolationReport.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('RVR-001'); // RightsViolationReport error 1
  });

  test('deve falhar se incidentDate for posterior a reportDate', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      reportDate: Timestamp.create({ value: TWO_DAYS_AGO }).unwrap(),
      incidentDate: Timestamp.create({ value: YESTERDAY }).unwrap(), // Inconsistente
      victimId: Uuid.create().unwrap(),
      violationType: ViolationType.FINANCIAL_EXPLOITATION,
      descriptionOfFact: 'Relato de apropriação de benefício.',
      actionsTaken: '',
    };

    // Act
    const result = RightsViolationReport.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('RVR-002');
  });

  test('deve falhar ao criar com uma descriptionOfFact vazia', () => {
    // Arrange
    const props = {
      id: Uuid.create().unwrap(),
      reportDate: Timestamp.create({ value: YESTERDAY }).unwrap(),
      victimId: Uuid.create().unwrap(),
      violationType: ViolationType.CHILD_LABOR,
      descriptionOfFact: ' ', // Inválido
      actionsTaken: 'Visita domiciliar agendada.',
    };

    // Act
    const result = RightsViolationReport.create(props, NOW);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe('RVR-003');
  });

  test('deve permitir a atualização das actionsTaken, retornando uma nova instância', () => {
    // Arrange
    const initialReport = RightsViolationReport.create({
      id: Uuid.create().unwrap(),
      reportDate: Timestamp.create({ value: YESTERDAY }).unwrap(),
      victimId: Uuid.create().unwrap(),
      violationType: ViolationType.PSYCHOLOGICAL_VIOLENCE,
      descriptionOfFact: 'Relato de ameaças constantes.',
      actionsTaken: 'Orientação inicial fornecida.',
    }, NOW).unwrap();
    
    const newAction = "Encaminhamento para serviço de saúde mental.";

    // Act
    const updatedReport = initialReport.updateActions(newAction);

    // Assert
    expect(updatedReport.actionsTaken).toBe(newAction);
    expect(initialReport.actionsTaken).toBe('Orientação inicial fornecida.'); // Imutabilidade
    expect(updatedReport).not.toBe(initialReport);
  });

  test('deve considerar duas instâncias iguais se seus ids forem os mesmos', () => {
    // Arrange
    const id = Uuid.create().unwrap();
    const report1 = RightsViolationReport.create({
      id,
      reportDate: Timestamp.create({ value: YESTERDAY }).unwrap(),
      victimId: Uuid.create().unwrap(),
      violationType: ViolationType.NEGLECT,
      descriptionOfFact: 'Descrição inicial.',
      actionsTaken: 'Ação inicial.',
    }, NOW).unwrap();

    const report2 = report1.updateActions('Ação atualizada.');

    // Act & Assert
    expect(report1.equals(report2)).toBe(true);
  });
});
