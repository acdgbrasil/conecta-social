# Bun Runtime

> Execute JavaScript/TypeScript files, package.json scripts, and executable packages with Bun's fast runtime.

The Bun Runtime is designed to start fast and run fast.

Under the hood, Bun uses the [JavaScriptCore engine](https://developer.apple.com/documentation/javascriptcore), which is developed by Apple for Safari. In most cases, the startup and running performance is faster than V8, the engine used by Node.js and Chromium-based browsers. Its transpiler and runtime are written in Zig, a modern, high-performance language. On Linux, this translates into startup times [4x faster](https://twitter.com/jarredsumner/status/1499225725492076544) than Node.js.

| Command         | Time     |
| --------------- | -------- |
| `bun hello.js`  | `5.2ms`  |
| `node hello.js` | `25.1ms` |

This benchmark is based on running a simple Hello World script on Linux

## Run a file

Use `bun run` to execute a source file.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run index.js
```

Bun supports TypeScript and JSX out of the box. Every file is transpiled on the fly by Bun's fast native transpiler before being executed.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run index.js
bun run index.jsx
bun run index.ts
bun run index.tsx
```

Alternatively, you can omit the `run` keyword and use the "naked" command; it behaves identically.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun index.tsx
bun index.js
```

### `--watch`

To run a file in watch mode, use the `--watch` flag.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --watch run index.tsx
```

<Note>
  When using `bun run`, put Bun flags like `--watch` immediately after `bun`.

  ```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun --watch run dev # ✔️ do this
  bun run dev --watch # ❌ don't do this
  ```

  Flags that occur at the end of the command will be ignored and passed through to the `"dev"` script itself.
</Note>

## Run a `package.json` script

<Note>
  Compare to `npm run <script>` or `yarn <script>`
</Note>

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun [bun flags] run <script> [script flags]
```

Your `package.json` can define a number of named `"scripts"` that correspond to shell commands.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	// ... other fields
	"scripts": {
		"clean": "rm -rf dist && echo 'Done.'",
		"dev": "bun server.ts"
	}
}
```

Use `bun run <script>` to execute these scripts.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run clean
rm -rf dist && echo 'Done.'
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Cleaning...
Done.
```

Bun executes the script command in a subshell. On Linux & macOS, it checks for the following shells in order, using the first one it finds: `bash`, `sh`, `zsh`. On windows, it uses [bun shell](https://bun.com/docs/runtime/shell) to support bash-like syntax and many common commands.

<Note>⚡️ The startup time for `npm run` on Linux is roughly 170ms; with Bun it is `6ms`.</Note>

Scripts can also be run with the shorter command `bun <script>`, however if there is a built-in bun command with the same name, the built-in command takes precedence. In this case, use the more explicit `bun run <script>` command to execute your package script.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run dev
```

To see a list of available scripts, run `bun run` without any arguments.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
quickstart scripts:

 bun run clean
   rm -rf dist && echo 'Done.'

 bun run dev
   bun server.ts

2 scripts
```

Bun respects lifecycle hooks. For instance, `bun run clean` will execute `preclean` and `postclean`, if defined. If the `pre<script>` fails, Bun will not execute the script itself.

### `--bun`

It's common for `package.json` scripts to reference locally-installed CLIs like `vite` or `next`. These CLIs are often JavaScript files marked with a [shebang](https://en.wikipedia.org/wiki/Shebang_\(Unix\)) to indicate that they should be executed with `node`.

```js cli.js icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
#!/usr/bin/env node

// do stuff
```

By default, Bun respects this shebang and executes the script with `node`. However, you can override this behavior with the `--bun` flag. For Node.js-based CLIs, this will run the CLI with Bun instead of Node.js.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run --bun vite
```

### Filtering

In monorepos containing multiple packages, you can use the `--filter` argument to execute scripts in many packages at once.

Use `bun run --filter <name_pattern> <script>` to execute `<script>` in all packages whose name matches `<name_pattern>`.
For example, if you have subdirectories containing packages named `foo`, `bar` and `baz`, running

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run --filter 'ba*' <script>
```

will execute `<script>` in both `bar` and `baz`, but not in `foo`.

Find more details in the docs page for [filter](https://bun.com/docs/cli/filter#running-scripts-with-filter).

## `bun run -` to pipe code from stdin

`bun run -` lets you read JavaScript, TypeScript, TSX, or JSX from stdin and execute it without writing to a temporary file first.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
echo "console.log('Hello')" | bun run -
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Hello
```

You can also use `bun run -` to redirect files into Bun. For example, to run a `.js` file as if it were a `.ts` file:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
echo "console.log!('This is TypeScript!' as any)" > secretly-typescript.js
bun run - < secretly-typescript.js
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
This is TypeScript!
```

For convenience, all code is treated as TypeScript with JSX support when using `bun run -`.

## `bun run --console-depth`

Control the depth of object inspection in console output with the `--console-depth` flag.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --console-depth 5 run index.tsx
```

This sets how deeply nested objects are displayed in `console.log()` output. The default depth is `2`. Higher values show more nested properties but may produce verbose output for complex objects.

```ts console.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const nested = { a: { b: { c: { d: "deep" } } } };
console.log(nested);
// With --console-depth 2 (default): { a: { b: [Object] } }
// With --console-depth 4: { a: { b: { c: { d: 'deep' } } } }
```

## `bun run --smol`

In memory-constrained environments, use the `--smol` flag to reduce memory usage at a cost to performance.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --smol run index.tsx
```

This causes the garbage collector to run more frequently, which can slow down execution. However, it can be useful in environments with limited memory. Bun automatically adjusts the garbage collector's heap size based on the available memory (accounting for cgroups and other memory limits) with and without the `--smol` flag, so this is mostly useful for cases where you want to make the heap size grow more slowly.

## Resolution order

Absolute paths and paths starting with `./` or `.\\` are always executed as source files. Unless using `bun run`, running a file with an allowed extension will prefer the file over a package.json script.

When there is a package.json script and a file with the same name, `bun run` prioritizes the package.json script. The full resolution order is:

1. package.json scripts, eg `bun run build`
2. Source files, eg `bun run src/main.js`
3. Binaries from project packages, eg `bun add eslint && bun run eslint`
4. (`bun run` only) System commands, eg `bun run ls`

***

# CLI Usage

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run <file or script>
```

### General Execution Options

<ParamField path="--silent" type="boolean">
  Don't print the script command
</ParamField>

<ParamField path="--if-present" type="boolean">
  Exit without an error if the entrypoint does not exist
</ParamField>

<ParamField path="--eval" type="string">
  Evaluate argument as a script. Alias: <code>-e</code>
</ParamField>

<ParamField path="--print" type="string">
  Evaluate argument as a script and print the result. Alias: <code>-p</code>
</ParamField>

<ParamField path="--help" type="boolean">
  Display this menu and exit. Alias: <code>-h</code>
</ParamField>

### Workspace Management

<ParamField path="--elide-lines" type="number" default="10">
  Number of lines of script output shown when using --filter (default: 10). Set to 0 to show all
  lines
</ParamField>

<ParamField path="--filter" type="string">
  Run a script in all workspace packages matching the pattern. Alias: <code>-F</code>
</ParamField>

<ParamField path="--workspaces" type="boolean">
  Run a script in all workspace packages (from the <code>workspaces</code> field in{" "}
  <code>package.json</code>)
</ParamField>

### Runtime & Process Control

<ParamField path="--bun" type="boolean">
  Force a script or package to use Bun's runtime instead of Node.js (via symlinking node). Alias:{" "}
  <code>-b</code>
</ParamField>

<ParamField path="--shell" type="string">
  Control the shell used for <code>package.json</code> scripts. Supports either <code>bun</code> or{" "}
  <code>system</code>
</ParamField>

<ParamField path="--smol" type="boolean">
  Use less memory, but run garbage collection more often
</ParamField>

<ParamField path="--expose-gc" type="boolean">
  Expose <code>gc()</code> on the global object. Has no effect on <code>Bun.gc()</code>
</ParamField>

<ParamField path="--no-deprecation" type="boolean">
  Suppress all reporting of the custom deprecation
</ParamField>

<ParamField path="--throw-deprecation" type="boolean">
  Determine whether or not deprecation warnings result in errors
</ParamField>

<ParamField path="--title" type="string">
  Set the process title
</ParamField>

<ParamField path="--zero-fill-buffers" type="boolean">
  Boolean to force <code>Buffer.allocUnsafe(size)</code> to be zero-filled
</ParamField>

<ParamField path="--no-addons" type="boolean">
  Throw an error if <code>process.dlopen</code> is called, and disable export condition{" "}
  <code>node-addons</code>
</ParamField>

<ParamField path="--unhandled-rejections" type="string">
  One of <code>strict</code>, <code>throw</code>, <code>warn</code>, <code>none</code>, or{" "}
  <code>warn-with-error-code</code>
</ParamField>

<ParamField path="--console-depth" type="number" default="2">
  Set the default depth for <code>console.log</code> object inspection (default: 2)
</ParamField>

### Development Workflow

<ParamField path="--watch" type="boolean">
  Automatically restart the process on file change
</ParamField>

<ParamField path="--hot" type="boolean">
  Enable auto reload in the Bun runtime, test runner, or bundler
</ParamField>

<ParamField path="--no-clear-screen" type="boolean">
  Disable clearing the terminal screen on reload when --hot or --watch is enabled
</ParamField>

### Debugging

<ParamField path="--inspect" type="string">
  Activate Bun's debugger
</ParamField>

<ParamField path="--inspect-wait" type="string">
  Activate Bun's debugger, wait for a connection before executing
</ParamField>

<ParamField path="--inspect-brk" type="string">
  Activate Bun's debugger, set breakpoint on first line of code and wait
</ParamField>

### Dependency & Module Resolution

<ParamField path="--preload" type="string">
  Import a module before other modules are loaded. Alias: <code>-r</code>
</ParamField>

<ParamField path="--require" type="string">
  Alias of --preload, for Node.js compatibility
</ParamField>

<ParamField path="--import" type="string">
  Alias of --preload, for Node.js compatibility
</ParamField>

<ParamField path="--no-install" type="boolean">
  Disable auto install in the Bun runtime
</ParamField>

<ParamField path="--install" type="string" default="auto">
  Configure auto-install behavior. One of <code>auto</code> (default, auto-installs when no
  node\_modules), <code>fallback</code> (missing packages only), <code>force</code> (always)
</ParamField>

<ParamField path="-i" type="boolean">
  Auto-install dependencies during execution. Equivalent to --install=fallback
</ParamField>

<ParamField path="--prefer-offline" type="boolean">
  Skip staleness checks for packages in the Bun runtime and resolve from disk
</ParamField>

<ParamField path="--prefer-latest" type="boolean">
  Use the latest matching versions of packages in the Bun runtime, always checking npm
</ParamField>

<ParamField path="--conditions" type="string">
  Pass custom conditions to resolve
</ParamField>

<ParamField path="--main-fields" type="string">
  Main fields to lookup in <code>package.json</code>. Defaults to --target dependent
</ParamField>

<ParamField path="--preserve-symlinks" type="boolean">
  Preserve symlinks when resolving files
</ParamField>

<ParamField path="--preserve-symlinks-main" type="boolean">
  Preserve symlinks when resolving the main entry point
</ParamField>

<ParamField path="--extension-order" type="string" default=".tsx,.ts,.jsx,.js,.json">
  Defaults to: <code>.tsx,.ts,.jsx,.js,.json</code>
</ParamField>

### Transpilation & Language Features

<ParamField path="--tsconfig-override" type="string">
  Specify custom <code>tsconfig.json</code>. Default <code>\$cwd/tsconfig.json</code>
</ParamField>

<ParamField path="--define" type="string">
  Substitute K:V while parsing, e.g. <code>--define process.env.NODE\_ENV:"development"</code>.
  Values are parsed as JSON. Alias: <code>-d</code>
</ParamField>

<ParamField path="--drop" type="string">
  Remove function calls, e.g. <code>--drop=console</code> removes all <code>console.\*</code> calls
</ParamField>

<ParamField path="--loader" type="string">
  Parse files with <code>.ext:loader</code>, e.g. <code>--loader .js:jsx</code>. Valid loaders:{" "}
  <code>js</code>, <code>jsx</code>, <code>ts</code>, <code>tsx</code>, <code>json</code>,{" "}
  <code>toml</code>, <code>text</code>, <code>file</code>, <code>wasm</code>, <code>napi</code>.
  Alias: <code>-l</code>
</ParamField>

<ParamField path="--no-macros" type="boolean">
  Disable macros from being executed in the bundler, transpiler and runtime
</ParamField>

<ParamField path="--jsx-factory" type="string">
  Changes the function called when compiling JSX elements using the classic JSX runtime
</ParamField>

<ParamField path="--jsx-fragment" type="string">
  Changes the function called when compiling JSX fragments
</ParamField>

<ParamField path="--jsx-import-source" type="string" default="react">
  Declares the module specifier to be used for importing the jsx and jsxs factory functions.
  Default: <code>react</code>
</ParamField>

<ParamField path="--jsx-runtime" type="string" default="automatic">
  <code>automatic</code> (default) or <code>classic</code>
</ParamField>

<ParamField path="--jsx-side-effects" type="boolean">
  Treat JSX elements as having side effects (disable pure annotations)
</ParamField>

<ParamField path="--ignore-dce-annotations" type="boolean">
  Ignore tree-shaking annotations such as <code>@**PURE**</code>
</ParamField>

### Networking & Security

<ParamField path="--port" type="number">
  Set the default port for <code>Bun.serve</code>
</ParamField>

<ParamField path="--fetch-preconnect" type="string">
  Preconnect to a URL while code is loading
</ParamField>

<ParamField path="--max-http-header-size" type="number" default="16384">
  Set the maximum size of HTTP headers in bytes. Default is 16KiB
</ParamField>

<ParamField path="--dns-result-order" type="string" default="verbatim">
  Set the default order of DNS lookup results. Valid orders: <code>verbatim</code> (default),{" "}
  <code>ipv4first</code>, <code>ipv6first</code>
</ParamField>

<ParamField path="--use-system-ca" type="boolean">
  Use the system's trusted certificate authorities
</ParamField>

<ParamField path="--use-openssl-ca" type="boolean">
  Use OpenSSL's default CA store
</ParamField>

<ParamField path="--use-bundled-ca" type="boolean">
  Use bundled CA store
</ParamField>

<ParamField path="--redis-preconnect" type="boolean">
  Preconnect to <code>\$REDIS\_URL</code> at startup
</ParamField>

<ParamField path="--sql-preconnect" type="boolean">
  Preconnect to PostgreSQL at startup
</ParamField>

<ParamField path="--user-agent" type="string">
  Set the default User-Agent header for HTTP requests
</ParamField>

### Global Configuration & Context

<ParamField path="--env-file" type="string">
  Load environment variables from the specified file(s)
</ParamField>

<ParamField path="--cwd" type="string">
  Absolute path to resolve files & entry points from. This just changes the process' cwd
</ParamField>

<ParamField path="--config" type="string">
  Specify path to Bun config file. Default <code>\$cwd/bunfig.toml</code>. Alias: <code>-c</code>
</ParamField>

## Examples

Run a JavaScript or TypeScript file:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run ./index.js
bun run ./index.tsx
```

Run a package.json script:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run dev
bun run lint
```

# Watch Mode

> Automatic reloading in Bun with --watch and --hot modes

Bun supports two kinds of automatic reloading via CLI flags:

* `--watch` mode, which hard restarts Bun's process when imported files change.
* `--hot` mode, which soft reloads the code (without restarting the process) when imported files change.

***

## `--watch` mode

Watch mode can be used with `bun test` or when running TypeScript, JSX, and JavaScript files.

To run a file in `--watch` mode:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --watch index.tsx
```

To run your tests in `--watch` mode:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --watch test
```

In `--watch` mode, Bun keeps track of all imported files and watches them for changes. When a change is detected, Bun restarts the process, preserving the same set of CLI arguments and environment variables used in the initial run. If Bun crashes, `--watch` will attempt to automatically restart the process.

<Note>
  **⚡️ Reloads are fast.** The filesystem watchers you're probably used to have several layers of libraries wrapping the native APIs or worse, rely on polling.

  Instead, Bun uses operating system native filesystem watcher APIs like kqueue or inotify to detect changes to files. Bun also does a number of optimizations to enable it scale to larger projects (such as setting a high rlimit for file descriptors, statically allocated file path buffers, reuse file descriptors when possible, etc).
</Note>

The following examples show Bun live-reloading a file as it is edited, with VSCode configured to save the file [on each keystroke](https://code.visualstudio.com/docs/editor/codebasics#_save-auto-save).

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run --watch watchy.tsx
```

```tsx title="watchy.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from "bun";

console.log("I restarted at:", Date.now());

serve({
	port: 4003,
	fetch(request) {
		return new Response("Sup");
	},
});
```

In this example, Bun is

<Frame>
  ![bun watch
  gif](https://user-images.githubusercontent.com/709451/228439002-7b9fad11-0db2-4e48-b82d-2b88c8625625.gif)
</Frame>

Running `bun test` in watch mode and `save-on-keypress` enabled:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --watch test
```

<Frame>
  ![bun test
  gif](https://user-images.githubusercontent.com/709451/228396976-38a23864-4a1d-4c96-87cc-04e5181bf459.gif)
</Frame>

<Note>
  The **`--no-clear-screen`** flag is useful in scenarios where you don't want the terminal to
  clear, such as when running multiple `bun build --watch` commands simultaneously using tools like
  `concurrently`. Without this flag, the output of one instance could clear the output of others,
  potentially hiding errors from one instance beneath the output of another. The `--no-clear-screen`
  flag, similar to TypeScript's `--preserveWatchOutput`, prevents this issue. It can be used in
  combination with `--watch`, for example: `bun build --watch --no-clear-screen`.
</Note>

***

## `--hot` mode

Use `bun --hot` to enable hot reloading when executing code with Bun. This is distinct from `--watch` mode in that Bun does not hard-restart the entire process. Instead, it detects code changes and updates its internal module cache with the new code.

<Note>
  This is not the same as hot reloading in the browser! Many frameworks provide a "hot reloading"
  experience, where you can edit & save your frontend code (say, a React component) and see the
  changes reflected in the browser without refreshing the page. Bun's `--hot` is the server-side
  equivalent of this experience. To get hot reloading in the browser, use a framework like
  [Vite](https://vitejs.dev).
</Note>

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --hot server.ts
```

Starting from the entrypoint (`server.ts` in the example above), Bun builds a registry of all imported source files (excluding those in `node_modules`) and watches them for changes. When a change is detected, Bun performs a "soft reload". All files are re-evaluated, but all global state (notably, the `globalThis` object) is persisted.

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// make TypeScript happy
declare global {
	var count: number;
}

globalThis.count ??= 0;
console.log(`Reloaded ${globalThis.count} times`);
globalThis.count++;

// prevent `bun run` from exiting
setInterval(function () {}, 1000000);
```

If you run this file with `bun --hot server.ts`, you'll see the reload count increment every time you save the file.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --hot index.ts
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Reloaded 1 times
Reloaded 2 times
Reloaded 3 times
```

Traditional file watchers like `nodemon` restart the entire process, so HTTP servers and other stateful objects are lost. By contrast, `bun --hot` is able to reflect the updated code without restarting the process.

### HTTP servers

This makes it possible, for instance, to update your HTTP request handler without shutting down the server itself. When you save the file, your HTTP server will be reloaded with the updated code without the process being restarted. This results in seriously fast refresh speeds.

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
globalThis.count ??= 0;
globalThis.count++;

Bun.serve({
	fetch(req: Request) {
		return new Response(`Reloaded ${globalThis.count} times`);
	},
	port: 3000,
});
```

<Note>
  **Note** — In a future version of Bun, support for Vite's `import.meta.hot` is planned to enable better lifecycle management for hot reloading and to align with the ecosystem.
</Note>

<Accordion title="Implementation details">
  On hot reload, Bun:

  * Resets the internal `require` cache and ES module registry (`Loader.registry`)
  * Runs the garbage collector synchronously (to minimize memory leaks, at the cost of runtime performance)
  * Re-transpiles all of your code from scratch (including sourcemaps)
  * Re-evaluates the code with JavaScriptCore

  This implementation isn't particularly optimized. It re-transpiles files that haven't changed. It makes no attempt at incremental compilation. It's a starting point.
</Accordion>

# Debugging

> Debug your Bun code with an interactive debugger using WebKit Inspector Protocol

Bun speaks the [WebKit Inspector Protocol](https://github.com/oven-sh/bun/blob/main/packages/bun-inspector-protocol/src/protocol/jsc/index.d.ts), so you can debug your code with an interactive debugger. For demonstration purposes, consider the following simple web server.

## Debugging JavaScript and TypeScript

```typescript icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" title="server.ts" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req) {
		console.log(req.url);
		return new Response("Hello, world!");
	},
});
```

### `--inspect`

To enable debugging when running code with Bun, use the `--inspect` flag. This automatically starts a WebSocket server on an available port that can be used to introspect the running Bun process.

```sh icon="terminal" title="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --inspect server.ts
```

```txt id="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
------------------ Bun Inspector ------------------
Listening at:
  ws://localhost:6499/0tqxs9exrgrm

Inspect in browser:
  https://debug.bun.sh/#localhost:6499/0tqxs9exrgrm
------------------ Bun Inspector ------------------
```

### `--inspect-brk`

The `--inspect-brk` flag behaves identically to `--inspect`, except it automatically injects a breakpoint at the first line of the executed script. This is useful for debugging scripts that run quickly and exit immediately.

### `--inspect-wait`

The `--inspect-wait` flag behaves identically to `--inspect`, except the code will not execute until a debugger has attached to the running process.

### Setting a port or URL for the debugger

Regardless of which flag you use, you can optionally specify a port number, URL prefix, or both.

```sh icon="terminal" title="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --inspect=4000 server.ts
bun --inspect=localhost:4000 server.ts
bun --inspect=localhost:4000/prefix server.ts
```

***

## Debuggers

Various debugging tools can connect to this server to provide an interactive debugging experience.

### `debug.bun.sh`

Bun hosts a web-based debugger at [debug.bun.sh](https://debug.bun.sh). It is a modified version of WebKit's [Web Inspector Interface](https://webkit.org/web-inspector/web-inspector-interface/), which will look familiar to Safari users.

Open the provided `debug.bun.sh` URL in your browser to start a debugging session. From this interface, you'll be able to view the source code of the running file, view and set breakpoints, and execute code with the built-in console.

<Frame>
  ![Screenshot of Bun debugger, Console
  tab](https://github.com/oven-sh/bun/assets/3084745/e6a976a8-80cc-4394-8925-539025cc025d)
</Frame>

Let's set a breakpoint. Navigate to the Sources tab; you should see the code from earlier. Click on the line number `3` to set a breakpoint on our `console.log(req.url)` statement.

<Frame>
  ![screenshot of Bun
  debugger](https://github.com/oven-sh/bun/assets/3084745/3b69c7e9-25ff-4f9d-acc4-caa736862935)
</Frame>

Then visit [`http://localhost:3000`](http://localhost:3000) in your web browser. This will send an HTTP request to our `localhost` web server. It will seem like the page isn't loading. Why? Because the program has paused execution at the breakpoint we set earlier.

Note how the UI has changed.

<Frame>
  ![screenshot of Bun
  debugger](https://github.com/oven-sh/bun/assets/3084745/8b565e58-5445-4061-9bc4-f41090dfe769)
</Frame>

At this point there's a lot we can do to introspect the current execution environment. We can use the console at the bottom to run arbitrary code in the context of the program, with full access to the variables in scope at our breakpoint.

<Frame>
  ![Bun debugger
  console](https://github.com/oven-sh/bun/assets/3084745/f4312b76-48ba-4a7d-b3b6-6205968ac681)
</Frame>

On the right side of the Sources pane, we can see all local variables currently in scope, and drill down to see their properties and methods. Here, we're inspecting the `req` variable.

<Frame>
  ![Bun debugger
  variables](https://github.com/oven-sh/bun/assets/3084745/63d7f843-5180-489c-aa94-87c486e68646)
</Frame>

In the upper left of the Sources pane, we can control the execution of the program.

<Frame>
  ![Bun debugger
  controls](https://github.com/oven-sh/bun/assets/3084745/41b76deb-7371-4461-9d5d-81b5a6d2f7a4)
</Frame>

Here's a cheat sheet explaining the functions of the control flow buttons.

* *Continue script execution* — continue running the program until the next breakpoint or exception.
* *Step over* — The program will continue to the next line.
* *Step into* — If the current statement contains a function call, the debugger will "step into" the called function.
* *Step out* — If the current statement is a function call, the debugger will finish executing the call, then "step out" of the function to the location where it was called.

<Frame>
  ![Bun debugger execution
  controls](https://github-production-user-asset-6210df.s3.amazonaws.com/3084745/261510346-6a94441c-75d3-413a-99a7-efa62365f83d.png)
</Frame>

### Visual Studio Code Debugger

Experimental support for debugging Bun scripts is available in Visual Studio Code. To use it, you'll need to install the [Bun VSCode extension](https://bun.com/guides/runtime/vscode-debugger).

***

## Debugging Network Requests

The `BUN_CONFIG_VERBOSE_FETCH` environment variable lets you log network requests made with `fetch()` or `node:http` automatically.

| Value   | Description                        |
| ------- | ---------------------------------- |
| `curl`  | Print requests as `curl` commands. |
| `true`  | Print request & response info      |
| `false` | Don't print anything. Default      |

### Print fetch & node:http requests as curl commands

Bun also supports printing `fetch()` and `node:http` network requests as `curl` commands by setting the environment variable `BUN_CONFIG_VERBOSE_FETCH` to `curl`.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
process.env.BUN_CONFIG_VERBOSE_FETCH = "curl";

await fetch("https://example.com", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({ foo: "bar" }),
});
```

This prints the `fetch` request as a single-line `curl` command to let you copy-paste into your terminal to replicate the request.

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
[fetch] $ curl --http1.1 "https://example.com/" -X POST -H "content-type: application/json" -H "Connection: keep-alive" -H "User-Agent: Bun/1.3.1" -H "Accept: */*" -H "Host: example.com" -H "Accept-Encoding: gzip, deflate, br" --compressed -H "Content-Length: 13" --data-raw "{\"foo\":\"bar\"}"
[fetch] > HTTP/1.1 POST https://example.com/
[fetch] > content-type: application/json
[fetch] > Connection: keep-alive
[fetch] > User-Agent: Bun/1.3.1
[fetch] > Accept: */*
[fetch] > Host: example.com
[fetch] > Accept-Encoding: gzip, deflate, br
[fetch] > Content-Length: 13

[fetch] < 200 OK
[fetch] < Accept-Ranges: bytes
[fetch] < Cache-Control: max-age=604800
[fetch] < Content-Type: text/html; charset=UTF-8
[fetch] < Date: Tue, 18 Jun 2024 05:12:07 GMT
[fetch] < Etag: "3147526947"
[fetch] < Expires: Tue, 25 Jun 2024 05:12:07 GMT
[fetch] < Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
[fetch] < Server: EOS (vny/044F)
[fetch] < Content-Length: 1256
```

The lines with `[fetch] >` are the request from your local code, and the lines with `[fetch] <` are the response from the remote server.

The `BUN_CONFIG_VERBOSE_FETCH` environment variable is supported in both `fetch()` and `node:http` requests, so it should just work.

To print without the `curl` command, set `BUN_CONFIG_VERBOSE_FETCH` to `true`.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
process.env.BUN_CONFIG_VERBOSE_FETCH = "true";

await fetch("https://example.com", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({ foo: "bar" }),
});
```

This prints the following to the console:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
[fetch] > HTTP/1.1 POST https://example.com/
[fetch] > content-type: application/json
[fetch] > Connection: keep-alive
[fetch] > User-Agent: Bun/1.3.1
[fetch] > Accept: */*
[fetch] > Host: example.com
[fetch] > Accept-Encoding: gzip, deflate, br
[fetch] > Content-Length: 13

[fetch] < 200 OK
[fetch] < Accept-Ranges: bytes
[fetch] < Cache-Control: max-age=604800
[fetch] < Content-Type: text/html; charset=UTF-8
[fetch] < Date: Tue, 18 Jun 2024 05:12:07 GMT
[fetch] < Etag: "3147526947"
[fetch] < Expires: Tue, 25 Jun 2024 05:12:07 GMT
[fetch] < Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
[fetch] < Server: EOS (vny/044F)
[fetch] < Content-Length: 1256
```

***

## Stacktraces & sourcemaps

Bun transpiles every file, which sounds like it would mean that the stack traces you see in the console would unhelpfully point to the transpiled output. To address this, Bun automatically generates and serves sourcemapped files for every file it transpiles. When you see a stack trace in the console, you can click on the file path and be taken to the original source code, even though it was written in TypeScript or JSX, or has some other transformation applied.

Bun automatically loads sourcemaps both at runtime when transpiling files on-demand, and when using `bun build` to precompile files ahead of time.

### Syntax-highlighted source code preview

To help with debugging, Bun automatically prints a small source-code preview when an unhandled exception or rejection occurs. You can simulate this behavior by calling `Bun.inspect(error)`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Create an error
const err = new Error("Something went wrong");
console.log(Bun.inspect(err, { colors: true }));
```

This prints a syntax-highlighted preview of the source code where the error occurred, along with the error message and stack trace.

```ts icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
1 | // Create an error
2 | const err = new Error("Something went wrong");
                ^
error: Something went wrong
      at file.js:2:13
```

### V8 Stack Traces

Bun uses JavaScriptCore as it's engine, but much of the Node.js ecosystem & npm expects V8. JavaScript engines differ in `error.stack` formatting. Bun intends to be a drop-in replacement for Node.js, and that means it's our job to make sure that even though the engine is different, the stack traces are as similar as possible.

That's why when you log `error.stack` in Bun, the formatting of `error.stack` is the same as in Node.js's V8 engine. This is especially useful when you're using libraries that expect V8 stack traces.

#### V8 Stack Trace API

Bun implements the [V8 Stack Trace API](https://v8.dev/docs/stack-trace-api), which is a set of functions that allow you to manipulate stack traces.

##### `Error.prepareStackTrace`

The `Error.prepareStackTrace` function is a global function that lets you customize the stack trace output. This function is called with the error object and an array of `CallSite` objects and lets you return a custom stack trace.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Error.prepareStackTrace = (err, stack) => {
	return stack.map(callSite => {
		return callSite.getFileName();
	});
};

const err = new Error("Something went wrong");
console.log(err.stack);
// [ "error.js" ]
```

The `CallSite` object has the following methods:

| Method                     | Returns                                               |
| -------------------------- | ----------------------------------------------------- |
| `getThis`                  | `this` value of the function call                     |
| `getTypeName`              | typeof `this`                                         |
| `getFunction`              | function object                                       |
| `getFunctionName`          | function name as a string                             |
| `getMethodName`            | method name as a string                               |
| `getFileName`              | file name or URL                                      |
| `getLineNumber`            | line number                                           |
| `getColumnNumber`          | column number                                         |
| `getEvalOrigin`            | `undefined`                                           |
| `getScriptNameOrSourceURL` | source URL                                            |
| `isToplevel`               | returns `true` if the function is in the global scope |
| `isEval`                   | returns `true` if the function is an `eval` call      |
| `isNative`                 | returns `true` if the function is native              |
| `isConstructor`            | returns `true` if the function is a constructor       |
| `isAsync`                  | returns `true` if the function is `async`             |
| `isPromiseAll`             | Not implemented yet.                                  |
| `getPromiseIndex`          | Not implemented yet.                                  |
| `toString`                 | returns a string representation of the call site      |

In some cases, the `Function` object may have already been garbage collected, so some of these methods may return `undefined`.

##### `Error.captureStackTrace(error, startFn)`

The `Error.captureStackTrace` function lets you capture a stack trace at a specific point in your code, rather than at the point where the error was thrown.

This can be helpful when you have callbacks or asynchronous code that makes it difficult to determine where an error originated. The 2nd argument to `Error.captureStackTrace` is the function where you want the stack trace to start.

For example, the below code will make `err.stack` point to the code calling `fn()`, even though the error was thrown at `myInner`.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const fn = () => {
	function myInner() {
		throw err;
	}

	try {
		myInner();
	} catch (err) {
		console.log(err.stack);
		console.log("");
		console.log("-- captureStackTrace --");
		console.log("");
		Error.captureStackTrace(err, fn);
		console.log(err.stack);
	}
};

fn();
```

This logs the following:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
Error: here!
    at myInner (file.js:4:15)
    at fn (file.js:8:5)
    at module code (file.js:17:1)
    at moduleEvaluation (native)
    at moduleEvaluation (native)
    at <anonymous> (native)

-- captureStackTrace --

Error: here!
    at module code (file.js:17:1)
    at moduleEvaluation (native)
    at moduleEvaluation (native)
    at <anonymous> (native)
```

# bunfig.toml

> Configure Bun's behavior using its configuration file bunfig.toml

Bun's behavior can be configured using its configuration file, `bunfig.toml`.

In general, Bun relies on pre-existing configuration files like `package.json` and `tsconfig.json` to configure its behavior. `bunfig.toml` is only necessary for configuring Bun-specific things. This file is optional, and Bun will work out of the box without it.

## Global vs. local

In general, it's recommended to add a `bunfig.toml` file to your project root, alongside your `package.json`.

To configure Bun globally, you can also create a `.bunfig.toml` file at one of the following paths:

* `$HOME/.bunfig.toml`
* `$XDG_CONFIG_HOME/.bunfig.toml`

If both a global and local `bunfig` are detected, the results are shallow-merged, with local overriding global. CLI flags will override `bunfig` setting where applicable.

## Runtime

Bun's runtime behavior is configured using top-level fields in the `bunfig.toml` file.

### `preload`

An array of scripts/plugins to execute before running a file or script.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
# scripts to run before `bun run`-ing a file or script
# register plugins by adding them to this list
preload = ["./preload.ts"]
```

### `jsx`

Configure how Bun handles JSX. You can also set these fields in the `compilerOptions` of your `tsconfig.json`, but they are supported here as well for non-TypeScript projects.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
jsx = "react"
jsxFactory = "h"
jsxFragment = "Fragment"
jsxImportSource = "react"
```

Refer to the tsconfig docs for more information on these fields.

* [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
* [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
* [`jsxFragment`](https://www.typescriptlang.org/tsconfig#jsxFragment)
* [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)

### `smol`

Enable `smol` mode. This reduces memory usage at the cost of performance.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Reduce memory usage at the cost of performance
smol = true
```

### `logLevel`

Set the log level. This can be one of `"debug"`, `"warn"`, or `"error"`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
logLevel = "debug" # "debug" | "warn" | "error"
```

### `define`

The `define` field allows you to replace certain global identifiers with constant expressions. Bun will replace any usage of the identifier with the expression. The expression should be a JSON string.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[define]
# Replace any usage of "process.env.bagel" with the string `lox`.
# The values are parsed as JSON, except single-quoted strings are supported and `'undefined'` becomes `undefined` in JS.
# This will probably change in a future release to be just regular TOML instead. It is a holdover from the CLI argument parsing.
"process.env.bagel" = "'lox'"
```

### `loader`

Configure how Bun maps file extensions to loaders. This is useful for loading files that aren't natively supported by Bun.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[loader]
# when a .bagel file is imported, treat it like a tsx file
".bagel" = "tsx"
```

Bun supports the following loaders:

* `jsx`
* `js`
* `ts`
* `tsx`
* `css`
* `file`
* `json`
* `toml`
* `wasm`
* `napi`
* `base64`
* `dataurl`
* `text`

### `telemetry`

The `telemetry` field permit to enable/disable the analytics records. Bun records bundle timings (so we can answer with data, "is Bun getting faster?") and feature usage (e.g., "are people actually using macros?"). The request body size is about 60 bytes, so it's not a lot of data. By default the telemetry is enabled. Equivalent of `DO_NOT_TRACK` env variable.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
telemetry = false
```

### `console`

Configure console output behavior.

#### `console.depth`

Set the default depth for `console.log()` object inspection. Default `2`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[console]
depth = 3
```

This controls how deeply nested objects are displayed in console output. Higher values show more nested properties but may produce verbose output for complex objects. This setting can be overridden by the `--console-depth` CLI flag.

## Test runner

The test runner is configured under the `[test]` section of your bunfig.toml.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
# configuration goes here
```

### `test.root`

The root directory to run tests from. Default `.`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
root = "./__tests__"
```

### `test.preload`

Same as the top-level `preload` field, but only applies to `bun test`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
preload = ["./setup.ts"]
```

### `test.smol`

Same as the top-level `smol` field, but only applies to `bun test`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
smol = true
```

### `test.coverage`

Enables coverage reporting. Default `false`. Use `--coverage` to override.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverage = false
```

### `test.coverageThreshold`

To specify a coverage threshold. By default, no threshold is set. If your test suite does not meet or exceed this threshold, `bun test` will exit with a non-zero exit code to indicate the failure.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]

# to require 90% line-level and function-level coverage
coverageThreshold = 0.9
```

Different thresholds can be specified for line-wise, function-wise, and statement-wise coverage.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageThreshold = { line = 0.7, function = 0.8, statement = 0.9 }
```

### `test.coverageSkipTestFiles`

Whether to skip test files when computing coverage statistics. Default `false`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageSkipTestFiles = false
```

### `test.coveragePathIgnorePatterns`

Exclude specific files or file patterns from coverage reports using glob patterns. Can be a single string pattern or an array of patterns.

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

### `test.coverageReporter`

By default, coverage reports will be printed to the console. For persistent code coverage reports in CI environments and for other tools use `lcov`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageReporter  = ["text", "lcov"]  # default ["text"]
```

### `test.coverageDir`

Set path where coverage reports will be saved. Please notice, that it works only for persistent `coverageReporter` like `lcov`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
coverageDir = "path/to/somewhere"  # default "coverage"
```

### `test.randomize`

Run tests in random order. Default `false`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
randomize = true
```

This helps catch bugs related to test interdependencies by running tests in a different order each time. When combined with `seed`, the random order becomes reproducible.

The `--randomize` CLI flag will override this setting when specified.

### `test.seed`

Set the random seed for test randomization. This option requires `randomize` to be `true`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
randomize = true
seed = 2444615283
```

Using a seed makes the randomized test order reproducible across runs, which is useful for debugging flaky tests. When you encounter a test failure with randomization enabled, you can use the same seed to reproduce the exact test order.

The `--seed` CLI flag will override this setting when specified.

### `test.rerunEach`

Re-run each test file a specified number of times. Default `0` (run once).

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[test]
rerunEach = 3
```

This is useful for catching flaky tests or non-deterministic behavior. Each test file will be executed the specified number of times.

The `--rerun-each` CLI flag will override this setting when specified.

## Package manager

Package management is a complex issue; to support a range of use cases, the behavior of `bun install` can be configured under the `[install]` section.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# configuration here
```

### `install.optional`

Whether to install optional dependencies. Default `true`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
optional = true
```

### `install.dev`

Whether to install development dependencies. Default `true`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
dev = true
```

### `install.peer`

Whether to install peer dependencies. Default `true`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
peer = true
```

### `install.production`

Whether `bun install` will run in "production mode". Default `false`.

In production mode, `"devDependencies"` are not installed. You can use `--production` in the CLI to override this setting.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
production = false
```

### `install.exact`

Whether to set an exact version in `package.json`. Default `false`.

By default Bun uses caret ranges; if the `latest` version of a package is `2.4.1`, the version range in your `package.json` will be `^2.4.1`. This indicates that any version from `2.4.1` up to (but not including) `3.0.0` is acceptable.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
exact = false
```

### `install.saveTextLockfile`

If false, generate a binary `bun.lockb` instead of a text-based `bun.lock` file when running `bun install` and no lockfile is present.

Default `true` (since Bun v1.2).

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
saveTextLockfile = false
```

### `install.auto`

To configure Bun's package auto-install behavior. Default `"auto"` — when no `node_modules` folder is found, Bun will automatically install dependencies on the fly during execution.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
auto = "auto"
```

Valid values are:

| Value        | Description                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `"auto"`     | Resolve modules from local `node_modules` if it exists. Otherwise, auto-install dependencies on the fly.                            |
| `"force"`    | Always auto-install dependencies, even if `node_modules` exists.                                                                    |
| `"disable"`  | Never auto-install dependencies.                                                                                                    |
| `"fallback"` | Check local `node_modules` first, then auto-install any packages that aren't found. You can enable this from the CLI with `bun -i`. |

### `install.frozenLockfile`

When true, `bun install` will not update `bun.lock`. Default `false`. If `package.json` and the existing `bun.lock` are not in agreement, this will error.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
frozenLockfile = false
```

### `install.dryRun`

Whether `bun install` will actually install dependencies. Default `false`. When true, it's equivalent to setting `--dry-run` on all `bun install` commands.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
dryRun = false
```

### `install.globalDir`

To configure the directory where Bun puts globally installed packages.

Environment variable: `BUN_INSTALL_GLOBAL_DIR`

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# where `bun install --global` installs packages
globalDir = "~/.bun/install/global"
```

### `install.globalBinDir`

To configure the directory where Bun installs globally installed binaries and CLIs.

Environment variable: `BUN_INSTALL_BIN`

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
# where globally-installed package bins are linked
globalBinDir = "~/.bun/bin"
```

### `install.registry`

The default registry is `https://registry.npmjs.org/`. This can be globally configured in `bunfig.toml`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# set default registry as a string
registry = "https://registry.npmjs.org"
# set a token
registry = { url = "https://registry.npmjs.org", token = "123456" }
# set a username/password
registry = "https://username:password@registry.npmjs.org"
```

### `install.linkWorkspacePackages`

To configure how workspace packages are linked, use the `install.linkWorkspacePackages` option.

Whether to link workspace packages from the monorepo root to their respective `node_modules` directories. Default `true`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
linkWorkspacePackages = true
```

### `install.scopes`

To configure a registry for a particular scope (e.g. `@myorg/<package>`) use `install.scopes`. You can reference environment variables with `$variable` notation.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install.scopes]
# registry as string
myorg = "https://username:password@registry.myorg.com/"

# registry with username/password
# you can reference environment variables
myorg = { username = "myusername", password = "$npm_password", url = "https://registry.myorg.com/" }

# registry with token
myorg = { token = "$npm_token", url = "https://registry.myorg.com/" }
```

### `install.ca` and `install.cafile`

To configure a CA certificate, use `install.ca` or `install.cafile` to specify a path to a CA certificate file.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# The CA certificate as a string
ca = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"

# A path to a CA certificate file. The file can contain multiple certificates.
cafile = "path/to/cafile"
```

### `install.cache`

To configure the cache behavior:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install.cache]

# the directory to use for the cache
dir = "~/.bun/install/cache"

# when true, don't load from the global cache.
# Bun may still write to node_modules/.cache
disable = false

# when true, always resolve the latest versions from the registry
disableManifest = false
```

### `install.lockfile`

To configure lockfile behavior, use the `install.lockfile` section.

Whether to generate a lockfile on `bun install`. Default `true`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install.lockfile]
save = true
```

Whether to generate a non-Bun lockfile alongside `bun.lock`. (A `bun.lock` will always be created.) Currently `"yarn"` is the only supported value.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install.lockfile]
print = "yarn"
```

### `install.linker`

Configure the default linker strategy. Default `"hoisted"` for single-project projects, `"isolated"` for monorepo projects.

For complete documentation refer to [Package manager > Isolated installs](/pm/isolated-installs).

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
linker = "hoisted"
```

Valid values are:

| Value        | Description                                             |
| ------------ | ------------------------------------------------------- |
| `"hoisted"`  | Link dependencies in a shared `node_modules` directory. |
| `"isolated"` | Link dependencies inside each package installation.     |

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[debug]
# When navigating to a blob: or src: link, open the file in your editor
# If not, it tries $EDITOR or $VISUAL
# If that still fails, it will try Visual Studio Code, then Sublime Text, then a few others
# This is used by Bun.openInEditor()
editor = "code"

# List of editors:
# - "subl", "sublime"
# - "vscode", "code"
# - "textmate", "mate"
# - "idea"
# - "webstorm"
# - "nvim", "neovim"
# - "vim","vi"
# - "emacs"
```

### `install.minimumReleaseAge`

Configure a minimum age (in seconds) for npm package versions. Package versions published more recently than this threshold will be filtered out during installation. Default is `null` (disabled).

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# Only install package versions published at least 3 days ago
minimumReleaseAge = 259200
# These packages will bypass the 3-day minimum age requirement
minimumReleaseAgeExcludes = ["@types/bun", "typescript"]
```

For more details see [Minimum release age](/pm/cli/install#minimum-release-age) in the install documentation.

## `bun run`

The `bun run` command can be configured under the `[run]` section. These apply to the `bun run` command and the `bun` command when running a file or executable or script.

Currently, `bunfig.toml` isn't always automatically loaded for `bun run` in a local project (it does check for a global `bunfig.toml`), so you might still need to pass `-c` or `-c=bunfig.toml` to use these settings.

### `run.shell` - use the system shell or Bun's shell

The shell to use when running package.json scripts via `bun run` or `bun`. On Windows, this defaults to `"bun"` and on other platforms it defaults to `"system"`.

To always use the system shell instead of Bun's shell (default behavior unless Windows):

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[run]
# default outside of Windows
shell = "system"
```

To always use Bun's shell instead of the system shell:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[run]
# default on Windows
shell = "bun"
```

### `run.bun` - auto alias `node` to `bun`

When `true`, this prepends `$PATH` with a `node` symlink that points to the `bun` binary for all scripts or executables invoked by `bun run` or `bun`.

This means that if you have a script that runs `node`, it will actually run `bun` instead, without needing to change your script. This works recursively, so if your script runs another script that runs `node`, it will also run `bun` instead. This applies to shebangs as well, so if you have a script with a shebang that points to `node`, it will actually run `bun` instead.

By default, this is enabled if `node` is not already in your `$PATH`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[run]
# equivalent to `bun --bun` for all `bun run` commands
bun = true
```

You can test this by running:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --bun which node # /path/to/bun
bun which node # /path/to/node
```

This option is equivalent to prefixing all `bun run` commands with `--bun`:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --bun run dev
bun --bun dev
bun run --bun dev
```

If set to `false`, this will disable the `node` symlink.

### `run.silent` - suppress reporting the command being run

When `true`, suppresses the output of the command being run by `bun run` or `bun`.

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[run]
silent = true
```

Without this option, the command being run will be printed to the console:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run dev
echo "Running \"dev\"..."
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Running "dev"...
```

With this option, the command being run will not be printed to the console:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run dev
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Running "dev"...
```

This is equivalent to passing `--silent` to all `bun run` commands:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --silent run dev
bun --silent dev
bun run --silent dev
```

