// src/auth/domain/repository/authRepository.ts

import { AuthUser } from '../entities/user';

/**
 * Define o contrato (interface) para o repositório de autenticação.
 * Qualquer implementação concreta (PostgreSQL, MongoDB, etc.) deve aderir a esta interface.
 * O domínio depende desta abstração, não de uma implementação concreta.
 */
export type AuthRepository = {
  /**
   * Busca um usuário pelo seu endereço de e-mail.
   * @param email O e-mail do usuário a ser encontrado.
   * @returns Uma promessa que resolve para a entidade AuthUser ou null se não for encontrado.
   */
  findByEmail(email: string): Promise<AuthUser | null>;
};
