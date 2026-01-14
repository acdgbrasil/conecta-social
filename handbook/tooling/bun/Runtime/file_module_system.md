# File Types

> File types and loaders supported by Bun's bundler and runtime

The Bun bundler implements a set of default loaders out of the box. As a rule of thumb, the bundler and the runtime both support the same set of file types out of the box.

`.js` `.cjs` `.mjs` `.mts` `.cts` `.ts` `.tsx` `.jsx` `.toml` `.json` `.txt` `.wasm` `.node` `.html`

Bun uses the file extension to determine which built-in *loader* should be used to parse the file. Every loader has a name, such as `js`, `tsx`, or `json`. These names are used when building [plugins](/bundler/plugins) that extend Bun with custom loaders.

You can explicitly specify which loader to use using the 'loader' import attribute.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import my_toml from "./my_file" with { loader: "toml" };
```

***

## Built-in loaders

### `js`

**JavaScript**. Default for `.cjs` and `.mjs`.

Parses the code and applies a set of default transforms like dead-code elimination and tree shaking. Note that Bun does not attempt to down-convert syntax at the moment.

### `jsx`

**JavaScript + JSX.**. Default for `.js` and `.jsx`.

Same as the `js` loader, but JSX syntax is supported. By default, JSX is down-converted to plain JavaScript; the details of how this is done depends on the `jsx*` compiler options in your `tsconfig.json`. Refer to the TypeScript documentation [on JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) for more information.

### `ts`

**TypeScript loader**. Default for `.ts`, `.mts`, and `.cts`.

Strips out all TypeScript syntax, then behaves identically to the `js` loader. Bun does not perform typechecking.

### `tsx`

**TypeScript + JSX loader**. Default for `.tsx`. Transpiles both TypeScript and JSX to vanilla JavaScript.

### `json`

**JSON loader**. Default for `.json`.

JSON files can be directly imported.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import pkg from "./package.json";
pkg.name; // => "my-package"
```

During bundling, the parsed JSON is inlined into the bundle as a JavaScript object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
var pkg = {
	name: "my-package",
	// ... other fields
};
pkg.name;
```

If a `.json` file is passed as an entrypoint to the bundler, it will be converted to a `.js` module that `export default`s the parsed object.

<CodeGroup>
  ```json Input theme={"theme":{"light":"github-light","dark":"dracula"}}
  {
  	"name": "John Doe",
  	"age": 35,
  	"email": "johndoe@example.com"
  }
  ```

  ```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
  export default {
  	name: "John Doe",
  	age: 35,
  	email: "johndoe@example.com",
  };
  ```
</CodeGroup>

### `toml`

**TOML loader**. Default for `.toml`.

TOML files can be directly imported. Bun will parse them with its fast native TOML parser.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import config from "./bunfig.toml";
config.logLevel; // => "debug"

// via import attribute:
// import myCustomTOML from './my.config' with {type: "toml"};
```

During bundling, the parsed TOML is inlined into the bundle as a JavaScript object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
var config = {
	logLevel: "debug",
	// ...other fields
};
config.logLevel;
```

If a `.toml` file is passed as an entrypoint, it will be converted to a `.js` module that `export default`s the parsed object.

<CodeGroup>
  ```toml Input theme={"theme":{"light":"github-light","dark":"dracula"}}
  name = "John Doe"
  age = 35
  email = "johndoe@example.com"
  ```

  ```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
  export default {
  	name: "John Doe",
  	age: 35,
  	email: "johndoe@example.com",
  };
  ```
</CodeGroup>

### `text`

**Text loader**. Default for `.txt`.

The contents of the text file are read and inlined into the bundle as a string.
Text files can be directly imported. The file is read and returned as a string.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import contents from "./file.txt";
console.log(contents); // => "Hello, world!"

// To import an html file as text
// The "type' attribute can be used to override the default loader.
import html from "./index.html" with { type: "text" };
```

When referenced during a build, the contents are inlined into the bundle as a string.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
var contents = `Hello, world!`;
console.log(contents);
```

If a `.txt` file is passed as an entrypoint, it will be converted to a `.js` module that `export default`s the file contents.

<CodeGroup>
  ```txt Input theme={"theme":{"light":"github-light","dark":"dracula"}}
  Hello, world!
  ```

  ```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
  export default "Hello, world!";
  ```
</CodeGroup>

### `napi`

**Native addon loader**. Default for `.node`.

In the runtime, native addons can be directly imported.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import addon from "./addon.node";
console.log(addon);
```

