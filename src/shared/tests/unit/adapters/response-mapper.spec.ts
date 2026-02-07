import { describe, expect, test } from "bun:test";
import { Result } from "@conecta/result";
import {
  mapDomainErrorToHttpResponse,
  mapResultToHttpResponse,
  mapResultToGrpcResponse,
  GrpcStatus,
} from "@conecta/adapters";
import { ErrorTaxonomy, DomainError } from "@conecta/domain-error";

const TestError = DomainError.makeFactory({
  bc: "TEST",
  module: "response-mapper",
  codePrefix: "TST",
  catalog: {
    TestFailure: {
      code: "TST-001",
      http: 422,
      category: ErrorTaxonomy.DataConsistencyIncident,
      template: () => "Falha de teste.",
    },
  },
});

describe("ResponseMapper", () => {
  test("mapDomainErrorToHttpResponse usa status HTTP do erro", () => {
    const error = TestError.TestFailure();
    const response = mapDomainErrorToHttpResponse(error);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("TST-001");
  });

  test("mapResultToHttpResponse retorna sucesso com payload", () => {
    const result = Result.ok({ ok: true });
    const response = mapResultToHttpResponse(result);

    expect(response.status).toBe(200);
    if ("data" in response.body) {
      expect(response.body.data.ok).toBe(true);
    }
  });

  test("mapResultToHttpResponse retorna erro consistente", () => {
    const error = TestError.TestFailure();
    const result = Result.err(error);
    const response = mapResultToHttpResponse(result);

    expect(response.status).toBe(422);
    if ("error" in response.body) {
      expect(response.body.error.message).toBe("Falha de teste.");
    }
  });

  test("mapResultToGrpcResponse usa status mapeado", () => {
    const error = TestError.TestFailure();
    const result = Result.err(error);
    const response = mapResultToGrpcResponse(result);

    expect(response.status).toBe(GrpcStatus.FAILED_PRECONDITION);
    expect(response.message).toBe("Falha de teste.");
  });

  test("mapDomainErrorToGrpcResponse usa UNKNOWN para status não mapeado", () => {
    const CustomError = DomainError.makeFactory({
      bc: "TEST",
      module: "test",
      catalog: {
        Fail: { code: "F", http: 418, category: ErrorTaxonomy.UnexpectedSystemState, template: () => "Err" }
      }
    });
    const response = mapResultToGrpcResponse(Result.err(CustomError.Fail()));
    expect(response.status).toBe(GrpcStatus.UNKNOWN);
  });

  test("mapResultToGrpcResponse retorna sucesso com dados", () => {
    const result = Result.ok({ id: 1 });
    const response = mapResultToGrpcResponse(result);
    expect(response.status).toBe(GrpcStatus.OK);
    expect(response.data).toEqual({ id: 1 });
  });
});
