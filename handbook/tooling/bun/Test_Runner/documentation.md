# Test runner

> Bun's fast, built-in, Jest-compatible test runner with TypeScript support, lifecycle hooks, mocking, and watch mode

Bun ships with a fast, built-in, Jest-compatible test runner. Tests are executed with the Bun runtime, and support the following features.

* TypeScript and JSX
* Lifecycle hooks
* Snapshot testing
* UI & DOM testing
* Watch mode with `--watch`
* Script pre-loading with `--preload`

<Note>
  Bun aims for compatibility with Jest, but not everything is implemented. To track compatibility,
  see [this tracking issue](https://github.com/oven-sh/bun/issues/1825).
</Note>

## Run tests

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test
```

Tests are written in JavaScript or TypeScript with a Jest-like API. Refer to [Writing tests](/test/writing-tests) for full documentation.

```ts math.test.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, test } from "bun:test";

test("2 + 2", () => {
    expect(2 + 2).toBe(4);
});
```

The runner recursively searches the working directory for files that match the following patterns:

* `*.test.{js|jsx|ts|tsx}`
* `*_test.{js|jsx|ts|tsx}`
* `*.spec.{js|jsx|ts|tsx}`
* `*_spec.{js|jsx|ts|tsx}`

You can filter the set of *test files* to run by passing additional positional arguments to `bun test`. Any test file with a path that matches one of the filters will run. Commonly, these filters will be file or directory names; glob patterns are not yet supported.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test <filter> <filter> ...
```

To filter by *test name*, use the `-t`/`--test-name-pattern` flag.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# run all tests or test suites with "addition" in the name
bun test --test-name-pattern addition
```

To run a specific file in the test runner, make sure the path starts with `./` or `/` to distinguish it from a filter name.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test ./test/specific-file.test.ts
```

The test runner runs all tests in a single process. It loads all `--preload` scripts (see [Lifecycle](/test/lifecycle) for details), then runs all tests. If a test fails, the test runner will exit with a non-zero exit code.

## CI/CD integration

`bun test` supports a variety of CI/CD integrations.

### GitHub Actions

`bun test` automatically detects if it's running inside GitHub Actions and will emit GitHub Actions annotations to the console directly.

No configuration is needed, other than installing `bun` in the workflow and running `bun test`.

#### How to install `bun` in a GitHub Actions workflow

To use `bun test` in a GitHub Actions workflow, add the following step:

```yaml title=".github/workflows/test.yml" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
jobs:
  build:
    name: build-app
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install bun
        uses: oven-sh/setup-bun@v2
      - name: Install dependencies # (assuming your project has dependencies)
        run: bun install # You can use npm/yarn/pnpm instead if you prefer
      - name: Run tests
        run: bun test
```

From there, you'll get GitHub Actions annotations.

### JUnit XML reports (GitLab, etc.)

To use `bun test` with a JUnit XML reporter, you can use the `--reporter=junit` in combination with `--reporter-outfile`.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --reporter=junit --reporter-outfile=./bun.xml
```

This will continue to output to stdout/stderr as usual, and also write a JUnit
XML report to the given path at the very end of the test run.

JUnit XML is a popular format for reporting test results in CI/CD pipelines.

## Timeouts

Use the `--timeout` flag to specify a *per-test* timeout in milliseconds. If a test times out, it will be marked as failed. The default value is `5000`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# default value is 5000
bun test --timeout 20
```

## Concurrent test execution

By default, Bun runs all tests sequentially within each test file. You can enable concurrent execution to run async tests in parallel, significantly speeding up test suites with independent tests.

### `--concurrent` flag

Use the `--concurrent` flag to run all tests concurrently within their respective files:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --concurrent
```

When this flag is enabled, all tests will run in parallel unless explicitly marked with `test.serial`.

### `--max-concurrency` flag

Control the maximum number of tests running simultaneously with the `--max-concurrency` flag:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Limit to 4 concurrent tests
bun test --concurrent --max-concurrency 4

# Default: 20
bun test --concurrent
```

This helps prevent resource exhaustion when running many concurrent tests. The default value is 20.

### `test.concurrent`

Mark individual tests to run concurrently, even when the `--concurrent` flag is not used:

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

// These tests run in parallel with each other
test.concurrent("concurrent test 1", async () => {
    await fetch("/api/endpoint1");
    expect(true).toBe(true);
});

test.concurrent("concurrent test 2", async () => {
    await fetch("/api/endpoint2");
    expect(true).toBe(true);
});

// This test runs sequentially
test("sequential test", () => {
    expect(1 + 1).toBe(2);
});
```

### `test.serial`

Force tests to run sequentially, even when the `--concurrent` flag is enabled:

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

let sharedState = 0;

// These tests must run in order
test.serial("first serial test", () => {
    sharedState = 1;
    expect(sharedState).toBe(1);
});

test.serial("second serial test", () => {
    // Depends on the previous test
    expect(sharedState).toBe(1);
    sharedState = 2;
});

// This test can run concurrently if --concurrent is enabled
test("independent test", () => {
    expect(true).toBe(true);
});

// Chaining test qualifiers
test.failing.each([1, 2, 3])("chained qualifiers %d", input => {
    expect(input).toBe(0); // This test is expected to fail for each input
});
```

## Rerun tests

Use the `--rerun-each` flag to run each test multiple times. This is useful for detecting flaky or non-deterministic test failures.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --rerun-each 100
```

## Randomize test execution order

Use the `--randomize` flag to run tests in a random order. This helps detect tests that depend on shared state or execution order.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --randomize
```

When using `--randomize`, the seed used for randomization will be displayed in the test summary:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --randomize
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
# ... test output ...
 --seed=12345
 2 pass
 8 fail
Ran 10 tests across 2 files. [50.00ms]
```

### Reproducible random order with `--seed`

Use the `--seed` flag to specify a seed for the randomization. This allows you to reproduce the same test order when debugging order-dependent failures.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Reproduce a previous randomized run
bun test --seed 123456
```

The `--seed` flag implies `--randomize`, so you don't need to specify both. Using the same seed value will always produce the same test execution order, making it easier to debug intermittent failures caused by test interdependencies.

## Bail out with `--bail`

Use the `--bail` flag to abort the test run early after a pre-determined number of test failures. By default Bun will run all tests and report all failures, but sometimes in CI environments it's preferable to terminate earlier to reduce CPU usage.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# bail after 1 failure
bun test --bail

# bail after 10 failure
bun test --bail=10
```

## Watch mode

Similar to `bun run`, you can pass the `--watch` flag to `bun test` to watch for changes and re-run tests.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --watch
```

## Lifecycle hooks

Bun supports the following lifecycle hooks:

| Hook         | Description                 |
| ------------ | --------------------------- |
| `beforeAll`  | Runs once before all tests. |
| `beforeEach` | Runs before each test.      |
| `afterEach`  | Runs after each test.       |
| `afterAll`   | Runs once after all tests.  |

These hooks can be defined inside test files, or in a separate file that is preloaded with the `--preload` flag.

```ts terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --preload ./setup.ts
```

See [Test > Lifecycle](/test/lifecycle) for complete documentation.

## Mocks

Create mock functions with the `mock` function.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";
const random = mock(() => Math.random());

test("random", () => {
    const val = random();
    expect(val).toBeGreaterThan(0);
    expect(random).toHaveBeenCalled();
    expect(random).toHaveBeenCalledTimes(1);
});
```

Alternatively, you can use `jest.fn()`, it behaves identically.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test"; // [!code --]
import { test, expect, jest } from "bun:test"; // [!code ++]

const random = mock(() => Math.random()); // [!code --]
const random = jest.fn(() => Math.random()); // [!code ++]
```

See [Test > Mocks](/test/mocks) for complete documentation.

## Snapshot testing

Snapshots are supported by `bun test`.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// example usage of toMatchSnapshot
import { test, expect } from "bun:test";

test("snapshot", () => {
    expect({ a: 1 }).toMatchSnapshot();
});
```

To update snapshots, use the `--update-snapshots` flag.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --update-snapshots
```

See [Test > Snapshots](/test/snapshots) for complete documentation.

## UI & DOM testing

Bun is compatible with popular UI testing libraries:

* [HappyDOM](https://github.com/capricorn86/happy-dom)
* [DOM Testing Library](https://testing-library.com/docs/dom-testing-library/intro/)
* [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

See [Test > DOM Testing](/test/dom) for complete documentation.

## Performance

Bun's test runner is fast.

<Frame>
    <img
      src="https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/buntest.jpeg?fit=max&auto=format&n=DJXb5ll7I0cV-M4b&q=85&s=385ddc5e64d35dd0534663d0f70ab116"
      alt="Running 266 React SSR tests faster than Jest can print its version
  number."
      data-og-width="2112"
      width="2112"
      data-og-height="716"
      height="716"
      data-path="images/buntest.jpeg"
      data-optimize="true"
      data-opv="3"
      srcset="https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/buntest.jpeg?w=280&fit=max&auto=format&n=DJXb5ll7I0cV-M4b&q=85&s=3521449d084de759182add8a38c60c3d 280w, https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/buntest.jpeg?w=560&fit=max&auto=format&n=DJXb5ll7I0cV-M4b&q=85&s=37c3031df9eea4fef6f01f5ed3d5619b 560w, https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/buntest.jpeg?w=840&fit=max&auto=format&n=DJXb5ll7I0cV-M4b&q=85&s=0b4986c07b5afc3fd75f5b0da4151b56 840w, https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/buntest.jpeg?w=1100&fit=max&auto=format&n=DJXb5ll7I0cV-M4b&q=85&s=780b91c86953d3c5ec6bd4d6c7fd90d4 1100w, https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/buntest.jpeg?w=1650&fit=max&auto=format&n=DJXb5ll7I0cV-M4b&q=85&s=14077e0b0e1766552cd69981352275bc 1650w, https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/buntest.jpeg?w=2500&fit=max&auto=format&n=DJXb5ll7I0cV-M4b&q=85&s=a29453d4a392600e61619bc16ee3e6a3 2500w"
    />
</Frame>

## AI Agent Integration

When using Bun's test runner with AI coding assistants, you can enable quieter output to improve readability and reduce context noise. This feature minimizes test output verbosity while preserving essential failure information.

### Environment Variables

Set any of the following environment variables to enable AI-friendly output:

* `CLAUDECODE=1` - For Claude Code
* `REPL_ID=1` - For Replit
* `AGENT=1` - Generic AI agent flag

### Behavior

When an AI agent environment is detected:

* Only test failures are displayed in detail
* Passing, skipped, and todo test indicators are hidden
* Summary statistics remain intact

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Example: Enable quiet output for Claude Code
CLAUDECODE=1 bun test

# Still shows failures and summary, but hides verbose passing test output
```

This feature is particularly useful in AI-assisted development workflows where reduced output verbosity improves context efficiency while maintaining visibility into test failures.

***

# CLI Usage

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test <patterns>
```

### Execution Control

<ParamField path="--timeout" type="number" default="5000">
  Set the per-test timeout in milliseconds (default 5000)
</ParamField>

<ParamField path="--rerun-each" type="number">
  Re-run each test file <code>NUMBER</code> times, helps catch certain bugs
</ParamField>

<ParamField path="--concurrent" type="boolean">
  Treat all tests as <code>test.concurrent()</code> tests
</ParamField>

<ParamField path="--randomize" type="boolean">
  Run tests in random order
</ParamField>

<ParamField path="--seed" type="number">
  Set the random seed for test randomization
</ParamField>

<ParamField path="--bail" type="number" default="1">
  Exit the test suite after <code>NUMBER</code> failures. If you do not specify a number, it
  defaults to 1.
</ParamField>

<ParamField path="--max-concurrency" type="number" default="20">
  Maximum number of concurrent tests to execute at once (default 20)
</ParamField>

### Test Filtering

<ParamField path="--todo" type="boolean">
  Include tests that are marked with <code>test.todo()</code>
</ParamField>

<ParamField path="--test-name-pattern" type="string">
  Run only tests with a name that matches the given regex. Alias: <code>-t</code>
</ParamField>

### Reporting

<ParamField path="--reporter" type="string">
  Test output reporter format. Available: <code>junit</code> (requires --reporter-outfile),{" "}
  <code>dots</code>. Default: console output.
</ParamField>

<ParamField path="--reporter-outfile" type="string">
  Output file path for the reporter format (required with --reporter)
</ParamField>

<ParamField path="--dots" type="boolean">
  Enable dots reporter. Shorthand for --reporter=dots
</ParamField>

### Coverage

<ParamField path="--coverage" type="boolean">
  Generate a coverage profile
</ParamField>

<ParamField path="--coverage-reporter" type="string" default="text">
  Report coverage in <code>text</code> and/or <code>lcov</code>. Defaults to <code>text</code>
</ParamField>

<ParamField path="--coverage-dir" type="string" default="coverage">
  Directory for coverage files. Defaults to <code>coverage</code>
</ParamField>

### Snapshots

<ParamField path="--update-snapshots" type="boolean">
  Update snapshot files. Alias: <code>-u</code>
</ParamField>

## Examples

Run all test files:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test
```

Run all test files with "foo" or "bar" in the file name:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test foo bar
```

Run all test files, only including tests whose names includes "baz":

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --test-name-pattern baz
```
# Writing tests

> Learn how to write tests using Bun's Jest-compatible API with support for async tests, timeouts, and various test modifiers

Define tests with a Jest-like API imported from the built-in `bun:test` module. Long term, Bun aims for complete Jest compatibility; at the moment, a limited set of expect matchers are supported.

## Basic Usage

To define a simple test:

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, test } from "bun:test";

test("2 + 2", () => {
    expect(2 + 2).toBe(4);
});
```

### Grouping Tests

Tests can be grouped into suites with `describe`.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, test, describe } from "bun:test";

describe("arithmetic", () => {
    test("2 + 2", () => {
        expect(2 + 2).toBe(4);
    });

    test("2 * 2", () => {
        expect(2 * 2).toBe(4);
    });
});
```

### Async Tests

Tests can be async.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, test } from "bun:test";

test("2 * 2", async () => {
    const result = await Promise.resolve(2 * 2);
    expect(result).toEqual(4);
});
```

Alternatively, use the `done` callback to signal completion. If you include the `done` callback as a parameter in your test definition, you must call it or the test will hang.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, test } from "bun:test";

test("2 * 2", done => {
    Promise.resolve(2 * 2).then(result => {
        expect(result).toEqual(4);
        done();
    });
});
```

## Timeouts

Optionally specify a per-test timeout in milliseconds by passing a number as the third argument to `test`.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test } from "bun:test";

test("wat", async () => {
    const data = await slowOperation();
    expect(data).toBe(42);
}, 500); // test must run in <500ms
```

In `bun:test`, test timeouts throw an uncatchable exception to force the test to stop running and fail. We also kill any child processes that were spawned in the test to avoid leaving behind zombie processes lurking in the background.

The default timeout for each test is 5000ms (5 seconds) if not overridden by this timeout option or `jest.setDefaultTimeout()`.

### 🧟 Zombie Process Killer

When a test times out and processes spawned in the test via `Bun.spawn`, `Bun.spawnSync`, or `node:child_process` are not killed, they will be automatically killed and a message will be logged to the console. This prevents zombie processes from lingering in the background after timed-out tests.

## Test Modifiers

### test.skip

Skip individual tests with `test.skip`. These tests will not be run.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, test } from "bun:test";

