export type RuntimePort = {
  env(key: string): string | undefined;
  exit(code?: number): void;
  cwd(): string;
};
