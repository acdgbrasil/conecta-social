import { crypto } from "bun";

/**
 * Utilitário funcional para verificação de assinaturas de Webhooks do Logto.
 * Garante que o payload não foi adulterado e provém do nosso IdP.
 */
export const LogtoSignature = {
  /**
   * Verifica se a assinatura SHA-256 coincide com o payload e a chave secreta.
   */
  async verify(
    payload: string,
    signature: string | undefined | null,
    signingKey: string | undefined
  ): Promise<boolean> {
    if (!signature || !signingKey) return false;

    try {
      const hmac = new Bun.CryptoHasher("sha256", signingKey);
      hmac.update(payload);
      const expectedSignature = hmac.digest("hex");

      return signature === expectedSignature;
    } catch (error) {
      console.error("[LogtoSignature] Erro ao verificar assinatura:", error);
      return false;
    }
  },
};
