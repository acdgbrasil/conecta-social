# Environment Variables

> Read and configure environment variables in Bun, including automatic .env file support

Bun reads your `.env` files automatically and provides idiomatic ways to read and write your environment variables programmatically. Plus, some aspects of Bun's runtime behavior can be configured with Bun-specific environment variables.

## Setting environment variables

Bun reads the following files automatically (listed in order of increasing precedence).

* `.env`
* `.env.production`, `.env.development`, `.env.test` (depending on value of `NODE_ENV`)
* `.env.local`

```txt .env icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
FOO=hello
BAR=world
```

Variables can also be set via the command line.

<CodeGroup>
  ```sh Linux/macOS icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  FOO=helloworld bun run dev
  ```

  ```sh Windows icon="windows" theme={"theme":{"light":"github-light","dark":"dracula"}}
  # Using CMD
  set FOO=helloworld && bun run dev

  # Using PowerShell
  $env:FOO="helloworld"; bun run dev
  ```
</CodeGroup>

<Accordion title="Cross-platform solution with Windows">
  For a cross-platform solution, you can use [bun shell](/runtime/shell). For example, the `bun exec` command.

  ```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun exec 'FOO=helloworld bun run dev'
  ```

  On Windows, `package.json` scripts called with `bun run` will automatically use the **bun shell**, making the following also cross-platform.

  ```json package.json theme={"theme":{"light":"github-light","dark":"dracula"}}
  "scripts": {
    "dev": "NODE_ENV=development bun --watch app.ts",
  },
  ```
</Accordion>

Or programmatically by assigning a property to `process.env`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
process.env.FOO = "hello";
```

***

## Manually specifying `.env` files

Bun supports `--env-file` to override which specific `.env` file to load. You can use `--env-file` when running scripts in bun's runtime, or when running package.json scripts.

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --env-file=.env.1 src/index.ts

bun --env-file=.env.abc --env-file=.env.def run build
```

***

## Quotation marks

Bun supports double quotes, single quotes, and template literal backticks:

```txt .env icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
FOO='hello'
FOO="hello"
FOO=`hello`
```

### Expansion

Environment variables are automatically *expanded*. This means you can reference previously-defined variables in your environment variables.

```txt .env icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
FOO=world
BAR=hello$FOO
```

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
process.env.BAR; // => "helloworld"
```

This is useful for constructing connection strings or other compound values.

```txt .env icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
DB_USER=postgres
DB_PASSWORD=secret
DB_HOST=localhost
DB_PORT=5432
DB_URL=postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
```

This can be disabled by escaping the `$` with a backslash.

```txt .env icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
FOO=world
BAR=hello\$FOO
```

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
process.env.BAR; // => "hello$FOO"
```

### `dotenv`

Generally speaking, you won't need `dotenv` or `dotenv-expand` anymore, because Bun reads `.env` files automatically.

## Reading environment variables

The current environment variables can be accessed via `process.env`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
process.env.API_TOKEN; // => "secret"
```

Bun also exposes these variables via `Bun.env` and `import.meta.env`, which is a simple alias of `process.env`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.env.API_TOKEN; // => "secret"
import.meta.env.API_TOKEN; // => "secret"
```

To print all currently-set environment variables to the command line, run `bun --print process.env`. This is useful for debugging.

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --print process.env
BAZ=stuff
FOOBAR=aaaaaa
<lots more lines>
```

## TypeScript

In TypeScript, all properties of `process.env` are typed as `string | undefined`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.env.whatever;
// string | undefined
```

To get autocompletion and tell TypeScript to treat a variable as a non-optional string, we'll use [interface merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces).

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
declare module "bun" {
	interface Env {
		AWESOME: string;
	}
}
```

Add this line to any file in your project. It will globally add the `AWESOME` property to `process.env` and `Bun.env`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
process.env.AWESOME; // => string
```

## Configuring Bun

These environment variables are read by Bun and configure aspects of its behavior.

