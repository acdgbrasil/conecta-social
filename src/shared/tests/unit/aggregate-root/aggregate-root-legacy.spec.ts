import { describe, expect, it } from "bun:test";
import { AggregateRoot } from "@conecta/shared/aggregate-root";
import { Uuid } from "@conecta/uuid";

describe("AggregateRoot (Legacy/Deprecated)", () => {
  class TestAggregate extends AggregateRoot<{ name: string }> {
    constructor(id: Uuid, name: string) {
      super(id, { name });
    }

    public updateName(name: string) {
      this.addEvent({ name: "NameUpdated", payload: { name }, occurredAt: new Date() });
    }

    public getNextEvents() {
      return this.nextEvents;
    }
  }

  it("deve gerenciar eventos de domínio", () => {
    const id = Uuid.v4();
    const agg = new TestAggregate(id, "Test");
    
    agg.updateName("New Name");
    expect(agg.domainEvents).toHaveLength(1);
    expect(agg.getNextEvents()).toHaveLength(1);
    
    const events = agg.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(agg.domainEvents).toBeEmpty();
  });

  it("clearDomainEvents() deve limpar sem retornar", () => {
    const id = Uuid.v4();
    const agg = new TestAggregate(id, "Test");
    agg.updateName("X");
    agg.clearDomainEvents();
    expect(agg.domainEvents).toBeEmpty();
  });
});
