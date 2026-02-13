import type { DomainError } from "@conecta/domain-error/DomainError";
import type { AuthenticatedUser, AuthPort } from "@conecta/ports";
import { Result } from "@conecta/result";

export type LogtoAuthConfig = {
	readonly endpoint: string;
	readonly userInfoPath?: string;
};

type LogtoUserInfo = {
	readonly sub?: string;
	readonly scope?: string | readonly string[];
	readonly scopes?: readonly string[];
	readonly custom_data?: Record<string, unknown>;
	readonly customData?: Record<string, unknown>;
	readonly personId?: string;
};

const toAuthError = (message: string, code: string): DomainError =>
	({ message, code }) as DomainError;

const normalizeEndpoint = (endpoint: string): string =>
	endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;

const parseScopes = (payload: LogtoUserInfo): readonly string[] => {
	const scopes = payload.scopes ?? payload.scope;
	if (Array.isArray(scopes)) {
		return scopes.filter((scope): scope is string => typeof scope === "string");
	}
	if (typeof scopes === "string") {
		return scopes
			.split(" ")
			.map((scope) => scope.trim())
			.filter(Boolean);
	}
	return [];
};

const extractPersonId = (payload: LogtoUserInfo): string | undefined => {
	if (typeof payload.personId === "string" && payload.personId.length > 0) {
		return payload.personId;
	}

	const customData = payload.custom_data ?? payload.customData;
	if (!customData || typeof customData !== "object") {
		return undefined;
	}

	const personId = customData.personId;
	return typeof personId === "string" && personId.length > 0
		? personId
		: undefined;
};

export const makeLogtoAuthPort = (config: LogtoAuthConfig): AuthPort => {
	const endpoint = normalizeEndpoint(config.endpoint);
	const userInfoPath = config.userInfoPath ?? "/oidc/me";

	return {
		validateToken: async (token: string) => {
			if (!token || token.trim().length === 0) {
				return Result.err(toAuthError("Missing access token", "AUTH-001"));
			}

			let response: Response;
			try {
				response = await fetch(`${endpoint}${userInfoPath}`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});
			} catch (error) {
				return Result.err(
					toAuthError(
						`Identity provider unreachable: ${String(error)}`,
						"AUTH-002",
					),
				);
			}

			if (!response.ok) {
				if (response.status === 401) {
					return Result.err(
						toAuthError("Invalid or expired access token", "AUTH-003"),
					);
				}

				return Result.err(
					toAuthError(
						`Identity provider returned HTTP ${response.status}`,
						"AUTH-004",
					),
				);
			}

			let payload: LogtoUserInfo;
			try {
				payload = (await response.json()) as LogtoUserInfo;
			} catch {
				return Result.err(
					toAuthError("Invalid identity provider response", "AUTH-005"),
				);
			}

			if (!payload.sub || payload.sub.trim().length === 0) {
				return Result.err(
					toAuthError("Identity payload missing subject", "AUTH-006"),
				);
			}

			const user: AuthenticatedUser = {
				sub: payload.sub,
				personId: extractPersonId(payload),
				scopes: parseScopes(payload),
			};

			return Result.ok(user);
		},

		hasScopes: (user, requiredScopes) =>
			requiredScopes.every((requiredScope) =>
				user.scopes.includes(requiredScope),
			),
	};
};
