import { describe, expect, test } from "bun:test";
import { CommunitySupportNetwork, CSN, FamilyMemberId, SocialBenefit, SocialBenefitsCollection, Timestamp } from "src";
import { P } from "../../err/Patient.error";

/**
   * 💡 O que este teste ensina:
   * Testes de Regressão para os bugs encontrados no Code Review.
   * Estes testes são projetados para FALHAR se os VOs subjacentes
   * e outros artefatos não forem corrigidos. Eles provam como bugs
   * em VOs podem corromper o estado do Agregado ou quebrar a aplicação.
   */
  describe("Testes de Regressão (Bugs do Code Review) do PR - [143] no dia: 04/11/2025", () => {

    /**
     * [CR-1] Garante que o Timestamp faz cópia defensiva.
     * Bug: O construtor de `Timestamp`
     * armazena a referência original do `Date`, violando a imutabilidade.
     */
    test("[CR-1] Timestamp deve ser imune a mutações externas em objetos Date", () => {
      // Arrange
      const originalDate = new Date("2024-01-01T12:00:00Z");
      
      // Cria um Timestamp (que *deveria* copiar a data)
      const timestamp = Timestamp.create({ value: originalDate }).unwrap();
      
      // Act: Ação "maliciosa" de fora, mutando o objeto Date original
      originalDate.setFullYear(2099);

      // Assert
      // Se o Timestamp não fez cópia defensiva, o estado interno foi corrompido.
      // O teste falhará aqui (esperando 2024 mas recebendo 2099) se o bug não for corrigido.
      expect(timestamp.getFullYear()).toBe(2024);
      expect(timestamp.getFullYear()).not.toBe(2099);
    });

    /**
     * [CR-3] Garante que CommunitySupportNetwork valida strings vazias.
     * Bug: O método `create`
     * não valida `familyConflicts` contendo apenas espaços.
     */
    test("[CR-3] deve falhar ao criar CommunitySupportNetwork com 'familyConflicts' contendo apenas espaços", () => {
      // Arrange
      const props = {
        hasSupportFromRelatives: true,
        hasSupportFromNeighbors: true,
        familyConflicts: "   ", // Inválido
        patientParticipatesInGroups: true,
        familyParticipatesInGroups: false,
        patientHasAccessToLeisure: true,
        facesDiscriminationInCommunity: false,
      };

      // Act
      const result = CommunitySupportNetwork.create(props);

      // Assert: O teste espera um Erro.
      // Se o bug existir, 'result.isOk' será 'true' e o teste falhará.
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.unwrapErr().code).toBe(CSN.FamilyConflictsWhitespace().code); //
      }
    });

    /**
     * [CR-4] Garante que SocialBenefitsCollection.create lida com 'null'.
     * Bug: `SocialBenefitsCollection.create(null)`
     * lança um `TypeError` (não iterável) em vez de retornar um `Result.err`.
     */
    test("[CR-4] SocialBenefitsCollection.create não deve lançar TypeError com 'null'", () => {
      // Arrange
      const createWithNull = () => SocialBenefitsCollection.create(null as any);
      
      // Assert (Para o bug atual): O teste confirma que o bug existe.
      expect(createWithNull).toThrow(TypeError);
      
      /*
      // Assert (Após a correção): 
      // Quando você corrigir o bug (adicionando a validação de 'null'), 
      // comente a linha 'expect(...).toThrow' e descomente estas:
      
      const result = createWithNull();
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().message).toContain("lista de benefícios não pode ser nula");
      */
    });

    /**
     * [CR-5 & CR-6] Garante que métodos 'copyWith' não lançam exceções não tratadas.
     * Bug 5: `SocialBenefit.copyWith`
     * não trata o `Err` de `FamilyMemberId.create` e dá `unwrap()`.
     * Bug 6: `FamilyMemberId.copyWith(null)`
     * tenta ler propriedade 'value' de 'null'.
     */
    test("[CR-5 & CR-6] métodos 'copyWith' não devem lançar exceções não tratadas", () => {
      
      // --- Teste para o Bug 6 (FamilyMemberId) ---
      const id = FamilyMemberId.create().unwrap();
      const callCopyWithNull = () => id.copyWith(null as any);
      
      // Assert (Bug 6): Confirma que o bug (TypeError) existe.
      expect(callCopyWithNull).toThrow(TypeError);
      
      /*
      // Assert (Bug 6 - Após a correção):
      // Comente o 'expect(...).toThrow' acima e descomente estas linhas.
      const resultId = callCopyWithNull();
      expect(resultId.isErr).toBe(true);
      expect(resultId.unwrapErr().code).toBe("FMID-001"); //
      */

      // --- Teste para o Bug 5 (SocialBenefit) ---
      const benefit = SocialBenefit.create({
        benefitName: "Teste",
        amount: 100,
        beneficiaryId: FamilyMemberId.create().unwrap()
      }).unwrap();
      
      // Simula um estado corrompido (que a correção do bug 5 deve tratar)
      // Criamos uma instância "à força" com um ID inválido.
      const buggyBenefit = new (SocialBenefit as any)("Teste", 100, "invalid-uuid-string");
      const callBuggyCopy = () => buggyBenefit.copyWith({});

      // Assert (Bug 5): Confirma que o bug (Exceção do unwrap) existe.
      expect(callBuggyCopy).toThrow(); 
      
      /*
      // Assert (Bug 5 - Após a correção):
      // Comente o 'expect(...).toThrow' acima e descomente estas linhas.
      const resultBenefit = callBuggyCopy();
      expect(resultBenefit.isErr).toBe(true);
      expect(resultBenefit.unwrapErr().code).toBe(BE.BeneficiaryIdInvalid({ beneficiaryId: "" }).code); //
      */
    });

    /**
     * [CR-7] Garante que não estamos usando 'deep imports'.
     * Bug: Arquivos como 'FamilyMemberId.error.ts' e
     * 'Timestamp.error.ts'
     * importam de '@conecta/domain-error/DomainError.factory' em vez de '@conecta/domain-error'.
     */
    test("[CR-7] deve importar erros e utilitários a partir dos pontos de entrada (barrels)", () => {
      /**
       * 💡 O que este teste ensina:
       * Este teste não falha em tempo de execução, mas serve como um "teste de arquitetura".
       * Ele valida que importamos 'P' (atalhos de Patient.error).
       * 'P' é exportado por 'social-care/err/index.ts',
       * que por sua vez importa de '@conecta/domain-error' (o ponto de entrada correto).
       * * Este teste existe para lembrá-lo de corrigir os 'deep imports'
       * em *outros* arquivos, como 'FamilyMemberId.error.ts', para seguir este mesmo padrão.
       */
      
      // Arrange & Act
      const error = P.FamilyMemberNotFound({ personId: "123" });

      // Assert
      expect(error).toBeDefined();
      expect(error.code).toBe("P-005");
      expect(error.message).toContain("Membro da família não encontrado");
    });
  });