| Name                                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_TLS_REJECT_UNAUTHORIZED`           | `NODE_TLS_REJECT_UNAUTHORIZED=0` disables SSL certificate validation. This is useful for testing and debugging, but you should be very hesitant to use this in production. Note: This environment variable was originally introduced by Node.js and we kept the name for compatibility.                                                                                                                                                                                                                                                                                   |
| `BUN_CONFIG_VERBOSE_FETCH`               | If `BUN_CONFIG_VERBOSE_FETCH=curl`, then fetch requests will log the url, method, request headers and response headers to the console. This is useful for debugging network requests. This also works with `node:http`. `BUN_CONFIG_VERBOSE_FETCH=1` is equivalent to `BUN_CONFIG_VERBOSE_FETCH=curl` except without the `curl` output.                                                                                                                                                                                                                                   |
| `BUN_RUNTIME_TRANSPILER_CACHE_PATH`      | The runtime transpiler caches the transpiled output of source files larger than 50 kb. This makes CLIs using Bun load faster. If `BUN_RUNTIME_TRANSPILER_CACHE_PATH` is set, then the runtime transpiler will cache transpiled output to the specified directory. If `BUN_RUNTIME_TRANSPILER_CACHE_PATH` is set to an empty string or the string `"0"`, then the runtime transpiler will not cache transpiled output. If `BUN_RUNTIME_TRANSPILER_CACHE_PATH` is unset, then the runtime transpiler will cache transpiled output to the platform-specific cache directory. |
| `TMPDIR`                                 | Bun occasionally requires a directory to store intermediate assets during bundling or other operations. If unset, defaults to the platform-specific temporary directory: `/tmp` on Linux, `/private/tmp` on macOS.                                                                                                                                                                                                                                                                                                                                                        |
| `NO_COLOR`                               | If `NO_COLOR=1`, then ANSI color output is [disabled](https://no-color.org/).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `FORCE_COLOR`                            | If `FORCE_COLOR=1`, then ANSI color output is force enabled, even if `NO_COLOR` is set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `BUN_CONFIG_MAX_HTTP_REQUESTS`           | Control the maximum number of concurrent HTTP requests sent by fetch and `bun install`. Defaults to `256`. If you are running into rate limits or connection issues, you can reduce this number.                                                                                                                                                                                                                                                                                                                                                                          |
| `BUN_CONFIG_NO_CLEAR_TERMINAL_ON_RELOAD` | If `BUN_CONFIG_NO_CLEAR_TERMINAL_ON_RELOAD=true`, then `bun --watch` will not clear the console on reload                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `DO_NOT_TRACK`                           | Disable uploading crash reports to `bun.report` on crash. On macOS & Windows, crash report uploads are enabled by default. Otherwise, telemetry is not sent yet as of May 21st, 2024, but we are planning to add telemetry in the coming weeks. If `DO_NOT_TRACK=1`, then auto-uploading crash reports and telemetry are both [disabled](https://do-not-track.dev/).                                                                                                                                                                                                      |
| `BUN_OPTIONS`                            | Prepends command-line arguments to any Bun execution. For example, `BUN_OPTIONS="--hot"` makes `bun run dev` behave like `bun --hot run dev`                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Runtime transpiler caching

For files larger than 50 KB, Bun caches transpiled output into `$BUN_RUNTIME_TRANSPILER_CACHE_PATH` or the platform-specific cache directory. This makes CLIs using Bun load faster.

This transpiler cache is global and shared across all projects. It is safe to delete the cache at any time. It is a content-addressable cache, so it will never contain duplicate entries. It is also safe to delete the cache while a Bun process is running.

It is recommended to disable this cache when using ephemeral filesystems like Docker. Bun's Docker images automatically disable this cache.

### Disable the runtime transpiler cache

To disable the runtime transpiler cache, set `BUN_RUNTIME_TRANSPILER_CACHE_PATH` to an empty string or the string `"0"`.

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 bun run dev
```

### What does it cache?

It caches:

* The transpiled output of source files larger than 50 KB.
* The sourcemap for the transpiled output of the file

The file extension `.pile` is used for these cached files.

# Shell

> Use Bun's shell scripting API to run shell commands from JavaScript

Bun Shell makes shell scripting with JavaScript & TypeScript fun. It's a cross-platform bash-like shell with seamless JavaScript interop.

Quickstart:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const response = await fetch("https://example.com");

// Use Response as stdin.
await $`cat < ${response} | wc -c`; // 1256
```

***

## Features

* **Cross-platform**: works on Windows, Linux & macOS. Instead of `rimraf` or `cross-env`', you can use Bun Shell without installing extra dependencies. Common shell commands like `ls`, `cd`, `rm` are implemented natively.
* **Familiar**: Bun Shell is a bash-like shell, supporting redirection, pipes, environment variables and more.
* **Globs**: Glob patterns are supported natively, including `**`, `*`, `{expansion}`, and more.
* **Template literals**: Template literals are used to execute shell commands. This allows for easy interpolation of variables and expressions.
* **Safety**: Bun Shell escapes all strings by default, preventing shell injection attacks.
* **JavaScript interop**: Use `Response`, `ArrayBuffer`, `Blob`, `Bun.file(path)` and other JavaScript objects as stdin, stdout, and stderr.
* **Shell scripting**: Bun Shell can be used to run shell scripts (`.bun.sh` files).
* **Custom interpreter**: Bun Shell is written in Zig, along with its lexer, parser, and interpreter. Bun Shell is a small programming language.

***

## Getting started

The simplest shell command is `echo`. To run it, use the `$` template literal tag:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`echo "Hello World!"`; // Hello World!
```

