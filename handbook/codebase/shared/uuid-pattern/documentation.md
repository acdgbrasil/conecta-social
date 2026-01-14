# @conecta/shared/uuid-pattern

> Value Object imutável para UUIDs com helpers de geração/validação.

## Recursos
- Suporte a versões `v1`, `v3`, `v4`, `v7`.
- Geração `v7` _time-ordered_ com fallback de RNG interno.
- Type guards (`isV1`, `isSupported`, etc.) e enum `Version`.

<Note>
  `Uuid.create()` sem argumentos gera automaticamente um UUID v7 e mantém um `seq` interno para preservar ordenação quando várias criações ocorrem no mesmo millis.
</Note>

## Uso básico

```ts typescript
import { Uuid } from "@conecta/uuid";

const generated = Uuid.create().unwrap(); // v7 lowercase
const parsed = Uuid.create("01890e18-257b-7b32-b264-93c9d46242ab");

if (parsed.isOk) {
  parsed.unwrap().getVersion(); // -> Version.V7
}
```

- `toString()` retorna a string canônica em minúsculas.
- `equals(other)` compara instâncias.

## Validação

```ts typescript
Uuid.isSupported(candidate);
Uuid.isV7(candidate);
```

Quando a string é inválida, `Uuid.create(value)` devolve `Result<never, InvalidUuidError>`.

## Geração determinística

```ts typescript
const rng = { nextInt: (max: number) => crypto.randomInt(max) };

const { uuid, nextSeq } = Uuid.generateV7({ rng, unixMillis: 1_697_000_000_000 });
uuid.toString(); // -> "01890..."
```

Para gerar UUID v4 aleatório:

```ts typescript
const uuid = Uuid.generateV4(rng);
```

## Boas práticas
- Armazene sempre em lowercase para evitar colisões (`create` já normaliza).
- Para IDs de entidades, prefira `Uuid` encapsulado em um Value Object específico (`PersonId`, `FamilyMemberId`, etc.) em vez de expor a classe diretamente.
- Quando precisar serializar, utilize `toString()`; nunca acesse `.value` diretamente.
