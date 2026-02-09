import type { DomainError } from "@conecta/domain-error/DomainError";
import { Result as ResultNamespace } from "./Result";

export const Result = ResultNamespace;
export type { Ok, Err } from "./Result";
export type Result<T, E = DomainError> = import("./Result").Result<T, E>;
