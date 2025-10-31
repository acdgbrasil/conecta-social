import { describe, expect, test } from "bun:test";
import { FamilyMember } from "../FamilyMember.entity"; // Irá falhar (ainda não existe)
import { FamilyMemberId } from "../../value-objects/FamilyMemberId.valueObject";
import { PersonId } from "../../value-objects/personId.valueObject";

describe('FamilyMember.entity', () => {
  test('deve criar um FamilyMember válido com todas as propriedades necessárias', () => {
    // Arrange
    const props = {
      id: FamilyMemberId.create().unwrap(), 
      personId: PersonId.create().unwrap(),
      relationship: 'FATHER_MOTHER',
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    };

    // Act
    const result = FamilyMember.create(props);

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const member = result.unwrap();
    expect(member.id.equals(props.id)).toBe(true);
    expect(member.personId.equals(props.personId)).toBe(true);
    expect(member.relationship).toBe('FATHER_MOTHER');
    expect(member.isPrimaryCaregiver).toBe(false);
    expect(member.residesWithPatient).toBe(true);
    expect(Object.isFrozen(member)).toBe(true); // Garantindo imutabilidade
  });

  test('deve falhar ao criar sem um personId, retornando um erro específico', () => {
    // Arrange
    const props = {
      id: FamilyMemberId.create().unwrap(),
      personId: null, // Inválido
      relationship: 'SIBLING',
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    };

    // Act
    const result = FamilyMember.create(props as any);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe('FM-001'); // Ex: FamilyMember error code 1
  });

  test('deve falhar ao criar com um relationship vazio, retornando um erro específico', () => {
    // Arrange
    const props = {
      id: FamilyMemberId.create().unwrap(),
      personId: PersonId.create().unwrap(),
      relationship: '', // Inválido
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    };

    // Act
    const result = FamilyMember.create(props);

    // Assert
    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    
    expect(result.error.code).toBe('FM-002');
  });

  test('deve permitir a designação como cuidador principal, retornando uma nova instância imutável', () => {
    // Arrange
    const initialMember = FamilyMember.create({
      id: FamilyMemberId.create().unwrap(),
      personId: PersonId.create().unwrap(),
      relationship: 'SPOUSE',
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    }).unwrap();

    // Act
    const updatedMember = initialMember.assignAsPrimaryCaregiver();

    // Assert
    expect(updatedMember.isPrimaryCaregiver).toBe(true);
    expect(initialMember.isPrimaryCaregiver).toBe(false); // Original não deve mudar
    expect(updatedMember).not.toBe(initialMember); // Deve ser uma nova instância
  });

  test('deve considerar duas instâncias iguais se seus ids forem os mesmos', () => {
    // Arrange
    const id = FamilyMemberId.create().unwrap();
    const member1 = FamilyMember.create({
      id,
      personId: PersonId.create().unwrap(),
      relationship: 'CHILD',
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    }).unwrap();

    const member2 = member1.assignAsPrimaryCaregiver(); // Mesmo ID, estado diferente

    // Act & Assert
    expect(member1.equals(member2)).toBe(true);
  });
});
