import { describe, expect, spyOn, test, } from "bun:test";
import { TE, Timestamp } from "packages/conecta-raros/social-care";

describe("Timestamp.valueObject (RED tests)", () => {
  test("aceita strings ISO convertendo automaticamente para Date", () => {
    const result = Timestamp.createFromISOString("2024-05-10T03:00:00Z");

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().toISOString()).toBe("2024-05-10T03:00:00.000Z");
  });

  test("trunca milissegundos ao normalizar datas", () => {
    const dateWithMs = new Date("2024-05-10T03:00:00.987Z");
    const result = Timestamp.create({ value: dateWithMs });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().toISOString()).toBe("2024-05-10T03:00:00.000Z");
  });

  test("mantém a data inalterada se não houver milissegundos", () => {
    const dateWithoutMs = new Date("2024-05-10T03:00:00.000Z");
    const result = Timestamp.create({ value: dateWithoutMs });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().toISOString()).toBe("2024-05-10T03:00:00.000Z");
  });



  test("isAfter retorna true quando a data é posterior", () => {
    const t1 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-02T00:00:00Z").unwrap();
    expect(t2.isAfter(t1)).toBe(true);
  });

  test("isAfter retorna false quando a data não é posterior", () => {
    const t1 = Timestamp.createFromISOString("2024-01-02T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    expect(t2.isAfter(t1)).toBe(false);
  });

  test("isAfter retorna false para datas iguais", () => {
    const t1 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    expect(t1.isAfter(t2)).toBe(false);
  });

  test("isBefore retorna true quando a data é anterior", () => {
    const t1 = Timestamp.createFromISOString("2024-01-02T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    expect(t2.isBefore(t1)).toBe(true);
  });

  test("isBefore retorna false quando a data não é anterior", () => {
    const t1 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-02T00:00:00Z").unwrap();
    expect(t2.isBefore(t1)).toBe(false);
  });

  test("isBefore retorna false para datas iguais", () => {
    const t1 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    expect(t1.isBefore(t2)).toBe(false);
  });

  test("equals retorna true para timestamps idênticos", () => {
    const t1 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    expect(t1.equals(t2)).toBe(true);
  });

  test("equals retorna false para timestamps diferentes", () => {
    const t1 = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const t2 = Timestamp.createFromISOString("2024-01-01T00:00:01Z").unwrap();
    expect(t1.equals(t2)).toBe(false);
  });

  test("getFullYear retorna o ano UTC correto", () => {
    const t = Timestamp.createFromISOString("2023-12-31T23:00:00Z").unwrap(); // 2024 in some timezones
    expect(t.getFullYear()).toBe(2023);
  });

  test("getFullYear retorna o ano correto para o início de um ano", () => {
    const t = Timestamp.createFromISOString("2025-01-01T00:00:00Z").unwrap();
    expect(t.getFullYear()).toBe(2025);
  });

  test("toDate retorna um clone do objeto Date interno", () => {
    const originalDate = new Date("2024-05-10T10:00:00Z");
    const timestamp = Timestamp.create({ value: originalDate }).unwrap();
    const clonedDate = timestamp.toDate();

    expect(clonedDate != originalDate).toBe(true);
    expect(clonedDate.getTime()).toBe(timestamp.toDate().getTime());

    clonedDate.setFullYear(1999);
    expect(timestamp.getFullYear()).toBe(2024);
  });

  test("copyWith cria uma nova instância com o valor fornecido", () => {
    const initial = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const newDate = new Date("2025-02-02T00:00:00Z");
    const copied = initial.copyWith({ value: newDate }).unwrap();

    expect(copied.getFullYear()).toBe(2025);
    expect(copied.equals(initial)).toBe(false);
  });

  test("copyWith cria uma cópia exata se nenhum valor for fornecido", () => {
    const initial = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const copied = initial.copyWith({}).unwrap();

    expect(copied.equals(initial)).toBe(true);
    expect(copied != initial).toBe(true);
  });


  test("copyWith trunca milissegundos do novo valor", () => {
    const initial = Timestamp.createFromISOString("2024-01-01T00:00:00Z").unwrap();
    const newDateWithMs = new Date("2025-02-02T10:20:30.123Z");
    const copiedResult = initial.copyWith({ value: newDateWithMs });

    expect(copiedResult.isOk).toBe(true);
    if (!copiedResult.isOk) return;

    const copied = copiedResult.unwrap();
    expect(copied.toISOString()).toBe("2025-02-02T10:20:30.000Z");
  });
});
/**
 * 💡 O que este arquivo de teste ensina:
 *
 * O 'Timestamp' é um Value Object (VO) fundamental. Seu único trabalho
 * é encapsular um momento no tempo ('Date') e garantir que ele seja
 * 100% imutável e sempre válido.
 *
 * A implementação correta deste VO deve:
 * 1. Armazenar o valor internamente como um objeto 'Date', não como 'string'.
 * 2. Validar a data de entrada no método 'create()'.
 * 3. Fazer "Cópias Defensivas" para garantir a imutabilidade [CR-1].
 * 4. Fornecer métodos de comparação e getters eficientes (sem parsing).
 *
 * Estes testes são projetados para quebrar se essas regras não forem seguidas.
 */
