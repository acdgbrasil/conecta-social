import type { Option } from "./Option";

export type GuardLet = <T>(option: Option<T>, elseBlock?: () => T) => T;

export type IfLet = <T>(option: Option<T>) => T;

/**
 * Compat wrappers mantidos para migração gradual.
 * Substitua por `Option.match` ou checagem com `Option.isSome`.
 */
export const guardLet: GuardLet = <T>(option: Option<T>, elseBlock?: () => T): T => {
  if (option.kind === "some") return option.value;
  if (elseBlock) return elseBlock();
  throw new Error("GuardLet failed: expected Some, got None");
};

export const ifLet: IfLet = <T>(option: Option<T>): T => guardLet(option);