By default, shell commands print to stdout. To quiet the output, call `.quiet()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`echo "Hello World!"`.quiet(); // No output
```

What if you want to access the output of the command as text? Use `.text()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

// .text() automatically calls .quiet() for you
const welcome = await $`echo "Hello World!"`.text();

console.log(welcome); // Hello World!\n
```

By default, `await`ing will return stdout and stderr as `Buffer`s.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const { stdout, stderr } = await $`echo "Hello!"`.quiet();

console.log(stdout); // Buffer(7) [ 72, 101, 108, 108, 111, 33, 10 ]
console.log(stderr); // Buffer(0) []
```

***

## Error handling

By default, non-zero exit codes will throw an error. This `ShellError` contains information about the command run.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

try {
	const output = await $`something-that-may-fail`.text();
	console.log(output);
} catch (err) {
	console.log(`Failed with code ${err.exitCode}`);
	console.log(err.stdout.toString());
	console.log(err.stderr.toString());
}
```

Throwing can be disabled with `.nothrow()`. The result's `exitCode` will need to be checked manually.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const { stdout, stderr, exitCode } = await $`something-that-may-fail`.nothrow().quiet();

if (exitCode !== 0) {
	console.log(`Non-zero exit code ${exitCode}`);
}

console.log(stdout);
console.log(stderr);
```

The default handling of non-zero exit codes can be configured by calling `.nothrow()` or `.throws(boolean)` on the `$` function itself.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";
// shell promises will not throw, meaning you will have to
// check for `exitCode` manually on every shell command.
$.nothrow(); // equivalent to $.throws(false)

// default behavior, non-zero exit codes will throw an error
$.throws(true);

// alias for $.nothrow()
$.throws(false);

await $`something-that-may-fail`; // No exception thrown
```

***

## Redirection

A command's *input* or *output* may be *redirected* using the typical Bash operators:

* `<` redirect stdin
* `>` or `1>` redirect stdout
* `2>` redirect stderr
* `&>` redirect both stdout and stderr
* `>>` or `1>>` redirect stdout, *appending* to the destination, instead of overwriting
* `2>>` redirect stderr, *appending* to the destination, instead of overwriting
* `&>>` redirect both stdout and stderr, *appending* to the destination, instead of overwriting
* `1>&2` redirect stdout to stderr (all writes to stdout will instead be in stderr)
* `2>&1` redirect stderr to stdout (all writes to stderr will instead be in stdout)

Bun Shell also supports redirecting from and to JavaScript objects.

### Example: Redirect output to JavaScript objects (`>`)

To redirect stdout to a JavaScript object, use the `>` operator:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const buffer = Buffer.alloc(100);
await $`echo "Hello World!" > ${buffer}`;

console.log(buffer.toString()); // Hello World!\n
```

The following JavaScript objects are supported for redirection to:

* `Buffer`, `Uint8Array`, `Uint16Array`, `Uint32Array`, `Int8Array`, `Int16Array`, `Int32Array`, `Float32Array`, `Float64Array`, `ArrayBuffer`, `SharedArrayBuffer` (writes to the underlying buffer)
* `Bun.file(path)`, `Bun.file(fd)` (writes to the file)

### Example: Redirect input from JavaScript objects (`<`)

To redirect the output from JavaScript objects to stdin, use the `<` operator:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const response = new Response("hello i am a response body");

const result = await $`cat < ${response}`.text();

console.log(result); // hello i am a response body
```

The following JavaScript objects are supported for redirection from:

* `Buffer`, `Uint8Array`, `Uint16Array`, `Uint32Array`, `Int8Array`, `Int16Array`, `Int32Array`, `Float32Array`, `Float64Array`, `ArrayBuffer`, `SharedArrayBuffer` (reads from the underlying buffer)
* `Bun.file(path)`, `Bun.file(fd)` (reads from the file)
* `Response` (reads from the body)

### Example: Redirect stdin -> file

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`cat < myfile.txt`;
```

### Example: Redirect stdout -> file

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`echo bun! > greeting.txt`;
```

### Example: Redirect stderr -> file

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`bun run index.ts 2> errors.txt`;
```

### Example: Redirect stderr -> stdout

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

// redirects stderr to stdout, so all output
// will be available on stdout
await $`bun run ./index.ts 2>&1`;
```

