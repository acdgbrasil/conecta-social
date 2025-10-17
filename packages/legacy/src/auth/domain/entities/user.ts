// src/auth/domain/entities/user.ts

/**
 * Representa a entidade de usuário com os dados essenciais para autenticação.
 * Esta é uma entidade pura do domínio, sem dependências externas.
 */
export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string; // A senha já deve vir hasheada do banco de dados.
  isActive: boolean;
};
