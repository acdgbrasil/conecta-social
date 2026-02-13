import type { Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error/DomainError";

/**
 * Representa os dados básicos de um indivíduo autenticado.
 */
export type AuthenticatedUser = {
  readonly sub: string; // Identificador único no Identity Provider (Logto)
  readonly personId?: string; // UUID v7 vinculado no People Context (custom_data)
  readonly scopes: readonly string[];
};

/**
 * Contrato funcional para o Provedor de Identidade e Acesso (IAM).
 */
export type AuthPort = {
  /**
   * Valida um Access Token (JWT) e extrai os dados do usuário.
   */
  readonly validateToken: (token: string) => Promise<Result<AuthenticatedUser, DomainError>>;

  /**
   * Verifica se o usuário autenticado possui todos os escopos necessários.
   */
  readonly hasScopes: (user: AuthenticatedUser, requiredScopes: readonly string[]) => boolean;
};
