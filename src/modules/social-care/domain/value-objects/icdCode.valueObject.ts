import type { DomainError } from "@conecta/domain-error";
import { pipe } from "@conecta/fn";
import type { Branded } from "@conecta/fn";
import { Result } from "@conecta/result";
import { ICDError } from "../errors/ICDCode.error";

export type ICDCode = Branded<{ readonly value: string }, "ICDCode">;

export const ICDCode = {
  create(
    stringCode: string,
    opts: {
      readonly requireDot?: boolean;
      readonly autoDot?: boolean;
      readonly fieldName?: string;
    } = {},
  ): Result<ICDCode, DomainError> {
    const { requireDot = false, autoDot = true, fieldName = "icdCode" } = opts;

    const sanitized = stringCode.trim().toUpperCase();
    if (!sanitized.length) return Result.err(ICDError.EMPTY_CID_CODE(fieldName));

    const candidate = pipe(sanitized, (val) =>
      autoDot ? val.replace(/^([A-TV-Z]\d{2})([A-Z0-9]{1,4})$/, "$1.$2") : val,
    );

    const isValid = requireDot
      ? /^[A-TV-Z]\d{2}\.[A-Z0-9]{1,4}$/i.test(candidate)
      : /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i.test(candidate);

    if (!isValid) {
      return Result.err(
        ICDError.INVALID_CID_NUMBER(stringCode, candidate, 
          requireDot ? "^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$" : "^[A-TV-Z]\\d{2}(?:\\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$"
        ),
      );
    }

    return Result.ok({ value: candidate } as ICDCode);
  },

  toNormalized(code: ICDCode): string {
    return code.value.replace(".", "");
  },

  toDisplay(raw: string): string {
    return raw.trim().toUpperCase().replace(/^([A-TV-Z]\d{2})([A-Z0-9]{1,4})$/, "$1.$2");
  },

  is(value: string): boolean {
    return /^[A-TV-Z]\d{2}(?:\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$/i.test(value);
  }
} as const;
