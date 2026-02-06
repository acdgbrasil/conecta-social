import type { DomainError } from "@conecta/domain-error";
import type { Result } from "@conecta/result";

export type HttpResponse<T> = {
  status: number;
  body: T;
};

export type HttpErrorBody = {
  error: {
    code: string;
    message: string;
    category?: string;
    severity?: string;
    fingerprint?: string[];
    tags?: Record<string, string>;
    details?: Record<string, unknown>;
  };
};

export type HttpSuccessBody<T> = {
  data: T;
};

export type HttpErrorResponse = HttpResponse<HttpErrorBody>;
export type HttpSuccessResponse<T> = HttpResponse<HttpSuccessBody<T>>;

export const mapDomainErrorToHttpResponse = (
  error: DomainError,
  fallbackStatus = 500,
): HttpErrorResponse => {
  const composed = error as DomainError & {
    http?: number;
    safeContext?: Readonly<Record<string, unknown>>;
    observability?: {
      category: string;
      severity: string;
      fingerprint: ReadonlyArray<string>;
      tags: Readonly<Record<string, string>>;
    };
  };

  const status = composed.http ?? fallbackStatus;
  const details = composed.safeContext ?? {};

  return {
    status,
    body: {
      error: {
        code: error.code,
        message: error.message,
        category: composed.observability?.category,
        severity: composed.observability?.severity,
        fingerprint: composed.observability?.fingerprint
          ? Array.from(composed.observability.fingerprint)
          : undefined,
        tags: composed.observability?.tags
          ? { ...composed.observability.tags }
          : undefined,
        details: Object.keys(details).length > 0 ? { ...details } : undefined,
      },
    },
  };
};

export const mapResultToHttpResponse = <T>(
  result: Result<T, DomainError>,
  opts: { readonly successStatus?: number } = {},
): HttpResponse<HttpSuccessBody<T> | HttpErrorBody> => {
  if (result.isErr) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return {
    status: opts.successStatus ?? 200,
    body: {
      data: result.value,
    },
  };
};

export const GrpcStatus = {
  OK: 0,
  CANCELLED: 1,
  UNKNOWN: 2,
  INVALID_ARGUMENT: 3,
  DEADLINE_EXCEEDED: 4,
  NOT_FOUND: 5,
  ALREADY_EXISTS: 6,
  PERMISSION_DENIED: 7,
  RESOURCE_EXHAUSTED: 8,
  FAILED_PRECONDITION: 9,
  ABORTED: 10,
  OUT_OF_RANGE: 11,
  UNIMPLEMENTED: 12,
  INTERNAL: 13,
  UNAVAILABLE: 14,
  DATA_LOSS: 15,
  UNAUTHENTICATED: 16,
} as const;

export type GrpcStatusCode = (typeof GrpcStatus)[keyof typeof GrpcStatus];

export type GrpcResponse<T> = {
  status: GrpcStatusCode;
  message?: string;
  data?: T;
};

const httpToGrpcStatus = (status: number): GrpcStatusCode => {
  if (status >= 200 && status < 300) return GrpcStatus.OK;
  if (status === 400) return GrpcStatus.INVALID_ARGUMENT;
  if (status === 401) return GrpcStatus.UNAUTHENTICATED;
  if (status === 403) return GrpcStatus.PERMISSION_DENIED;
  if (status === 404) return GrpcStatus.NOT_FOUND;
  if (status === 409) return GrpcStatus.ALREADY_EXISTS;
  if (status === 422) return GrpcStatus.FAILED_PRECONDITION;
  if (status === 429) return GrpcStatus.RESOURCE_EXHAUSTED;
  if (status === 503) return GrpcStatus.UNAVAILABLE;
  if (status >= 500) return GrpcStatus.INTERNAL;
  return GrpcStatus.UNKNOWN;
};

export const mapDomainErrorToGrpcResponse = (
  error: DomainError,
  fallbackStatus = 500,
): GrpcResponse<never> => {
  const http = (error as DomainError & { http?: number }).http ?? fallbackStatus;
  return {
    status: httpToGrpcStatus(http),
    message: error.message,
  };
};

export const mapResultToGrpcResponse = <T>(
  result: Result<T, DomainError>,
  opts: { readonly successStatus?: GrpcStatusCode } = {},
): GrpcResponse<T> => {
  if (result.isErr) {
    return mapDomainErrorToGrpcResponse(result.error);
  }

  return {
    status: opts.successStatus ?? GrpcStatus.OK,
    data: result.value,
  };
};