### Example: Redirect stdout -> stderr

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

// redirects stdout to stderr, so all output
// will be available on stderr
await $`bun run ./index.ts 1>&2`;
```

## Piping (`|`)

Like in bash, you can pipe the output of one command to another:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const result = await $`echo "Hello World!" | wc -w`.text();

console.log(result); // 2\n
```

You can also pipe with JavaScript objects:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const response = new Response("hello i am a response body");

const result = await $`cat < ${response} | wc -w`.text();

console.log(result); // 6\n
```

## Command substitution (`$(...)`)

Command substitution allows you to substitute the output of another script into the current script:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

// Prints out the hash of the current commit
await $`echo Hash of current commit: $(git rev-parse HEAD)`;
```

This is a textual insertion of the command's output and can be used to, for example, declare a shell variable:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`
  REV=$(git rev-parse HEAD)
  docker built -t myapp:$REV
  echo Done building docker image "myapp:$REV"
`;
```

<Note>
  Because Bun internally uses the special [`raw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#raw_strings) property on the input template literal, using the backtick syntax for command substitution won't work:

  ```ts icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { $ } from "bun";

  await $`echo \`echo hi\``;
  ```

  Instead of printing:

  ```
  hi
  ```

  The above will print out:

  ```
  echo hi
  ```

  We instead recommend sticking to the `$(...)` syntax.
</Note>

***

## Environment variables

Environment variables can be set like in bash:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`FOO=foo bun -e 'console.log(process.env.FOO)'`; // foo\n
```

You can use string interpolation to set environment variables:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const foo = "bar123";

await $`FOO=${foo + "456"} bun -e 'console.log(process.env.FOO)'`; // bar123456\n
```

Input is escaped by default, preventing shell injection attacks:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const foo = "bar123; rm -rf /tmp";

await $`FOO=${foo} bun -e 'console.log(process.env.FOO)'`; // bar123; rm -rf /tmp\n
```

### Changing the environment variables

By default, `process.env` is used as the environment variables for all commands.

You can change the environment variables for a single command by calling `.env()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`echo $FOO`.env({ ...process.env, FOO: "bar" }); // bar
```

You can change the default environment variables for all commands by calling `$.env`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

$.env({ FOO: "bar" });

// the globally-set $FOO
await $`echo $FOO`; // bar

// the locally-set $FOO
await $`echo $FOO`.env({ FOO: "baz" }); // baz
```

You can reset the environment variables to the default by calling `$.env()` with no arguments:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

$.env({ FOO: "bar" });

// the globally-set $FOO
await $`echo $FOO`; // bar

// the locally-set $FOO
await $`echo $FOO`.env(undefined); // ""
```

### Changing the working directory

You can change the working directory of a command by passing a string to `.cwd()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`pwd`.cwd("/tmp"); // /tmp
```

You can change the default working directory for all commands by calling `$.cwd`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

$.cwd("/tmp");

// the globally-set working directory
await $`pwd`; // /tmp

// the locally-set working directory
await $`pwd`.cwd("/"); // /
```

***

## Reading output

To read the output of a command as a string, use `.text()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const result = await $`echo "Hello World!"`.text();

console.log(result); // Hello World!\n
```

### Reading output as JSON

To read the output of a command as JSON, use `.json()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const result = await $`echo '{"foo": "bar"}'`.json();

console.log(result); // { foo: "bar" }
```

### Reading output line-by-line

To read the output of a command line-by-line, use `.lines()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

for await (let line of $`echo "Hello World!"`.lines()) {
	console.log(line); // Hello World!
}
```

You can also use `.lines()` on a completed command:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const search = "bun";

for await (let line of $`cat list.txt | grep ${search}`.lines()) {
	console.log(line);
}
```

### Reading output as a Blob

To read the output of a command as a Blob, use `.blob()`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const result = await $`echo "Hello World!"`.blob();

console.log(result); // Blob(13) { size: 13, type: "text/plain" }
```

***

## Builtin Commands

For cross-platform compatibility, Bun Shell implements a set of builtin commands, in addition to reading commands from the PATH environment variable.

* `cd`: change the working directory
* `ls`: list files in a directory
* `rm`: remove files and directories
* `echo`: print text
* `pwd`: print the working directory
* `bun`: run bun in bun
* `cat`
* `touch`
* `mkdir`
* `which`
* `mv`
* `exit`
* `true`
* `false`
* `yes`
* `seq`
* `dirname`
* `basename`

**Partially** implemented:

* `mv`: move files and directories (missing cross-device support)

**Not** implemented yet, but planned:

* See [Issue #9716](https://github.com/oven-sh/bun/issues/9716) for the full list.

***

## Utilities

Bun Shell also implements a set of utilities for working with shells.

### `$.braces` (brace expansion)

This function implements simple [brace expansion](https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html) for shell commands:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $.braces(`echo {1,2,3}`);
// => ["echo 1", "echo 2", "echo 3"]
```

### `$.escape` (escape strings)

Exposes Bun Shell's escaping logic as a function:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

console.log($.escape('$(foo) `bar` "baz"'));
// => \$(foo) \`bar\` \"baz\"
```

If you do not want your string to be escaped, wrap it in a `{ raw: 'str' }` object:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

await $`echo ${{ raw: '$(foo) `bar` "baz"' }}`;
// => bun: command not found: foo
// => bun: command not found: bar
// => baz
```

***

## `.sh` file loader

For simple shell scripts, instead of `/bin/sh`, you can use Bun Shell to run shell scripts.

To do so, just run the script with `bun` on a file with the `.sh` extension.

```sh script.sh icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
echo "Hello World! pwd=$(pwd)"
```

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./script.sh
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Hello World! pwd=/home/demo
```

Scripts with Bun Shell are cross platform, which means they work on Windows:

```powershell powershell icon="windows" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun .\script.sh
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Hello World! pwd=C:\Users\Demo
```

***

## Implementation notes

Bun Shell is a small programming language in Bun that is implemented in Zig. It includes a handwritten lexer, parser, and interpreter. Unlike bash, zsh, and other shells, Bun Shell runs operations concurrently.

***

## Security in the Bun shell

By design, the Bun shell *does not invoke a system shell* (like `/bin/sh`) and
is instead a re-implementation of bash that runs in the same Bun process,
designed with security in mind.

When parsing command arguments, it treats all *interpolated variables* as single, literal strings.

This protects the Bun shell against **command injection**:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const userInput = "my-file.txt; rm -rf /";

// SAFE: `userInput` is treated as a single quoted string
await $`ls ${userInput}`;
```

In the above example, `userInput` is treated as a single string. This causes
the `ls` command to try to read the contents of a single directory named
"my-file; rm -rf /".

### Security considerations

While command injection is prevented by default, developers are still
responsible for security in certain scenarios.

Similar to the `Bun.spawn` or `node:child_process.exec()` APIs, you can intentionally
execute a command which spawns a new shell (e.g. `bash -c`) with arguments.

When you do this, you hand off control, and Bun's built-in protections no
longer apply to the string interpreted by that new shell.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

const userInput = "world; touch /tmp/pwned";

// UNSAFE: You have explicitly started a new shell process with `bash -c`.
// This new shell will execute the `touch` command. Any user input
// passed this way must be rigorously sanitized.
await $`bash -c "echo ${userInput}"`;
```

### Argument injection

The Bun shell cannot know how an external command interprets its own
command-line arguments. An attacker can supply input that the target program
recognizes as one of its own options or flags, leading to unintended behavior.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { $ } from "bun";

// Malicious input formatted as a Git command-line flag
const branch = "--upload-pack=echo pwned";

// UNSAFE: While Bun safely passes the string as a single argument,
// the `git` program itself sees and acts upon the malicious flag.
await $`git ls-remote origin ${branch}`;
```

<Note>
  **Recommendation** — As is best practice in every language, always sanitize user-provided input
  before passing it as an argument to an external command. The responsibility for validating
  arguments rests with your application code.
</Note>

***

## Credits

Large parts of this API were inspired by [zx](https://github.com/google/zx), [dax](https://github.com/dsherret/dax), and [bnx](https://github.com/wobsoriano/bnx). Thank you to the authors of those projects.

# Spawn

> Spawn child processes with `Bun.spawn` or `Bun.spawnSync`

## Spawn a process (`Bun.spawn()`)

Provide a command as an array of strings. The result of `Bun.spawn()` is a `Bun.Subprocess` object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"]);
console.log(await proc.exited); // 0
```

The second argument to `Bun.spawn` is a parameters object that can be used to configure the subprocess.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"], {
	cwd: "./path/to/subdir", // specify a working directory
	env: { ...process.env, FOO: "bar" }, // specify environment variables
	onExit(proc, exitCode, signalCode, error) {
		// exit handler
	},
});

proc.pid; // process ID of subprocess
```

## Input stream

By default, the input stream of the subprocess is undefined; it can be configured with the `stdin` parameter.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["cat"], {
	stdin: await fetch("https://raw.githubusercontent.com/oven-sh/bun/main/examples/hashing.js"),
});

const text = await proc.stdout.text();
console.log(text); // "const input = "hello world".repeat(400); ..."
```

| Value                    | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `null`                   | **Default.** Provide no input to the subprocess  |
| `"pipe"`                 | Return a `FileSink` for fast incremental writing |
| `"inherit"`              | Inherit the `stdin` of the parent process        |
| `Bun.file()`             | Read from the specified file                     |
| `TypedArray \| DataView` | Use a binary buffer as input                     |
| `Response`               | Use the response `body` as input                 |
| `Request`                | Use the request `body` as input                  |
| `ReadableStream`         | Use a readable stream as input                   |
| `Blob`                   | Use a blob as input                              |
| `number`                 | Read from the file with a given file descriptor  |

The `"pipe"` option lets incrementally write to the subprocess's input stream from the parent process.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["cat"], {
	stdin: "pipe", // return a FileSink for writing
});

// enqueue string data
proc.stdin.write("hello");

// enqueue binary data
const enc = new TextEncoder();
proc.stdin.write(enc.encode(" world!"));

// send buffered data
proc.stdin.flush();

// close the input stream
proc.stdin.end();
```

Passing a `ReadableStream` to `stdin` lets you pipe data from a JavaScript `ReadableStream` directly to the subprocess's input:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const stream = new ReadableStream({
	start(controller) {
		controller.enqueue("Hello from ");
		controller.enqueue("ReadableStream!");
		controller.close();
	},
});

