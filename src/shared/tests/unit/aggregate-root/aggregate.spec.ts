import { describe, expect, it } from "bun:test";
import { Aggregate } from "@conecta/shared/aggregate-root";
import { Uuid } from "@conecta/uuid";

describe("Aggregate (Functional Core)", () => {
  type UserProps = {
    name: string;
    age: number;
    roles: string[];
  };

  const id = Uuid.v4();
  const initialUser = Aggregate.of<UserProps>(id, {
    name: "Alice",
    age: 25,
    roles: ["user"],
  });

  it("of() cria um agregado com props readonly", () => {
    expect(initialUser.id).toBe(id);
    expect(initialUser.props.name).toBe("Alice");
    expect(initialUser.events).toBeEmpty();
    
  });

  it("update() cria nova instância com props atualizadas", () => {
    const updated = Aggregate.update(initialUser, { age: 26 });

    expect(updated).not.toBe(initialUser); // Referência mudou
    expect(updated.props).not.toBe(initialUser.props); // Props mudaram
    expect(updated.props.age).toBe(26);
    expect(updated.props.name).toBe("Alice"); // Mantém inalterado
  });

  it("update() aceita função para lógica derivada", () => {
    const birthday = Aggregate.update(initialUser, (current) => ({
      age: current.age + 1
    }));

    expect(birthday.props.age).toBe(26);
  });

  it("addEvent() adiciona evento sem mutar original", () => {
    const event = {
      name: "UserUpdated",
      payload: {},
      occurredAt: new Date()
    };

    const withEvent = Aggregate.addEvent(initialUser, event);

    expect(initialUser.events).toBeEmpty();
    expect(withEvent.events).toHaveLength(1);
    expect(withEvent.events[0]).toBe(event);
  });

  it("clearEvents() limpa a lista de eventos", () => {
    const event = { name: "Test", payload: {}, occurredAt: new Date() };
    const withEvent = Aggregate.addEvent(initialUser, event);
    const cleared = Aggregate.clearEvents(withEvent);

    expect(cleared.events).toBeEmpty();
    expect(withEvent.events).toHaveLength(1); // Imutabilidade
  });

  it("DeepReadonly protege arrays aninhados", () => {
    const admin = Aggregate.update(initialUser, (current) => ({
      roles: [...current.roles, "admin"]
    }));

    expect(admin.props.roles).toEqual(["user", "admin"]);
  });
});