test.skip("wat", () => {
    // TODO: fix this
    expect(0.1 + 0.2).toEqual(0.3);
});
```

### test.todo

Mark a test as a todo with `test.todo`. These tests will not be run.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, test } from "bun:test";

test.todo("fix this", () => {
    myTestFunction();
});
```

To run todo tests and find any which are passing, use `bun test --todo`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --todo
```

```
my.test.ts:
✗ unimplemented feature
  ^ this test is marked as todo but passes. Remove `.todo` or check that test is correct.

 0 pass
 1 fail
 1 expect() calls
```

With this flag, failing todo tests will not cause an error, but todo tests which pass will be marked as failing so you can remove the todo mark or fix the test.

### test.only

To run a particular test or suite of tests use `test.only()` or `describe.only()`.

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, describe } from "bun:test";

test("test #1", () => {
    // does not run
});

test.only("test #2", () => {
    // runs
});

describe.only("only", () => {
    test("test #3", () => {
        // runs
    });
});
```

The following command will only execute tests #2 and #3.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --only
```

The following command will only execute tests #1, #2 and #3.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test
```

### test.if

To run a test conditionally, use `test.if()`. The test will run if the condition is truthy. This is particularly useful for tests that should only run on specific architectures or operating systems.

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test.if(Math.random() > 0.5)("runs half the time", () => {
    // ...
});

const macOS = process.platform === "darwin";
test.if(macOS)("runs on macOS", () => {
    // runs if macOS
});
```

### test.skipIf

To instead skip a test based on some condition, use `test.skipIf()` or `describe.skipIf()`.

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const macOS = process.platform === "darwin";

test.skipIf(macOS)("runs on non-macOS", () => {
    // runs if *not* macOS
});
```

### test.todoIf

If instead you want to mark the test as TODO, use `test.todoIf()` or `describe.todoIf()`. Carefully choosing `skipIf` or `todoIf` can show a difference between, for example, intent of "invalid for this target" and "planned but not implemented yet."

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const macOS = process.platform === "darwin";

// TODO: we've only implemented this for Linux so far.
test.todoIf(macOS)("runs on posix", () => {
    // runs if *not* macOS
});
```

### test.failing

Use `test.failing()` when you know a test is currently failing but you want to track it and be notified when it starts passing. This inverts the test result:

* A failing test marked with `.failing()` will pass
* A passing test marked with `.failing()` will fail (with a message indicating it's now passing and should be fixed)

```ts math.test.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// This will pass because the test is failing as expected
test.failing("math is broken", () => {
    expect(0.1 + 0.2).toBe(0.3); // fails due to floating point precision
});

// This will fail with a message that the test is now passing
test.failing("fixed bug", () => {
    expect(1 + 1).toBe(2); // passes, but we expected it to fail
});
```

This is useful for tracking known bugs that you plan to fix later, or for implementing test-driven development.

## Conditional Tests for Describe Blocks

The conditional modifiers `.if()`, `.skipIf()`, and `.todoIf()` can also be applied to describe blocks, affecting all tests within the suite:

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const isMacOS = process.platform === "darwin";

// Only runs the entire suite on macOS
describe.if(isMacOS)("macOS-specific features", () => {
    test("feature A", () => {
        // only runs on macOS
    });

    test("feature B", () => {
        // only runs on macOS
    });
});

// Skips the entire suite on Windows
describe.skipIf(process.platform === "win32")("Unix features", () => {
    test("feature C", () => {
        // skipped on Windows
    });
});

// Marks the entire suite as TODO on Linux
describe.todoIf(process.platform === "linux")("Upcoming Linux support", () => {
    test("feature D", () => {
        // marked as TODO on Linux
    });
});
```

## Parametrized Tests

### `test.each` and `describe.each`

To run the same test with multiple sets of data, use `test.each`. This creates a parametrized test that runs once for each test case provided.

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const cases = [
    [1, 2, 3],
    [3, 4, 7],
];

test.each(cases)("%p + %p should be %p", (a, b, expected) => {
    expect(a + b).toBe(expected);
});
```

You can also use `describe.each` to create a parametrized suite that runs once for each test case:

```ts title="sum.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
describe.each([
    [1, 2, 3],
    [3, 4, 7],
])("add(%i, %i)", (a, b, expected) => {
    test(`returns ${expected}`, () => {
        expect(a + b).toBe(expected);
    });

    test(`sum is greater than each value`, () => {
        expect(a + b).toBeGreaterThan(a);
        expect(a + b).toBeGreaterThan(b);
    });
});
```

### Argument Passing

How arguments are passed to your test function depends on the structure of your test cases:

* If a table row is an array (like `[1, 2, 3]`), each element is passed as an individual argument
* If a row is not an array (like an object), it's passed as a single argument

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Array items passed as individual arguments
test.each([
    [1, 2, 3],
    [4, 5, 9],
])("add(%i, %i) = %i", (a, b, expected) => {
    expect(a + b).toBe(expected);
});

// Object items passed as a single argument
test.each([
    { a: 1, b: 2, expected: 3 },
    { a: 4, b: 5, expected: 9 },
])("add($a, $b) = $expected", data => {
    expect(data.a + data.b).toBe(data.expected);
});
```

### Format Specifiers

There are a number of options available for formatting the test title:

| Specifier | Description             |
| --------- | ----------------------- |
| `%p`      | pretty-format           |
| `%s`      | String                  |
| `%d`      | Number                  |
| `%i`      | Integer                 |
| `%f`      | Floating point          |
| `%j`      | JSON                    |
| `%o`      | Object                  |
| `%#`      | Index of the test case  |
| `%%`      | Single percent sign (%) |

#### Examples

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Basic specifiers
test.each([
    ["hello", 123],
    ["world", 456],
])("string: %s, number: %i", (str, num) => {
    // "string: hello, number: 123"
    // "string: world, number: 456"
});

// %p for pretty-format output
test.each([
    [{ name: "Alice" }, { a: 1, b: 2 }],
    [{ name: "Bob" }, { x: 5, y: 10 }],
])("user %p with data %p", (user, data) => {
    // "user { name: 'Alice' } with data { a: 1, b: 2 }"
    // "user { name: 'Bob' } with data { x: 5, y: 10 }"
});

// %# for index
test.each(["apple", "banana"])("fruit #%# is %s", fruit => {
    // "fruit #0 is apple"
    // "fruit #1 is banana"
});
```

## Assertion Counting

Bun supports verifying that a specific number of assertions were called during a test:

### expect.hasAssertions()

Use `expect.hasAssertions()` to verify that at least one assertion is called during a test:

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("async work calls assertions", async () => {
    expect.hasAssertions(); // Will fail if no assertions are called

    const data = await fetchData();
    expect(data).toBeDefined();
});
```

This is especially useful for async tests to ensure your assertions actually run.

### expect.assertions(count)

Use `expect.assertions(count)` to verify that a specific number of assertions are called during a test:

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("exactly two assertions", () => {
    expect.assertions(2); // Will fail if not exactly 2 assertions are called

    expect(1 + 1).toBe(2);
    expect("hello").toContain("ell");
});
```

This helps ensure all your assertions run, especially in complex async code with multiple code paths.

## Type Testing

Bun includes `expectTypeOf` for testing TypeScript types, compatible with Vitest.

### expectTypeOf

<Warning>
  These functions are no-ops at runtime - you need to run TypeScript separately to verify the type
  checks.
</Warning>

The `expectTypeOf` function provides type-level assertions that are checked by TypeScript's type checker. To test your types:

1. Write your type assertions using `expectTypeOf`
2. Run `bunx tsc --noEmit` to check that your types are correct

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expectTypeOf } from "bun:test";

// Basic type assertions
expectTypeOf<string>().toEqualTypeOf<string>();
expectTypeOf(123).toBeNumber();
expectTypeOf("hello").toBeString();

// Object type matching
expectTypeOf({ a: 1, b: "hello" }).toMatchObjectType<{ a: number }>();

// Function types
function greet(name: string): string {
    return `Hello ${name}`;
}

expectTypeOf(greet).toBeFunction();
expectTypeOf(greet).parameters.toEqualTypeOf<[string]>();
expectTypeOf(greet).returns.toEqualTypeOf<string>();

// Array types
expectTypeOf([1, 2, 3]).items.toBeNumber();

// Promise types
expectTypeOf(Promise.resolve(42)).resolves.toBeNumber();
```

