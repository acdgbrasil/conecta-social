# Proposta Técnica: Do Notation (com Generators) para Result

> **Status:** Backlog / Futuro
> **Contexto:** Melhoria da ergonomia do `Result Pattern` em fluxos sequenciais complexos.

---

## 🧐 O que é a "Do Notation" (com Generators)?

Se você já usa `async/await`, você já entende a alma da Do Notation.

* **O problema do Async antigo:** Antes, tínhamos o "Callback Hell" ou cadeias infinitas de `.then().then().catch()`.
* **A solução do Async/Await:** Você escreve código que *parece* síncrono (linha após linha), mas o compilador cuida da assincronia por baixo dos panos.

A **Do Notation** faz exatamente a mesma coisa, mas para **Erros** (Result), usando a funcionalidade de **Generators** do JavaScript (`function*` e `yield`).

### Como funciona a mágica:

1. Você cria uma função geradora (`function*`).
2. Sempre que chamar algo que retorna um `Result`, você coloca um `yield` na frente.
3. **A Mágica:** Um utilitário (chamado `output` ou `doResult`) roda esse gerador passo a passo.
    * Se o `Result` for **Sucesso (Ok)**: O utilitário "arranca" o valor de dentro e entrega para a variável à esquerda do yield.
    * Se o `Result` for **Erro (Err)**: O utilitário **PARA TUDO IMEDIATAMENTE**, aborta a função e retorna o Erro para quem chamou.

---

## 💾 O Prompt para o Futuro

Quando houver tempo para evoluir a biblioteca `@conecta/result`, utilize o prompt abaixo:

---

**Título:** Melhoria Técnica - Implementar Do-Notation (Generator) na lib @conecta/result

**Contexto:**
Atualmente, estamos utilizando o *Result Pattern* em todo o domínio. Porém, em casos de uso com muitas etapas sequenciais, estamos sofrendo com o "Unwrap Hell" (múltiplos `if (res.isErr) return res`), o que polui a leitura da regra de negócio.

**Objetivo:**
Implementar uma função utilitária (sugestão de nome: `output`, `doResult` ou `safeBlock`) que utilize **JavaScript Generators** para simular o comportamento de "early return" em caso de erro, similar ao operador `?` do Rust ou `do notation` do Haskell.

**Requisitos Técnicos:**

1. A função deve receber um `Generator`.
2. Ela deve iterar sobre o generator.
3. Quando o `yield` retornar um `Result::Err`, a função deve parar a iteração imediatamente e retornar esse `Err`.
4. Quando o `yield` retornar um `Result::Ok`, a função deve extrair o valor (`unwrap`) e injetá-lo de volta no generator, permitindo atribuição direta (`const valor = yield Metodo()`).
5. **Crucial:** A tipagem TypeScript deve ser preservada. O retorno da função utilitária deve ser inferido corretamente como `Result<T, E>`, onde `E` é a união de todos os erros possíveis lançados dentro do bloco.

**Exemplo de uso esperado:**

```typescript
// Antes
/*
const userRes = User.create(dto);
if (userRes.isErr) return err(userRes.error);
const user = userRes.value;

const saveRes = repo.save(user);
if (saveRes.isErr) return err(saveRes.error);
*/

// Depois (Meta)
/*
return output(function* () {
  const user = yield User.create(dto); // Retorna User ou aborta com DomainError
  yield repo.save(user);               // Retorna void ou aborta com InfraError
  
  return user; // Retorna Result<User, DomainError | InfraError>
});
*/
```

**Tarefa:**
Crie o código dessa função utilitária compatível com a nossa estrutura atual da classe `Result` (que possui métodos `isErr`, `isOk`, `unwrap`, etc.).