const proc = Bun.spawn(["cat"], {
	stdin: stream,
	stdout: "pipe",
});

const output = await new Response(proc.stdout).text();
console.log(output); // "Hello from ReadableStream!"
```

## Output streams

You can read results from the subprocess via the `stdout` and `stderr` properties. By default these are instances of `ReadableStream`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"]);
const text = await proc.stdout.text();
console.log(text); // => "1.3.1\n"
```

Configure the output stream by passing one of the following values to `stdout/stderr`:

| Value        | Description                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `"pipe"`     | **Default for `stdout`.** Pipe the output to a `ReadableStream` on the returned `Subprocess` object |
| `"inherit"`  | **Default for `stderr`.** Inherit from the parent process                                           |
| `"ignore"`   | Discard the output                                                                                  |
| `Bun.file()` | Write to the specified file                                                                         |
| `number`     | Write to the file with the given file descriptor                                                    |

## Exit handling

Use the `onExit` callback to listen for the process exiting or being killed.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"], {
	onExit(proc, exitCode, signalCode, error) {
		// exit handler
	},
});
```

For convenience, the `exited` property is a `Promise` that resolves when the process exits.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"]);

await proc.exited; // resolves when process exit
proc.killed; // boolean — was the process killed?
proc.exitCode; // null | number
proc.signalCode; // null | "SIGABRT" | "SIGALRM" | ...
```