For full documentation on expectTypeOf matchers, see the [API Reference](https://bun.com/reference/bun/test/expectTypeOf).

## Matchers

Bun implements the following matchers. Full Jest compatibility is on the roadmap; [track progress here](https://github.com/oven-sh/bun/issues/1825).

### Basic Matchers

| Status | Matcher            |
| ------ | ------------------ |
| ✅      | `.not`             |
| ✅      | `.toBe()`          |
| ✅      | `.toEqual()`       |
| ✅      | `.toBeNull()`      |
| ✅      | `.toBeUndefined()` |
| ✅      | `.toBeNaN()`       |
| ✅      | `.toBeDefined()`   |
| ✅      | `.toBeFalsy()`     |
| ✅      | `.toBeTruthy()`    |
| ✅      | `.toStrictEqual()` |

### String and Array Matchers

| Status | Matcher               |
| ------ | --------------------- |
| ✅      | `.toContain()`        |
| ✅      | `.toHaveLength()`     |
| ✅      | `.toMatch()`          |
| ✅      | `.toContainEqual()`   |
| ✅      | `.stringContaining()` |
| ✅      | `.stringMatching()`   |
| ✅      | `.arrayContaining()`  |

### Object Matchers

| Status | Matcher                 |
| ------ | ----------------------- |
| ✅      | `.toHaveProperty()`     |
| ✅      | `.toMatchObject()`      |
| ✅      | `.toContainAllKeys()`   |
| ✅      | `.toContainValue()`     |
| ✅      | `.toContainValues()`    |
| ✅      | `.toContainAllValues()` |
| ✅      | `.toContainAnyValues()` |
| ✅      | `.objectContaining()`   |

### Number Matchers

| Status | Matcher                     |
| ------ | --------------------------- |
| ✅      | `.toBeCloseTo()`            |
| ✅      | `.closeTo()`                |
| ✅      | `.toBeGreaterThan()`        |
| ✅      | `.toBeGreaterThanOrEqual()` |
| ✅      | `.toBeLessThan()`           |
| ✅      | `.toBeLessThanOrEqual()`    |

### Function and Class Matchers

| Status | Matcher             |
| ------ | ------------------- |
| ✅      | `.toThrow()`        |
| ✅      | `.toBeInstanceOf()` |

### Promise Matchers

| Status | Matcher       |
| ------ | ------------- |
| ✅      | `.resolves()` |
| ✅      | `.rejects()`  |

### Mock Function Matchers

| Status | Matcher                       |
| ------ | ----------------------------- |
| ✅      | `.toHaveBeenCalled()`         |
| ✅      | `.toHaveBeenCalledTimes()`    |
| ✅      | `.toHaveBeenCalledWith()`     |
| ✅      | `.toHaveBeenLastCalledWith()` |
| ✅      | `.toHaveBeenNthCalledWith()`  |
| ✅      | `.toHaveReturned()`           |
| ✅      | `.toHaveReturnedTimes()`      |
| ✅      | `.toHaveReturnedWith()`       |
| ✅      | `.toHaveLastReturnedWith()`   |
| ✅      | `.toHaveNthReturnedWith()`    |

### Snapshot Matchers

| Status | Matcher                                 |
| ------ | --------------------------------------- |
| ✅      | `.toMatchSnapshot()`                    |
| ✅      | `.toMatchInlineSnapshot()`              |
| ✅      | `.toThrowErrorMatchingSnapshot()`       |
| ✅      | `.toThrowErrorMatchingInlineSnapshot()` |

### Utility Matchers

| Status | Matcher            |
| ------ | ------------------ |
| ✅      | `.extend`          |
| ✅      | `.anything()`      |
| ✅      | `.any()`           |
| ✅      | `.assertions()`    |
| ✅      | `.hasAssertions()` |

### Not Yet Implemented

| Status | Matcher                    |
| ------ | -------------------------- |
| ❌      | `.addSnapshotSerializer()` |

## Best Practices

### Use Descriptive Test Names

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good
test("should calculate total price including tax for multiple items", () => {
    // test implementation
});

// Avoid
test("price calculation", () => {
    // test implementation
});
```

### Group Related Tests

```ts title="auth.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
describe("User authentication", () => {
    describe("with valid credentials", () => {
        test("should return user data", () => {
            // test implementation
        });

        test("should set authentication token", () => {
            // test implementation
        });
    });

    describe("with invalid credentials", () => {
        test("should throw authentication error", () => {
            // test implementation
        });
    });
});
```

### Use Appropriate Matchers

```ts title="auth.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: Use specific matchers
expect(users).toHaveLength(3);
expect(user.email).toContain("@");
expect(response.status).toBeGreaterThanOrEqual(200);

// Avoid: Using toBe for everything
expect(users.length === 3).toBe(true);
expect(user.email.includes("@")).toBe(true);
expect(response.status >= 200).toBe(true);
```

### Test Error Conditions

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("should throw error for invalid input", () => {
    expect(() => {
        validateEmail("not-an-email");
    }).toThrow("Invalid email format");
});

test("should handle async errors", async () => {
    await expect(async () => {
        await fetchUser("invalid-id");
    }).rejects.toThrow("User not found");
});
```

### Use Setup and Teardown

```ts title="example.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeEach, afterEach, test } from "bun:test";

let testUser;

beforeEach(() => {
    testUser = createTestUser();
});

afterEach(() => {
    cleanupTestUser(testUser);
});

test("should update user profile", () => {
    // Use testUser in test
});
```
# Test configuration

> Learn how to configure Bun test behavior using bunfig.toml and command-line options

Configure `bun test` via `bunfig.toml` file and command-line options. This page documents the available configuration options for `bun test`.

## Configuration File

You can configure `bun test` behavior by adding a `[test]` section to your `bunfig.toml` file:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Options go here
```

## Test Discovery

### root

The `root` option specifies a root directory for test discovery, overriding the default behavior of scanning from the project root.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
root = "src"  # Only scan for tests in the src directory
```

This is useful when you want to:

* Limit test discovery to specific directories
* Exclude certain parts of your project from test scanning
* Organize tests in a specific subdirectory structure

#### Examples

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Only run tests in the src directory
root = "src"

# Run tests in a specific test directory
root = "tests"

# Run tests in multiple specific directories (not currently supported - use patterns instead)
# root = ["src", "lib"]  # This syntax is not supported
```

### Preload Scripts

Load scripts before running tests using the `preload` option:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
preload = ["./test-setup.ts", "./global-mocks.ts"]
```

This is equivalent to using `--preload` on the command line:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --preload ./test-setup.ts --preload ./global-mocks.ts
```

#### Common Preload Use Cases

```ts title="test-setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Global test setup
import { beforeAll, afterAll } from "bun:test";

beforeAll(() => {
    // Set up test database
    setupTestDatabase();
});

afterAll(() => {
    // Clean up
    cleanupTestDatabase();
});
```

```ts title="global-mocks.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Global mocks
import { mock } from "bun:test";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.API_URL = "http://localhost:3001";

// Mock external dependencies
mock.module("./external-api", () => ({
    fetchData: mock(() => Promise.resolve({ data: "test" })),
}));
```

## Timeouts

### Default Timeout

Set the default timeout for all tests:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
timeout = 10000  # 10 seconds (default is 5000ms)
```

This applies to all tests unless overridden by individual test timeouts:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// This test will use the default timeout from bunfig.toml
test("uses default timeout", () => {
    // test implementation
});

// This test overrides the default timeout
test("custom timeout", () => {
    // test implementation
}, 30000); // 30 seconds
```

## Reporters

### JUnit Reporter

Configure the JUnit reporter output file path directly in the config file:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test.reporter]
junit = "path/to/junit.xml"  # Output path for JUnit XML report
```

This complements the `--reporter=junit` and `--reporter-outfile` CLI flags:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Equivalent command line usage
bun test --reporter=junit --reporter-outfile=./junit.xml
```

#### Multiple Reporters

You can use multiple reporters simultaneously:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# CLI approach
bun test --reporter=junit --reporter-outfile=./junit.xml

# Config file approach
```

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test.reporter]
junit = "./reports/junit.xml"

[test]
# Also enable coverage reporting
coverage = true
coverageReporter = ["text", "lcov"]
```

## Memory Usage

### smol Mode

Enable the `--smol` memory-saving mode specifically for the test runner:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
smol = true  # Reduce memory usage during test runs
```

This is equivalent to using the `--smol` flag on the command line:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --smol
```

The `smol` mode reduces memory usage by:

* Using less memory for the JavaScript heap
* Being more aggressive about garbage collection
* Reducing buffer sizes where possible

This is useful for:

* CI environments with limited memory
* Large test suites that consume significant memory
* Development environments with memory constraints

## Coverage Options

### Basic Coverage Settings

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Enable coverage by default
coverage = true

# Set coverage reporter
coverageReporter = ["text", "lcov"]

# Set coverage output directory
coverageDir = "./coverage"
```

### Skip Test Files from Coverage

Exclude files matching test patterns (e.g., `*.test.ts`) from the coverage report:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageSkipTestFiles = true  # Exclude test files from coverage reports
```

### Coverage Thresholds

The coverage threshold can be specified either as a number or as an object with specific thresholds:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Simple threshold - applies to lines, functions, and statements
coverageThreshold = 0.8

# Detailed thresholds
coverageThreshold = { lines = 0.9, functions = 0.8, statements = 0.85 }
```

Setting any of these enables `fail_on_low_coverage`, causing the test run to fail if coverage is below the threshold.

#### Threshold Examples

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Require 90% coverage across the board
coverageThreshold = 0.9

# Different requirements for different metrics
coverageThreshold = {
  lines = 0.85,      # 85% line coverage
  functions = 0.90,  # 90% function coverage
  statements = 0.80  # 80% statement coverage
}
```

### Coverage Path Ignore Patterns

Exclude specific files or file patterns from coverage reports using glob patterns:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Single pattern
coveragePathIgnorePatterns = "**/*.spec.ts"

# Multiple patterns
coveragePathIgnorePatterns = [
  "**/*.spec.ts",
  "**/*.test.ts",
  "src/utils/**",
  "*.config.js",
  "generated/**",
  "vendor/**"
]
```

Files matching any of these patterns will be excluded from coverage calculation and reporting. See the [coverage documentation](/test/code-coverage) for more details and examples.

#### Common Ignore Patterns

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coveragePathIgnorePatterns = [
  # Test files
  "**/*.test.ts",
  "**/*.spec.ts",
  "**/*.e2e.ts",

  # Configuration files
  "*.config.js",
  "*.config.ts",
  "webpack.config.*",
  "vite.config.*",

  # Build output
  "dist/**",
  "build/**",
  ".next/**",

  # Generated code
  "generated/**",
  "**/*.generated.ts",

  # Vendor/third-party
  "vendor/**",
  "third-party/**",

  # Utilities that don't need testing
  "src/utils/constants.ts",
  "src/types/**"
]
```

### Sourcemap Handling

Internally, Bun transpiles every file. That means code coverage must also go through sourcemaps before they can be reported. We expose this as a flag to allow you to opt out of this behavior, but it will be confusing because during the transpilation process, Bun may move code around and change variable names. This option is mostly useful for debugging coverage issues.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageIgnoreSourcemaps = true  # Don't use sourcemaps for coverage analysis
```

<Warning>
  When using this option, you probably want to stick a `// @bun` comment at the top of the source
  file to opt out of the transpilation process.
</Warning>

## Install Settings Inheritance

The `bun test` command inherits relevant network and installation configuration (registry, cafile, prefer, exact, etc.) from the `[install]` section of `bunfig.toml`. This is important if tests need to interact with private registries or require specific install behaviors triggered during the test run.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# These settings are inherited by bun test
registry = "https://npm.company.com/"
exact = true
prefer = "offline"

[test]
# Test-specific configuration
coverage = true
timeout = 10000
```

## Environment Variables

You can also set environment variables in your configuration that affect test behavior:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[env]
NODE_ENV = "test"
DATABASE_URL = "postgresql://localhost:5432/test_db"
LOG_LEVEL = "error"

[test]
coverage = true
```

## Complete Configuration Example

Here's a comprehensive example showing all available test configuration options:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# Install settings inherited by tests
registry = "https://registry.npmjs.org/"
exact = true

[env]
# Environment variables for tests
NODE_ENV = "test"
DATABASE_URL = "postgresql://localhost:5432/test_db"
API_URL = "http://localhost:3001"
LOG_LEVEL = "error"

[test]
# Test discovery
root = "src"
preload = ["./test-setup.ts", "./global-mocks.ts"]

# Execution settings
timeout = 10000
smol = true

# Coverage configuration
coverage = true
coverageReporter = ["text", "lcov"]
coverageDir = "./coverage"
coverageThreshold = { lines = 0.85, functions = 0.90, statements = 0.80 }
coverageSkipTestFiles = true
coveragePathIgnorePatterns = [
  "**/*.spec.ts",
  "src/utils/**",
  "*.config.js",
  "generated/**"
]

# Advanced coverage settings
coverageIgnoreSourcemaps = false

# Reporter configuration
[test.reporter]
junit = "./reports/junit.xml"
```

## CLI Override Behavior

Command-line options always override configuration file settings:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
timeout = 5000
coverage = false
```

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# These CLI flags override the config file
bun test --timeout 10000 --coverage
# timeout will be 10000ms and coverage will be enabled
```

## Conditional Configuration

You can use different configurations for different environments:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Default test configuration
coverage = false
timeout = 5000

# Override for CI environment
[test.ci]
coverage = true
coverageThreshold = 0.8
timeout = 30000
```

Then in CI:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Use CI-specific settings
bun test --config=ci
```

## Validation and Troubleshooting

### Invalid Configuration

Bun will warn about invalid configuration options:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
invalidOption = true  # This will generate a warning
```

### Common Configuration Issues

1. **Path Resolution**: Relative paths in config are resolved relative to the config file location
2. **Pattern Matching**: Glob patterns use standard glob syntax
3. **Type Mismatches**: Ensure numeric values are not quoted unless they should be strings

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Correct
timeout = 10000

# Incorrect - will be treated as string
timeout = "10000"
```

### Debugging Configuration

To see what configuration is being used:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Show effective configuration
bun test --dry-run

# Verbose output to see configuration loading
bun test --verbose
```
# Runtime behavior

> Learn about Bun test's runtime integration, environment variables, timeouts, and error handling

`bun test` is deeply integrated with Bun's runtime. This is part of what makes `bun test` fast and simple to use.

## Environment Variables

### NODE\_ENV

`bun test` automatically sets `$NODE_ENV` to `"test"` unless it's already set in the environment or via `.env` files. This is standard behavior for most test runners and helps ensure consistent test behavior.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("NODE_ENV is set to test", () => {
    expect(process.env.NODE_ENV).toBe("test");
});
```

You can override this by setting `NODE_ENV` explicitly:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
NODE_ENV=development bun test
```

