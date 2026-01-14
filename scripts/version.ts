#!/usr/bin/env bun
/**
 * Automação leve de versionamento/changelog.
 * - Encaminha para `bun pm version <type>`
 * - Cria/atualiza stub de changelog (stdout) e lembra do git tag
 *
 * Uso:
 *   bun run scripts/version.ts patch
 *   bun run scripts/version.ts minor
 *   bun run scripts/version.ts major
 *   bun run scripts/version.ts prerelease --preid beta
 */

import { $ } from "bun";

const allowed = new Set(["patch", "minor", "major", "prerelease"]);
const [type, ...rest] = process.argv.slice(2);

if (!type || !allowed.has(type)) {
  console.error(`Tipo inválido. Use: patch | minor | major | prerelease`);
  process.exit(1);
}

const extraArgs = rest.join(" ");

await $`bun pm version ${type} ${extraArgs}`.quiet();

console.log("\nPróximos passos:");
console.log(
  "- Atualize o changelog/report no handbook (handbook/reports/daily ou refactor).",
);
console.log(
  '- Gere tag anotada: git tag -a v<nova-versao> -m "<mensagem>" && git push --tags',
);
console.log(
  "- Verifique pacotes afetados (workspaces) e publique se aplicável.",
);
console.log("- Rode a suíte: bun test");