describe('Timestamp.valueObject', () => {

  // --- Helpers de Teste ---
  const dateA = new Date("2024-01-10T12:00:00Z");
  const dateB_later = new Date("2024-01-11T12:00:00Z");
  const dateC_earlier = new Date("2024-01-09T12:00:00Z");
  const dateA_copy = new Date("2024-01-10T12:00:00Z");

  /**
   * 💡 O que este teste ensina:
   * O método 'create' é o "Guardião" do VO. Ele deve
   * rejeitar qualquer data que não seja válida (inválida, NaN, null).
   * O uso de 'test.each' (uma boa prática do bun:test)
   * nos permite testar múltiplos casos de falha de forma concisa.
   */
  describe('1. Criação (Factory) e Validação', () => {

    test('deve criar um Timestamp válido a partir de um objeto Date', () => {
      // Arrange
      const props = { value: dateA };

      // Act
      const result = Timestamp.create(props);

      // Assert
      expect(result.isOk).toBe(true);
    });

    // REATORADO: Usando test.each para agrupar casos de falha
    const invalidCases = [
      { name: "data inválida (NaN)", value: new Date('isto não é uma data') },
      { name: "valor null", value: null },
      { name: "valor undefined", value: undefined }
    ];

    // test.each é a forma idiomática de fazer testes parametrizados
    test.each(invalidCases)('deve FALHAR ao criar a partir de $name (regra TS-001)', ({ value }) => {
      // Arrange
      const props = { value: value as any };

      // Act
      const result = Timestamp.create(props);

      // Assert
      // Sua implementação 'new Date(props.value).toISOString()' lançará uma
      // exceção (RangeError) aqui se não for validada. O teste espera um Result.err.
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(TE.InvalidDate({value: ""}).code); //
    });
  });

  /**
   * 💡 O que este teste ensina:
   * Este é o teste para o [CR-1]. Objetos 'Date' em JS são mutáveis.
   * Para garantir a imutabilidade, o 'Timestamp' deve:
   * 1. (Teste 1) Criar uma "Cópia Defensiva" no 'create()'.
   * 2. (Teste 2) Retornar uma "Cópia Defensiva" no 'toDate()'.
   */
  describe('2. Imutabilidade (Cópia Defensiva - [CR-1])', () => {

    test('[CR-1] deve ser imune a mutações no objeto Date original (cópia na criação)', () => {
      // Arrange
      const originalDate = new Date("2024-01-01T12:00:00Z");
      // O 'create' deve fazer uma cópia defensiva
      const timestamp = Timestamp.create({ value: originalDate }).unwrap();

      // Act: Ação "maliciosa" de fora, mutando o objeto Date original
      originalDate.setFullYear(2099);

      // Assert
      // Se o 'create' não fez uma cópia defensiva, o estado interno
      // do 'timestamp' foi corrompido. O teste falhará aqui.
      expect(timestamp.getFullYear()).toBe(2024);
      expect(timestamp.getFullYear()).not.toBe(2099);
    });

    test('[CR-1] deve proteger o estado interno contra mutações no objeto Date retornado (cópia na saída)', () => {
      // Arrange
      const timestamp = Timestamp.create({ value: dateA }).unwrap();
      
      // Pega o que deveria ser uma CÓPIA do Date interno
      const dateCopia = timestamp.toDate();

      // Act: Ação "maliciosa", mutando a cópia retornada
      dateCopia.setFullYear(2099);

      // Assert
      // Se o 'toDate()' retornou a referência interna (this.value) em vez de
      // uma cópia, o estado do 'timestamp' foi corrompido.
      expect(timestamp.getFullYear()).toBe(2024);
      expect(timestamp.getFullYear()).not.toBe(2099);
    });
  });

  /**
   * 💡 O que este teste ensina:
   * Métodos de comparação devem ser eficientes. O uso de 'test.each'
   * nos permite validar múltiplos cenários (passado, futuro, presente)
   * para cada método de forma limpa.
   */
  describe('3. Métodos de Comparação', () => {

    // Arrange: Criamos as instâncias uma vez
    const tsA = Timestamp.create({ value: dateA }).unwrap();
    const tsLater = Timestamp.create({ value: dateB_later }).unwrap();
    const tsEarlier = Timestamp.create({ value: dateC_earlier }).unwrap();
    const tsA_copy = Timestamp.create({ value: dateA_copy }).unwrap();

    // REATORADO: Usando test.each para 'isAfter'
    test.each(<any[]>[
      { name: "presente vs passado", ts1: tsA, ts2: tsEarlier, expected: true },
      { name: "presente vs futuro", ts1: tsA, ts2: tsLater, expected: false },
      { name: "presente vs presente", ts1: tsA, ts2: tsA_copy, expected: false },
    ])('isAfter() deve retornar $expected para $name', ({ ts1, ts2, expected }) => {
      expect(ts1.isAfter(ts2)).toBe(expected);
    });
    
    // REATORADO: Usando test.each para 'isBefore'
    test.each(<any[]>[
      { name: "presente vs futuro", ts1: tsA, ts2: tsLater, expected: true },
      { name: "presente vs passado", ts1: tsA, ts2: tsEarlier, expected: false },
      { name: "presente vs presente", ts1: tsA, ts2: tsA_copy, expected: false },
    ])('isBefore() deve retornar $expected para $name', ({ ts1, ts2, expected }) => {
      expect(ts1.isBefore(ts2)).toBe(expected);
    });

    // REATORADO: Usando test.each para 'equals'
    test.each(<any[]>[
      { name: "mesma instância", ts1: tsA, ts2: tsA, expected: true },
      { name: "instâncias diferentes, mesmo valor", ts1: tsA, ts2: tsA_copy, expected: true },
      { name: "valores diferentes", ts1: tsA, ts2: tsLater, expected: false },
    ])('equals() deve retornar $expected para $name', ({ ts1, ts2, expected }) => {
      expect(ts1.equals(ts2)).toBe(expected);
    });
  });

  /**
   * 💡 O que este teste ensina:
   * Métodos 'getter' (como getFullYear) devem ser diretos e eficientes.
   * Sua implementação atual (que armazena string) é forçada a fazer
   * 'this.copyWith...unwrap().toDate()...', o que é muito ineficiente.
   * Este teste usa 'spyOn'
   * para garantir que a implementação correta (que armazena 'Date')
   * acesse o valor diretamente, sem chamar outros métodos.
   */
  describe('4. Métodos Getters (Acesso Eficiente)', () => {

    test('deve retornar os valores (getFullYear, toISOString) eficientemente sem chamadas extras', () => {
      // Arrange
      const specificDate = new Date("2025-02-15T10:30:00Z");
      const ts = Timestamp.create({ value: specificDate }).unwrap();
      
      // Criamos espiões
      const copyWithSpy = spyOn(ts, 'copyWith');
      const toDateSpy = spyOn(ts, 'toDate');

      // Act
      const year = ts.getFullYear();
      const iso = ts.toISOString();

      // Assert
      // A implementação de string (errada) FALHARÁ aqui, pois 'copyWith' e 'toDate'
      // serão chamados. A implementação de 'Date' (correta) passará.
      expect(year).toBe(2025);
      expect(iso).toBe("2025-02-15T10:30:00.000Z");
      expect(copyWithSpy).not.toHaveBeenCalled();
      expect(toDateSpy).not.toHaveBeenCalled();
      
      // Limpa os espiões
      copyWithSpy.mockRestore();
      toDateSpy.mockRestore();
    });
  });

  /**
   * 💡 O que este teste ensina:
   * O método 'copyWith' deve retornar uma *nova instância* do VO.
   * O teste 'chamado vazio' é crucial: ele falhará na sua implementação
   * de 'string' (pois 'new Date(this.value)' falha se 'this.value'
   * for uma string ISO).
   */
  describe('5. Imutabilidade (copyWith)', () => {

    test('copyWith() deve criar uma nova instância com o valor alterado', () => {
      // Arrange
      const ts1 = Timestamp.create({ value: dateA }).unwrap();
      
      // Act
      const result = ts1.copyWith({ value: dateB_later });
      const ts2 = result.unwrap();

      // Assert
      expect(result.isOk).toBe(true);
      expect(ts1).not.toBe(ts2); // Deve ser uma nova instância
      expect(ts2.isAfter(ts1)).toBe(true);
    });

    test('copyWith() deve criar uma nova instância com o mesmo valor se chamado vazio', () => {
      // Arrange
      const ts1 = Timestamp.create({ value: dateA }).unwrap();
      
      // Act
      // Sua implementação atual de 'string' FALHARÁ aqui.
      const result = ts1.copyWith({}); 
      const ts2 = result.unwrap();

      // Assert
      expect(result.isOk).toBe(true);
      expect(ts1).not.toBe(ts2);       // Ainda deve ser uma nova instância
      expect(ts1.equals(ts2)).toBe(true); // Mas com o mesmo valor
    });
  });
});