### TZ (Timezone)

By default, all `bun test` runs use UTC (`Etc/UTC`) as the time zone unless overridden by the `TZ` environment variable. This ensures consistent date and time behavior across different development environments.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("timezone is UTC by default", () => {
    const date = new Date();
    expect(date.getTimezoneOffset()).toBe(0);
});
```

To test with a specific timezone:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
TZ=America/New_York bun test
```

## Test Timeouts

Each test has a default timeout of 5000ms (5 seconds) if not explicitly overridden. Tests that exceed this timeout will fail.

### Global Timeout

Change the timeout globally with the `--timeout` flag:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --timeout 10000  # 10 seconds
```

### Per-Test Timeout

Set timeout per test as the third parameter to the test function:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("fast test", () => {
    expect(1 + 1).toBe(2);
}, 1000); // 1 second timeout

test("slow test", async () => {
    await new Promise(resolve => setTimeout(resolve, 8000));
}, 10000); // 10 second timeout
```

### Infinite Timeout

Use `0` or `Infinity` to disable timeout:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("test without timeout", async () => {
    // This test can run indefinitely
    await someVeryLongOperation();
}, 0);
```

## Error Handling

### Unhandled Errors

`bun test` tracks unhandled promise rejections and errors that occur between tests. If such errors occur, the final exit code will be non-zero (specifically, the count of such errors), even if all tests pass.

This helps catch errors in asynchronous code that might otherwise go unnoticed:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test } from "bun:test";

test("test 1", () => {
    // This test passes
    expect(true).toBe(true);
});

// This error happens outside any test
setTimeout(() => {
    throw new Error("Unhandled error");
}, 0);

test("test 2", () => {
    // This test also passes
    expect(true).toBe(true);
});

// The test run will still fail with a non-zero exit code
// because of the unhandled error
```

### Promise Rejections

Unhandled promise rejections are also caught:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test } from "bun:test";

test("passing test", () => {
    expect(1).toBe(1);
});

// This will cause the test run to fail
Promise.reject(new Error("Unhandled rejection"));
```

### Custom Error Handling

You can set up custom error handlers in your test setup:

```ts title="test-setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
process.on("uncaughtException", error => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
```

## CLI Flags Integration

Several Bun CLI flags can be used with `bun test` to modify its behavior:

### Memory Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Reduces memory usage for the test runner VM
bun test --smol
```

### Debugging

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Attaches the debugger to the test runner process
bun test --inspect
bun test --inspect-brk
```

### Module Loading

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Runs scripts before test files (useful for global setup/mocks)
bun test --preload ./setup.ts

# Sets compile-time constants
bun test --define "process.env.API_URL='http://localhost:3000'"

# Configures custom loaders
bun test --loader .special:special-loader

# Uses a different tsconfig
bun test --tsconfig-override ./test-tsconfig.json

# Sets package.json conditions for module resolution
bun test --conditions development

# Loads environment variables for tests
bun test --env-file .env.test
```

### Installation-related Flags

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# Affect any network requests or auto-installs during test execution
bun test --prefer-offline
bun test --frozen-lockfile
```

## Watch and Hot Reloading

### Watch Mode

When running `bun test` with the `--watch` flag, the test runner will watch for file changes and re-run affected tests.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --watch
```

The test runner is smart about which tests to re-run:

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { add } from "./math.js";
import { test, expect } from "bun:test";

test("addition", () => {
    expect(add(2, 3)).toBe(5);
});
```

If you modify `math.js`, only `math.test.ts` will re-run, not all tests.

### Hot Reloading

The `--hot` flag provides similar functionality but is more aggressive about trying to preserve state between runs:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --hot
```

For most test scenarios, `--watch` is the recommended option as it provides better isolation between test runs.

## Global Variables

The following globals are automatically available in test files without importing (though they can be imported from `bun:test` if preferred):

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// All of these are available globally
test("global test function", () => {
    expect(true).toBe(true);
});

describe("global describe", () => {
    beforeAll(() => {
        // global beforeAll
    });

    it("global it function", () => {
        // it is an alias for test
    });
});

// Jest compatibility
jest.fn();

// Vitest compatibility
vi.fn();
```

You can also import them explicitly if you prefer:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import {
    test,
    it,
    describe,
    expect,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
    jest,
    vi,
} from "bun:test";
```

## Process Integration

### Exit Codes

`bun test` uses standard exit codes:

* `0`: All tests passed, no unhandled errors
* `1`: Test failures occurred
* `>1`: Number of unhandled errors (even if tests passed)

### Signal Handling

The test runner properly handles common signals:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Gracefully stops test execution
kill -SIGTERM <test-process-pid>

# Immediately stops test execution
kill -SIGKILL <test-process-pid>
```

### Environment Detection

Bun automatically detects certain environments and adjusts behavior:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// GitHub Actions detection
if (process.env.GITHUB_ACTIONS) {
    // Bun automatically emits GitHub Actions annotations
}

// CI detection
if (process.env.CI) {
    // Certain behaviors may be adjusted for CI environments
}
```

## Performance Considerations

### Single Process

The test runner runs all tests in a single process by default. This provides:

* **Faster startup** - No need to spawn multiple processes
* **Shared memory** - Efficient resource usage
* **Simple debugging** - All tests in one process

However, this means:

* Tests share global state (use lifecycle hooks to clean up)
* One test crash can affect others
* No true parallelization of individual tests

### Memory Management

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Monitor memory usage
bun test --smol  # Reduces memory footprint

# For large test suites, consider splitting files
bun test src/unit/
bun test src/integration/
```

### Test Isolation

Since tests run in the same process, ensure proper cleanup:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { afterEach } from "bun:test";

afterEach(() => {
    // Clean up global state
    global.myGlobalVar = undefined;
    delete process.env.TEST_VAR;

    // Reset modules if needed
    jest.resetModules();
});
```
# Finding tests

> Learn how Bun's test runner discovers and filters test files in your project

bun test's file discovery mechanism determines which files to run as tests. Understanding how it works helps you structure your test files effectively.

## Default Discovery Logic

By default, `bun test` recursively searches the project directory for files that match specific patterns:

* `*.test.{js|jsx|ts|tsx}` - Files ending with `.test.js`, `.test.jsx`, `.test.ts`, or `.test.tsx`
* `*_test.{js|jsx|ts|tsx}` - Files ending with `_test.js`, `_test.jsx`, `_test.ts`, or `_test.tsx`
* `*.spec.{js|jsx|ts|tsx}` - Files ending with `.spec.js`, `.spec.jsx`, `.spec.ts`, or `.spec.tsx`
* `*_spec.{js|jsx|ts|tsx}` - Files ending with `_spec.js`, `_spec.jsx`, `_spec.ts`, or `_spec.tsx`

## Exclusions

By default, Bun test ignores:

* `node_modules` directories
* Hidden directories (those starting with a period `.`)
* Files that don't have JavaScript-like extensions (based on available loaders)

## Customizing Test Discovery

### Position Arguments as Filters

You can filter which test files run by passing additional positional arguments to `bun test`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test <filter> <filter> ...
```

Any test file with a path that contains one of the filters will run. These filters are simple substring matches, not glob patterns.

For example, to run all tests in a `utils` directory:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test utils
```

This would match files like `src/utils/string.test.ts` and `lib/utils/array_test.js`.

### Specifying Exact File Paths

To run a specific file in the test runner, make sure the path starts with `./` or `/` to distinguish it from a filter name:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test ./test/specific-file.test.ts
```

### Filter by Test Name

To filter tests by name rather than file path, use the `-t`/`--test-name-pattern` flag with a regex pattern:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# run all tests with "addition" in the name
bun test --test-name-pattern addition
```

The pattern is matched against a concatenated string of the test name prepended with the labels of all its parent describe blocks, separated by spaces. For example, a test defined as:

```ts title="math.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
describe("Math", () => {
    describe("operations", () => {
        test("should add correctly", () => {
            // ...
        });
    });
});
```

Would be matched against the string "Math operations should add correctly".

### Changing the Root Directory

By default, Bun looks for test files starting from the current working directory. You can change this with the `root` option in your `bunfig.toml`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
root = "src"  # Only scan for tests in the src directory
```

## Execution Order

Tests are run in the following order:

1. Test files are executed sequentially (not in parallel)
2. Within each file, tests run sequentially based on their definition order
# Lifecycle hooks

> Learn how to use beforeAll, beforeEach, afterEach, and afterAll lifecycle hooks in Bun tests

The test runner supports the following lifecycle hooks. This is useful for loading test fixtures, mocking data, and configuring the test environment.

| Hook         | Description                 |
| ------------ | --------------------------- |
| `beforeAll`  | Runs once before all tests. |
| `beforeEach` | Runs before each test.      |
| `afterEach`  | Runs after each test.       |
| `afterAll`   | Runs once after all tests.  |

## Per-Test Setup and Teardown

Perform per-test setup and teardown logic with `beforeEach` and `afterEach`.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeEach, afterEach, test } from "bun:test";

beforeEach(() => {
    console.log("running test.");
});

afterEach(() => {
    console.log("done with test.");
});

// tests...
test("example test", () => {
    // This test will have beforeEach run before it
    // and afterEach run after it
});
```

## Per-Scope Setup and Teardown

Perform per-scope setup and teardown logic with `beforeAll` and `afterAll`. The scope is determined by where the hook is defined.

### Scoped to a Describe Block

To scope the hooks to a particular describe block:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { describe, beforeAll, afterAll, test } from "bun:test";

describe("test group", () => {
    beforeAll(() => {
        // setup for this describe block
        console.log("Setting up test group");
    });

    afterAll(() => {
        // teardown for this describe block
        console.log("Tearing down test group");
    });

    test("test 1", () => {
        // test implementation
    });

    test("test 2", () => {
        // test implementation
    });
});
```

### Scoped to a Test File

To scope the hooks to an entire test file:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { describe, beforeAll, afterAll, test } from "bun:test";

beforeAll(() => {
    // setup for entire file
    console.log("Setting up test file");
});

afterAll(() => {
    // teardown for entire file
    console.log("Tearing down test file");
});

describe("test group", () => {
    test("test 1", () => {
        // test implementation
    });
});
```

## Global Setup and Teardown

To scope the hooks to an entire multi-file test run, define the hooks in a separate file.

```ts title="setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeAll, afterAll } from "bun:test";

beforeAll(() => {
    // global setup
    console.log("Global test setup");
    // Initialize database connections, start servers, etc.
});

afterAll(() => {
    // global teardown
    console.log("Global test teardown");
    // Close database connections, stop servers, etc.
});
```

Then use `--preload` to run the setup script before any test files.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --preload ./setup.ts
```

To avoid typing `--preload` every time you run tests, it can be added to your `bunfig.toml`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
preload = ["./setup.ts"]
```

## Practical Examples

### Database Setup

```ts title="database-setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeAll, afterAll, beforeEach, afterEach } from "bun:test";
import { createConnection, closeConnection, clearDatabase } from "./db";

let connection;

beforeAll(async () => {
    // Connect to test database
    connection = await createConnection({
        host: "localhost",
        database: "test_db",
    });
});

afterAll(async () => {
    // Close database connection
    await closeConnection(connection);
});

beforeEach(async () => {
    // Start with clean database for each test
    await clearDatabase(connection);
});
```

### API Server Setup

```ts title="server-setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeAll, afterAll } from "bun:test";
import { startServer, stopServer } from "./server";

let server;

beforeAll(async () => {
    // Start test server
    server = await startServer({
        port: 3001,
        env: "test",
    });
});

afterAll(async () => {
    // Stop test server
    await stopServer(server);
});
```

### Mock Setup

```ts title="mock-setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeEach, afterEach } from "bun:test";
import { mock } from "bun:test";

beforeEach(() => {
    // Set up common mocks
    mock.module("./api-client", () => ({
        fetchUser: mock(() => Promise.resolve({ id: 1, name: "Test User" })),
        createUser: mock(() => Promise.resolve({ id: 2 })),
    }));
});

afterEach(() => {
    // Clear all mocks after each test
    mock.restore();
});
```

## Async Lifecycle Hooks

All lifecycle hooks support async functions:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeAll, afterAll, test } from "bun:test";

