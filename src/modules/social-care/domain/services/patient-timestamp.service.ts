import type { DomainError } from "@conecta/domain-error";
import { ok, type Result } from "@conecta/result";

import { Timestamp } from "../value-objects/timestamp.valueObject";

export const ensureTimestamp = (
  timestamp: Timestamp | undefined,
  referenceDate: Date,
): Result<Timestamp, DomainError> => {
  if (timestamp) return ok<Timestamp, DomainError>(timestamp);

  return Timestamp.create({ value: referenceDate });
};