To kill a process:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"]);
proc.kill();
proc.killed; // true

proc.kill(15); // specify a signal code
proc.kill("SIGTERM"); // specify a signal name
```

The parent `bun` process will not terminate until all child processes have exited. Use `proc.unref()` to detach the child process from the parent.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"]);
proc.unref();
```

## Resource usage

You can get information about the process's resource usage after it has exited:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawn(["bun", "--version"]);
await proc.exited;

const usage = proc.resourceUsage();
console.log(`Max memory used: ${usage.maxRSS} bytes`);
console.log(`CPU time (user): ${usage.cpuTime.user} µs`);
console.log(`CPU time (system): ${usage.cpuTime.system} µs`);
```

## Using AbortSignal

You can abort a subprocess using an `AbortSignal`:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const controller = new AbortController();
const { signal } = controller;

const proc = Bun.spawn({
	cmd: ["sleep", "100"],
	signal,
});

// Later, to abort the process:
controller.abort();
```

## Using timeout and killSignal

You can set a timeout for a subprocess to automatically terminate after a specific duration:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Kill the process after 5 seconds
const proc = Bun.spawn({
	cmd: ["sleep", "10"],
	timeout: 5000, // 5 seconds in milliseconds
});

await proc.exited; // Will resolve after 5 seconds
```

By default, timed-out processes are killed with the `SIGTERM` signal. You can specify a different signal with the `killSignal` option:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Kill the process with SIGKILL after 5 seconds
const proc = Bun.spawn({
	cmd: ["sleep", "10"],
	timeout: 5000,
	killSignal: "SIGKILL", // Can be string name or signal number
});
```

The `killSignal` option also controls which signal is sent when an AbortSignal is aborted.

## Using maxBuffer