beforeAll(async () => {
    // Async setup
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("Async setup complete");
});

afterAll(async () => {
    // Async teardown
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("Async teardown complete");
});

test("async test", async () => {
    // Test will wait for beforeAll to complete
    await expect(Promise.resolve("test")).resolves.toBe("test");
});
```

## Nested Hooks

Hooks can be nested and will run in the appropriate order:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { describe, beforeAll, beforeEach, afterEach, afterAll, test } from "bun:test";

beforeAll(() => console.log("File beforeAll"));
afterAll(() => console.log("File afterAll"));

describe("outer describe", () => {
    beforeAll(() => console.log("Outer beforeAll"));
    beforeEach(() => console.log("Outer beforeEach"));
    afterEach(() => console.log("Outer afterEach"));
    afterAll(() => console.log("Outer afterAll"));

    describe("inner describe", () => {
        beforeAll(() => console.log("Inner beforeAll"));
        beforeEach(() => console.log("Inner beforeEach"));
        afterEach(() => console.log("Inner afterEach"));
        afterAll(() => console.log("Inner afterAll"));

        test("nested test", () => {
            console.log("Test running");
        });
    });
});
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Output order:
// File beforeAll
// Outer beforeAll
// Inner beforeAll
// Outer beforeEach
// Inner beforeEach
// Test running
// Inner afterEach
// Outer afterEach
// Inner afterAll
// Outer afterAll
// File afterAll
```

## Error Handling

If a lifecycle hook throws an error, it will affect test execution:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeAll, test } from "bun:test";

beforeAll(() => {
    // If this throws, all tests in this scope will be skipped
    throw new Error("Setup failed");
});

test("this test will be skipped", () => {
    // This won't run because beforeAll failed
});
```

For better error handling:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { beforeAll, test, expect } from "bun:test";

beforeAll(async () => {
    try {
        await setupDatabase();
    } catch (error) {
        console.error("Database setup failed:", error);
        throw error; // Re-throw to fail the test suite
    }
});
```

## Best Practices

### Keep Hooks Simple

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: Simple, focused setup
beforeEach(() => {
    clearLocalStorage();
    resetMocks();
});

// Avoid: Complex logic in hooks
beforeEach(async () => {
    // Too much complex logic makes tests hard to debug
    const data = await fetchComplexData();
    await processData(data);
    await setupMultipleServices(data);
});
```

### Use Appropriate Scope

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: File-level setup for shared resources
beforeAll(async () => {
    await startTestServer();
});

// Good: Test-level setup for test-specific state
beforeEach(() => {
    user = createTestUser();
});
```

### Clean Up Resources

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { afterAll, afterEach } from "bun:test";

afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = "";
    localStorage.clear();
});

afterAll(async () => {
    // Clean up expensive resources
    await closeDatabase();
    await stopServer();
});
```
# Mocks

> Learn how to create and use mock functions, spies, and module mocks in Bun tests

Mocking is essential for testing by allowing you to replace dependencies with controlled implementations. Bun provides comprehensive mocking capabilities including function mocks, spies, and module mocks.

## Basic Function Mocks

Create mocks with the `mock` function.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

const random = mock(() => Math.random());

test("random", () => {
    const val = random();
    expect(val).toBeGreaterThan(0);
    expect(random).toHaveBeenCalled();
    expect(random).toHaveBeenCalledTimes(1);
});
```

### Jest Compatibility

Alternatively, you can use the `jest.fn()` function, as in Jest. It behaves identically.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, jest } from "bun:test";

const random = jest.fn(() => Math.random());

test("random", () => {
    const val = random();
    expect(val).toBeGreaterThan(0);
    expect(random).toHaveBeenCalled();
    expect(random).toHaveBeenCalledTimes(1);
});
```

## Mock Function Properties

The result of `mock()` is a new function that's been decorated with some additional properties.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { mock } from "bun:test";

const random = mock((multiplier: number) => multiplier * Math.random());

random(2);
random(10);

random.mock.calls;
// [[ 2 ], [ 10 ]]

random.mock.results;
//  [
//    { type: "return", value: 0.6533907460954099 },
//    { type: "return", value: 0.6452713933037312 }
//  ]
```

### Available Properties and Methods

The following properties and methods are implemented on mock functions:

| Property/Method                           | Description                                    |
| ----------------------------------------- | ---------------------------------------------- |
| `mockFn.getMockName()`                    | Returns the mock name                          |
| `mockFn.mock.calls`                       | Array of call arguments for each invocation    |
| `mockFn.mock.results`                     | Array of return values for each invocation     |
| `mockFn.mock.instances`                   | Array of `this` contexts for each invocation   |
| `mockFn.mock.contexts`                    | Array of `this` contexts for each invocation   |
| `mockFn.mock.lastCall`                    | Arguments of the most recent call              |
| `mockFn.mockClear()`                      | Clears call history                            |
| `mockFn.mockReset()`                      | Clears call history and removes implementation |
| `mockFn.mockRestore()`                    | Restores original implementation               |
| `mockFn.mockImplementation(fn)`           | Sets a new implementation                      |
| `mockFn.mockImplementationOnce(fn)`       | Sets implementation for next call only         |
| `mockFn.mockName(name)`                   | Sets the mock name                             |
| `mockFn.mockReturnThis()`                 | Sets the return value to `this`                |
| `mockFn.mockReturnValue(value)`           | Sets a return value                            |
| `mockFn.mockReturnValueOnce(value)`       | Sets return value for next call only           |
| `mockFn.mockResolvedValue(value)`         | Sets a resolved Promise value                  |
| `mockFn.mockResolvedValueOnce(value)`     | Sets resolved Promise for next call only       |
| `mockFn.mockRejectedValue(value)`         | Sets a rejected Promise value                  |
| `mockFn.mockRejectedValueOnce(value)`     | Sets rejected Promise for next call only       |
| `mockFn.withImplementation(fn, callback)` | Temporarily changes implementation             |

### Practical Examples

#### Basic Mock Usage

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

test("mock function behavior", () => {
    const mockFn = mock((x: number) => x * 2);

    // Call the mock
    const result1 = mockFn(5);
    const result2 = mockFn(10);

    // Verify calls
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith(5);
    expect(mockFn).toHaveBeenLastCalledWith(10);

    // Check results
    expect(result1).toBe(10);
    expect(result2).toBe(20);

    // Inspect call history
    expect(mockFn.mock.calls).toEqual([[5], [10]]);
    expect(mockFn.mock.results).toEqual([
        { type: "return", value: 10 },
        { type: "return", value: 20 },
    ]);
});
```

#### Dynamic Mock Implementations

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

test("dynamic mock implementations", () => {
    const mockFn = mock();

    // Set different implementations
    mockFn.mockImplementationOnce(() => "first");
    mockFn.mockImplementationOnce(() => "second");
    mockFn.mockImplementation(() => "default");

    expect(mockFn()).toBe("first");
    expect(mockFn()).toBe("second");
    expect(mockFn()).toBe("default");
    expect(mockFn()).toBe("default"); // Uses default implementation
});
```

#### Async Mocks

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

test("async mock functions", async () => {
    const asyncMock = mock();

    // Mock resolved values
    asyncMock.mockResolvedValueOnce("first result");
    asyncMock.mockResolvedValue("default result");

    expect(await asyncMock()).toBe("first result");
    expect(await asyncMock()).toBe("default result");

    // Mock rejected values
    const rejectMock = mock();
    rejectMock.mockRejectedValue(new Error("Mock error"));

    await expect(rejectMock()).rejects.toThrow("Mock error");
});
```

## Spies with spyOn()

It's possible to track calls to a function without replacing it with a mock. Use `spyOn()` to create a spy; these spies can be passed to `.toHaveBeenCalled()` and `.toHaveBeenCalledTimes()`.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, spyOn } from "bun:test";

const ringo = {
    name: "Ringo",
    sayHi() {
        console.log(`Hello I'm ${this.name}`);
    },
};

const spy = spyOn(ringo, "sayHi");

test("spyon", () => {
    expect(spy).toHaveBeenCalledTimes(0);
    ringo.sayHi();
    expect(spy).toHaveBeenCalledTimes(1);
});
```

### Advanced Spy Usage

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, spyOn, afterEach } from "bun:test";

class UserService {
    async getUser(id: string) {
        // Original implementation
        return { id, name: `User ${id}` };
    }

    async saveUser(user: any) {
        // Original implementation
        return { ...user, saved: true };
    }
}

const userService = new UserService();

afterEach(() => {
    // Restore all spies after each test
    jest.restoreAllMocks();
});

test("spy on service methods", async () => {
    // Spy without changing implementation
    const getUserSpy = spyOn(userService, "getUser");
    const saveUserSpy = spyOn(userService, "saveUser");

    // Use the service normally
    const user = await userService.getUser("123");
    await userService.saveUser(user);

    // Verify calls
    expect(getUserSpy).toHaveBeenCalledWith("123");
    expect(saveUserSpy).toHaveBeenCalledWith(user);
});

test("spy with mock implementation", async () => {
    // Spy and override implementation
    const getUserSpy = spyOn(userService, "getUser").mockResolvedValue({
        id: "123",
        name: "Mocked User",
    });

    const result = await userService.getUser("123");

    expect(result.name).toBe("Mocked User");
    expect(getUserSpy).toHaveBeenCalledWith("123");
});
```

## Module Mocks with mock.module()

Module mocking lets you override the behavior of a module. Use `mock.module(path: string, callback: () => Object)` to mock a module.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

mock.module("./module", () => {
    return {
        foo: "bar",
    };
});

test("mock.module", async () => {
    const esm = await import("./module");
    expect(esm.foo).toBe("bar");

    const cjs = require("./module");
    expect(cjs.foo).toBe("bar");
});
```

Like the rest of Bun, module mocks support both `import` and `require`.

### Overriding Already Imported Modules

If you need to override a module that's already been imported, there's nothing special you need to do. Just call `mock.module()` and the module will be overridden.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

// The module we're going to mock is here:
import { foo } from "./module";

test("mock.module", async () => {
    const cjs = require("./module");
    expect(foo).toBe("bar");
    expect(cjs.foo).toBe("bar");

    // We update it here:
    mock.module("./module", () => {
        return {
            foo: "baz",
        };
    });

    // And the live bindings are updated.
    expect(foo).toBe("baz");

    // The module is also updated for CJS.
    expect(cjs.foo).toBe("baz");
});
```

### Hoisting & Preloading

If you need to ensure a module is mocked before it's imported, you should use `--preload` to load your mocks before your tests run.

```ts title="my-preload.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { mock } from "bun:test";

mock.module("./module", () => {
    return {
        foo: "bar",
    };
});
```

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --preload ./my-preload
```

To make your life easier, you can put preload in your `bunfig.toml`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Load these modules before running tests.
preload = ["./my-preload"]
```

### Module Mock Best Practices

#### When to Use Preload

**What happens if I mock a module that's already been imported?**

If you mock a module that's already been imported, the module will be updated in the module cache. This means that any modules that import the module will get the mocked version, BUT the original module will still have been evaluated. That means that any side effects from the original module will still have happened.

If you want to prevent the original module from being evaluated, you should use `--preload` to load your mocks before your tests run.

#### Practical Module Mock Examples

