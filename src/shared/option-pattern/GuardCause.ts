import type { Option } from "@conecta/shared/option-pattern/Option";

export type GuardLet = <T>(option: Option<T>, elseBlock?: () => T) => T;

export type IfLet = <T>(option: Option<T>) => T;

export const guardLet: GuardLet = <T>(
  option: Option<T>,
  elseBlock?: () => T,
): T => {
  if (option.isSome) return option.value;
  if (elseBlock) return elseBlock();
  throw new Error("GuardLet failed: expected Some, got None");
};

export const ifLet: IfLet = <T>(option: Option<T>): T => {
  return guardLet(option);
};