For spawnSync, you can limit the maximum number of bytes of output before the process is killed:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Kill 'yes' after it emits over 100 bytes of output
const result = Bun.spawnSync({
	cmd: ["yes"], // or ["bun", "exec", "yes"] on Windows
	maxBuffer: 100,
});
// process exits
```

## Inter-process communication (IPC)

Bun supports direct inter-process communication channel between two `bun` processes. To receive messages from a spawned Bun subprocess, specify an `ipc` handler.

```ts parent.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const child = Bun.spawn(["bun", "child.ts"], {
	ipc(message) {
		/**
		 * The message received from the sub process
		 **/
	},
});
```

The parent process can send messages to the subprocess using the `.send()` method on the returned `Subprocess` instance. A reference to the sending subprocess is also available as the second argument in the `ipc` handler.

```ts parent.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const childProc = Bun.spawn(["bun", "child.ts"], {
	ipc(message, childProc) {
		/**
		 * The message received from the sub process
		 **/
		childProc.send("Respond to child");
	},
});

childProc.send("I am your father"); // The parent can send messages to the child as well
```

Meanwhile the child process can send messages to its parent using with `process.send()` and receive messages with `process.on("message")`. This is the same API used for `child_process.fork()` in Node.js.

```ts child.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
process.send("Hello from child as string");
process.send({ message: "Hello from child as object" });

process.on("message", message => {
	// print message from parent
	console.log(message);
});
```

```ts child.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
// send a string
process.send("Hello from child as string");

// send an object
process.send({ message: "Hello from child as object" });
```

The `serialization` option controls the underlying communication format between the two processes:

* `advanced`: (default) Messages are serialized using the JSC `serialize` API, which supports cloning [everything `structuredClone` supports](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). This does not support transferring ownership of objects.
* `json`: Messages are serialized using `JSON.stringify` and `JSON.parse`, which does not support as many object types as `advanced` does.

To disconnect the IPC channel from the parent process, call:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
childProc.disconnect();
```

### IPC between Bun & Node.js

To use IPC between a `bun` process and a Node.js process, set `serialization: "json"` in `Bun.spawn`. This is because Node.js and Bun use different JavaScript engines with different object serialization formats.

```ts bun-node-ipc.js icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
if (typeof Bun !== "undefined") {
	const prefix = `[bun ${process.versions.bun} 🐇]`;
	const node = Bun.spawn({
		cmd: ["node", __filename],
		ipc({ message }) {
			console.log(message);
			node.send({ message: `${prefix} 👋 hey node` });
			node.kill();
		},
		stdio: ["inherit", "inherit", "inherit"],
		serialization: "json",
	});

	node.send({ message: `${prefix} 👋 hey node` });
} else {
	const prefix = `[node ${process.version}]`;
	process.on("message", ({ message }) => {
		console.log(message);
		process.send({ message: `${prefix} 👋 hey bun` });
	});
}
```

***

## Blocking API (`Bun.spawnSync()`)

Bun provides a synchronous equivalent of `Bun.spawn` called `Bun.spawnSync`. This is a blocking API that supports the same inputs and parameters as `Bun.spawn`. It returns a `SyncSubprocess` object, which differs from `Subprocess` in a few ways.

1. It contains a `success` property that indicates whether the process exited with a zero exit code.
2. The `stdout` and `stderr` properties are instances of `Buffer` instead of `ReadableStream`.
3. There is no `stdin` property. Use `Bun.spawn` to incrementally write to the subprocess's input stream.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const proc = Bun.spawnSync(["echo", "hello"]);

console.log(proc.stdout.toString());
// => "hello\n"
```

As a rule of thumb, the asynchronous `Bun.spawn` API is better for HTTP servers and apps, and `Bun.spawnSync` is better for building command-line tools.

***

## Benchmarks

<Note>
  ⚡️ Under the hood, `Bun.spawn` and `Bun.spawnSync` use
  [`posix_spawn(3)`](https://man7.org/linux/man-pages/man3/posix_spawn.3.html).
</Note>

Bun's `spawnSync` spawns processes 60% faster than the Node.js `child_process` module.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun spawn.mjs
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
cpu: Apple M1 Max
runtime: bun 1.x (arm64-darwin)

benchmark              time (avg)             (min … max)       p75       p99      p995
--------------------------------------------------------- -----------------------------
spawnSync echo hi  888.14 µs/iter    (821.83 µs … 1.2 ms) 905.92 µs      1 ms   1.03 ms
```

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
node spawn.node.mjs
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
cpu: Apple M1 Max
runtime: node v18.9.1 (arm64-darwin)