```ts title="api-client.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock, beforeEach } from "bun:test";

// Mock the API client module
mock.module("./api-client", () => ({
    fetchUser: mock(async (id: string) => ({ id, name: `User ${id}` })),
    createUser: mock(async (user: any) => ({ ...user, id: "new-id" })),
    updateUser: mock(async (id: string, user: any) => ({ ...user, id })),
}));

test("user service with mocked API", async () => {
    const { fetchUser } = await import("./api-client");
    const { UserService } = await import("./user-service");

    const userService = new UserService();
    const user = await userService.getUser("123");

    expect(fetchUser).toHaveBeenCalledWith("123");
    expect(user.name).toBe("User 123");
});
```

#### Mocking External Dependencies

```ts title="database.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

// Mock external database library
mock.module("pg", () => ({
    Client: mock(function () {
        return {
            connect: mock(async () => {}),
            query: mock(async (sql: string) => ({
                rows: [{ id: 1, name: "Test User" }],
            })),
            end: mock(async () => {}),
        };
    }),
}));

test("database operations", async () => {
    const { Database } = await import("./database");
    const db = new Database();

    const users = await db.getUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("Test User");
});
```

## Global Mock Functions

### Clear All Mocks

Reset all mock function state (calls, results, etc.) without restoring their original implementation:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, mock, test } from "bun:test";

const random1 = mock(() => Math.random());
const random2 = mock(() => Math.random());

test("clearing all mocks", () => {
    random1();
    random2();

    expect(random1).toHaveBeenCalledTimes(1);
    expect(random2).toHaveBeenCalledTimes(1);

    mock.clearAllMocks();

    expect(random1).toHaveBeenCalledTimes(0);
    expect(random2).toHaveBeenCalledTimes(0);

    // Note: implementations are preserved
    expect(typeof random1()).toBe("number");
    expect(typeof random2()).toBe("number");
});
```

This resets the `.mock.calls`, `.mock.instances`, `.mock.contexts`, and `.mock.results` properties of all mocks, but unlike `mock.restore()`, it does not restore the original implementation.

### Restore All Mocks

Instead of manually restoring each mock individually with `mockFn.mockRestore()`, restore all mocks with one command by calling `mock.restore()`. Doing so does not reset the value of modules overridden with `mock.module()`.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { expect, mock, spyOn, test } from "bun:test";

import * as fooModule from "./foo.ts";
import * as barModule from "./bar.ts";
import * as bazModule from "./baz.ts";

test("foo, bar, baz", () => {
    const fooSpy = spyOn(fooModule, "foo");
    const barSpy = spyOn(barModule, "bar");
    const bazSpy = spyOn(bazModule, "baz");

    // Original values
    expect(fooSpy).toBe("foo");
    expect(barSpy).toBe("bar");
    expect(bazSpy).toBe("baz");

    // Mock implementations
    fooSpy.mockImplementation(() => 42);
    barSpy.mockImplementation(() => 43);
    bazSpy.mockImplementation(() => 44);

    expect(fooSpy()).toBe(42);
    expect(barSpy()).toBe(43);
    expect(bazSpy()).toBe(44);

    // Restore all
    mock.restore();

    expect(fooSpy()).toBe("foo");
    expect(barSpy()).toBe("bar");
    expect(bazSpy()).toBe("baz");
});
```

Using `mock.restore()` can reduce the amount of code in your tests by adding it to `afterEach` blocks in each test file or even in your test preload code.

## Vitest Compatibility

For added compatibility with tests written for Vitest, Bun provides the `vi` global object as an alias for parts of the Jest mocking API:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

// Using the 'vi' alias similar to Vitest
test("vitest compatibility", () => {
    const mockFn = vi.fn(() => 42);

    mockFn();
    expect(mockFn).toHaveBeenCalled();

    // The following functions are available on the vi object:
    // vi.fn
    // vi.spyOn
    // vi.mock
    // vi.restoreAllMocks
    // vi.clearAllMocks
});
```

This makes it easier to port tests from Vitest to Bun without having to rewrite all your mocks.

## Implementation Details

Understanding how `mock.module()` works helps you use it more effectively:

### Cache Interaction

Module mocks interact with both ESM and CommonJS module caches.

### Lazy Evaluation

The mock factory callback is only evaluated when the module is actually imported or required.

### Path Resolution

Bun automatically resolves the module specifier as though you were doing an import, supporting:

* Relative paths (`'./module'`)
* Absolute paths (`'/path/to/module'`)
* Package names (`'lodash'`)

### Import Timing Effects

* **When mocking before first import**: No side effects from the original module occur
* **When mocking after import**: The original module's side effects have already happened

For this reason, using `--preload` is recommended for mocks that need to prevent side effects.

### Live Bindings

Mocked ESM modules maintain live bindings, so changing the mock will update all existing imports.

## Advanced Patterns

### Factory Functions

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { mock } from "bun:test";

function createMockUser(overrides = {}) {
    return {
        id: "mock-id",
        name: "Mock User",
        email: "mock@example.com",
        ...overrides,
    };
}

const mockUserService = {
    getUser: mock(async (id: string) => createMockUser({ id })),
    createUser: mock(async (data: any) => createMockUser(data)),
    updateUser: mock(async (id: string, data: any) => createMockUser({ id, ...data })),
};
```

### Conditional Mocking

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, mock } from "bun:test";

const shouldUseMockApi = process.env.NODE_ENV === "test";

if (shouldUseMockApi) {
    mock.module("./api", () => ({
        fetchData: mock(async () => ({ data: "mocked" })),
    }));
}

test("conditional API usage", async () => {
    const { fetchData } = await import("./api");
    const result = await fetchData();

    if (shouldUseMockApi) {
        expect(result.data).toBe("mocked");
    }
});
```

### Mock Cleanup Patterns

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { afterEach, beforeEach } from "bun:test";

beforeEach(() => {
    // Set up common mocks
    mock.module("./logger", () => ({
        log: mock(() => {}),
        error: mock(() => {}),
        warn: mock(() => {}),
    }));
});

afterEach(() => {
    // Clean up all mocks
    mock.restore();
    mock.clearAllMocks();
});
```

## Best Practices

### Keep Mocks Simple

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: Simple, focused mock
const mockUserApi = {
    getUser: mock(async id => ({ id, name: "Test User" })),
};

// Avoid: Overly complex mock behavior
const complexMock = mock(input => {
    if (input.type === "A") {
        return processTypeA(input);
    } else if (input.type === "B") {
        return processTypeB(input);
    }
    // ... lots of complex logic
});
```

### Use Type-Safe Mocks

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
interface UserService {
    getUser(id: string): Promise<User>;
    createUser(data: CreateUserData): Promise<User>;
}

const mockUserService: UserService = {
    getUser: mock(async (id: string) => ({ id, name: "Test User" })),
    createUser: mock(async data => ({ id: "new-id", ...data })),
};
```

### Test Mock Behavior

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("service calls API correctly", async () => {
    const mockApi = { fetchUser: mock(async () => ({ id: "1" })) };

    const service = new UserService(mockApi);
    await service.getUser("123");

    // Verify the mock was called correctly
    expect(mockApi.fetchUser).toHaveBeenCalledWith("123");
    expect(mockApi.fetchUser).toHaveBeenCalledTimes(1);
});
```

## Notes

### Auto-mocking

`__mocks__` directory and auto-mocking are not supported yet. If this is blocking you from switching to Bun, please [file an issue](https://github.com/oven-sh/bun/issues).

### ESM vs CommonJS

Module mocks have different implementations for ESM and CommonJS modules. For ES Modules, Bun has added patches to JavaScriptCore that allow Bun to override export values at runtime and update live bindings recursively.
# Snapshots

> Learn how to use snapshot testing in Bun to save and compare output between test runs

Snapshot testing saves the output of a value and compares it against future test runs. This is particularly useful for UI components, complex objects, or any output that needs to remain consistent.

## Basic Snapshots

Snapshot tests are written using the `.toMatchSnapshot()` matcher:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("snap", () => {
    expect("foo").toMatchSnapshot();
});
```

The first time this test is run, the argument to `expect` will be serialized and written to a special snapshot file in a `__snapshots__` directory alongside the test file.

### Snapshot Files

After running the test above, Bun will create:

```text title="directory structure" icon="file-directory" theme={"theme":{"light":"github-light","dark":"dracula"}}
your-project/
├── snap.test.ts
└── __snapshots__/
    └── snap.test.ts.snap
```

The snapshot file contains:

```txt title="snapshot file" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Bun Snapshot v1, https://goo.gl/fbAQLP

exports[`snap 1`] = `"foo"`;
```

On future runs, the argument is compared against the snapshot on disk.

## Updating Snapshots

Snapshots can be re-generated with the following command:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --update-snapshots
```

This is useful when:

* You've intentionally changed the output
* You're adding new snapshot tests
* The expected output has legitimately changed

## Inline Snapshots

For smaller values, you can use inline snapshots with `.toMatchInlineSnapshot()`. These snapshots are stored directly in your test file:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("inline snapshot", () => {
    // First run: snapshot will be inserted automatically
    expect({ hello: "world" }).toMatchInlineSnapshot();
});
```

After the first run, Bun automatically updates your test file:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("inline snapshot", () => {
    expect({ hello: "world" }).toMatchInlineSnapshot(`
{
  "hello": "world",
}
`);
});
```

### Using Inline Snapshots

1. Write your test with `.toMatchInlineSnapshot()`
2. Run the test once
3. Bun automatically updates your test file with the snapshot
4. On subsequent runs, the value will be compared against the inline snapshot

Inline snapshots are particularly useful for small, simple values where it's helpful to see the expected output right in the test file.

## Error Snapshots

You can also snapshot error messages using `.toThrowErrorMatchingSnapshot()` and `.toThrowErrorMatchingInlineSnapshot()`:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("error snapshot", () => {
    expect(() => {
        throw new Error("Something went wrong");
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
        throw new Error("Another error");
    }).toThrowErrorMatchingInlineSnapshot();
});
```

After running, the inline version becomes:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("error snapshot", () => {
    expect(() => {
        throw new Error("Something went wrong");
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
        throw new Error("Another error");
    }).toThrowErrorMatchingInlineSnapshot(`"Another error"`);
});
```

## Advanced Snapshot Usage

### Complex Objects

Snapshots work well with complex nested objects:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("complex object snapshot", () => {
    const user = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        profile: {
            age: 30,
            preferences: {
                theme: "dark",
                notifications: true,
            },
        },
        tags: ["developer", "javascript", "bun"],
    };

    expect(user).toMatchSnapshot();
});
```

### Array Snapshots

Arrays are also well-suited for snapshot testing:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("array snapshot", () => {
    const numbers = [1, 2, 3, 4, 5].map(n => n * 2);
    expect(numbers).toMatchSnapshot();
});
```

### Function Output Snapshots

Snapshot the output of functions:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

function generateReport(data: any[]) {
    return {
        total: data.length,
        summary: data.map(item => ({ id: item.id, name: item.name })),
        timestamp: "2024-01-01", // Fixed for testing
    };
}

test("report generation", () => {
    const data = [
        { id: 1, name: "Alice", age: 30 },
        { id: 2, name: "Bob", age: 25 },
    ];

    expect(generateReport(data)).toMatchSnapshot();
});
```

## React Component Snapshots

Snapshots are particularly useful for React components:

```tsx title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";
import { render } from "@testing-library/react";

function Button({ children, variant = "primary" }) {
    return <button className={`btn btn-${variant}`}>{children}</button>;
}

test("Button component snapshots", () => {
    const { container: primary } = render(<Button>Click me</Button>);
    const { container: secondary } = render(<Button variant="secondary">Cancel</Button>);

    expect(primary.innerHTML).toMatchSnapshot();
    expect(secondary.innerHTML).toMatchSnapshot();
});
```

## Property Matchers

For values that change between test runs (like timestamps or IDs), use property matchers:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("snapshot with dynamic values", () => {
    const user = {
        id: Math.random(), // This changes every run
        name: "John",
        createdAt: new Date().toISOString(), // This also changes
    };

    expect(user).toMatchSnapshot({
        id: expect.any(Number),
        createdAt: expect.any(String),
    });
});
```

The snapshot will store:

```txt title="snapshot file" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
exports[`snapshot with dynamic values 1`] = `
{
  "createdAt": Any<String>,
  "id": Any<Number>,
  "name": "John",
}
`;
```

## Custom Serializers

You can customize how objects are serialized in snapshots:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

// Custom serializer for Date objects
expect.addSnapshotSerializer({
    test: val => val instanceof Date,
    serialize: val => `"${val.toISOString()}"`,
});

test("custom serializer", () => {
    const event = {
        name: "Meeting",
        date: new Date("2024-01-01T10:00:00Z"),
    };

    expect(event).toMatchSnapshot();
});
```

