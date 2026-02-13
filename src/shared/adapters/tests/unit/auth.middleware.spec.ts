import { describe, expect, mock, test } from "bun:test";
import type { DomainError } from "@conecta/domain-error/DomainError";
import { Result } from "@conecta/result";
import { Hono } from "hono";
import type { AuthenticatedUser, AuthPort } from "../../../ports/auth.port";
import { makeAuthMiddleware } from "../../auth.middleware";

describe("AuthMiddleware (Unit)", () => {
	const mockUser: AuthenticatedUser = {
		sub: "user_123",
		personId: "018f4a7a-1e37-7b2c-8f00-123456789abc",
		scopes: ["social-care:read"],
	};

	const validateTokenMock = mock(async (token: string) => {
		if (token === "valid_token") return Result.ok(mockUser);
		return Result.err({
			message: "Invalid token",
			code: "AUTH-001",
		} as DomainError);
	});
	const hasScopesMock = mock(
		(user: AuthenticatedUser, required: readonly string[]) => {
			return required.every((s) => user.scopes.includes(s));
		},
	);
	const authPortMock: AuthPort = {
		validateToken: validateTokenMock,
		hasScopes: hasScopesMock,
	};

	test("deve permitir acesso com token válido e escopos corretos", async () => {
		const app = new Hono();
		app.use(
			"/protected",
			makeAuthMiddleware(authPortMock, {
				requiredScopes: ["social-care:read"],
			}),
		);
		app.get("/protected", (c) => c.json({ ok: true }));

		const res = await app.request("/protected", {
			headers: { Authorization: "Bearer valid_token" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	test("deve bloquear acesso sem header de autorização", async () => {
		const app = new Hono();
		app.use("/protected", makeAuthMiddleware(authPortMock));
		app.get("/protected", (c) => c.json({ ok: true }));

		const res = await app.request("/protected");

		expect(res.status).toBe(401);
	});

	test("deve bloquear acesso quando o token bearer estiver vazio", async () => {
		const middleware = makeAuthMiddleware(authPortMock);
		const jsonMock = mock((body: unknown, status: number) => ({ body, status }));
		const c = {
			req: {
				header: (name: string) => (name === "Authorization" ? "Bearer " : undefined),
			},
			get: () => undefined,
			set: () => undefined,
			json: jsonMock,
		} as any;
		const next = mock(async () => {});

		const response = await middleware(c, next);

		expect(response).toEqual({
			body: { success: false, error: "Missing bearer token" },
			status: 401,
		});
		expect(next).not.toHaveBeenCalled();
	});

	test("deve bloquear acesso com token inválido", async () => {
		const app = new Hono();
		app.use("/protected", makeAuthMiddleware(authPortMock));
		app.get("/protected", (c) => c.json({ ok: true }));

		const res = await app.request("/protected", {
			headers: { Authorization: "Bearer invalid_token" },
		});

		expect(res.status).toBe(401);
		expect(await res.json()).toMatchObject({ error: "Invalid token" });
	});

	test("deve bloquear acesso se o usuário não tiver os escopos necessários", async () => {
		const app = new Hono();
		// Exige 'admin', mas o mock só tem 'read'
		app.use(
			"/protected",
			makeAuthMiddleware(authPortMock, { requiredScopes: ["admin"] }),
		);
		app.get("/protected", (c) => c.json({ ok: true }));

		const res = await app.request("/protected", {
			headers: { Authorization: "Bearer valid_token" },
		});

		expect(res.status).toBe(403);
		expect(await res.json()).toMatchObject({
			error: "Insufficient permissions",
		});
	});

	test("deve validar token apenas uma vez quando authn e authz rodam em cadeia", async () => {
		const app = new Hono();
		validateTokenMock.mockClear();
		hasScopesMock.mockClear();
		app.use("/protected", makeAuthMiddleware(authPortMock));
		app.use(
			"/protected",
			makeAuthMiddleware(authPortMock, {
				requiredScopes: ["social-care:read"],
			}),
		);
		app.get("/protected", (c) => c.json({ ok: true }));

		const res = await app.request("/protected", {
			headers: { Authorization: "Bearer valid_token" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
		expect(validateTokenMock.mock.calls.length).toBe(1);
	});
});
