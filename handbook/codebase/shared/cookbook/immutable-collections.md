# Garantindo invariantes em coleções

## Cenário
Um agregado precisa manter a lista de dependências funcionais de um paciente sem permitir duplicatas ou mutações diretas.

## Ferramentas
- `ImutableListFactory`
- `Result`

## Passo a passo

```ts typescript
import { ImutableListFactory } from "@conecta/fn";
import { Result, ok, err } from "@conecta/result";
import { SHSDE } from "../err/SocialHealthSummary.error";

type FunctionalDependency = string;

type SummaryProps = {
  dependencies: readonly FunctionalDependency[];
};

export class FunctionalDependencyList {
  private constructor(readonly items: readonly FunctionalDependency[]) {
    Object.freeze(this);
  }

  static create(props: SummaryProps): Result<FunctionalDependencyList, ReturnType<typeof SHSDE.DuplicateDependency>> {
    const list = ImutableListFactory.fromArray([...props.dependencies]);
    const unique = list.setUnique();

    if (unique.count() !== list.count()) {
      return err(SHSDE.DuplicateDependency());
    }

    return ok(new FunctionalDependencyList(unique.getAll()));
  }

  add(entry: FunctionalDependency) {
    return FunctionalDependencyList.create({
      dependencies: ImutableListFactory.fromArray([...this.items]).add(entry).getAll(),
    });
  }
}
```

### Pontos de atenção
- Sempre clone o array de entrada (`[...props.dependencies]`) antes de transformar em `ImutableList`.
- Use `setUnique` para detectar duplicidade sem escrever loops manuais.
- Métodos de mutação devem retornar um novo `Result`, nunca mutar `this.items`.