## Best Practices

### Keep Snapshots Small

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: Focused snapshots
test("user name formatting", () => {
    const formatted = formatUserName("john", "doe");
    expect(formatted).toMatchInlineSnapshot(`"John Doe"`);
});

// Avoid: Huge snapshots that are hard to review
test("entire page render", () => {
    const page = renderEntirePage();
    expect(page).toMatchSnapshot(); // This could be thousands of lines
});
```

### Use Descriptive Test Names

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: Clear what the snapshot represents
test("formats currency with USD symbol", () => {
    expect(formatCurrency(99.99)).toMatchInlineSnapshot(`"$99.99"`);
});

// Avoid: Unclear what's being tested
test("format test", () => {
    expect(format(99.99)).toMatchInlineSnapshot(`"$99.99"`);
});
```

### Group Related Snapshots

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { describe, test, expect } from "bun:test";

describe("Button component", () => {
  test("primary variant", () => {
    expect(render(<Button variant="primary">Click</Button>))
      .toMatchSnapshot();
  });

  test("secondary variant", () => {
    expect(render(<Button variant="secondary">Cancel</Button>))
      .toMatchSnapshot();
  });

  test("disabled state", () => {
    expect(render(<Button disabled>Disabled</Button>))
      .toMatchSnapshot();
  });
});
```

### Handle Dynamic Data

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: Normalize dynamic data
test("API response format", () => {
    const response = {
        data: { id: 1, name: "Test" },
        timestamp: Date.now(),
        requestId: generateId(),
    };

    expect({
        ...response,
        timestamp: "TIMESTAMP",
        requestId: "REQUEST_ID",
    }).toMatchSnapshot();
});

// Or use property matchers
test("API response with matchers", () => {
    const response = getApiResponse();

    expect(response).toMatchSnapshot({
        timestamp: expect.any(Number),
        requestId: expect.any(String),
    });
});
```

## Managing Snapshots

### Reviewing Snapshot Changes

When snapshots change, carefully review them:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# See what changed
git diff __snapshots__/

# Update if changes are intentional
bun test --update-snapshots

# Commit the updated snapshots
git add __snapshots__/
git commit -m "Update snapshots after UI changes"
```

### Cleaning Up Unused Snapshots

Bun will warn about unused snapshots:

```txt title="warning" icon="warning" theme={"theme":{"light":"github-light","dark":"dracula"}}
Warning: 1 unused snapshot found:
  my-test.test.ts.snap: "old test that no longer exists 1"
```

Remove unused snapshots by deleting them from the snapshot files or by running tests with cleanup flags if available.

### Organizing Large Snapshot Files

For large projects, consider organizing tests to keep snapshot files manageable:

```text title="directory structure" icon="file-directory" theme={"theme":{"light":"github-light","dark":"dracula"}}
tests/
├── components/
│   ├── Button.test.tsx
│   └── __snapshots__/
│       └── Button.test.tsx.snap
├── utils/
│   ├── formatters.test.ts
│   └── __snapshots__/
│       └── formatters.test.ts.snap
```

## Troubleshooting

### Snapshot Failures

When snapshots fail, you'll see a diff:

```text title="diff" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
- Expected
+ Received

  Object {
-   "name": "John",
+   "name": "Jane",
  }
```

Common causes:

* Intentional changes (update with `--update-snapshots`)
* Unintentional changes (fix the code)
* Dynamic data (use property matchers)
* Environment differences (normalize the data)

### Platform Differences

Be aware of platform-specific differences:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Paths might differ between Windows/Unix
test("file operations", () => {
    const result = processFile("./test.txt");

    expect({
        ...result,
        path: result.path.replace(/\\/g, "/"), // Normalize paths
    }).toMatchSnapshot();
});
```
# Dates and times

> Learn how to manipulate time and dates in your Bun tests using setSystemTime and Jest compatibility functions

`bun:test` lets you change what time it is in your tests.

This works with any of the following:

* `Date.now`
* `new Date()`
* `new Intl.DateTimeFormat().format()`

<Note>Timers are not impacted yet, but may be in a future release of Bun.</Note>

## setSystemTime

To change the system time, use `setSystemTime`:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { setSystemTime, beforeAll, test, expect } from "bun:test";

beforeAll(() => {
    setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
});

test("it is 2020", () => {
    expect(new Date().getFullYear()).toBe(2020);
});
```

To support existing tests that use Jest's `useFakeTimers` and `useRealTimers`, you can use `useFakeTimers` and `useRealTimers`:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("just like in jest", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
    expect(new Date().getFullYear()).toBe(2020);
    jest.useRealTimers();
    expect(new Date().getFullYear()).toBeGreaterThan(2020);
});

test("unlike in jest", () => {
    const OriginalDate = Date;
    jest.useFakeTimers();
    if (typeof Bun === "undefined") {
        // In Jest, the Date constructor changes
        // That can cause all sorts of bugs because suddenly Date !== Date before the test.
        expect(Date).not.toBe(OriginalDate);
        expect(Date.now).not.toBe(OriginalDate.now);
    } else {
        // In bun:test, Date constructor does not change when you useFakeTimers
        expect(Date).toBe(OriginalDate);
        expect(Date.now).toBe(OriginalDate.now);
    }
});
```

<Warning>
  **Timers** — Note that we have not implemented builtin support for mocking timers yet, but this is
  on the roadmap.
</Warning>

## Reset the system time

To reset the system time, pass no arguments to `setSystemTime`:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { setSystemTime, expect, test } from "bun:test";

test("it was 2020, for a moment.", () => {
    // Set it to something!
    setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
    expect(new Date().getFullYear()).toBe(2020);

    // reset it!
    setSystemTime();

    expect(new Date().getFullYear()).toBeGreaterThan(2020);
});
```

## Get mocked time with jest.now()

When you're using mocked time (with `setSystemTime` or `useFakeTimers`), you can use `jest.now()` to get the current mocked timestamp:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect, jest } from "bun:test";

test("get the current mocked time", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

    expect(Date.now()).toBe(1577836800000); // Jan 1, 2020 timestamp
    expect(jest.now()).toBe(1577836800000); // Same value

    jest.useRealTimers();
});
```

This is useful when you need to access the mocked time directly without creating a new Date object.

## Set the time zone

By default, the time zone for all `bun test` runs is set to UTC (`Etc/UTC`) unless overridden. To change the time zone, either pass the `$TZ` environment variable to `bun test`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
TZ=America/Los_Angeles bun test
```

Or set `process.env.TZ` at runtime:

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("Welcome to California!", () => {
    process.env.TZ = "America/Los_Angeles";
    expect(new Date().getTimezoneOffset()).toBe(420);
    expect(new Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("America/Los_Angeles");
});

test("Welcome to New York!", () => {
    // Unlike in Jest, you can set the timezone multiple times at runtime and it will work.
    process.env.TZ = "America/New_York";
    expect(new Date().getTimezoneOffset()).toBe(240);
    expect(new Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("America/New_York");
});
```

<Info>Unlike in Jest, you can set the timezone multiple times at runtime and it will work.</Info>
# DOM testing

> Learn how to test DOM elements and components using Bun with happy-dom and React Testing Library

Bun's test runner plays well with existing component and DOM testing libraries, including React Testing Library and happy-dom.

## happy-dom

For writing headless tests for your frontend code and components, we recommend happy-dom. Happy DOM implements a complete set of HTML and DOM APIs in plain JavaScript, making it possible to simulate a browser environment with high fidelity.

To get started install the `@happy-dom/global-registrator` package as a dev dependency.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add -d @happy-dom/global-registrator
```

We'll be using Bun's preload functionality to register the happy-dom globals before running our tests. This step will make browser APIs like `document` available in the global scope. Create a file called `happydom.ts` in the root of your project and add the following code:

```ts title="happydom.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
```

To preload this file before `bun test`, open or create a `bunfig.toml` file and add the following lines.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
preload = ["./happydom.ts"]
```

This will execute `happydom.ts` when you run `bun test`. Now you can write tests that use browser APIs like `document` and `window`.

```ts title="dom.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { test, expect } from "bun:test";

test("dom test", () => {
    document.body.innerHTML = `<button>My button</button>`;
    const button = document.querySelector("button");
    expect(button?.innerText).toEqual("My button");
});
```

### TypeScript Support

Depending on your `tsconfig.json` setup, you may see a "Cannot find name 'document'" type error in the code above. To "inject" the types for `document` and other browser APIs, add the following triple-slash directive to the top of any test file.

```ts title="dom.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
/// <reference lib="dom" />

import { test, expect } from "bun:test";

test("dom test", () => {
    document.body.innerHTML = `<button>My button</button>`;
    const button = document.querySelector("button");
    expect(button?.innerText).toEqual("My button");
});
```

Let's run this test with `bun test`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test
```

```
bun test v1.2.20

dom.test.ts:
✓ dom test [0.82ms]

 1 pass
 0 fail
 1 expect() calls
Ran 1 tests across 1 files. 1 total [125.00ms]
```

## React Testing Library

Bun works seamlessly with React Testing Library for testing React components. After setting up happy-dom as shown above, you can install and use React Testing Library normally.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add -d @testing-library/react @testing-library/jest-dom
```

```ts title="component.test.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
/// <reference lib="dom" />

import { test, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>;
}

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## Advanced DOM Testing

### Custom Elements

You can test custom elements and web components using the same setup:

```ts title="custom-element.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
/// <reference lib="dom" />

import { test, expect } from "bun:test";

test("custom element", () => {
    // Define a custom element
    class MyElement extends HTMLElement {
        constructor() {
            super();
            this.innerHTML = "<p>Custom element content</p>";
        }
    }

    customElements.define("my-element", MyElement);

    // Use it in tests
    document.body.innerHTML = "<my-element></my-element>";
    const element = document.querySelector("my-element");
    expect(element?.innerHTML).toBe("<p>Custom element content</p>");
});
```

### Event Testing

Test DOM events and user interactions:

```ts title="events.test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
/// <reference lib="dom" />

import { test, expect } from "bun:test";

test("button click event", () => {
    let clicked = false;

    document.body.innerHTML = '<button id="test-btn">Click me</button>';
    const button = document.getElementById("test-btn");

    button?.addEventListener("click", () => {
        clicked = true;
    });

    button?.click();
    expect(clicked).toBe(true);
});
```

## Configuration Tips

### Global Setup

For more complex DOM testing setups, you can create a more comprehensive preload file:

```ts title="test-setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";

// Register happy-dom globals
GlobalRegistrator.register();

// Add any global test configuration here
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock other APIs as needed
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
```

Then update your `bunfig.toml`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
preload = ["./test-setup.ts"]
```

## Troubleshooting

### Common Issues

**TypeScript errors for DOM APIs**: Make sure to include the `/// <reference lib="dom" />` directive at the top of your test files.

**Missing globals**: Ensure that `@happy-dom/global-registrator` is properly imported and registered in your preload file.

**React component rendering issues**: Make sure you've installed both `@testing-library/react` and have happy-dom set up correctly.

### Performance Considerations

Happy-dom is fast, but for very large test suites, you might want to:

* Use `beforeEach` to reset the DOM state between tests
* Avoid creating too many DOM elements in a single test
* Consider using `cleanup` functions from testing libraries

```ts title="test-setup.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";

afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
});
```
# Code coverage

> Learn how to use Bun's built-in code coverage reporting to track test coverage and find untested areas in your codebase

Bun's test runner now supports built-in code coverage reporting. This makes it easy to see how much of the codebase is covered by tests, and find areas that are not currently well-tested.

## Enabling Coverage

`bun:test` supports seeing which lines of code are covered by tests. To use this feature, pass `--coverage` to the CLI. It will print out a coverage report to the console:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --coverage

-------------|---------|---------|-------------------
File         | % Funcs | % Lines | Uncovered Line #s
-------------|---------|---------|-------------------
All files    |   38.89 |   42.11 |
 index-0.ts  |   33.33 |   36.84 | 10-15,19-24
 index-1.ts  |   33.33 |   36.84 | 10-15,19-24
 index-10.ts |   33.33 |   36.84 | 10-15,19-24
 index-2.ts  |   33.33 |   36.84 | 10-15,19-24
 index-3.ts  |   33.33 |   36.84 | 10-15,19-24
 index-4.ts  |   33.33 |   36.84 | 10-15,19-24
 index-5.ts  |   33.33 |   36.84 | 10-15,19-24
 index-6.ts  |   33.33 |   36.84 | 10-15,19-24
 index-7.ts  |   33.33 |   36.84 | 10-15,19-24
 index-8.ts  |   33.33 |   36.84 | 10-15,19-24
 index-9.ts  |   33.33 |   36.84 | 10-15,19-24
 index.ts    |  100.00 |  100.00 |
