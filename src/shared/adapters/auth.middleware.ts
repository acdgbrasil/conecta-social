import type { AuthenticatedUser, AuthPort } from "@conecta/ports";
import { Result } from "@conecta/result";
import type { Context, Next } from "hono";

type AuthMiddlewareOptions = {
	readonly requiredScopes?: readonly string[];
};

const getBearerToken = (
	authorizationHeader: string | undefined,
): Result<string, { message: string }> => {
	if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
		return Result.err({
			message: "Missing or invalid authorization header",
		});
	}

	const token = authorizationHeader.slice("Bearer ".length).trim();
	if (token.length === 0) {
		return Result.err({
			message: "Missing bearer token",
		});
	}

	return Result.ok(token);
};

const isAuthenticatedUser = (value: unknown): value is AuthenticatedUser => {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Partial<AuthenticatedUser>;
	return (
		typeof candidate.sub === "string" &&
		Array.isArray(candidate.scopes) &&
		candidate.scopes.every((scope) => typeof scope === "string")
	);
};

export const makeAuthMiddleware = (
	authPort: AuthPort,
	options: AuthMiddlewareOptions = {},
) => {
	const requiredScopes = options.requiredScopes ?? [];

	return async (c: Context, next: Next) => {
		const existingUser = c.get("user");
		let user: AuthenticatedUser;

		if (isAuthenticatedUser(existingUser)) {
			user = existingUser;
		} else {
			const tokenResult = getBearerToken(c.req.header("Authorization"));
			if (Result.isErr(tokenResult)) {
				return c.json(
					{ success: false, error: tokenResult.error.message },
					401,
				);
			}

			const validation = await authPort.validateToken(tokenResult.value);
			if (Result.isErr(validation)) {
				return c.json({ success: false, error: validation.error.message }, 401);
			}

			user = validation.value;
			c.set("user", user);
		}

		if (
			requiredScopes.length > 0 &&
			!authPort.hasScopes(user, requiredScopes)
		) {
			return c.json({ success: false, error: "Insufficient permissions" }, 403);
		}

		await next();
	};
};
