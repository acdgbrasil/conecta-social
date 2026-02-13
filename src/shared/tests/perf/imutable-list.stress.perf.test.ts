import { describe, test } from "bun:test";
import { List } from "../../fn-pattern/imutable-list";

const SIZES = [100_000, 1_000_000, 5_000_000];

const shouldRunPerf = ["1", "true"].includes(
	(Bun.env.RUN_PERF ?? process.env.RUN_PERF ?? "").toLowerCase(),
);
const describePerf = shouldRunPerf ? describe : describe.skip;

describePerf("Stress Perf — ImutableList (Full Coverage Load)", () => {
	for (const size of SIZES) {
		test(`Carga Total com N = ${size.toLocaleString()}`, () => {
			// eslint-disable-next-line no-console
			console.log(
				`\n--- Iniciando Stress Test Completo: ${size.toLocaleString()} itens ---`,
			);

			const rawData = Array.from({ length: size }, (_, i) => i);
			const startTotal = performance.now();

			// 1. empty & isEmpty
			const empty = List.empty<number>();
			if (!List.isEmpty(empty)) throw new Error("Falha isEmpty");

			// 2. from (Alloc)
			const t1 = performance.now();
			const list = List.from(rawData);
			const t2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(`[Alloc] List.from: ${(t2 - t1).toFixed(2)}ms`);

			// 3. of (Multi-args alloc) - Apenas para 100k devido ao limite de argumentos/pilha do JS
			if (size <= 100_000) {
				const tOf1 = performance.now();
				List.of(...rawData);
				const tOf2 = performance.now();
				// eslint-disable-next-line no-console
				console.log(`[Alloc] List.of: ${(tOf2 - tOf1).toFixed(2)}ms`);
			}

			// 4. count & isEmpty (Queries O(1))
			const tQ1 = performance.now();
			List.count(list);
			List.isEmpty(list);
			const tQ2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(
				`[Query] count & isEmpty (O(1)): ${(tQ2 - tQ1).toFixed(4)}ms`,
			);

			// 5. has (Search O(N))
			const tH1 = performance.now();
			List.has(list, size - 1); // Pior caso: último item
			const tH2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(
				`[Search] List.has (Worst case): ${(tH2 - tH1).toFixed(2)}ms`,
			);

			// 6. hasDuplicates (False)
			const tHD1 = performance.now();
			List.hasDuplicates(list);
			const tHD2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(
				`[Check] hasDuplicates (False): ${(tHD2 - tHD1).toFixed(2)}ms`,
			);

			// 7. add (Copy on Write)
			const tA1 = performance.now();
			const listExtended = List.add(list, size);
			const tA2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(`[Write] List.add: ${(tA2 - tA1).toFixed(2)}ms`);

			// 8. remove (Filter O(N))
			const tR1 = performance.now();
			List.remove(listExtended, size);
			const tR2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(`[Write] List.remove: ${(tR2 - tR1).toFixed(2)}ms`);

			// 9. map (Transform O(N))
			const tM1 = performance.now();
			List.map(list, (x) => x + 1);
			const tM2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(`[Transform] List.map: ${(tM2 - tM1).toFixed(2)}ms`);

			// 10. filter (Filter O(N))
			const tF1 = performance.now();
			List.filter(list, (x) => x % 2 === 0);
			const tF2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(
				`[Filter] List.filter (Even numbers): ${(tF2 - tF1).toFixed(2)}ms`,
			);

			// 11. unique (O(N) with Set)
			const tU1 = performance.now();
			List.unique(listExtended);
			const tU2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(`[Dedup] List.unique: ${(tU2 - tU1).toFixed(2)}ms`);

			// 12. toArray (Shallow copy)
			const tTA1 = performance.now();
			List.toArray(list);
			const tTA2 = performance.now();
			// eslint-disable-next-line no-console
			console.log(`[Export] List.toArray: ${(tTA2 - tTA1).toFixed(2)}ms`);

			const endTotal = performance.now();
			// eslint-disable-next-line no-console
			console.log(
				`TOTAL para ${size.toLocaleString()} itens: ${(endTotal - startTotal).toFixed(2)}ms`,
			);
		});
	}
});