-------------|---------|---------|-------------------
```

### Enable by Default

To always enable coverage reporting by default, add the following line to your `bunfig.toml`:

```toml title="bunfig.toml" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Always enable coverage
coverage = true
```

By default coverage reports will include test files and exclude sourcemaps. This is usually what you want, but it can be configured otherwise in `bunfig.toml`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageSkipTestFiles = true  # default false
```

## Coverage Thresholds

It is possible to specify a coverage threshold in `bunfig.toml`. If your test suite does not meet or exceed this threshold, `bun test` will exit with a non-zero exit code to indicate the failure.

### Simple Threshold

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# To require 90% line-level and function-level coverage
coverageThreshold = 0.9
```

### Detailed Thresholds

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# To set different thresholds for lines and functions
coverageThreshold = { lines = 0.9, functions = 0.9, statements = 0.9 }
```

Setting any of these thresholds enables `fail_on_low_coverage`, causing the test run to fail if coverage is below the threshold.

## Coverage Reporters

By default, coverage reports will be printed to the console.

For persistent code coverage reports in CI environments and for other tools, you can pass a `--coverage-reporter=lcov` CLI option or `coverageReporter` option in `bunfig.toml`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageReporter = ["text", "lcov"]  # default ["text"]
coverageDir = "path/to/somewhere"    # default "coverage"
```

### Available Reporters

| Reporter | Description                                          |
| -------- | ---------------------------------------------------- |
| `text`   | Prints a text summary of the coverage to the console |
| `lcov`   | Save coverage in lcov format                         |

### LCOV Coverage Reporter

To generate an lcov report, you can use the lcov reporter. This will generate an `lcov.info` file in the coverage directory.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageReporter = "lcov"
```

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Or via CLI
bun test --coverage --coverage-reporter=lcov
```

The LCOV format is widely supported by various tools and services:

* **Code editors**: VS Code extensions can show coverage inline
* **CI/CD services**: GitHub Actions, GitLab CI, CircleCI
* **Coverage services**: Codecov, Coveralls
* **IDEs**: WebStorm, IntelliJ IDEA

#### Using LCOV with GitHub Actions

```yaml title=".github/workflows/test.yml" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
name: Test with Coverage
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun test --coverage --coverage-reporter=lcov
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Excluding Files from Coverage

### Skip Test Files

By default, test files themselves are included in coverage reports. You can exclude them with:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageSkipTestFiles = true  # default false
```

This will exclude files matching test patterns (e.g., `*.test.ts`, `*.spec.js`) from the coverage report.

### Ignore Specific Paths and Patterns

You can exclude specific files or file patterns from coverage reports using `coveragePathIgnorePatterns`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Single pattern
coveragePathIgnorePatterns = "**/*.spec.ts"

# Multiple patterns
coveragePathIgnorePatterns = [
  "**/*.spec.ts",
  "**/*.test.ts",
  "src/utils/**",
  "*.config.js"
]
```

This option accepts glob patterns and works similarly to Jest's `collectCoverageFrom` ignore patterns. Files matching any of these patterns will be excluded from coverage calculation and reporting in both text and LCOV outputs.

#### Common Use Cases

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coveragePathIgnorePatterns = [
  # Exclude utility files
  "src/utils/**",

  # Exclude configuration files
  "*.config.js",
  "webpack.config.ts",
  "vite.config.ts",

  # Exclude specific test patterns
  "**/*.spec.ts",
  "**/*.e2e.ts",

  # Exclude build artifacts
  "dist/**",
  "build/**",

  # Exclude generated files
  "src/generated/**",
  "**/*.generated.ts",

  # Exclude vendor/third-party code
  "vendor/**",
  "third-party/**"
]
```

## Sourcemaps

Internally, Bun transpiles all files by default, so Bun automatically generates an internal source map that maps lines of your original source code onto Bun's internal representation. If for any reason you want to disable this, set `test.coverageIgnoreSourcemaps` to `true`; this will rarely be desirable outside of advanced use cases.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageIgnoreSourcemaps = true  # default false
```

<Warning>
  When using this option, you probably want to stick a `// @bun` comment at the top of the source
  file to opt out of the transpilation process.
</Warning>

## Coverage Defaults

By default, coverage reports:

* **Exclude** `node_modules` directories
* **Exclude** files loaded via non-JS/TS loaders (e.g., `.css`, `.txt`) unless a custom JS loader is specified
* **Include** test files themselves (can be disabled with `coverageSkipTestFiles = true`)
* Can exclude additional files with `coveragePathIgnorePatterns`

## Advanced Configuration

### Custom Coverage Directory

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageDir = "coverage-reports"  # default "coverage"
```

### Multiple Reporters

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageReporter = ["text", "lcov"]
```

### Coverage with Specific Test Patterns

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Run coverage only on specific test files
bun test --coverage src/components/*.test.ts

# Run coverage with name pattern
bun test --coverage --test-name-pattern="API"
```

## CI/CD Integration

### GitHub Actions Example

```yaml title=".github/workflows/coverage.yml" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
name: Coverage Report
on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Run tests with coverage
        run: bun test --coverage --coverage-reporter=lcov

      - name: Upload to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
```

### GitLab CI Example

```yaml title=".gitlab-ci.yml" theme={"theme":{"light":"github-light","dark":"dracula"}}
test:coverage:
  stage: test
  script:
    - bun install
    - bun test --coverage --coverage-reporter=lcov
  coverage: '/Lines\s*:\s*(\d+.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/lcov.info
```

## Interpreting Coverage Reports

### Text Output Explanation

```
-------------|---------|---------|-------------------
File         | % Funcs | % Lines | Uncovered Line #s
-------------|---------|---------|-------------------
All files    |   85.71 |   90.48 |
 src/        |   85.71 |   90.48 |
  utils.ts   |  100.00 |  100.00 |
  api.ts     |   75.00 |   85.71 | 15-18,25
  main.ts    |   80.00 |   88.89 | 42,50-52
-------------|---------|---------|-------------------
```

* **% Funcs**: Percentage of functions that were called during tests
* **% Lines**: Percentage of executable lines that were run during tests
* **Uncovered Line #s**: Specific line numbers that were not executed

### What to Aim For

* **80%+ overall coverage**: Generally considered good
* **90%+ critical paths**: Important business logic should be well-tested
* **100% utility functions**: Pure functions and utilities are easy to test completely
* **Lower coverage for UI components**: Often acceptable as they may require integration tests

## Best Practices

### Focus on Quality, Not Just Quantity

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Good: Test actual functionality
test("calculateTax should handle different tax rates", () => {
    expect(calculateTax(100, 0.08)).toBe(8);
    expect(calculateTax(100, 0.1)).toBe(10);
    expect(calculateTax(0, 0.08)).toBe(0);
});

// Avoid: Just hitting lines for coverage
test("calculateTax exists", () => {
    calculateTax(100, 0.08); // No assertions!
});
```

### Test Edge Cases

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
test("user input validation", () => {
    // Test normal case
    expect(validateEmail("user@example.com")).toBe(true);

    // Test edge cases that improve coverage meaningfully
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail(null)).toBe(false);
});
```

### Use Coverage to Find Missing Tests

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Run coverage to identify untested code
bun test --coverage

# Look at specific files that need attention
bun test --coverage src/critical-module.ts
```

### Combine with Other Quality Metrics

Coverage is just one metric. Also consider:

* **Code review quality**
* **Integration test coverage**
* **Error handling tests**
* **Performance tests**
* **Type safety**

## Troubleshooting

### Coverage Not Showing for Some Files

If files aren't appearing in coverage reports, they might not be imported by your tests. Coverage only tracks files that are actually loaded.

```ts title="test.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Make sure to import the modules you want to test
import { myFunction } from "../src/my-module";

test("my function works", () => {
    expect(myFunction()).toBeDefined();
});
```

### False Coverage Reports

If you see coverage reports that don't match your expectations:

1. Check if source maps are working correctly
2. Verify file patterns in `coveragePathIgnorePatterns`
3. Ensure test files are actually importing the code to test

### Performance Issues with Large Codebases

For large projects, coverage collection can slow down tests:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# Exclude large directories you don't need coverage for
coveragePathIgnorePatterns = [
  "node_modules/**",
  "vendor/**",
  "generated/**"
]
```

Consider running coverage only on CI or specific branches rather than every test run during development.
# Test Reporters

bun test supports different output formats through reporters. This document covers both built-in reporters and how to implement your own custom reporters.

***

## Built-in Reporters

### Default Console Reporter

By default, bun test outputs results to the console in a human-readable format:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
test/package-json-lint.test.ts:
✓ test/package.json [0.88ms]
✓ test/js/third_party/grpc-js/package.json [0.18ms]
✓ test/js/third_party/svelte/package.json [0.21ms]
✓ test/js/third_party/express/package.json [1.05ms]

 4 pass
 0 fail
 4 expect() calls
Ran 4 tests in 1.44ms
```

When a terminal doesn't support colors, the output avoids non-ascii characters:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
test/package-json-lint.test.ts:
(pass) test/package.json [0.48ms]
(pass) test/js/third_party/grpc-js/package.json [0.10ms]
(pass) test/js/third_party/svelte/package.json [0.04ms]
(pass) test/js/third_party/express/package.json [0.04ms]

 4 pass
 0 fail
 4 expect() calls
Ran 4 tests across 1 files. [0.66ms]
```

### JUnit XML Reporter

For CI/CD environments, Bun supports generating JUnit XML reports. JUnit XML is a widely-adopted format for test results that can be parsed by many CI/CD systems, including GitLab, Jenkins, and others.

#### Using the JUnit Reporter

To generate a JUnit XML report, use the `--reporter=junit` flag along with `--reporter-outfile` to specify the output file:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun test --reporter=junit --reporter-outfile=./junit.xml
```

This continues to output to the console as usual while also writing the JUnit XML report to the specified path at the end of the test run.

#### Configuring via bunfig.toml

You can also configure the JUnit reporter in your `bunfig.toml` file:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test.reporter]
junit = "path/to/junit.xml"  # Output path for JUnit XML report
```

#### Environment Variables in JUnit Reports

The JUnit reporter automatically includes environment information as `<properties>` in the XML output. This can be helpful for tracking test runs in CI environments.

Specifically, it includes the following environment variables when available:

| Environment Variable                                                    | Property Name | Description            |
| ----------------------------------------------------------------------- | ------------- | ---------------------- |
| `GITHUB_RUN_ID`, `GITHUB_SERVER_URL`, `GITHUB_REPOSITORY`, `CI_JOB_URL` | `ci`          | CI build information   |
| `GITHUB_SHA`, `CI_COMMIT_SHA`, `GIT_SHA`                                | `commit`      | Git commit identifiers |
| System hostname                                                         | `hostname`    | Machine hostname       |

This makes it easier to track which environment and commit a particular test run was for.

#### Current Limitations

The JUnit reporter currently has a few limitations that will be addressed in future updates:

* `stdout` and `stderr` output from individual tests are not included in the report
* Precise timestamp fields per test case are not included

### GitHub Actions reporter

Bun test automatically detects when it's running inside GitHub Actions and emits GitHub Actions annotations to the console directly. No special configuration is needed beyond installing Bun and running `bun test`.

For a GitHub Actions workflow configuration example, see the [CI/CD integration](/pm/cli/install#ci%2Fcd) section of the CLI documentation.

***

## Custom Reporters

Bun allows developers to implement custom test reporters by extending the WebKit Inspector Protocol with additional testing-specific domains.

### Inspector Protocol for Testing

To support test reporting, Bun extends the standard WebKit Inspector Protocol with two custom domains:

1. **TestReporter**: Reports test discovery, execution start, and completion events
2. **LifecycleReporter**: Reports errors and exceptions during test execution

These extensions allow you to build custom reporting tools that can receive detailed information about test execution in real-time.

### Key Events

Custom reporters can listen for these key events:

* `TestReporter.found`: Emitted when a test is discovered
* `TestReporter.start`: Emitted when a test starts running
* `TestReporter.end`: Emitted when a test completes
* `Console.messageAdded`: Emitted when console output occurs during a test
* `LifecycleReporter.error`: Emitted when an error or exception occurs