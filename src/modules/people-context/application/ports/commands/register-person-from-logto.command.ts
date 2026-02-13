/**
 * Comando disparado pelo Webhook do Logto quando um novo usuário se registra.
 */
export type RegisterPersonFromLogtoCommand = {
  readonly logtoUserId: string;
  readonly email: string;
  readonly name?: string;
};
