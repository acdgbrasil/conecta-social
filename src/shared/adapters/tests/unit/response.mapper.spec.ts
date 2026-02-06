import { describe, expect, test } from "bun:test";
import { err, ok } from "@conecta/result";
import {
  mapDomainErrorToHttpResponse,
  mapResultToHttpResponse,
  mapResultToGrpcResponse,
  GrpcStatus,
} from "../../response.mapper";
import { ErrorTaxonomy, makeDomainErrorFactory } from "@conecta/domain-error";

const TestError = makeDomainErrorFactory<"TestFailure">({
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
    const result = ok({ ok: true });
    const response = mapResultToHttpResponse(result);

    expect(response.status).toBe(200);
    if ("data" in response.body) {
      expect(response.body.data.ok).toBe(true);
    }
  });

  test("mapResultToHttpResponse retorna erro consistente", () => {
    const error = TestError.TestFailure();
    const result = err(error);
    const response = mapResultToHttpResponse(result);

    expect(response.status).toBe(422);
    if ("error" in response.body) {
      expect(response.body.error.message).toBe("Falha de teste.");
    }
  });

  test("mapResultToGrpcResponse usa status mapeado", () => {
    const error = TestError.TestFailure();
    const result = err(error);
    const response = mapResultToGrpcResponse(result);

    expect(response.status).toBe(GrpcStatus.FAILED_PRECONDITION);
    expect(response.message).toBe("Falha de teste.");
  });
});