In the bundler, `.node` files are handled using the [`file`](#file) loader.

### `sqlite`

**SQLite loader**. `with { "type": "sqlite" }` import attribute

In the runtime and bundler, SQLite databases can be directly imported. This will load the database using [`bun:sqlite`](/runtime/sqlite).

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import db from "./my.db" with { type: "sqlite" };
```

This is only supported when the `target` is `bun`.

By default, the database is external to the bundle (so that you can potentially use a database loaded elsewhere), so the database file on-disk won't be bundled into the final output.

You can change this behavior with the `"embed"` attribute:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// embed the database into the bundle
import db from "./my.db" with { type: "sqlite", embed: "true" };
```

When using a [standalone executable](/bundler/executables), the database is embedded into the single-file executable.

Otherwise, the database to embed is copied into the `outdir` with a hashed filename.

### `html`

The html loader processes HTML files and bundles any referenced assets. It will:

* Bundle and hash referenced JavaScript files (`<script src="...">`)
* Bundle and hash referenced CSS files (`<link rel="stylesheet" href="...">`)
* Hash referenced images (`<img src="...">`)
* Preserve external URLs (by default, anything starting with `http://` or `https://`)

For example, given this HTML file:

<CodeGroup>
  ```html src/index.html theme={"theme":{"light":"github-light","dark":"dracula"}}
  <!DOCTYPE html>
  <html>
  	<body>
  		<img src="./image.jpg" alt="Local image" />
  		<img src="https://example.com/image.jpg" alt="External image" />
  		<script type="module" src="./script.js"></script>
  	</body>
  </html>
  ```
</CodeGroup>

It will output a new HTML file with the bundled assets:

<CodeGroup>
  ```html dist/output.html theme={"theme":{"light":"github-light","dark":"dracula"}}
  <!DOCTYPE html>
  <html>
  	<body>
  		<img src="./image-HASHED.jpg" alt="Local image" />
  		<img src="https://example.com/image.jpg" alt="External image" />
  		<script type="module" src="./output-ALSO-HASHED.js"></script>
  	</body>
  </html>
  ```
</CodeGroup>

Under the hood, it uses [`lol-html`](https://github.com/cloudflare/lol-html) to extract script and link tags as entrypoints, and other assets as external.

Currently, the list of selectors is:

* `audio[src]`
* `iframe[src]`
* `img[src]`
* `img[srcset]`
* `link:not([rel~='stylesheet']):not([rel~='modulepreload']):not([rel~='manifest']):not([rel~='icon']):not([rel~='apple-touch-icon'])[href]`
* `link[as='font'][href], link[type^='font/'][href]`
* `link[as='image'][href]`
* `link[as='style'][href]`
* `link[as='video'][href], link[as='audio'][href]`
* `link[as='worker'][href]`
* `link[rel='icon'][href], link[rel='apple-touch-icon'][href]`
* `link[rel='manifest'][href]`
* `link[rel='stylesheet'][href]`
* `script[src]`
* `source[src]`
* `source[srcset]`
* `video[poster]`
* `video[src]`

<Note>
  **HTML Loader Behavior in Different Contexts**

  The `html` loader behaves differently depending on how it's used:

  1. **Static Build:** When you run `bun build ./index.html`, Bun produces a static site with all assets bundled and hashed.

  2. **Runtime:** When you run `bun run server.ts` (where `server.ts` imports an HTML file), Bun bundles assets on-the-fly during development, enabling features like hot module replacement.

  3. **Full-stack Build:** When you run `bun build --target=bun server.ts` (where `server.ts` imports an HTML file), the import resolves to a manifest object that `Bun.serve` uses to efficiently serve pre-bundled assets in production.
</Note>

### `sh` loader

**Bun Shell loader**. Default for `.sh` files

This loader is used to parse [Bun Shell](/runtime/shell) scripts. It's only supported when starting Bun itself, so it's not available in the bundler or in the runtime.

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run ./script.sh
```

### `file`

**File loader**. Default for all unrecognized file types.

The file loader resolves the import as a *path/URL* to the imported file. It's commonly used for referencing media or font assets.

```ts logo.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
import logo from "./logo.svg";
console.log(logo);
```

*In the runtime*, Bun checks that the `logo.svg` file exists and converts it to an absolute path to the location of `logo.svg` on disk.

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run logo.ts
/path/to/project/logo.svg
```

*In the bundler*, things are slightly different. The file is copied into `outdir` as-is, and the import is resolved as a relative path pointing to the copied file.

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
var logo = "./logo.svg";
console.log(logo);
```

If a value is specified for `publicPath`, the import will use value as a prefix to construct an absolute path/URL.

| Public path                  | Resolved import                    |
| ---------------------------- | ---------------------------------- |
| `""` (default)               | `/logo.svg`                        |
| `"/assets"`                  | `/assets/logo.svg`                 |
| `"https://cdn.example.com/"` | `https://cdn.example.com/logo.svg` |

<Note>
  The location and file name of the copied file is determined by the value of
  [`naming.asset`](/bundler#naming).
</Note>

This loader is copied into the `outdir` as-is. The name of the copied file is determined using the
value of `naming.asset`.

<Accordion title="Fixing TypeScript import errors">
  If you're using TypeScript, you may get an error like this:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  // TypeScript error
  // Cannot find module './logo.svg' or its corresponding type declarations.
  ```

  This can be fixed by creating `*.d.ts` file anywhere in your project (any name will work) with the following contents:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  declare module "*.svg" {
  	const content: string;
  	export default content;
  }
  ```

  This tells TypeScript that any default imports from `.svg` should be treated as a string.
</Accordion>

# Module Resolution

> How Bun resolves modules and handles imports in JavaScript and TypeScript

Module resolution in JavaScript is a complex topic.

The ecosystem is currently in the midst of a years-long transition from CommonJS modules to native ES modules. TypeScript enforces its own set of rules around import extensions that aren't compatible with ESM. Different build tools support path re-mapping via disparate non-compatible mechanisms.

Bun aims to provide a consistent and predictable module resolution system that just works. Unfortunately it's still quite complex.

## Syntax

Consider the following files.

<CodeGroup>
  ```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { hello } from "./hello";

  hello();
  ```

  ```ts hello.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  export function hello() {
  	console.log("Hello world!");
  }
  ```
</CodeGroup>

When we run `index.ts`, it prints "Hello world!".

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun index.ts
Hello world!
```

In this case, we are importing from `./hello`, a relative path with no extension. **Extensioned imports are optional but supported.** To resolve this import, Bun will check for the following files in order:

* `./hello.tsx`
* `./hello.jsx`
* `./hello.ts`
* `./hello.mjs`
* `./hello.js`
* `./hello.cjs`
* `./hello.json`
* `./hello/index.tsx`
* `./hello/index.jsx`
* `./hello/index.ts`
* `./hello/index.mjs`
* `./hello/index.js`
* `./hello/index.cjs`
* `./hello/index.json`

Import paths can optionally include extensions. If an extension is present, Bun will only check for a file with that exact extension.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { hello } from "./hello";
import { hello } from "./hello.ts"; // this works
```

If you import `from "*.js{x}"`, Bun will additionally check for a matching `*.ts{x}` file, to be compatible with TypeScript's [ES module support](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#new-file-extensions).

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { hello } from "./hello";
import { hello } from "./hello.ts"; // this works
import { hello } from "./hello.js"; // this also works
```

Bun supports both ES modules (`import`/`export` syntax) and CommonJS modules (`require()`/`module.exports`). The following CommonJS version would also work in Bun.

<CodeGroup>
  ```ts index.js icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  const { hello } = require("./hello");

  hello();
  ```

  ```ts hello.js icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  function hello() {
  	console.log("Hello world!");
  }

  exports.hello = hello;
  ```
</CodeGroup>

That said, using CommonJS is discouraged in new projects.

***

## Module systems

Bun has native support for CommonJS and ES modules. ES Modules are the recommended module format for new projects, but CommonJS modules are still widely used in the Node.js ecosystem.

In Bun's JavaScript runtime, `require` can be used by both ES Modules and CommonJS modules. If the target module is an ES Module, `require` returns the module namespace object (equivalent to `import * as`). If the target module is a CommonJS module, `require` returns the `module.exports` object (as in Node.js).

| Module Type | `require()`      | `import * as`                                                           |
| ----------- | ---------------- | ----------------------------------------------------------------------- |
| ES Module   | Module Namespace | Module Namespace                                                        |
| CommonJS    | module.exports   | `default` is `module.exports`, keys of module.exports are named exports |

### Using `require()`

You can `require()` any file or package, even `.ts` or `.mjs` files.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const { foo } = require("./foo"); // extensions are optional
const { bar } = require("./bar.mjs");
const { baz } = require("./baz.tsx");
```

<Accordion title="What is a CommonJS module?">
  In 2016, ECMAScript added support for [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). ES Modules are the standard for JavaScript modules. However, millions of npm packages still use CommonJS modules.

  CommonJS modules are modules that use `module.exports` to export values. Typically, `require` is used to import CommonJS modules.

  ```ts my-commonjs.cjs icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
  const stuff = require("./stuff");
  module.exports = { stuff };
  ```

  The biggest difference between CommonJS and ES Modules is that CommonJS modules are synchronous, while ES Modules are asynchronous. There are other differences too.

  * ES Modules support top-level `await` and CommonJS modules don't.
  * ES Modules are always in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode), while CommonJS modules are not.
  * Browsers do not have native support for CommonJS modules, but they do have native support for ES Modules via `<script type="module">`.
  * CommonJS modules are not statically analyzable, while ES Modules only allow static imports and exports.

  **CommonJS Modules:** These are a type of module system used in JavaScript. One key feature of CommonJS modules is that they load and execute synchronously. This means that when you import a CommonJS module, the code in that module runs immediately, and your program waits for it to finish before moving on to the next task. It's similar to reading a book from start to finish without skipping pages.

  **ES Modules (ESM):** These are another type of module system introduced in JavaScript. They have a slightly different behavior compared to CommonJS. In ESM, static imports (imports made using `import` statements) are synchronous, just like CommonJS. This means that when you import an ESM using a regular `import` statement, the code in that module runs immediately, and your program proceeds in a step-by-step manner. Think of it like reading a book page by page.

  **Dynamic imports:** Now, here comes the part that might be confusing. ES Modules also support importing modules on the fly via the `import()` function. This is called a "dynamic import" and it's asynchronous, so it doesn't block the main program execution. Instead, it fetches and loads the module in the background while your program continues to run. Once the module is ready, you can use it. This is like getting additional information from a book while you're still reading it, without having to pause your reading.

  **In summary:**

  * CommonJS modules and static ES Modules (`import` statements) work in a similar synchronous way, like reading a book from start to finish.
  * ES Modules also offer the option to import modules asynchronously using the `import()` function. This is like looking up additional information in the middle of reading the book without stopping.
</Accordion>

### Using `import`

You can `import` any file or package, even `.cjs` files.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { foo } from "./foo"; // extensions are optional
import bar from "./bar.ts";
import { stuff } from "./my-commonjs.cjs";
```

### Using `import` and `require()` together

In Bun, you can use `import` or `require` in the same file—they both work, all the time.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { stuff } from "./my-commonjs.cjs";
import Stuff from "./my-commonjs.cjs";

const myStuff = require("./my-commonjs.cjs");
```

### Top level await

The only exception to this rule is top-level await. You can't `require()` a file that uses top-level await, since the `require()` function is inherently synchronous.

Fortunately, very few libraries use top-level await, so this is rarely a problem. But if you're using top-level await in your application code, make sure that file isn't being `require()` from elsewhere in your application. Instead, you should use `import` or [dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import).

***

## Importing packages

Bun implements the Node.js module resolution algorithm, so you can import packages from `node_modules` with a bare specifier.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { stuff } from "foo";
```

The full specification of this algorithm are officially documented in the [Node.js documentation](https://nodejs.org/api/modules.html); we won't rehash it here. Briefly: if you import `from "foo"`, Bun scans up the file system for a `node_modules` directory containing the package `foo`.

Once it finds the `foo` package, Bun reads the `package.json` to determine how the package should be imported. To determine the package's entrypoint, Bun first reads the `exports` field and checks for the following conditions.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "foo",
	"exports": {
		"bun": "./index.js",
		"node": "./index.js",
		"require": "./index.js", // if importer is CommonJS
		"import": "./index.mjs", // if importer is ES module
		"default": "./index.js"
	}
}
```

Whichever one of these conditions occurs *first* in the `package.json` is used to determine the package's entrypoint.

Bun respects subpath [`"exports"`](https://nodejs.org/api/packages.html#subpath-exports) and [`"imports"`](https://nodejs.org/api/packages.html#imports).

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "foo",
	"exports": {
		".": "./index.js"
	}
}
```

Subpath imports and conditional imports work in conjunction with each other.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "foo",
	"exports": {
		".": {
			"import": "./index.mjs",
			"require": "./index.js"
		}
	}
}
```

As in Node.js, Specifying any subpath in the `"exports"` map will prevent other subpaths from being importable; you can only import files that are explicitly exported. Given the `package.json` above:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import stuff from "foo"; // this works
import stuff from "foo/index.mjs"; // this doesn't
```

<Note>
  **Shipping TypeScript** — Note that Bun supports the special `"bun"` export condition. If your
  library is written in TypeScript, you can publish your (un-transpiled!) TypeScript files to `npm`
  directly. If you specify your package's `*.ts` entrypoint in the `"bun"` condition, Bun will
  directly import and execute your TypeScript source files.
</Note>

If `exports` is not defined, Bun falls back to `"module"` (ESM imports only) then [`"main"`](https://nodejs.org/api/packages.html#main).

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "foo",
	"module": "./index.js",
	"main": "./index.js"
}
```

### Custom conditions

The `--conditions` flag allows you to specify a list of conditions to use when resolving packages from package.json `"exports"`.

This flag is supported in both `bun build` and Bun's runtime.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Use it with bun build:
bun build --conditions="react-server" --target=bun ./app/foo/route.js

# Use it with bun's runtime:
bun --conditions="react-server" ./app/foo/route.js
```

You can also use `conditions` programmatically with `Bun.build`:

```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.build({
	conditions: ["react-server"],
	target: "bun",
	entryPoints: ["./app/foo/route.js"],
});
```

***

## Path re-mapping

In the spirit of treating TypeScript as a first-class citizen, the Bun runtime will re-map import paths according to the [`compilerOptions.paths`](https://www.typescriptlang.org/tsconfig#paths) field in `tsconfig.json`. This is a major divergence from Node.js, which doesn't support any form of import path re-mapping.

```json tsconfig.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"compilerOptions": {
		"paths": {
			"config": ["./config.ts"], // map specifier to file
			"components/*": ["components/*"] // wildcard matching
		}
	}
}
```

If you aren't a TypeScript user, you can create a [`jsconfig.json`](https://code.visualstudio.com/docs/languages/jsconfig) in your project root to achieve the same behavior.

<Accordion title="Low-level details of CommonJS interop in Bun">
  Bun's JavaScript runtime has native support for CommonJS. When Bun's JavaScript transpiler detects usages of `module.exports`, it treats the file as CommonJS. The module loader will then wrap the transpiled module in a function shaped like this:

  ```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
  (function (module, exports, require) {
  	// transpiled module
  })(module, exports, require);
  ```

  `module`, `exports`, and `require` are very much like the `module`, `exports`, and `require` in Node.js. These are assigned via a [`with scope`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with) in C++. An internal `Map` stores the `exports` object to handle cyclical `require` calls before the module is fully loaded.

  Once the CommonJS module is successfully evaluated, a Synthetic Module Record is created with the `default` ES Module [export set to `module.exports`](https://github.com/oven-sh/bun/blob/9b6913e1a674ceb7f670f917fc355bb8758c6c72/src/bun.js/bindings/CommonJSModuleRecord.cpp#L212-L213) and keys of the `module.exports` object are re-exported as named exports (if the `module.exports` object is an object).

  When using Bun's bundler, this works differently. The bundler will wrap the CommonJS module in a `require_${moduleName}` function which returns the `module.exports` object.
</Accordion>

***

## `import.meta`

The `import.meta` object is a way for a module to access information about itself. It's part of the JavaScript language, but its contents are not standardized. Each "host" (browser, runtime, etc) is free to implement any properties it wishes on the `import.meta` object.

Bun implements the following properties.

```ts /path/to/project/file.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
import.meta.dir; // => "/path/to/project"
import.meta.file; // => "file.ts"
import.meta.path; // => "/path/to/project/file.ts"
import.meta.url; // => "file:///path/to/project/file.ts"

import.meta.main; // `true` if this file is directly executed by `bun run`
// `false` otherwise

import.meta.resolve("zod"); // => "file:///path/to/project/node_modules/zod/index.js"
```

| Property               | Description                                                                                                                                                                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `import.meta.dir`      | Absolute path to the directory containing the current file, e.g. `/path/to/project`. Equivalent to `__dirname` in CommonJS modules (and Node.js)                                                                                                                                                                              |
| `import.meta.dirname`  | An alias to `import.meta.dir`, for Node.js compatibility                                                                                                                                                                                                                                                                      |
| `import.meta.env`      | An alias to `process.env`.                                                                                                                                                                                                                                                                                                    |
| `import.meta.file`     | The name of the current file, e.g. `index.tsx`                                                                                                                                                                                                                                                                                |
| `import.meta.path`     | Absolute path to the current file, e.g. `/path/to/project/index.ts`. Equivalent to `__filename` in CommonJS modules (and Node.js)                                                                                                                                                                                             |
| `import.meta.filename` | An alias to `import.meta.path`, for Node.js compatibility                                                                                                                                                                                                                                                                     |
| `import.meta.main`     | Indicates whether the current file is the entrypoint to the current `bun` process. Is the file being directly executed by `bun run` or is it being imported?                                                                                                                                                                  |
| `import.meta.resolve`  | Resolve a module specifier (e.g. `"zod"` or `"./file.tsx"`) to a url. Equivalent to [`import.meta.resolve` in browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta#resolve). Example: `import.meta.resolve("zod")` returns `"file:///path/to/project/node_modules/zod/index.ts"` |
| `import.meta.url`      | A `string` url to the current file, e.g. `file:///path/to/project/index.ts`. Equivalent to [`import.meta.url` in browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta#url)                                                                                                       |

# JSX

> Built-in JSX and TSX support in Bun with configurable transpilation options

Bun supports `.jsx` and `.tsx` files out of the box. Bun's internal transpiler converts JSX syntax into vanilla JavaScript before execution.

```ts react.tsx icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
function Component(props: {message: string}) {
  return (
    <body>
      <h1 style={{color: 'red'}}>{props.message}</h1>
    </body>
  );
}

console.log(<Component message="Hello world!" />);
```

## Configuration

Bun reads your `tsconfig.json` or `jsconfig.json` configuration files to determines how to perform the JSX transform internally. To avoid using either of these, the following options can also be defined in [`bunfig.toml`](/runtime/bunfig).

The following compiler options are respected.

### [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)

How JSX constructs are transformed into vanilla JavaScript internally. The table below lists the possible values of `jsx`, along with their transpilation of the following simple JSX component:

```tsx  theme={"theme":{"light":"github-light","dark":"dracula"}}
<Box width={5}>Hello</Box>
```

| Compiler options                                    | Transpiled output                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `json<br/>{<br/>  "jsx": "react"<br/>}<br/>`        | `tsx<br/>import { createElement } from "react";<br/>createElement("Box", { width: 5 }, "Hello");<br/>`                                                                                                                                                                                                                                                                                                                                                                      |
| `json<br/>{<br/>  "jsx": "react-jsx"<br/>}<br/>`    | `tsx<br/>import { jsx } from "react/jsx-runtime";<br/>jsx("Box", { width: 5 }, "Hello");<br/>`                                                                                                                                                                                                                                                                                                                                                                              |
| `json<br/>{<br/>  "jsx": "react-jsxdev"<br/>}<br/>` | `tsx<br/>import { jsxDEV } from "react/jsx-dev-runtime";<br/>jsxDEV(<br/>  "Box",<br/>  { width: 5, children: "Hello" },<br/>  undefined,<br/>  false,<br/>  undefined,<br/>  this,<br/>);<br/>`<br /><br />The `jsxDEV` variable name is a convention used by React. The `DEV` suffix is a visible way to indicate that the code is intended for use in development. The development version of React is slower and includes additional validity checks & debugging tools. |
| `json<br/>{<br/>  "jsx": "preserve"<br/>}<br/>`     | `tsx<br/>// JSX is not transpiled<br/>// "preserve" is not supported by Bun currently<br/><Box width={5}>Hello</Box><br/>`                                                                                                                                                                                                                                                                                                                                                  |

### [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)

<Note>**Note** — Only applicable when `jsx` is `react`.</Note>

The function name used to represent JSX constructs. Default value is `"createElement"`. This is useful for libraries like [Preact](https://preactjs.com/) that use a different function name (`"h"`).

| Compiler options                                                      | Transpiled output                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `json<br/>{<br/>  "jsx": "react",<br/>  "jsxFactory": "h"<br/>}<br/>` | `tsx<br/>import { h } from "react";<br/>h("Box", { width: 5 }, "Hello");<br/>` |

### [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)

<Note>**Note** — Only applicable when `jsx` is `react`.</Note>

The function name used to represent [JSX fragments](https://react.dev/reference/react/Fragment) such as `<>Hello</>`; only applicable when `jsx` is `react`. Default value is `"Fragment"`.

| Compiler options                                                                                                    | Transpiled output                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `json<br/>{<br/>  "jsx": "react",<br/>  "jsxFactory": "myjsx",<br/>  "jsxFragmentFactory": "MyFragment"<br/>}<br/>` | `tsx<br/>// input<br/><>Hello</>;<br/><br/>// output<br/>import { myjsx, MyFragment } from "react";<br/>myjsx(MyFragment, null, "Hello");<br/>` |

### [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)

<Note>**Note** — Only applicable when `jsx` is `react-jsx` or `react-jsxdev`.</Note>

The module from which the component factory function (`createElement`, `jsx`, `jsxDEV`, etc) will be imported. Default value is `"react"`. This will typically be necessary when using a component library like Preact.

| Compiler options                                                                                                   | Transpiled output                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jsonc<br/>{<br/>  "jsx": "react",<br/>  // jsxImportSource is not defined<br/>  // default to "react"<br/>}<br/>` | `tsx<br/>import { jsx } from "react/jsx-runtime";<br/>jsx("Box", { width: 5, children: "Hello" });<br/>`                                                                                                                                        |
| `jsonc<br/>{<br/>  "jsx": "react-jsx",<br/>  "jsxImportSource": "preact",<br/>}<br/>`                              | `tsx<br/>import { jsx } from "preact/jsx-runtime";<br/>jsx("Box", { width: 5, children: "Hello" });<br/>`                                                                                                                                       |
| `jsonc<br/>{<br/>  "jsx": "react-jsxdev",<br/>  "jsxImportSource": "preact",<br/>}<br/>`                           | `tsx<br/>// /jsx-runtime is automatically appended<br/>import { jsxDEV } from "preact/jsx-dev-runtime";<br/>jsxDEV(<br/>  "Box",<br/>  { width: 5, children: "Hello" },<br/>  undefined,<br/>  false,<br/>  undefined,<br/>  this,<br/>);<br/>` |

### JSX pragma

All of these values can be set on a per-file basis using *pragmas*. A pragma is a special comment that sets a compiler option in a particular file.

| Pragma                                   | Equivalent config                                                  |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `ts<br/>// @jsx h<br/>`                  | `jsonc<br/>{<br/>  "jsxFactory": "h",<br/>}<br/>`                  |
| `ts<br/>// @jsxFrag MyFragment<br/>`     | `jsonc<br/>{<br/>  "jsxFragmentFactory": "MyFragment",<br/>}<br/>` |
| `ts<br/>// @jsxImportSource preact<br/>` | `jsonc<br/>{<br/>  "jsxImportSource": "preact",<br/>}<br/>`        |

## Logging

Bun implements special logging for JSX to make debugging easier. Given the following file:

```tsx index.tsx icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Stack, UserCard } from "./components";

console.log(
	<Stack>
		<UserCard name="Dom" bio="Street racer and Corona lover" />
		<UserCard name="Jakob" bio="Super spy and Dom's secret brother" />
	</Stack>,
);
```

Bun will pretty-print the component tree when logged:

<Frame>
  ![JSX logging
  output](https://github.com/oven-sh/bun/assets/3084745/d29db51d-6837-44e2-b8be-84fc1b9e9d97)
</Frame>

## Prop punning

The Bun runtime also supports "prop punning" for JSX. This is a shorthand syntax useful for assigning a variable to a prop with the same name.

```tsx react.tsx icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
function Div(props: {className: string;}) {
  const {className} = props;

  // without punning
  return <div className={className} />;
  // with punning
  return <div {className} />;
}
```

# Auto-install

> Bun's automatic package installation feature for standalone script execution

If no `node_modules` directory is found in the working directory or higher, Bun will abandon Node.js-style module resolution in favor of the **Bun module resolution algorithm**.

Under Bun-style module resolution, all imported packages are auto-installed on the fly into a [global module cache](/pm/global-cache) during execution (the same cache used by [`bun install`](/pm/cli/install)).

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { foo } from "foo"; // install `latest` version

foo();
```

The first time you run this script, Bun will auto-install `"foo"` and cache it. The next time you run the script, it will use the cached version.

***

## Version resolution

To determine which version to install, Bun follows the following algorithm:

1. Check for a `bun.lock` file in the project root. If it exists, use the version specified in the lockfile.
2. Otherwise, scan up the tree for a `package.json` that includes `"foo"` as a dependency. If found, use the specified semver version or version range.
3. Otherwise, use `latest`.

***

## Cache behavior

Once a version or version range has been determined, Bun will:

1. Check the module cache for a compatible version. If one exists, use it.
2. When resolving `latest`, Bun will check if `package@latest` has been downloaded and cached in the last *24 hours*. If so, use it.
3. Otherwise, download and install the appropriate version from the `npm` registry.

***

## Installation

Packages are installed and cached into `<cache>/<pkg>@<version>`, so multiple versions of the same package can be cached at once. Additionally, a symlink is created under `<cache>/<pkg>/<version>` to make it faster to look up all versions of a package that exist in the cache.

***

## Version specifiers

This entire resolution algorithm can be short-circuited by specifying a version or version range directly in your import statement.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { z } from "zod@3.0.0"; // specific version
import { z } from "zod@next"; // npm tag
import { z } from "zod@^3.20.0"; // semver range
```

***

## Benefits

This auto-installation approach is useful for a few reasons:

* **Space efficiency** — Each version of a dependency only exists in one place on disk. This is a huge space and time savings compared to redundant per-project installations.
* **Portability** — To share simple scripts and gists, your source file is *self-contained*. No need to `zip` together a directory containing your code and config files. With version specifiers in `import` statements, even a `package.json` isn't necessary.
* **Convenience** — There's no need to run `npm install` or `bun install` before running a file or script. Just `bun run` it.
* **Backwards compatibility** — Because Bun still respects the versions specified in `package.json` if one exists, you can switch to Bun-style resolution with a single command: `rm -rf node_modules`.

***

## Limitations

* No Intellisense. TypeScript auto-completion in IDEs relies on the existence of type declaration files inside `node_modules`. We are investigating various solutions to this.
* No [patch-package](https://github.com/ds300/patch-package) support

***

## FAQ

<AccordionGroup>
  <Accordion title="How is this different from what pnpm does?">
    With pnpm, you have to run `pnpm install`, which creates a `node_modules` folder of symlinks for the runtime to resolve. By contrast, Bun resolves dependencies on the fly when you run a file; there's no need to run any `install` command ahead of time. Bun also doesn't create a `node_modules` folder.
  </Accordion>

  <Accordion title="How is this different from Yarn Plug'N'Play does?">
    With Yarn, you must run `yarn install` before you run a script. By contrast, Bun resolves dependencies on the fly when you run a file; there's no need to run any `install` command ahead of time.

    Yarn Plug'N'Play also uses zip files to store dependencies. This makes dependency loading [slower at runtime](https://twitter.com/jarredsumner/status/1458207919636287490), as random access reads on zip files tend to be slower than the equivalent disk lookup.
  </Accordion>

  <Accordion title="How is this different from what Deno does?">
    Deno requires an `npm:` specifier before each npm `import`, lacks support for import maps via `compilerOptions.paths` in `tsconfig.json`, and has incomplete support for `package.json` settings. Unlike Deno, Bun does not currently support URL imports.
  </Accordion>
</AccordionGroup>

# Plugins

> Universal plugin API for extending Bun's runtime and bundler

Bun provides a universal plugin API that can be used to extend both the *runtime* and *bundler*.

Plugins intercept imports and perform custom loading logic: reading files, transpiling code, etc. They can be used to add support for additional file types, like `.scss` or `.yaml`. In the context of Bun's bundler, plugins can be used to implement framework-level features like CSS extraction, macros, and client-server code co-location.

## Lifecycle hooks

Plugins can register callbacks to be run at various points in the lifecycle of a bundle:

* [`onStart()`](#onstart): Run once the bundler has started a bundle
* [`onResolve()`](#onresolve): Run before a module is resolved
* [`onLoad()`](#onload): Run before a module is loaded.
* [`onBeforeParse()`](#onbeforeparse): Run zero-copy native addons in the parser thread before a file is parsed.

### Reference

A rough overview of the types (please refer to Bun's `bun.d.ts` for the full type definitions):

```ts Plugin Types icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
type PluginBuilder = {
	onStart(callback: () => void): void;
	onResolve: (
		args: { filter: RegExp; namespace?: string },
		callback: (args: { path: string; importer: string }) => {
			path: string;
			namespace?: string;
		} | void,
	) => void;
	onLoad: (
		args: { filter: RegExp; namespace?: string },
		defer: () => Promise<void>,
		callback: (args: { path: string }) => {
			loader?: Loader;
			contents?: string;
			exports?: Record<string, any>;
		},
	) => void;
	config: BuildConfig;
};

type Loader = "js" | "jsx" | "ts" | "tsx" | "css" | "json" | "toml";
```

## Usage

A plugin is defined as simple JavaScript object containing a `name` property and a `setup` function.

```tsx myPlugin.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from "bun";

const myPlugin: BunPlugin = {
	name: "Custom loader",
	setup(build) {
		// implementation
	},
};
```

This plugin can be passed into the `plugins` array when calling `Bun.build`.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.build({
	entrypoints: ["./app.ts"],
	outdir: "./out",
	plugins: [myPlugin],
});
```

## Plugin lifecycle

### Namespaces

`onLoad` and `onResolve` accept an optional `namespace` string. What is a namespace?

Every module has a namespace. Namespaces are used to prefix the import in transpiled code; for instance, a loader with a `filter: /\.yaml$/` and `namespace: "yaml:"` will transform an import from `./myfile.yaml` into `yaml:./myfile.yaml`.

The default namespace is `"file"` and it is not necessary to specify it, for instance: `import myModule from "./my-module.ts"` is the same as `import myModule from "file:./my-module.ts"`.

Other common namespaces are:

* `"bun"`: for Bun-specific modules (e.g. `"bun:test"`, `"bun:sqlite"`)
* `"node"`: for Node.js modules (e.g. `"node:fs"`, `"node:path"`)

### `onStart`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
onStart(callback: () => void): Promise<void> | void;
```

Registers a callback to be run when the bundler starts a new bundle.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { plugin } from "bun";

plugin({
	name: "onStart example",

	setup(build) {
		build.onStart(() => {
			console.log("Bundle started!");
		});
	},
});
```

The callback can return a `Promise`. After the bundle process has initialized, the bundler waits until all `onStart()` callbacks have completed before continuing.

For example:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const result = await Bun.build({
	entrypoints: ["./app.ts"],
	outdir: "./dist",
	sourcemap: "external",
	plugins: [
		{
			name: "Sleep for 10 seconds",
			setup(build) {
				build.onStart(async () => {
					await Bunlog.sleep(10_000);
				});
			},
		},
		{
			name: "Log bundle time to a file",
			setup(build) {
				build.onStart(async () => {
					const now = Date.now();
					await Bun.$`echo ${now} > bundle-time.txt`;
				});
			},
		},
	],
});
```

In the above example, Bun will wait until the first `onStart()` (sleeping for 10 seconds) has completed, *as well as* the second `onStart()` (writing the bundle time to a file).

Note that `onStart()` callbacks (like every other lifecycle callback) do not have the ability to modify the `build.config` object. If you want to mutate `build.config`, you must do so directly in the `setup()` function.

### `onResolve`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
onResolve(
  args: { filter: RegExp; namespace?: string },
  callback: (args: { path: string; importer: string }) => {
    path: string;
    namespace?: string;
  } | void,
): void;
```

To bundle your project, Bun walks down the dependency tree of all modules in your project. For each imported module, Bun actually has to find and read that module. The "finding" part is known as "resolving" a module.

The `onResolve()` plugin lifecycle callback allows you to configure how a module is resolved.

The first argument to `onResolve()` is an object with a `filter` and [`namespace`](#what-is-a-namespace) property. The filter is a regular expression which is run on the import string. Effectively, these allow you to filter which modules your custom resolution logic will apply to.

The second argument to `onResolve()` is a callback which is run for each module import Bun finds that matches the `filter` and `namespace` defined in the first argument.

The callback receives as input the *path* to the matching module. The callback can return a *new path* for the module. Bun will read the contents of the *new path* and parse it as a module.

For example, redirecting all imports to `images/` to `./public/images/`:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { plugin } from "bun";

plugin({
	name: "onResolve example",
	setup(build) {
		build.onResolve({ filter: /.*/, namespace: "file" }, args => {
			if (args.path.startsWith("images/")) {
				return {
					path: args.path.replace("images/", "./public/images/"),
				};
			}
		});
	},
});
```

### `onLoad`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
onLoad(
  args: { filter: RegExp; namespace?: string },
  defer: () => Promise<void>,
  callback: (args: { path: string, importer: string, namespace: string, kind: ImportKind  }) => {
    loader?: Loader;
    contents?: string;
    exports?: Record<string, any>;
  },
): void;
```

After Bun's bundler has resolved a module, it needs to read the contents of the module and parse it.

The `onLoad()` plugin lifecycle callback allows you to modify the *contents* of a module before it is read and parsed by Bun.

Like `onResolve()`, the first argument to `onLoad()` allows you to filter which modules this invocation of `onLoad()` will apply to.

The second argument to `onLoad()` is a callback which is run for each matching module *before* Bun loads the contents of the module into memory.

This callback receives as input the *path* to the matching module, the *importer* of the module (the module that imported the module), the *namespace* of the module, and the *kind* of the module.

The callback can return a new `contents` string for the module as well as a new `loader`.

For example:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { plugin } from "bun";

const envPlugin: BunPlugin = {
  name: "env plugin",
  setup(build) {
    build.onLoad({ filter: /env/, namespace: "file" }, args => {
      return {
        contents: `export default ${JSON.stringify(process.env)}`,
        loader: "js",
      };
    });
  },
});

Bun.build({
  entrypoints: ["./app.ts"],
  outdir: "./dist",
  plugins: [envPlugin],
});

// import env from "env"
// env.FOO === "bar"
```

This plugin will transform all imports of the form `import env from "env"` into a JavaScript module that exports the current environment variables.

#### `.defer()`

One of the arguments passed to the `onLoad` callback is a `defer` function. This function returns a `Promise` that is resolved when all *other* modules have been loaded.

This allows you to delay execution of the `onLoad` callback until all other modules have been loaded.

This is useful for returning contents of a module that depends on other modules.

##### Example: tracking and reporting unused exports

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { plugin } from "bun";

plugin({
	name: "track imports",
	setup(build) {
		const transpiler = new Bun.Transpiler();

		let trackedImports: Record<string, number> = {};

		// Each module that goes through this onLoad callback
		// will record its imports in `trackedImports`
		build.onLoad({ filter: /\.ts/ }, async ({ path }) => {
			const contents = await Bun.file(path).arrayBuffer();

			const imports = transpiler.scanImports(contents);

			for (const i of imports) {
				trackedImports[i.path] = (trackedImports[i.path] || 0) + 1;
			}

			return undefined;
		});

		build.onLoad({ filter: /stats\.json/ }, async ({ defer }) => {
			// Wait for all files to be loaded, ensuring
			// that every file goes through the above `onLoad()` function
			// and their imports tracked
			await defer();

			// Emit JSON containing the stats of each import
			return {
				contents: `export default ${JSON.stringify(trackedImports)}`,
				loader: "json",
			};
		});
	},
});
```

Note that the `.defer()` function currently has the limitation that it can only be called once per `onLoad` callback.

## Native plugins

One of the reasons why Bun's bundler is so fast is that it is written in native code and leverages multi-threading to load and parse modules in parallel.

However, one limitation of plugins written in JavaScript is that JavaScript itself is single-threaded.

Native plugins are written as [NAPI](/runtime/node-api) modules and can be run on multiple threads. This allows native plugins to run much faster than JavaScript plugins.

In addition, native plugins can skip unnecessary work such as the UTF-8 -> UTF-16 conversion needed to pass strings to JavaScript.

These are the following lifecycle hooks which are available to native plugins:

* [`onBeforeParse()`](#onbeforeparse): Called on any thread before a file is parsed by Bun's bundler.

Native plugins are NAPI modules which expose lifecycle hooks as C ABI functions.

To create a native plugin, you must export a C ABI function which matches the signature of the native lifecycle hook you want to implement.

### Creating a native plugin in Rust

Native plugins are NAPI modules which expose lifecycle hooks as C ABI functions.

To create a native plugin, you must export a C ABI function which matches the signature of the native lifecycle hook you want to implement.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add -g @napi-rs/cli
napi new
```

Then install this crate:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
cargo add bun-native-plugin
```

Now, inside the `lib.rs` file, we'll use the `bun_native_plugin::bun` proc macro to define a function which
will implement our native plugin.

Here's an example implementing the `onBeforeParse` hook:

```rs lib.rs icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/rust.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a19fdd19ab10419707f1ba90fa0a2cde" theme={"theme":{"light":"github-light","dark":"dracula"}}
use bun_native_plugin::{define_bun_plugin, OnBeforeParse, bun, Result, anyhow, BunLoader};
use napi_derive::napi;

/// Define the plugin and its name
define_bun_plugin!("replace-foo-with-bar");

/// Here we'll implement `onBeforeParse` with code that replaces all occurrences of
/// `foo` with `bar`.
///
/// We use the #[bun] macro to generate some of the boilerplate code.
///
/// The argument of the function (`handle: &mut OnBeforeParse`) tells
/// the macro that this function implements the `onBeforeParse` hook.
#[bun]
pub fn replace_foo_with_bar(handle: &mut OnBeforeParse) -> Result<()> {
  // Fetch the input source code.
  let input_source_code = handle.input_source_code()?;

  // Get the Loader for the file
  let loader = handle.output_loader();


  let output_source_code = input_source_code.replace("foo", "bar");

  handle.set_output_source_code(output_source_code, BunLoader::BUN_LOADER_JSX);

  Ok(())
}
```

And to use it in Bun.build():

```typescript  theme={"theme":{"light":"github-light","dark":"dracula"}}
import myNativeAddon from "./my-native-addon";
Bun.build({
	entrypoints: ["./app.tsx"],
	plugins: [
		{
			name: "my-plugin",

			setup(build) {
				build.onBeforeParse(
					{
						namespace: "file",
						filter: "**/*.tsx",
					},
					{
						napiModule: myNativeAddon,
						symbol: "replace_foo_with_bar",
						// external: myNativeAddon.getSharedState()
					},
				);
			},
		},
	],
});
```

### `onBeforeParse`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
onBeforeParse(
  args: { filter: RegExp; namespace?: string },
  callback: { napiModule: NapiModule; symbol: string; external?: unknown },
): void;
```

This lifecycle callback is run immediately before a file is parsed by Bun's bundler.

As input, it receives the file's contents and can optionally return new source code.

This callback can be called from any thread and so the napi module implementation must be thread-safe.

# File System Router

> Bun provides a fast API for resolving routes against file-system paths

This API is primarily intended for library authors. At the moment only Next.js-style file-system routing is supported, but other styles may be added in the future.

## Next.js-style

The `FileSystemRouter` class can resolve routes against a `pages` directory. (The Next.js 13 `app` directory is not yet supported.) Consider the following `pages` directory:

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
pages
├── index.tsx
├── settings.tsx
├── blog
│   ├── [slug].tsx
│   └── index.tsx
└── [[...catchall]].tsx
```

The `FileSystemRouter` can be used to resolve routes against this directory:

```ts router.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: "./pages",
  origin: "https://mydomain.com",
  assetPrefix: "_next/static/"
});

router.match("/");

// =>
{
  filePath: "/path/to/pages/index.tsx",
  kind: "exact",
  name: "/",
  pathname: "/",
  src: "https://mydomain.com/_next/static/pages/index.tsx"
}
```

Query parameters will be parsed and returned in the `query` property.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
router.match("/settings?foo=bar");

// =>
{
  filePath: "/Users/colinmcd94/Documents/bun/fun/pages/settings.tsx",
  kind: "dynamic",
  name: "/settings",
  pathname: "/settings?foo=bar",
  src: "https://mydomain.com/_next/static/pages/settings.tsx",
  query: {
    foo: "bar"
  }
}
```

The router will automatically parse URL parameters and return them in the `params` property:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
router.match("/blog/my-cool-post");

// =>
{
  filePath: "/Users/colinmcd94/Documents/bun/fun/pages/blog/[slug].tsx",
  kind: "dynamic",
  name: "/blog/[slug]",
  pathname: "/blog/my-cool-post",
  src: "https://mydomain.com/_next/static/pages/blog/[slug].tsx",
  params: {
    slug: "my-cool-post"
  }
}
```

The `.match()` method also accepts `Request` and `Response` objects. The `url` property will be used to resolve the route.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
router.match(new Request("https://example.com/blog/my-cool-post"));
```

The router will read the directory contents on initialization. To re-scan the files, use the `.reload()` method.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
router.reload();
```

## Reference

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
interface Bun {
  class FileSystemRouter {
    constructor(params: {
      dir: string;
      style: "nextjs";
      origin?: string;
      assetPrefix?: string;
      fileExtensions?: string[];
    });

    reload(): void;

    match(path: string | Request | Response): {
      filePath: string;
      kind: "exact" | "catch-all" | "optional-catch-all" | "dynamic";
      name: string;
      pathname: string;
      src: string;
      params?: Record<string, string>;
      query?: Record<string, string>;
    } | null
  }
}
```


