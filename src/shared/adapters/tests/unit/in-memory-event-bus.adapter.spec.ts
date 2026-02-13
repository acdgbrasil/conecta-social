import { describe, expect, mock, test } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import { Result } from "@conecta/result";

describe("InMemoryEventBus Adapter", () => {
	test("publish deve entregar evento aos handlers e registrar no buffer", async () => {
		const bus = inMemoryEventBus();
		const handler = { handle: mock(async () => {}) };
		bus.subscribe("PatientCreated", handler);

		const event = {
			name: "PatientCreated",
			payload: { patientId: "p-1" },
			occurredAt: new Date(),
		};

		const result = await bus.publish(event);

		expect(Result.isOk(result)).toBe(true);
		expect(handler.handle).toHaveBeenCalledTimes(1);
		expect(handler.handle).toHaveBeenCalledWith(event);
		expect(bus.published.length).toBe(1);
	});

	test("publish com array deve processar todos os eventos", async () => {
		const bus = inMemoryEventBus();
		const handler = { handle: mock(async () => {}) };
		bus.subscribe("PatientUpdated", handler);

		const events = [
			{
				name: "PatientUpdated",
				payload: { id: "p-1" },
				occurredAt: new Date(),
			},
			{
				name: "PatientUpdated",
				payload: { id: "p-2" },
				occurredAt: new Date(),
			},
		] as const;

		const result = await bus.publish(events);

		expect(Result.isOk(result)).toBe(true);
		expect(handler.handle).toHaveBeenCalledTimes(2);
		expect(bus.published.length).toBe(2);
	});

	test("unsubscribe deve remover apenas o handler inscrito", async () => {
		const bus = inMemoryEventBus();
		const handlerA = { handle: mock(async () => {}) };
		const handlerB = { handle: mock(async () => {}) };

		const subA = bus.subscribe("FamilyMemberAdded", handlerA);
		bus.subscribe("FamilyMemberAdded", handlerB);
		subA.unsubscribe();

		await bus.publish({
			name: "FamilyMemberAdded",
			payload: { memberId: "m-1" },
			occurredAt: new Date(),
		});

		expect(handlerA.handle).toHaveBeenCalledTimes(0);
		expect(handlerB.handle).toHaveBeenCalledTimes(1);
	});

	test("clear deve limpar buffer e handlers", async () => {
		const bus = inMemoryEventBus();
		const handler = { handle: mock(async () => {}) };
		bus.subscribe("ReferralCreated", handler);

		await bus.publish({
			name: "ReferralCreated",
			payload: { referralId: "r-1" },
			occurredAt: new Date(),
		});
		expect(bus.published.length).toBe(1);

		bus.clear();
		expect(bus.published.length).toBe(0);

		await bus.publish({
			name: "ReferralCreated",
			payload: { referralId: "r-2" },
			occurredAt: new Date(),
		});
		expect(handler.handle).toHaveBeenCalledTimes(1);
	});
});
