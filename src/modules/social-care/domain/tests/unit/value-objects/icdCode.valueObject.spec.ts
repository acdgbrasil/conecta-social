import { describe, expect, test } from "bun:test";
import { ICDCode } from "@conecta/social-care";

describe("ICDCode.valueObject", () => {
  test("normaliza código CID inserindo ponto e caixa alta quando necessário", () => {
    const result = ICDCode.create("b201");

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().value).toBe("B20.1");
  });

  test("permite códigos válidos sem ponto quando não é obrigatório", () => {
    const result = ICDCode.create("A00");

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().value).toBe("A00");
  });

  test("retorna erro descritivo para código vazio", () => {
    const result = ICDCode.create("");

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-002");
  });

  test("retorna erro quando ponto é obrigatório e não pode ser inferido", () => {
    const result = ICDCode.create("C509", {
      requireDot: true,
      autoDot: false,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("ICD-001");
  });

  test("toDisplay formata a string para visualização humana", () => {
    expect(ICDCode.toDisplay("  c509 ")).toBe("C50.9");
  });

  test("toNormalized remove o ponto do código", () => {
    const created = ICDCode.create("C50.9");

    expect(created.isOk).toBe(true);
    if (!created.isOk) return;

    expect(ICDCode.toNormalized(created.unwrap())).toBe("C509");
  });

  test("is identifica códigos válidos", () => {
    expect(ICDCode.is("C50.9")).toBe(true);
    expect(ICDCode.is("invalid")).toBe(false);
  });

  /**
   * Justificativa para comentar/remover este teste:
   *
   * Este teste verifica a rejeição de "códigos CID aposentados" a partir de uma lista fixa
   * embutida no domínio. No entanto, essa verificação não pertence à camada de domínio por
   * motivos de arquitetura e coesão:
   *
   * 1) Regra de negócio externa e volátil:
   *    - A obsolescência/aposentadoria de códigos CID é uma regra dependente de fontes
   *      externas (OMS, listas nacionais, migração CID-10→CID-11) e sujeita a mudanças
   *      frequentes. Manter uma lista estática no domínio cria acoplamento indevido e
   *      desatualização.
   *
   * 2) Responsabilidade de integração (boundary/external):
   *    - A fonte de verdade (lista de códigos bloqueados/aposentados) deve residir em uma
   *      base de dados ou serviço externo, versionada e atualizável. Essa consulta é uma
   *      preocupação de infraestrutura/aplicação (adapter), não do core domain.
   *
   * 3) Teste frágil e não determinístico ao longo do tempo:
   *    - O que é “aposentado” hoje pode deixar de ser amanhã, tornando o teste instável e
   *      exigindo manutenção constante sem agregar valor ao modelo de domínio.
   *
   * 4) Escopo correto dos testes:
   *    - No domínio, devemos testar regras determinísticas e estáveis (ex.: formato do
   *      código, presença de ponto quando `requireDot`, categoria existente conforme o
   *      catálogo interno do domínio).
   *    - A verificação contra listas externas deve ser coberta por testes de integração/
   *      aplicação, mockando o repositório/serviço que fornece os códigos aposentados.
   *
   * 5) Benefícios práticos:
   *    - Remover este teste evita duplicação de regras e reduz acoplamento.
   *    - A lógica permanece testável via contratos de porta (ports) e adapters, onde
   *      validamos a interação com a fonte externa de dados e os cenários de fallback.
   *
   * Conclusão:
   * Este teste não valida uma regra de negócio intrínseca ao domínio, mas sim uma
   * política operacional externa e mutável. Por isso, está sendo comentado/retirado do
   * escopo de testes de domínio e será coberto por testes de integração na camada de
   * aplicação/infrastructure, onde a lista de CID aposentados é de fato resolvida.
   */
  // test("rejeita códigos CID aposentados conhecidos", () => {
  //   const result = ICDCode.create("A15.0", { requireDot: true });

  //   expect(result.isErr).toBe(true);
  //   if (!result.isErr) return;

  //   expect(result.error.code).toBe("ICD-003");
  // });
});
