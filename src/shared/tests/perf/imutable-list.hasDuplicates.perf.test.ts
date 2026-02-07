import { describe, expect, test } from "bun:test";
import { List } from "../../fn-pattern/imutable-list";

type FixtureKind = "primitive" | "shallow" | "nested";

type BenchCase = {
  kind: FixtureKind;
  size: number;
  makeData: () => unknown[];
};

const SIZES = [10, 50, 100, 250, 500, 1000];

const makeCases = (): BenchCase[] => {
  const cases: BenchCase[] = [];

  for (const size of SIZES) {
    cases.push({
      kind: "primitive",
      size,
      makeData: () => Array.from({ length: size }, (_, i) => `item-${i}`),
    });
    cases.push({
      kind: "shallow",
      size,
      makeData: () =>
        Array.from({ length: size }, (_, i) => ({
          id: i,
          name: `name-${i}`,
          active: i % 2 === 0,
        })),
    });
    cases.push({
      kind: "nested",
      size,
      makeData: () => {
        const base = Array.from({ length: size }, (_, i) => ({
          id: i,
          name: `name-${i}`,
          meta: {
            tags: [`tag-${i % 5}`, `tag-${(i + 1) % 5}`],
            nested: { seq: i, label: `l-${i}` },
          },
        }));
        // Introduce a circular ref on the last element.
        if (base.length > 1) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (base[base.length - 1] as any).meta.self = base[base.length - 1];
        }
        return base;
      },
    });
  }

  return cases;
};

const runBench = (bench: BenchCase, iterations = 10) => {
  const durations: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const data = bench.makeData();
    const list = List.from(data);

    const start = performance.now();
    List.hasDuplicates(list); // ignore result; aim is timing
    const end = performance.now();

    durations.push(end - start);
  }

  const mean =
    durations.reduce((sum, d) => sum + d, 0) / (durations.length || 1);
  const variance =
    durations.reduce((acc, d) => acc + (d - mean) ** 2, 0) /
    (durations.length || 1);

  return {
    durations,
    mean,
    stdDev: Math.sqrt(variance),
  };
};

const formatCase = (bench: BenchCase) => `${bench.kind}-${bench.size}`;

const thresholdsMs: Record<FixtureKind, number> = {
  primitive: Number(process.env.IMUTABLE_LIST_PERF_THRESHOLD_PRIMITIVE ?? 2),
  shallow: Number(process.env.IMUTABLE_LIST_PERF_THRESHOLD_SHALLOW ?? 3),
  nested: Number(process.env.IMUTABLE_LIST_PERF_THRESHOLD_NESTED ?? 5),
};

describe("Perf — List.hasDuplicates", () => {
  test("coleta tempos médios por tamanho e tipo de dado", () => {
    const cases = makeCases();
    const results = cases.map((bench) => ({
      case: formatCase(bench),
      ...runBench(bench),
    }));

    // A própria asserção é só para garantir que rodou; ajuste thresholds conforme hardware.
    for (const r of results) {
      expect(r.mean).toBeGreaterThanOrEqual(0);
      expect(r.mean).toBeLessThanOrEqual(
        thresholdsMs[r.case.split("-")[0] as FixtureKind],
      );
    }

    // Print resumido para consulta manual (não falha teste).
    const summary = results
      .map(
        (r) =>
          `${r.case} -> mean=${r.mean.toFixed(3)}ms std=${r.stdDev.toFixed(
            3,
          )}ms`,
      )
      .join("\n");
    // eslint-disable-next-line no-console
    console.log(summary);
  });
});
