import type { RuntimePort } from "@conecta/ports";

export const bunRuntime: RuntimePort = {
  env: (key: string) => process.env[key],
  exit: (code?: number) => process.exit(code),
  cwd: () => process.cwd(),
};
