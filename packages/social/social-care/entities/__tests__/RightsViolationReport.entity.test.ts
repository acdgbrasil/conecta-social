// __tests__/RightsViolationReport.entity.test.ts
import { describe, expect, test } from "bun:test";
import { RightsViolationReport, RightsViolationReportProps, ViolationType } from '../RightsViolationReport.entity';
import { Uuid } from '@conecta/uuid';
import { Timestamp } from '../../value-objects/timestamp.valueObject';
import { RVR } from "../../err/RightsViolationReport.error"; // Importando os erros

/**
 * 💡 O que este teste ensina:
 *
 * Esta é uma Entidade Filha que representa um "documento" ou "registro".
 * Ela tem regras de criação (Invariantes) para garantir que o registro
 * seja cronologicamente válido.
 *
 * Os testes validam:
 * 1. Regras de data (data do relato vs. data do incidente).
 * 2. Campos obrigatórios (descrição).
 * 3. Gerenciamento de estado (o método 'updateActions' retorna uma nova instância).
 */
describe('RightsViolationReport.entity', () => {

  const NOW = new Date();
  const YESTERDAY_TS = Timestamp.create({ value: new Date(NOW.getTime() - 24 * 60 * 60 * 1000) }).unwrap();
  const TWO_DAYS_AGO_TS = Timestamp.create({ value: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000) }).unwrap();

  // Helper para props válidas
  const createValidProps = (overrides: Partial<RightsViolationReportProps> = {}) => ({
    id: Uuid.create().unwrap(),
    reportDate: YESTERDAY_TS,
    incidentDate: TWO_DAYS_AGO_TS,
    victimId: Uuid.create().unwrap(),
    violationType: ViolationType.NEGLECT,
    descriptionOfFact: 'Criança encontrada sozinha em casa por longos períodos.',
    actionsTaken: 'Conselho Tutelar foi notificado via ofício nº 123.',
    ...overrides,
  });

  describe('Criação (Factory)', () => {

    test('deve criar um RightsViolationReport válido com dados consistentes', () => {
      // Arrange
      const props = createValidProps();

      // Act
      const result = RightsViolationReport.create(props, NOW);

      // Assert
      expect(result.isOk).toBe(true);
      const report = result.unwrap();
      
      expect(report.id.equals(props.id)).toBe(true);
      expect(report.violationType).toBe('NEGLECT');
      expect(report.actionsTaken).toContain('Conselho Tutelar');
      expect(Object.isFrozen(report)).toBe(true);
    });
    
    test('deve criar um relato válido mesmo sem data do incidente (opcional)', () => {
      // Arrange
      const props = createValidProps({ incidentDate: undefined });

      // Act
      const result = RightsViolationReport.create(props, NOW);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.unwrap().props.incidentDate).toBeUndefined();
    });

    test('deve FALHAR ao criar com data do relato no futuro (regra RVR-001)', () => {
      // Arrange
      const TOMORROW_TS = Timestamp.create({ value: new Date(NOW.getTime() + 24 * 60 * 60 * 1000) }).unwrap();
      const props = createValidProps({ reportDate: TOMORROW_TS });

      // Act
      const result = RightsViolationReport.create(props, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      //
      expect(result.unwrapErr().code).toBe(RVR.ReportDateInFuture().code); // RVR-001
    });

    test('deve FALHAR se data do incidente for posterior à data do relato (regra RVR-002)', () => {
      // Arrange
      const props = createValidProps({
        reportDate: TWO_DAYS_AGO_TS, // 2 dias atrás
        incidentDate: YESTERDAY_TS,   // 1 dia atrás (inválido)
      });

      // Act
      const result = RightsViolationReport.create(props, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      //
      expect(result.unwrapErr().code).toBe(RVR.IncidentAfterReport().code); // RVR-002
    });

    test('deve FALHAR ao criar com uma descriptionOfFact vazia (regra RVR-003)', () => {
      // Arrange
      const props = createValidProps({ descriptionOfFact: ' ' }); // Deve falhar com string vazia

      // Act
      const result = RightsViolationReport.create(props, NOW);

      // Assert
      expect(result.isErr).toBe(true);
      //
      expect(result.unwrapErr().code).toBe(RVR.EmptyDescription().code); // RVR-003
    });
  });
  
  describe('Gerenciamento de Estado (Imutabilidade)', () => {

    test('deve permitir a atualização das actionsTaken, retornando uma nova instância', () => {
      // Arrange
      const initialReport = RightsViolationReport.create(createValidProps({
        actionsTaken: 'Orientação inicial fornecida.',
      }), NOW).unwrap();
      
      const newAction = "Encaminhamento para serviço de saúde mental.";

      // Act
      // O método 'updateActions' é o único que altera o estado
      const updatedReport = initialReport.updateActions(newAction); 

      // Assert
      expect(updatedReport.actionsTaken).toBe(newAction);
      
      // Valida imutabilidade
      expect(initialReport.actionsTaken).toBe('Orientação inicial fornecida.'); // Original não deve mudar
      expect(updatedReport).not.toBe(initialReport); // Deve ser uma nova instância
    });
  });

  describe('Identidade da Entidade', () => {
    
    test('deve considerar duas instâncias iguais se seus IDs forem os mesmos (equals)', () => {
      // Arrange
      const id = Uuid.create().unwrap();
      const report1 = RightsViolationReport.create(createValidProps({ id, actionsTaken: 'Ação 1' }), NOW).unwrap();
      const report2 = report1.updateActions('Ação 2'); // Mesmo ID, estado diferente

      // Act & Assert
      expect(report1.equals(report2)).toBe(true);
      expect(report1.actionsTaken).not.toBe(report2.actionsTaken);
    });
  });
});