// __tests__/FamilyMember.entity.test.ts
import { describe, expect, test } from "bun:test";
import { FamilyMember, FamilyMemberProps } from "../FamilyMember.entity";
import { FamilyMemberId } from "../../value-objects/FamilyMemberId.valueObject";
import { PersonId } from "../../value-objects/personId.valueObject";
import { FM } from "../../err/FamilyMember.error"; // Importando os erros

/**
 * 💡 O que este teste ensina:
 *
 * Esta é uma Entidade Filha (Child Entity) do Agregado 'Patient'.
 * Ela possui seu próprio ciclo de vida (create) e identidade (FamilyMemberId),
 * mas só deve ser manipulada através do Agregado Raiz (Patient).
 *
 * Os testes validam as regras de criação (Invariantes) da própria entidade:
 * 1. Um 'FamilyMember' deve estar ligado a um 'PersonId'.
 * 2. Um 'FamilyMember' deve ter um 'relationship' (parentesco).
 * 3. A entidade é imutável (métodos como 'assignAsPrimaryCaregiver' retornam uma nova cópia).
 */
describe('FamilyMember.entity', () => {

  // Helper para criar props válidas
  const createValidProps = (overrides: Partial<FamilyMemberProps> = {}) => ({
    id: FamilyMemberId.create().unwrap(),
    personId: PersonId.create().unwrap(),
    relationship: 'FATHER_MOTHER',
    isPrimaryCaregiver: false,
    residesWithPatient: true,
    ...overrides,
  });

  test('deve criar um FamilyMember válido com estado inicial correto', () => {
    // Arrange
    const props = createValidProps();

    // Act
    const result = FamilyMember.create(props);

    // Assert
    expect(result.isOk).toBe(true);
    const member = result.unwrap();
    
    expect(member.id.equals(props.id)).toBe(true);
    expect(member.personId.equals(props.personId!)).toBe(true);
    expect(member.relationship).toBe('FATHER_MOTHER');
    expect(member.isPrimaryCaregiver).toBe(false);
    expect(member.residesWithPatient).toBe(true);
    expect(Object.isFrozen(member)).toBe(true);
  });

  test('deve FALHAR ao criar sem um personId (regra FM-001)', () => {
    // Arrange
    const props = createValidProps({ personId: null });

    // Act
    const result = FamilyMember.create(props as any); // 'as any' para forçar o tipo nulo

    // Assert
    expect(result.isErr).toBe(true);
    // Valida o código de erro específico
    expect(result.unwrapErr().code).toBe(FM.MissingPerson().code); // FM-001
  });

  test('deve FALHAR ao criar com um relationship vazio (regra FM-002)', () => {
    // Arrange
    const props = createValidProps({ relationship: '   ' }); // String com espaços

    // Act
    const result = FamilyMember.create(props);

    // Assert
    expect(result.isErr).toBe(true);
    // Valida o código de erro específico
    expect(result.unwrapErr().code).toBe(FM.InvalidRelationship().code); // FM-002
  });
  
  test('deve remover espaços em branco do relationship na criação', () => {
    // Arrange
    const props = createValidProps({ relationship: '  CHILD  ' });

    // Act
    const result = FamilyMember.create(props);

    // Assert
    expect(result.isOk).toBe(true);
    // Garante que o 'trim()' foi aplicado
    expect(result.unwrap().relationship).toBe('CHILD'); 
  });

  describe('Gerenciamento de Estado (Imutabilidade)', () => {

    test('deve retornar uma nova instância ao ser designado como cuidador principal', () => {
      // Arrange
      const initialMember = FamilyMember.create(createValidProps({ isPrimaryCaregiver: false })).unwrap();

      // Act
      const updatedMember = initialMember.assignAsPrimaryCaregiver();

      // Assert
      expect(updatedMember.isPrimaryCaregiver).toBe(true);
      expect(initialMember.isPrimaryCaregiver).toBe(false); // Original não deve mudar
      expect(updatedMember).not.toBe(initialMember); // Deve ser uma nova instância
    });

    test('deve retornar a SI MESMO (idempotência) se já for o cuidador principal', () => {
      // Arrange
      const initialMember = FamilyMember.create(createValidProps({ isPrimaryCaregiver: true })).unwrap();

      // Act
      // O método deve ser idempotente
      const updatedMember = initialMember.assignAsPrimaryCaregiver(); 

      // Assert
      expect(updatedMember.isPrimaryCaregiver).toBe(true);
      expect(updatedMember).toBe(initialMember); // Deve retornar a *mesma* instância
    });

    // (Você deve adicionar um teste similar para 'revokePrimaryCaregiver' quando o criar)
  });

  describe('Identidade da Entidade', () => {
    
    test('deve considerar duas instâncias iguais se seus IDs forem os mesmos (equals)', () => {
      /**
       * 💡 O que este teste ensina:
       * A definição de uma Entidade (vs. Value Object) é que ela tem uma
       * identidade que persiste acima das mudanças de estado.
       * Duas instâncias de FamilyMember são "iguais" se elas representam
       * o *mesmo papel* (mesmo 'id'), mesmo que seus atributos
       * (como 'isPrimaryCaregiver') sejam diferentes.
       */
       
      // Arrange
      const id = FamilyMemberId.create().unwrap();
      const member1 = FamilyMember.create(createValidProps({ id, isPrimaryCaregiver: false })).unwrap();
      const member2 = member1.assignAsPrimaryCaregiver(); // Mesmo ID, estado diferente

      // Act & Assert
      expect(member1.id.equals(member2.id)).toBe(true);
      expect(member1.equals(member2)).toBe(true); // Método 'equals' deve comparar por ID
      expect(member1).not.toBe(member2); // São instâncias diferentes
      expect(member1.isPrimaryCaregiver).not.toBe(member2.isPrimaryCaregiver); // Com estados diferentes
    });
  });
});