benchmark              time (avg)             (min … max)       p75       p99      p995
--------------------------------------------------------- -----------------------------
spawnSync echo hi    1.47 ms/iter     (1.14 ms … 2.64 ms)   1.57 ms   2.37 ms   2.52 ms
```

***

## Reference

A reference of the Spawn API and types are shown below. The real types have complex generics to strongly type the `Subprocess` streams with the options passed to `Bun.spawn` and `Bun.spawnSync`. For full details, find these types as defined [bun.d.ts](https://github.com/oven-sh/bun/blob/main/packages/bun-types/bun.d.ts).

```ts See Typescript Definitions expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
interface Bun {
	spawn(command: string[], options?: SpawnOptions.OptionsObject): Subprocess;
	spawnSync(command: string[], options?: SpawnOptions.OptionsObject): SyncSubprocess;

	spawn(options: { cmd: string[] } & SpawnOptions.OptionsObject): Subprocess;
	spawnSync(options: { cmd: string[] } & SpawnOptions.OptionsObject): SyncSubprocess;
}

namespace SpawnOptions {
	interface OptionsObject {
		cwd?: string;
		env?: Record<string, string | undefined>;
		stdio?: [Writable, Readable, Readable];
		stdin?: Writable;
		stdout?: Readable;
		stderr?: Readable;
		onExit?(
			subprocess: Subprocess,
			exitCode: number | null,
			signalCode: number | null,
			error?: ErrorLike,
		): void | Promise<void>;
		ipc?(message: any, subprocess: Subprocess): void;
		serialization?: "json" | "advanced";
		windowsHide?: boolean;
		windowsVerbatimArguments?: boolean;
		argv0?: string;
		signal?: AbortSignal;
		timeout?: number;
		killSignal?: string | number;
		maxBuffer?: number;
	}

	type Readable =
		| "pipe"
		| "inherit"
		| "ignore"
		| null // equivalent to "ignore"
		| undefined // to use default
		| BunFile
		| ArrayBufferView
		| number;

	type Writable =
		| "pipe"
		| "inherit"
		| "ignore"
		| null // equivalent to "ignore"
		| undefined // to use default
		| BunFile
		| ArrayBufferView
		| number
		| ReadableStream
		| Blob
		| Response
		| Request;
}

interface Subprocess extends AsyncDisposable {
	readonly stdin: FileSink | number | undefined;
	readonly stdout: ReadableStream<Uint8Array> | number | undefined;
	readonly stderr: ReadableStream<Uint8Array> | number | undefined;
	readonly readable: ReadableStream<Uint8Array> | number | undefined;
	readonly pid: number;
	readonly exited: Promise<number>;
	readonly exitCode: number | null;
	readonly signalCode: NodeJS.Signals | null;
	readonly killed: boolean;

	kill(exitCode?: number | NodeJS.Signals): void;
	ref(): void;
	unref(): void;

	send(message: any): void;
	disconnect(): void;
	resourceUsage(): ResourceUsage | undefined;
}

interface SyncSubprocess {
	stdout: Buffer | undefined;
	stderr: Buffer | undefined;
	exitCode: number;
	success: boolean;
	resourceUsage: ResourceUsage;
	signalCode?: string;
	exitedDueToTimeout?: true;
	pid: number;
}

interface ResourceUsage {
	contextSwitches: {
		voluntary: number;
		involuntary: number;
	};

	cpuTime: {
		user: number;
		system: number;
		total: number;
	};
	maxRSS: number;

	messages: {
		sent: number;
		received: number;
	};
	ops: {
		in: number;
		out: number;
	};
	shmSize: number;
	signalCount: number;
	swapCount: number;
}

type Signal =
	| "SIGABRT"
	| "SIGALRM"
	| "SIGBUS"
	| "SIGCHLD"
	| "SIGCONT"
	| "SIGFPE"
	| "SIGHUP"
	| "SIGILL"
	| "SIGINT"
	| "SIGIO"
	| "SIGIOT"
	| "SIGKILL"
	| "SIGPIPE"
	| "SIGPOLL"
	| "SIGPROF"
	| "SIGPWR"
	| "SIGQUIT"
	| "SIGSEGV"
	| "SIGSTKFLT"
	| "SIGSTOP"
	| "SIGSYS"
	| "SIGTERM"
	| "SIGTRAP"
	| "SIGTSTP"
	| "SIGTTIN"
	| "SIGTTOU"
	| "SIGUNUSED"
	| "SIGURG"
	| "SIGUSR1"
	| "SIGUSR2"
	| "SIGVTALRM"
	| "SIGWINCH"
	| "SIGXCPU"
	| "SIGXFSZ"
	| "SIGBREAK"
	| "SIGLOST"
	| "SIGINFO";
```
