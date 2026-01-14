# Bundler

> Bun's fast native bundler for JavaScript, TypeScript, JSX, and more

export const name_0 = undefined

Bun's fast native bundler can be used via the `bun build` CLI command or the `Bun.build()` JavaScript API.

### At a Glance

* JS API: `await Bun.build({ entrypoints, outdir })`
* CLI: `bun build <entry> --outdir ./out`
* Watch: `--watch` for incremental rebuilds
* Targets: `--target browser|bun|node`
* Formats: `--format esm|cjs|iife` (experimental for cjs/iife)

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './build',
    });
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./build
    ```
  </Tab>
</Tabs>

It's fast. The numbers below represent performance on esbuild's [three.js benchmark](https://github.com/oven-sh/bun/tree/main/bench/bundle).

<Frame>
  <img src="https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/bundler-speed.png?fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=0a549e542fceb7d51f84976fe1d151e4" caption="Bundling 10 copies of three.js from scratch, with sourcemaps and minification" data-og-width="2690" width="2690" data-og-height="1072" height="1072" data-path="images/bundler-speed.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/bundler-speed.png?w=280&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=c92e84677eb9da86699582482f7d0752 280w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/bundler-speed.png?w=560&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=de00bc18218a9e7e4a710f88ab82d6f7 560w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/bundler-speed.png?w=840&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=07d97d8810d903fe052476caddbc2646 840w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/bundler-speed.png?w=1100&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=6ad21a681255af55a711bbceccfef746 1100w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/bundler-speed.png?w=1650&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=8decffe83aa2e455b19b1c389214994e 1650w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/bundler-speed.png?w=2500&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=5db3e9a0ef08d32d43b64d35c7626895 2500w" />
</Frame>

## Why bundle?

The bundler is a key piece of infrastructure in the JavaScript ecosystem. As a brief overview of why bundling is so important:

* **Reducing HTTP requests.** A single package in `node_modules` may consist of hundreds of files, and large applications may have dozens of such dependencies. Loading each of these files with a separate HTTP request becomes untenable very quickly, so bundlers are used to convert our application source code into a smaller number of self-contained "bundles" that can be loaded with a single request.
* **Code transforms.** Modern apps are commonly built with languages or tools like TypeScript, JSX, and CSS modules, all of which must be converted into plain JavaScript and CSS before they can be consumed by a browser. The bundler is the natural place to configure these transformations.
* **Framework features.** Frameworks rely on bundler plugins & code transformations to implement common patterns like file-system routing, client-server code co-location (think `getServerSideProps` or Remix loaders), and server components.
* **Full-stack Applications.** Bun's bundler can handle both server and client code in a single command, enabling optimized production builds and single-file executables. With build-time HTML imports, you can bundle your entire application — frontend assets and backend server — into a single deployable unit.

Let's jump into the bundler API.

<Note>
  The Bun bundler is not intended to replace `tsc` for typechecking or generating type declarations.
</Note>

## Basic example

Let's build our first bundle. You have the following two files, which implement a simple client-side rendered React app.

<CodeGroup>
  ```tsx index.tsx icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import * as ReactDOM from "react-dom/client";
  import { Component } from "./Component";

  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(<Component message="Sup!" />);
  ```

  ```tsx Component.tsx icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  export function Component(props: { message: string }) {
  	return <h1>{props.message}</h1>;
  }
  ```
</CodeGroup>

Here, `index.tsx` is the "entrypoint" to our application. Commonly, this will be a script that performs some side effect, like starting a server or—in this case—initializing a React root. Because we're using TypeScript & JSX, we need to bundle our code before it can be sent to the browser.

To create our bundle:

<CodeGroup>
  ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  await Bun.build({
  	entrypoints: ["./index.tsx"],
  	outdir: "./out",
  });
  ```

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun build ./index.tsx --outdir ./out
  ```
</CodeGroup>

For each file specified in `entrypoints`, Bun will generate a new bundle. This bundle will be written to disk in the `./out` directory (as resolved from the current working directory). After running the build, the file system looks like this:

```text title="file system" icon="folder-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
.
├── index.tsx
├── Component.tsx
└── out
    └── index.js
```

The contents of `out/index.js` will look something like this:

```ts title="out/index.js" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
// out/index.js
// ...
// ~20k lines of code
// including the contents of `react-dom/client` and all its dependencies
// this is where the $jsxDEV and $createRoot functions are defined

// Component.tsx
function Component(props) {
	return $jsxDEV(
		"p",
		{
			children: props.message,
		},
		undefined,
		false,
		undefined,
		this,
	);
}

// index.tsx
var rootNode = document.getElementById("root");
var root = $createRoot(rootNode);
root.render(
	$jsxDEV(
		Component,
		{
			message: "Sup!",
		},
		undefined,
		false,
		undefined,
		this,
	),
);
```

## Watch mode

Like the runtime and test runner, the bundler supports watch mode natively.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./index.tsx --outdir ./out --watch
```

## Content types

Like the Bun runtime, the bundler supports an array of file types out of the box. The following table breaks down the bundler's set of standard "loaders". Refer to [Bundler > File types](/bundler/loaders) for full documentation.

| Extensions                                            | Details                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.js` `.jsx` `.cjs` `.mjs` `.mts` `.cts` `.ts` `.tsx` | Uses Bun's built-in transpiler to parse the file and transpile TypeScript/JSX syntax to vanilla JavaScript. The bundler executes a set of default transforms including dead code elimination and tree shaking. At the moment Bun does not attempt to down-convert syntax; if you use recently ECMAScript syntax, that will be reflected in the bundled code. |
| `.json`                                               | JSON files are parsed and inlined into the bundle as a JavaScript object.<br /><br />`js<br/>import pkg from "./package.json";<br/>pkg.name; // => "my-package"<br/>`                                                                                                                                                                                        |
| `.toml`                                               | TOML files are parsed and inlined into the bundle as a JavaScript object.<br /><br />`js<br/>import config from "./bunfig.toml";<br/>config.logLevel; // => "debug"<br/>`                                                                                                                                                                                    |
| `.txt`                                                | The contents of the text file are read and inlined into the bundle as a string.<br /><br />`js<br/>import contents from "./file.txt";<br/>console.log(contents); // => "Hello, world!"<br/>`                                                                                                                                                                 |
| `.node` `.wasm`                                       | These files are supported by the Bun runtime, but during bundling they are treated as assets.                                                                                                                                                                                                                                                                |

### Assets

If the bundler encounters an import with an unrecognized extension, it treats the imported file as an external file. The referenced file is copied as-is into `outdir`, and the import is resolved as a path to the file.

<CodeGroup>
  ```ts Input icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  // bundle entrypoint
  import logo from "./logo.svg";
  console.log(logo);
  ```

  ```ts Output icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
  // bundled output
  var logo = "./logo-a7305bdef.svg";
  console.log(logo);
  ```
</CodeGroup>

The exact behavior of the file loader is also impacted by [`naming`](#naming) and [`publicPath`](#publicpath).

<Info>
  Refer to the [Bundler > Loaders](/bundler/loaders) page for more complete documentation on the
  file loader.
</Info>

### Plugins

The behavior described in this table can be overridden or extended with plugins. Refer to the [Bundler > Loaders](/bundler/loaders) page for complete documentation.

## API

### entrypoints

<Badge>Required</Badge>

An array of paths corresponding to the entrypoints of our application. One bundle will be generated for each entrypoint.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    const result = await Bun.build({
      entrypoints: ["./index.ts"],
    });
    // => { success: boolean, outputs: BuildArtifact[], logs: BuildMessage[] }
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.ts
    ```
  </Tab>
</Tabs>

### outdir

The directory where output files will be written.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    const result = await Bun.build({
      entrypoints: ['./index.ts'],
      outdir: './out'
    });
    // => { success: boolean, outputs: BuildArtifact[], logs: BuildMessage[] }
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.ts --outdir ./out
    ```
  </Tab>
</Tabs>

If `outdir` is not passed to the JavaScript API, bundled code will not be written to disk. Bundled files are returned in an array of `BuildArtifact` objects. These objects are Blobs with extra properties; see [Outputs](#outputs) for complete documentation.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const result = await Bun.build({
	entrypoints: ["./index.ts"],
});

for (const res of result.outputs) {
	// Can be consumed as blobs
	await res.text();

	// Bun will set Content-Type and Etag headers
	new Response(res);

	// Can be written manually, but you should use `outdir` in this case.
	Bun.write(path.join("out", res.path), res);
}
```

When `outdir` is set, the `path` property on a `BuildArtifact` will be the absolute path to where it was written to.

### target

The intended execution environment for the bundle.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.ts'],
      outdir: './out',
      target: 'browser', // default
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.ts --outdir ./out --target browser
    ```
  </Tab>
</Tabs>

Depending on the target, Bun will apply different module resolution rules and optimizations.

<Card title="browser" icon="globe">
  **Default.** For generating bundles that are intended for execution by a browser. Prioritizes the
  `"browser"` export condition when resolving imports. Importing any built-in modules, like
  `node:events` or `node:path` will work, but calling some functions, like `fs.readFile` will not
  work.
</Card>

<Card title="bun" icon="server">
  For generating bundles that are intended to be run by the Bun runtime. In many cases, it isn't necessary to bundle server-side code; you can directly execute the source code without modification. However, bundling your server code can reduce startup times and improve running performance. This is the target to use for building full-stack applications with build-time HTML imports, where both server and client code are bundled together.

  All bundles generated with `target: "bun"` are marked with a special `// @bun` pragma, which indicates to the Bun runtime that there's no need to re-transpile the file before execution.

  If any entrypoints contains a Bun shebang (`#!/usr/bin/env bun`) the bundler will default to `target: "bun"` instead of `"browser"`.

  When using `target: "bun"` and `format: "cjs"` together, the `// @bun @bun-cjs` pragma is added and the CommonJS wrapper function is not compatible with Node.js.
</Card>

<Card title="node" icon="node">
  For generating bundles that are intended to be run by Node.js. Prioritizes the `"node"` export
  condition when resolving imports, and outputs `.mjs`. In the future, this will automatically
  polyfill the Bun global and other built-in `bun:*` modules, though this is not yet implemented.
</Card>

### format

Specifies the module format to be used in the generated bundles.

Bun defaults to `"esm"`, and provides experimental support for `"cjs"` and `"iife"`.

#### format: "esm" - ES Module

This is the default format, which supports ES Module syntax including top-level await, `import.meta`, and more.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      format: "esm",
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --format esm
    ```
  </Tab>
</Tabs>

To use ES Module syntax in browsers, set `format` to `"esm"` and make sure your `<script type="module">` tag has `type="module"` set.

#### format: "cjs" - CommonJS

To build a CommonJS module, set `format` to `"cjs"`. When choosing `"cjs"`, the default target changes from `"browser"` (esm) to `"node"` (cjs). CommonJS modules transpiled with `format: "cjs"`, `target: "node"` can be executed in both Bun and Node.js (assuming the APIs in use are supported by both).

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      format: "cjs",
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --format cjs
    ```
  </Tab>
</Tabs>

#### format: "iife" - IIFE

TODO: document IIFE once we support globalNames.

### `jsx`

Configure JSX transform behavior. Allows fine-grained control over how JSX is compiled.

**Classic runtime example** (uses `factory` and `fragment`):

<CodeGroup>
  ```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  await Bun.build({
  	entrypoints: ["./app.tsx"],
  	outdir: "./out",
  	jsx: {
  		factory: "h",
  		fragment: "Fragment",
  		runtime: "classic",
  	},
  });
  ```

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  # JSX configuration is handled via bunfig.toml or tsconfig.json
  bun build ./app.tsx --outdir ./out
  ```
</CodeGroup>

**Automatic runtime example** (uses `importSource`):

<CodeGroup>
  ```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  await Bun.build({
  	entrypoints: ["./app.tsx"],
  	outdir: "./out",
  	jsx: {
  		importSource: "preact",
  		runtime: "automatic",
  	},
  });
  ```

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  # JSX configuration is handled via bunfig.toml or tsconfig.json
  bun build ./app.tsx --outdir ./out
  ```
</CodeGroup>

### splitting

Whether to enable code splitting.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      splitting: false, // default
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --splitting
    ```
  </Tab>
</Tabs>

When `true`, the bundler will enable code splitting. When multiple entrypoints both import the same file, module, or set of files/modules, it's often useful to split the shared code into a separate bundle. This shared bundle is known as a chunk. Consider the following files:

<CodeGroup>
  ```ts entry-a.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { shared } from "./shared.ts";
  ```

  ```ts entry-b.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { shared } from "./shared.ts";
  ```

  ```ts shared.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  export const shared = "shared";
  ```
</CodeGroup>

To bundle `entry-a.ts` and `entry-b.ts` with code-splitting enabled:

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./entry-a.ts', './entry-b.ts'],
      outdir: './out',
      splitting: true,
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./entry-a.ts ./entry-b.ts --outdir ./out --splitting
    ```
  </Tab>
</Tabs>

Running this build will result in the following files:

```text title="file system" icon="folder-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
.
├── entry-a.tsx
├── entry-b.tsx
├── shared.tsx
└── out
    ├── entry-a.js
    ├── entry-b.js
    └── chunk-2fce6291bf86559d.js
```

The generated `chunk-2fce6291bf86559d.js` file contains the shared code. To avoid collisions, the file name automatically includes a content hash by default. This can be customized with [`naming`](#naming).

### plugins

A list of plugins to use during bundling.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.build({
	entrypoints: ["./index.tsx"],
	outdir: "./out",
	plugins: [
		/* ... */
	],
});
```

Bun implements a universal plugin system for both Bun's runtime and bundler. Refer to the [plugin documentation](/bundler/plugins) for complete documentation.

### env

Controls how environment variables are handled during bundling. Internally, this uses `define` to inject environment variables into the bundle, but makes it easier to specify the environment variables to inject.

#### env: "inline"

Injects environment variables into the bundled output by converting `process.env.FOO` references to string literals containing the actual environment variable values.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      env: "inline",
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --env inline
    ```
  </Tab>
</Tabs>

For the input below:

```ts title="input.js" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
// input.js
console.log(process.env.FOO);
console.log(process.env.BAZ);
```

The generated bundle will contain the following code:

```ts title="output.js" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
// output.js
console.log("bar");
console.log("123");
```

#### env: "PUBLIC\_\*" (prefix)

Inlines environment variables matching the given prefix (the part before the `*` character), replacing `process.env.FOO` with the actual environment variable value. This is useful for selectively inlining environment variables for things like public-facing URLs or client-side tokens, without worrying about injecting private credentials into output bundles.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      
      // Inline all env vars that start with "ACME_PUBLIC_"
      env: "ACME_PUBLIC_*",
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --env ACME_PUBLIC_*
    ```
  </Tab>
</Tabs>

For example, given the following environment variables:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
FOO=bar BAZ=123 ACME_PUBLIC_URL=https://acme.com
```

And source code:

```tsx index.tsx icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(process.env.FOO);
console.log(process.env.ACME_PUBLIC_URL);
console.log(process.env.BAZ);
```

The generated bundle will contain the following code:

```ts title="output.js" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(process.env.FOO);
console.log("https://acme.com");
console.log(process.env.BAZ);
```

#### env: "disable"

Disables environment variable injection entirely.

### sourcemap

Specifies the type of sourcemap to generate.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      sourcemap: 'linked', // default 'none'
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --sourcemap linked
    ```
  </Tab>
</Tabs>

| Value        | Description                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"none"`     | Default. No sourcemap is generated.                                                                                                                                                                                                                                                                                                                                                                 |
| `"linked"`   | A separate `*.js.map` file is created alongside each `*.js` bundle using a `//# sourceMappingURL` comment to link the two. Requires `--outdir` to be set. The base URL of this can be customized with `--public-path`.<br /><br />`js<br/>// <bundled code here><br/><br/>//# sourceMappingURL=bundle.js.map<br/>`                                                                                  |
| `"external"` | A separate `*.js.map` file is created alongside each `*.js` bundle without inserting a `//# sourceMappingURL` comment.<br /><br />Generated bundles contain a debug id that can be used to associate a bundle with its corresponding sourcemap. This `debugId` is added as a comment at the bottom of the file.<br /><br />`js<br/>// <generated bundle code><br/><br/>//# debugId=<DEBUG ID><br/>` |
| `"inline"`   | A sourcemap is generated and appended to the end of the generated bundle as a base64 payload.<br /><br />`js<br/>// <bundled code here><br/><br/>//# sourceMappingURL=data:application/json;base64,<encoded sourcemap here><br/>`                                                                                                                                                                   |

The associated `*.js.map` sourcemap will be a JSON file containing an equivalent `debugId` property.

### minify

Whether to enable minification. Default `false`.

<Note>When targeting `bun`, identifiers will be minified by default.</Note>

To enable all minification options:

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      minify: true, // default false
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --minify
    ```
  </Tab>
</Tabs>

To granularly enable certain minifications:

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      minify: {
        whitespace: true,
        identifiers: true,
        syntax: true,
      },
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --minify-whitespace --minify-identifiers --minify-syntax
    ```
  </Tab>
</Tabs>

### external

A list of import paths to consider external. Defaults to `[]`.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      external: ["lodash", "react"], // default: []
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --external lodash --external react
    ```
  </Tab>
</Tabs>

An external import is one that will not be included in the final bundle. Instead, the import statement will be left as-is, to be resolved at runtime.

For instance, consider the following entrypoint file:

```tsx index.tsx icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import _ from "lodash";
import { z } from "zod";

const value = z.string().parse("Hello world!");
console.log(_.upperCase(value));
```

Normally, bundling `index.tsx` would generate a bundle containing the entire source code of the "zod" package. If instead, we want to leave the import statement as-is, we can mark it as external:

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      external: ['zod'],
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --external zod
    ```
  </Tab>
</Tabs>

The generated bundle will look something like this:

```ts title="out/index.js" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { z } from "zod";

// ...
// the contents of the "lodash" package
// including the `_.upperCase` function

var value = z.string().parse("Hello world!");
console.log(_.upperCase(value));
```

To mark all imports as external, use the wildcard `*`:

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      external: ['*'],
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --external '*'
    ```
  </Tab>
</Tabs>

### packages

Control whether package dependencies are included to bundle or not. Possible values: `bundle` (default), `external`. Bun treats any import which path do not start with `.`, `..` or `/` as package.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.ts'],
      packages: 'external',
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.ts --packages external
    ```
  </Tab>
</Tabs>

### naming

Customizes the generated file names. Defaults to `./[dir]/[name].[ext]`.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      naming: "[dir]/[name].[ext]", // default
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --entry-naming "[dir]/[name].[ext]"
    ```
  </Tab>
</Tabs>

By default, the names of the generated bundles are based on the name of the associated entrypoint.

```text title="file system" icon="folder-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
.
├── index.tsx
└── out
    └── index.js
```

With multiple entrypoints, the generated file hierarchy will reflect the directory structure of the entrypoints.

```text title="file system" icon="folder-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
.
├── index.tsx
└── nested
    └── index.tsx
└── out
    ├── index.js
    └── nested
        └── index.js
```

The names and locations of the generated files can be customized with the `naming` field. This field accepts a template string that is used to generate the filenames for all bundles corresponding to entrypoints. where the following tokens are replaced with their corresponding values:

* `[name]` - The name of the entrypoint file, without the extension.
* `[ext]` - The extension of the generated bundle.
* `[hash]` - A hash of the bundle contents.
* `[dir]` - The relative path from the project root to the parent directory of the source file.

For example:

| Token               | `[name]` | `[ext]` | `[hash]`   | `[dir]`             |
| ------------------- | -------- | ------- | ---------- | ------------------- |
| `./index.tsx`       | `index`  | `js`    | `a1b2c3d4` | `""` (empty string) |
| `./nested/entry.ts` | `entry`  | `js`    | `c3d4e5f6` | `"nested"`          |

We can combine these tokens to create a template string. For instance, to include the hash in the generated bundle names:

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      naming: 'files/[dir]/[name]-[hash].[ext]',
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --entry-naming 'files/[dir]/[name]-[hash].[ext]'
    ```
  </Tab>
</Tabs>

This build would result in the following file structure:

```text title="file system" icon="folder-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
.
├── index.tsx
└── out
    └── files
        └── index-a1b2c3d4.js
```

When a string is provided for the `naming` field, it is used only for bundles that correspond to entrypoints. The names of chunks and copied assets are not affected. Using the JavaScript API, separate template strings can be specified for each type of generated file.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      naming: {
        // default values
        entry: '[dir]/[name].[ext]',
        chunk: '[name]-[hash].[ext]',
        asset: '[name]-[hash].[ext]',
      },
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out \
      --entry-naming '[dir]/[name].[ext]' \
      --chunk-naming '[name]-[hash].[ext]' \
      --asset-naming '[name]-[hash].[ext]'
    ```
  </Tab>
</Tabs>

### root

The root directory of the project.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./pages/a.tsx', './pages/b.tsx'],
      outdir: './out',
      root: '.',
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./pages/a.tsx ./pages/b.tsx --outdir ./out --root .
    ```
  </Tab>
</Tabs>

If unspecified, it is computed to be the first common ancestor of all entrypoint files. Consider the following file structure:

```text title="file system" icon="folder-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
.
└── pages
  └── index.tsx
  └── settings.tsx
```

We can build both entrypoints in the `pages` directory:

<Tabs>
  <Tab title="JavaScript">
    ```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./pages/index.tsx', './pages/settings.tsx'],
      outdir: './out',
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./pages/index.tsx ./pages/settings.tsx --outdir ./out
    ```
  </Tab>
</Tabs>

This would result in a file structure like this:

```text title="file system" icon="folder-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
.
└── pages
  └── index.tsx
  └── settings.tsx
└── out
  └── index.js
  └── settings.js
```

Since the `pages` directory is the first common ancestor of the entrypoint files, it is considered the project root. This means that the generated bundles live at the top level of the `out` directory; there is no `out/pages` directory.

This behavior can be overridden by specifying the `root` option:

<Tabs>
  <Tab title="JavaScript">
    ```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./pages/index.tsx', './pages/settings.tsx'],
      outdir: './out',
      root: '.',
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./pages/index.tsx ./pages/settings.tsx --outdir ./out --root .
    ```
  </Tab>
</Tabs>

By specifying `.` as `root`, the generated file structure will look like this:

```
.
└── pages
  └── index.tsx
  └── settings.tsx
└── out
  └── pages
    └── index.js
    └── settings.js
```

### publicPath

A prefix to be appended to any import paths in bundled code.

In many cases, generated bundles will contain no import statements. After all, the goal of bundling is to combine all of the code into a single file. However there are a number of cases with the generated bundles will contain import statements.

* **Asset imports** — When importing an unrecognized file type like `*.svg`, the bundler defers to the file loader, which copies the file into `outdir` as is. The import is converted into a variable
* **External modules** — Files and modules can be marked as external, in which case they will not be included in the bundle. Instead, the import statement will be left in the final bundle.
* **Chunking.** When `splitting` is enabled, the bundler may generate separate "chunk" files that represent code that is shared among multiple entrypoints.

In any of these cases, the final bundles may contain paths to other files. By default these imports are relative. Here is an example of a simple asset import:

<CodeGroup>
  ```ts Input icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import logo from "./logo.svg";
  console.log(logo);
  ```

  ```ts Output icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
  var logo = "./logo-a7305bdef.svg";
  console.log(logo);
  ```
</CodeGroup>

Setting `publicPath` will prefix all file paths with the specified value.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      publicPath: 'https://cdn.example.com/', // default is undefined
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --public-path 'https://cdn.example.com/'
    ```
  </Tab>
</Tabs>

The output file would now look something like this.

```ts title="out/index.js" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
var logo = "https://cdn.example.com/logo-a7305bdef.svg";
```

### define

A map of global identifiers to be replaced at build time. Keys of this object are identifier names, and values are JSON strings that will be inlined.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      define: {
        STRING: JSON.stringify("value"),
        "nested.boolean": "true",
      },
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --define STRING='"value"' --define nested.boolean=true
    ```
  </Tab>
</Tabs>

### loader

A map of file extensions to built-in loader names. This can be used to quickly customize how certain files are loaded.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      loader: {
        ".png": "dataurl",
        ".txt": "file",
      },
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --loader .png:dataurl --loader .txt:file
    ```
  </Tab>
</Tabs>

### banner

A banner to be added to the final bundle, this can be a directive like `"use client"` for react or a comment block such as a license for the code.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      banner: '"use client";'
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --banner '"use client";'
    ```
  </Tab>
</Tabs>

### footer

A footer to be added to the final bundle, this can be something like a comment block for a license or just a fun easter egg.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      footer: '// built with love in SF'
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --footer '// built with love in SF'
    ```
  </Tab>
</Tabs>

### drop

Remove function calls from a bundle. For example, `--drop=console` will remove all calls to `console.log`. Arguments to calls will also be removed, regardless of if those arguments may have side effects. Dropping `debugger` will remove all `debugger` statements.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ['./index.tsx'],
      outdir: './out',
      drop: ["console", "debugger", "anyIdentifier.or.propertyAccess"],
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --drop console --drop debugger
    ```
  </Tab>
</Tabs>

## Outputs

The `Bun.build` function returns a `Promise<BuildOutput>`, defined as:

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
interface BuildOutput {
	outputs: BuildArtifact[];
	success: boolean;
	logs: Array<object>; // see docs for details
}

interface BuildArtifact extends Blob {
	kind: "entry-point" | "chunk" | "asset" | "sourcemap";
	path: string;
	loader: Loader;
	hash: string | null;
	sourcemap: BuildArtifact | null;
}
```

The `outputs` array contains all the files that were generated by the build. Each artifact implements the Blob interface.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const build = await Bun.build({
	/* */
});

for (const output of build.outputs) {
	await output.arrayBuffer(); // => ArrayBuffer
	await output.bytes(); // => Uint8Array
	await output.text(); // string
}
```

Each artifact also contains the following properties:

| Property    | Description                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`      | What kind of build output this file is. A build generates bundled entrypoints, code-split "chunks", sourcemaps, bytecode, and copied assets (like images).   |
| `path`      | Absolute path to the file on disk                                                                                                                            |
| `loader`    | The loader was used to interpret the file. See [Bundler > Loaders](/bundler/loaders) to see how Bun maps file extensions to the appropriate built-in loader. |
| `hash`      | The hash of the file contents. Always defined for assets.                                                                                                    |
| `sourcemap` | The sourcemap file corresponding to this file, if generated. Only defined for entrypoints and chunks.                                                        |

Similar to `BunFile`, `BuildArtifact` objects can be passed directly into `new Response()`.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const build = await Bun.build({
	/* */
});

const artifact = build.outputs[0];

// Content-Type header is automatically set
return new Response(artifact);
```

The Bun runtime implements special pretty-printing of `BuildArtifact` object to make debugging easier.

<CodeGroup>
  ```ts build.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  // build.ts
  const build = await Bun.build({
  	/* */
  });

  const artifact = build.outputs[0];
  console.log(artifact);
  ```

  ```bash Shell output theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun run build.ts

  BuildArtifact (entry-point) {
    path: "./index.js",
    loader: "tsx",
    kind: "entry-point",
    hash: "824a039620219640",
    Blob (74756 bytes) {
      type: "text/javascript;charset=utf-8"
    },
    sourcemap: BuildArtifact (sourcemap) {
      path: "./index.js.map",
      loader: "file",
      kind: "sourcemap",
      hash: "e7178cda3e72e301",
      Blob (24765 bytes) {
        type: "application/json;charset=utf-8"
      },
      sourcemap: null
    }
  }
  ```
</CodeGroup>

## Bytecode

The `bytecode: boolean` option can be used to generate bytecode for any JavaScript/TypeScript entrypoints. This can greatly improve startup times for large applications. Only supported for `"cjs"` format, only supports `"target": "bun"` and dependent on a matching version of Bun. This adds a corresponding `.jsc` file for each entrypoint.

<Tabs>
  <Tab title="JavaScript">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./index.tsx"],
      outdir: "./out",
      bytecode: true,
    })
    ```
  </Tab>

  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.tsx --outdir ./out --bytecode
    ```
  </Tab>
</Tabs>

## Executables

Bun supports "compiling" a JavaScript/TypeScript entrypoint into a standalone executable. This executable contains a copy of the Bun binary.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./cli.tsx --outfile mycli --compile
./mycli
```

Refer to [Bundler > Executables](/bundler/executables) for complete documentation.

## Logs and errors

On failure, `Bun.build` returns a rejected promise with an `AggregateError`. This can be logged to the console for pretty printing of the error list, or programmatically read with a try/catch block.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
try {
	const result = await Bun.build({
		entrypoints: ["./index.tsx"],
		outdir: "./out",
	});
} catch (e) {
	// TypeScript does not allow annotations on the catch clause
	const error = e as AggregateError;
	console.error("Build Failed");

	// Example: Using the built-in formatter
	console.error(error);

	// Example: Serializing the failure as a JSON string.
	console.error(JSON.stringify(error, null, 2));
}
```

Most of the time, an explicit try/catch is not needed, as Bun will neatly print uncaught exceptions. It is enough to just use a top-level await on the `Bun.build` call.

Each item in `error.errors` is an instance of `BuildMessage` or `ResolveMessage` (subclasses of `Error`), containing detailed information for each error.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
class BuildMessage {
	name: string;
	position?: Position;
	message: string;
	level: "error" | "warning" | "info" | "debug" | "verbose";
}

class ResolveMessage extends BuildMessage {
	code: string;
	referrer: string;
	specifier: string;
	importKind: ImportKind;
}
```

On build success, the returned object contains a `logs` property, which contains bundler warnings and info messages.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const result = await Bun.build({
	entrypoints: ["./index.tsx"],
	outdir: "./out",
});

if (result.logs.length > 0) {
	console.warn("Build succeeded with warnings:");
	for (const message of result.logs) {
		// Bun will pretty print the message object
		console.warn(message);
	}
}
```

## Reference

```ts Typescript Definitions icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
interface Bun {
	build(options: BuildOptions): Promise<BuildOutput>;
}

interface BuildConfig {
	entrypoints: string[]; // list of file path
	outdir?: string; // output directory
	target?: Target; // default: "browser"
	/**
	 * Output module format. Top-level await is only supported for `"esm"`.
	 *
	 * Can be:
	 * - `"esm"`
	 * - `"cjs"` (**experimental**)
	 * - `"iife"` (**experimental**)
	 *
	 * @default "esm"
	 */
	format?: "esm" | "cjs" | "iife";
	/**
	 * JSX configuration object for controlling JSX transform behavior
	 */
	jsx?: {
		factory?: string;
		fragment?: string;
		importSource?: string;
		runtime?: "automatic" | "classic";
	};
	naming?:
		| string
		| {
				chunk?: string;
				entry?: string;
				asset?: string;
		  };
	root?: string; // project root
	splitting?: boolean; // default true, enable code splitting
	plugins?: BunPlugin[];
	external?: string[];
	packages?: "bundle" | "external";
	publicPath?: string;
	define?: Record<string, string>;
	loader?: { [k in string]: Loader };
	sourcemap?: "none" | "linked" | "inline" | "external" | "linked" | boolean; // default: "none", true -> "inline"
	/**
	 * package.json `exports` conditions used when resolving imports
	 *
	 * Equivalent to `--conditions` in `bun build` or `bun run`.
	 *
	 * https://nodejs.org/api/packages.html#exports
	 */
	conditions?: Array<string> | string;

	/**
	 * Controls how environment variables are handled during bundling.
	 *
	 * Can be one of:
	 * - `"inline"`: Injects environment variables into the bundled output by converting `process.env.FOO`
	 *   references to string literals containing the actual environment variable values
	 * - `"disable"`: Disables environment variable injection entirely
	 * - A string ending in `*`: Inlines environment variables that match the given prefix.
	 *   For example, `"MY_PUBLIC_*"` will only include env vars starting with "MY_PUBLIC_"
	 */
	env?: "inline" | "disable" | `${string}*`;
	minify?:
		| boolean
		| {
				whitespace?: boolean;
				syntax?: boolean;
				identifiers?: boolean;
		  };
	/**
	 * Ignore dead code elimination/tree-shaking annotations such as @__PURE__ and package.json
	 * "sideEffects" fields. This should only be used as a temporary workaround for incorrect
	 * annotations in libraries.
	 */
	ignoreDCEAnnotations?: boolean;
	/**
	 * Force emitting @__PURE__ annotations even if minify.whitespace is true.
	 */
	emitDCEAnnotations?: boolean;

	/**
	 * Generate bytecode for the output. This can dramatically improve cold
	 * start times, but will make the final output larger and slightly increase
	 * memory usage.
	 *
	 * Bytecode is currently only supported for CommonJS (`format: "cjs"`).
	 *
	 * Must be `target: "bun"`
	 * @default false
	 */
	bytecode?: boolean;
	/**
	 * Add a banner to the bundled code such as "use client";
	 */
	banner?: string;
	/**
	 * Add a footer to the bundled code such as a comment block like
	 *
	 * `// made with bun!`
	 */
	footer?: string;

	/**
	 * Drop function calls to matching property accesses.
	 */
	drop?: string[];

	/**
	 * When set to `true`, the returned promise rejects with an AggregateError when a build failure happens.
	 * When set to `false`, the `success` property of the returned object will be `false` when a build failure happens.
	 *
	 * This defaults to `false` in Bun 1.1 and will change to `true` in Bun 1.2
	 * as most usage of `Bun.build` forgets to check for errors.
	 */
	throw?: boolean;
}

interface BuildOutput {
	outputs: BuildArtifact[];
	success: boolean;
	logs: Array<BuildMessage | ResolveMessage>;
}

interface BuildArtifact extends Blob {
	path: string;
	loader: Loader;
	hash: string | null;
	kind: "entry-point" | "chunk" | "asset" | "sourcemap" | "bytecode";
	sourcemap: BuildArtifact | null;
}

type Loader = "js" | "jsx" | "ts" | "tsx" | "json" | "toml" | "file" | "napi" | "wasm" | "text";

interface BuildOutput {
	outputs: BuildArtifact[];
	success: boolean;
	logs: Array<BuildMessage | ResolveMessage>;
}

declare class ResolveMessage {
	readonly name: "ResolveMessage";
	readonly position: Position | null;
	readonly code: string;
	readonly message: string;
	readonly referrer: string;
	readonly specifier: string;
	readonly importKind:
		| "entry_point"
		| "stmt"
		| "require"
		| "import"
		| "dynamic"
		| "require_resolve"
		| "at"
		| "at_conditional"
		| "url"
		| "internal";
	readonly level: "error" | "warning" | "info" | "debug" | "verbose";

	toString(): string;
}
```

***

## CLI Usage

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build <entry points>
```

### General Configuration

<ParamField path="--production" type="boolean">
  Set <code>NODE\_ENV=production</code> and enable minification
</ParamField>

<ParamField path="--bytecode" type="boolean">
  Use a bytecode cache when compiling
</ParamField>

<ParamField path="--target" type="string" default="browser">
  Intended execution environment for the bundle. One of <code>browser</code>, <code>bun</code>, or{" "}
  <code>node</code>
</ParamField>

<ParamField path="--conditions" type="string">
  Pass custom resolution conditions
</ParamField>

<ParamField path="--env" type="string" default="disable">
  Inline environment variables into the bundle as <code>process.env.\${name_0}</code>. To inline
  variables matching a prefix, use a glob like <code>FOO\_PUBLIC\_\*</code>
</ParamField>

### Output & File Handling

<ParamField path="--outdir" type="string" default="dist">
  Output directory (used when building multiple entry points)
</ParamField>

<ParamField path="--outfile" type="string">
  Write output to a specific file
</ParamField>

<ParamField path="--sourcemap" type="string" default="none">
  Generate source maps. One of <code>linked</code>, <code>inline</code>, <code>external</code>, or{" "}
  <code>none</code>
</ParamField>

<ParamField path="--banner" type="string">
  Add a banner to the output (e.g. <code>"use client"</code> for React Server Components)
</ParamField>

<ParamField path="--footer" type="string">
  Add a footer to the output (e.g. <code>// built with bun!</code>)
</ParamField>

<ParamField path="--format" type="string" default="esm">
  Module format of the output bundle. One of <code>esm</code>, <code>cjs</code>, or{" "}
  <code>iife</code>
</ParamField>

### File Naming

<ParamField path="--entry-naming" type="string" default="[dir]/[name].[ext]">
  Customize entry point filenames
</ParamField>

<ParamField path="--chunk-naming" type="string" default="[name]-[hash].[ext]">
  Customize chunk filenames
</ParamField>

<ParamField path="--asset-naming" type="string" default="[name]-[hash].[ext]">
  Customize asset filenames
</ParamField>

### Bundling Options

<ParamField path="--root" type="string">
  Root directory used when bundling multiple entry points
</ParamField>

<ParamField path="--splitting" type="boolean">
  Enable code splitting for shared modules
</ParamField>

<ParamField path="--public-path" type="string">
  Prefix to be added to import paths in bundled code
</ParamField>

<ParamField path="--external" type="string">
  Exclude modules from the bundle (supports wildcards). Alias: <code>-e</code>
</ParamField>

<ParamField path="--packages" type="string" default="bundle">
  How to treat dependencies: <code>external</code> or <code>bundle</code>
</ParamField>

<ParamField path="--no-bundle" type="boolean">
  Transpile only — do not bundle
</ParamField>

<ParamField path="--css-chunking" type="boolean">
  Chunk CSS files together to reduce duplication (only when multiple entry points import CSS)
</ParamField>

### Minification & Optimization

<ParamField path="--emit-dce-annotations" type="boolean" default="true">
  Re-emit Dead Code Elimination annotations. Disabled when <code>--minify-whitespace</code> is used
</ParamField>

<ParamField path="--minify" type="boolean">
  Enable all minification options
</ParamField>

<ParamField path="--minify-syntax" type="boolean">
  Minify syntax and inline constants
</ParamField>

<ParamField path="--minify-whitespace" type="boolean">
  Minify whitespace
</ParamField>

<ParamField path="--minify-identifiers" type="boolean">
  Minify variable and function identifiers
</ParamField>

<ParamField path="--keep-names" type="boolean">
  Preserve original function and class names when minifying
</ParamField>

### Development Features

<ParamField path="--watch" type="boolean">
  Rebuild automatically when files change
</ParamField>

<ParamField path="--no-clear-screen" type="boolean">
  Don’t clear the terminal when rebuilding with <code>--watch</code>
</ParamField>

<ParamField path="--react-fast-refresh" type="boolean">
  Enable React Fast Refresh transform (for development testing)
</ParamField>

### Standalone Executables

<ParamField path="--compile" type="boolean">
  Generate a standalone Bun executable containing the bundle. Implies <code>--production</code>
</ParamField>

<ParamField path="--compile-exec-argv" type="string">
  Prepend arguments to the standalone executable’s <code>execArgv</code>
</ParamField>

### Windows Executable Details

<ParamField path="--windows-hide-console" type="boolean">
  Prevent a console window from opening when running a compiled Windows executable
</ParamField>

<ParamField path="--windows-icon" type="string">
  Set an icon for the Windows executable
</ParamField>

<ParamField path="--windows-title" type="string">
  Set the Windows executable product name
</ParamField>

<ParamField path="--windows-publisher" type="string">
  Set the Windows executable company name
</ParamField>

<ParamField path="--windows-version" type="string">
  Set the Windows executable version (e.g. <code>1.2.3.4</code>)
</ParamField>

<ParamField path="--windows-description" type="string">
  Set the Windows executable description
</ParamField>

<ParamField path="--windows-copyright" type="string">
  Set the Windows executable copyright notice
</ParamField>

### Experimental & App Building

<ParamField path="--app" type="boolean">
  <b>(EXPERIMENTAL)</b> Build a web app for production using Bun Bake
</ParamField>

<ParamField path="--server-components" type="boolean">
  <b>(EXPERIMENTAL)</b> Enable React Server Components
</ParamField>

<ParamField path="--debug-dump-server-files" type="boolean">
  When <code>--app</code> is set, dump all server files to disk even for static builds
</ParamField>

<ParamField path="--debug-no-minify" type="boolean">
  When <code>--app</code> is set, disable all minification
</ParamField>

# Fullstack dev server

> Build fullstack applications with Bun's integrated dev server that bundles frontend assets and handles API routes

To get started, import HTML files and pass them to the `routes` option in `Bun.serve()`.

```ts title="app.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from "bun";
import dashboard from "./dashboard.html";
import homepage from "./index.html";

const server = serve({
	routes: {
		// ** HTML imports **
		// Bundle & route index.html to "/". This uses HTMLRewriter to scan
		// the HTML for `<script>` and `<link>` tags, runs Bun's JavaScript
		// & CSS bundler on them, transpiles any TypeScript, JSX, and TSX,
		// downlevels CSS with Bun's CSS parser and serves the result.
		"/": homepage,
		// Bundle & route dashboard.html to "/dashboard"
		"/dashboard": dashboard,

		// ** API endpoints ** (Bun v1.2.3+ required)
		"/api/users": {
			async GET(req) {
				const users = await sql`SELECT * FROM users`;
				return Response.json(users);
			},
			async POST(req) {
				const { name, email } = await req.json();
				const [user] = await sql`INSERT INTO users (name, email) VALUES (${name}, ${email})`;
				return Response.json(user);
			},
		},
		"/api/users/:id": async req => {
			const { id } = req.params;
			const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
			return Response.json(user);
		},
	},

	// Enable development mode for:
	// - Detailed error messages
	// - Hot reloading (Bun v1.2.3+ required)
	development: true,
});

console.log(`Listening on ${server.url}`);
```

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run app.ts
```

## HTML Routes

### HTML Imports as Routes

The web starts with HTML, and so does Bun's fullstack dev server.

To specify entrypoints to your frontend, import HTML files into your JavaScript/TypeScript/TSX/JSX files.

```ts title="app.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import dashboard from "./dashboard.html";
import homepage from "./index.html";
```

These HTML files are used as routes in Bun's dev server you can pass to `Bun.serve()`.

```ts title="app.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		"/": homepage,
		"/dashboard": dashboard,
	},

	fetch(req) {
		// ... api requests
	},
});
```

When you make a request to `/dashboard` or `/`, Bun automatically bundles the `<script>` and `<link>` tags in the HTML files, exposes them as static routes, and serves the result.

### HTML Processing Example

An `index.html` file like this:

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
	<head>
		<title>Home</title>
		<link rel="stylesheet" href="./reset.css" />
		<link rel="stylesheet" href="./styles.css" />
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="./sentry-and-preloads.ts"></script>
		<script type="module" src="./my-app.tsx"></script>
	</body>
</html>
```

Becomes something like this:

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
	<head>
		<title>Home</title>
		<link rel="stylesheet" href="/index-[hash].css" />
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/index-[hash].js"></script>
	</body>
</html>
```

## React Integration

To use React in your client-side code, import `react-dom/client` and render your app.

<CodeGroup>
  ```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import dashboard from "../public/dashboard.html";
  import { serve } from "bun";

  serve({
  	routes: {
  		"/": dashboard,
  	},
  	async fetch(req) {
  		// ...api requests
  		return new Response("hello world");
  	},
  });

  ```

  ```tsx title="src/frontend.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { createRoot } from 'react-dom/client';
  import App from './app';

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(<App />);
  ```

  ```html title="public/dashboard.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
  <!DOCTYPE html>
  <html>
    <head>
      <title>Dashboard</title>
      <link rel="stylesheet" href="../src/styles.css" />
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="../src/frontend.tsx"></script>
    </body>
  </html>
  ```

  ```tsx title="src/app.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { useState } from 'react';

  export default function App() {
  	const [count, setCount] = useState(0);

  	return (
  		<div>
  			<h1>Dashboard</h1>
  			<button onClick={() => setCount(count + 1)}>
  				Count: {count}
  			</button>
  		</div>
  	);
  }
  ```
</CodeGroup>

## Development Mode

When building locally, enable development mode by setting `development: true` in `Bun.serve()`.

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import homepage from "./index.html";
import dashboard from "./dashboard.html";

Bun.serve({
  routes: {
    "/": homepage,
    "/dashboard": dashboard,
  },

  development: true,

  fetch(req) {
    // ... api requests
  },
});
```

### Development Mode Features

When `development` is `true`, Bun will:

* Include the SourceMap header in the response so that devtools can show the original source code
* Disable minification
* Re-bundle assets on each request to a `.html` file
* Enable hot module reloading (unless `hmr: false` is set)
* Echo console logs from browser to terminal

### Advanced Development Configuration

`Bun.serve()` supports echoing console logs from the browser to the terminal.

To enable this, pass `console: true` in the development object in `Bun.serve()`.

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import homepage from "./index.html";

Bun.serve({
	// development can also be an object.
	development: {
		// Enable Hot Module Reloading
		hmr: true,

		// Echo console logs from the browser to the terminal
		console: true,
	},

	routes: {
		"/": homepage,
	},
});
```

When `console: true` is set, Bun will stream console logs from the browser to the terminal. This reuses the existing WebSocket connection from HMR to send the logs.

### Development vs Production

| Feature             | Development            | Production |
| ------------------- | ---------------------- | ---------- |
| **Source maps**     | ✅ Enabled              | ❌ Disabled |
| **Minification**    | ❌ Disabled             | ✅ Enabled  |
| **Hot reloading**   | ✅ Enabled              | ❌ Disabled |
| **Asset bundling**  | 🔄 On each request     | 💾 Cached  |
| **Console logging** | 🖥️ Browser → Terminal | ❌ Disabled |
| **Error details**   | 📝 Detailed            | 🔒 Minimal |

## Production Mode

Hot reloading and `development: true` helps you iterate quickly, but in production, your server should be as fast as possible and have as few external dependencies as possible.

### Ahead of Time Bundling (Recommended)

As of Bun v1.2.17, you can use `Bun.build` or `bun build` to bundle your full-stack application ahead of time.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --target=bun --production --outdir=dist ./src/index.ts
```

When Bun's bundler sees an HTML import from server-side code, it will bundle the referenced JavaScript/TypeScript/TSX/JSX and CSS files into a manifest object that `Bun.serve()` can use to serve the assets.

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from "bun";
import index from "./index.html";

serve({
	routes: { "/": index },
});
```

### Runtime Bundling

When adding a build step is too complicated, you can set `development: false` in `Bun.serve()`.

This will:

* Enable in-memory caching of bundled assets. Bun will bundle assets lazily on the first request to an `.html` file, and cache the result in memory until the server restarts.
* Enable `Cache-Control` headers and `ETag` headers
* Minify JavaScript/TypeScript/TSX/JSX files

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from "bun";
import homepage from "./index.html";

serve({
	routes: {
		"/": homepage,
	},

	// Production mode
	development: false,
});
```

## API Routes

### HTTP Method Handlers

Define API endpoints with HTTP method handlers:

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from "bun";

serve({
	routes: {
		"/api/users": {
			async GET(req) {
				// Handle GET requests
				const users = await getUsers();
				return Response.json(users);
			},

			async POST(req) {
				// Handle POST requests
				const userData = await req.json();
				const user = await createUser(userData);
				return Response.json(user, { status: 201 });
			},

			async PUT(req) {
				// Handle PUT requests
				const userData = await req.json();
				const user = await updateUser(userData);
				return Response.json(user);
			},

			async DELETE(req) {
				// Handle DELETE requests
				await deleteUser(req.params.id);
				return new Response(null, { status: 204 });
			},
		},
	},
});
```

### Dynamic Routes

Use URL parameters in your routes:

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
serve({
	routes: {
		// Single parameter
		"/api/users/:id": async req => {
			const { id } = req.params;
			const user = await getUserById(id);
			return Response.json(user);
		},

		// Multiple parameters
		"/api/users/:userId/posts/:postId": async req => {
			const { userId, postId } = req.params;
			const post = await getPostByUser(userId, postId);
			return Response.json(post);
		},

		// Wildcard routes
		"/api/files/*": async req => {
			const filePath = req.params["*"];
			const file = await getFile(filePath);
			return new Response(file);
		},
	},
});
```

### Request Handling

```ts title="src/backend.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
serve({
	routes: {
		"/api/data": {
			async POST(req) {
				// Parse JSON body
				const body = await req.json();

				// Access headers
				const auth = req.headers.get("Authorization");

				// Access URL parameters
				const { id } = req.params;

				// Access query parameters
				const url = new URL(req.url);
				const page = url.searchParams.get("page") || "1";

				// Return response
				return Response.json({
					message: "Data processed",
					page: parseInt(page),
					authenticated: !!auth,
				});
			},
		},
	},
});
```

## Plugins

Bun's bundler plugins are also supported when bundling static routes.

To configure plugins for `Bun.serve`, add a `plugins` array in the `[serve.static]` section of your `bunfig.toml`.

### TailwindCSS Plugin

You can use TailwindCSS by installing and adding the `tailwindcss` package and `bun-plugin-tailwind` plugin.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add tailwindcss bun-plugin-tailwind
```

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

This will allow you to use TailwindCSS utility classes in your HTML and CSS files. All you need to do is import `tailwindcss` somewhere:

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!doctype html>
<html>
	<head>
		<link rel="stylesheet" href="tailwindcss" />
		<!-- [!code ++] -->
	</head>
	<!-- the rest of your HTML... -->
</html>
```

Alternatively, you can import TailwindCSS in your CSS file:

```css title="style.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
@import "tailwindcss";

.custom-class {
	@apply bg-red-500 text-white;
}
```

```html index.html icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!doctype html>
<html>
	<head>
		<link rel="stylesheet" href="./style.css" />
		<!-- [!code ++] -->
	</head>
	<!-- the rest of your HTML... -->
</html>
```

### Custom Plugins

Any JS file or module which exports a valid bundler plugin object (essentially an object with a `name` and `setup` field) can be placed inside the plugins array:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[serve.static]
plugins = ["./my-plugin-implementation.ts"]
```

```ts title="my-plugin-implementation.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from "bun";

const myPlugin: BunPlugin = {
	name: "my-custom-plugin",
	setup(build) {
		// Plugin implementation
		build.onLoad({ filter: /\.custom$/ }, async args => {
			const text = await Bun.file(args.path).text();
			return {
				contents: `export default ${JSON.stringify(text)};`,
				loader: "js",
			};
		});
	},
};

export default myPlugin;
```

Bun will lazily resolve and load each plugin and use them to bundle your routes.

<Note>
  This is currently in `bunfig.toml` to make it possible to know statically which plugins are in use
  when we eventually integrate this with the `bun build` CLI. These plugins work in `Bun.build()`'s
  JS API, but are not yet supported in the CLI.
</Note>

## How It Works

Bun uses `HTMLRewriter` to scan for `<script>` and `<link>` tags in HTML files, uses them as entrypoints for Bun's bundler, generates an optimized bundle for the JavaScript/TypeScript/TSX/JSX and CSS files, and serves the result.

### Processing Pipeline

<Steps>
  <Step title="1. <script> Processing">
    * Transpiles TypeScript, JSX, and TSX in `<script>` tags
    * Bundles imported dependencies
    * Generates sourcemaps for debugging
    * Minifies when `development` is not `true` in `Bun.serve()`

    ```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
    <script type="module" src="./counter.tsx"></script>
    ```
  </Step>

  <Step title="2. <link> Processing">
    * Processes CSS imports and `<link>` tags
    * Concatenates CSS files
    * Rewrites url and asset paths to include content-addressable hashes in URLs

    ```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
    <link rel="stylesheet" href="./styles.css" />
    ```
  </Step>

  <Step title="3. <img> & Asset Processing">
    * Links to assets are rewritten to include content-addressable hashes in URLs
    * Small assets in CSS files are inlined into `data:` URLs, reducing the total number of HTTP requests sent over the wire
  </Step>

  <Step title="4. HTML Rewriting">
    * Combines all `<script>` tags into a single `<script>` tag with a content-addressable hash in the URL
    * Combines all `<link>` tags into a single `<link>` tag with a content-addressable hash in the URL
    * Outputs a new HTML file
  </Step>

  <Step title="5. Serving">
    * All the output files from the bundler are exposed as static routes, using the same mechanism internally as when you pass a Response object to `static` in `Bun.serve()`.
    * This works similarly to how `Bun.build` processes HTML files.
  </Step>
</Steps>

## Complete Example

Here's a complete fullstack application example:

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serve } from "bun";
import { Database } from "bun:sqlite";
import homepage from "./public/index.html";
import dashboard from "./public/dashboard.html";

// Initialize database
const db = new Database("app.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const server = serve({
	routes: {
		// Frontend routes
		"/": homepage,
		"/dashboard": dashboard,

		// API routes
		"/api/users": {
			async GET() {
				const users = db.query("SELECT * FROM users").all();
				return Response.json(users);
			},

			async POST(req) {
				const { name, email } = await req.json();

				try {
					const result = db
						.query("INSERT INTO users (name, email) VALUES (?, ?) RETURNING *")
						.get(name, email);

					return Response.json(result, { status: 201 });
				} catch (error) {
					return Response.json({ error: "Email already exists" }, { status: 400 });
				}
			},
		},

		"/api/users/:id": {
			async GET(req) {
				const { id } = req.params;
				const user = db.query("SELECT * FROM users WHERE id = ?").get(id);

				if (!user) {
					return Response.json({ error: "User not found" }, { status: 404 });
				}

				return Response.json(user);
			},

			async DELETE(req) {
				const { id } = req.params;
				const result = db.query("DELETE FROM users WHERE id = ?").run(id);

				if (result.changes === 0) {
					return Response.json({ error: "User not found" }, { status: 404 });
				}

				return new Response(null, { status: 204 });
			},
		},

		// Health check endpoint
		"/api/health": {
			GET() {
				return Response.json({
					status: "ok",
					timestamp: new Date().toISOString(),
				});
			},
		},
	},

	// Enable development mode
	development: {
		hmr: true,
		console: true,
	},

	// Fallback for unmatched routes
	fetch(req) {
		return new Response("Not Found", { status: 404 });
	},
});

console.log(`🚀 Server running on ${server.url}`);
```

```html title="public/index.html" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Fullstack Bun App</title>
		<link rel="stylesheet" href="../src/styles.css" />
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="../src/main.tsx"></script>
	</body>
</html>
```

```tsx title="src/main.tsx" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
```

```tsx title="src/App.tsx" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { useState, useEffect } from "react";

interface User {
	id: number;
	name: string;
	email: string;
	created_at: string;
}

export function App() {
	const [users, setUsers] = useState<User[]>([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const fetchUsers = async () => {
		const response = await fetch("/api/users");
		const data = await response.json();
		setUsers(data);
	};

	const createUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email }),
			});

			if (response.ok) {
				setName("");
				setEmail("");
				await fetchUsers();
			} else {
				const error = await response.json();
				alert(error.error);
			}
		} catch (error) {
			alert("Failed to create user");
		} finally {
			setLoading(false);
		}
	};

	const deleteUser = async (id: number) => {
		if (!confirm("Are you sure?")) return;

		try {
			const response = await fetch(`/api/users/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				await fetchUsers();
			}
		} catch (error) {
			alert("Failed to delete user");
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return (
		<div className="container">
			<h1>User Management</h1>

			<form onSubmit={createUser} className="form">
				<input
					type="text"
					placeholder="Name"
					value={name}
					onChange={e => setName(e.target.value)}
					required
				/>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create User"}
				</button>
			</form>

			<div className="users">
				<h2>Users ({users.length})</h2>
				{users.map(user => (
					<div key={user.id} className="user-card">
						<div>
							<strong>{user.name}</strong>
							<br />
							<span>{user.email}</span>
						</div>
						<button onClick={() => deleteUser(user.id)} className="delete-btn">
							Delete
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
```

```css title="src/styles.css" theme={"theme":{"light":"github-light","dark":"dracula"}}
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, sans-serif;
	background: #f5f5f5;
	color: #333;
}

.container {
	max-width: 800px;
	margin: 0 auto;
	padding: 2rem;
}

h1 {
	color: #2563eb;
	margin-bottom: 2rem;
}

.form {
	background: white;
	padding: 1.5rem;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	margin-bottom: 2rem;
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
}

.form input {
	flex: 1;
	min-width: 200px;
	padding: 0.75rem;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.form button {
	padding: 0.75rem 1.5rem;
	background: #2563eb;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.form button:hover {
	background: #1d4ed8;
}

.form button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.users {
	background: white;
	padding: 1.5rem;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid #eee;
}

.user-card:last-child {
	border-bottom: none;
}

.delete-btn {
	padding: 0.5rem 1rem;
	background: #dc2626;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.delete-btn:hover {
	background: #b91c1c;
}
```

## Best Practices

### Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   └── UserList.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── utils/
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── index.html
│   ├── dashboard.html
│   └── favicon.ico
├── server/
│   ├── routes/
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── db/
│   │   └── schema.sql
│   └── index.ts
├── bunfig.toml
└── package.json
```

### Environment-Based Configuration

```ts title="server/config.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export const config = {
	development: process.env.NODE_ENV !== "production",
	port: process.env.PORT || 3000,
	database: {
		url: process.env.DATABASE_URL || "./dev.db",
	},
	cors: {
		origin: process.env.CORS_ORIGIN || "*",
	},
};
```

### Error Handling

```ts title="server/middleware.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function errorHandler(error: Error, req: Request) {
	console.error("Server error:", error);

	if (process.env.NODE_ENV === "production") {
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}

	return Response.json(
		{
			error: error.message,
			stack: error.stack,
		},
		{ status: 500 },
	);
}
```

### API Response Helpers

```ts title="server/utils.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function json(data: any, status = 200) {
	return Response.json(data, { status });
}

export function error(message: string, status = 400) {
	return Response.json({ error: message }, { status });
}

export function notFound(message = "Not found") {
	return error(message, 404);
}

export function unauthorized(message = "Unauthorized") {
	return error(message, 401);
}
```

### Type Safety

```ts title="types/api.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export interface User {
	id: number;
	name: string;
	email: string;
	created_at: string;
}

export interface CreateUserRequest {
	name: string;
	email: string;
}

export interface ApiResponse<T> {
	data?: T;
	error?: string;
}
```

## Deployment

### Production Build

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Build for production
bun build --target=bun --production --outdir=dist ./server/index.ts

# Run production server
NODE_ENV=production bun dist/index.js
```

### Docker Deployment

```dockerfile title="Dockerfile" icon="docker" theme={"theme":{"light":"github-light","dark":"dracula"}}
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN bun build --target=bun --production --outdir=dist ./server/index.ts

# Production stage
FROM oven/bun:1-slim
WORKDIR /usr/src/app
COPY --from=base /usr/src/app/dist ./
COPY --from=base /usr/src/app/public ./public

EXPOSE 3000
CMD ["bun", "index.js"]
```

### Environment Variables

```bash title=".env.production" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp
CORS_ORIGIN=https://myapp.com
```

## Migration from Other Frameworks

### From Express + Webpack

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Before (Express + Webpack)
app.use(express.static("dist"));
app.get("/api/users", (req, res) => {
	res.json(users);
});

// After (Bun fullstack)
serve({
	routes: {
		"/": homepage, // Replaces express.static
		"/api/users": {
			GET() {
				return Response.json(users);
			},
		},
	},
});
```

### From Next.js API Routes

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Before (Next.js)
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(users);
  }
}

// After (Bun)
"/api/users": {
  GET() { return Response.json(users); }
}
```

## Limitations and Future Plans

### Current Limitations

* `bun build` CLI integration is not yet available for fullstack apps
* Auto-discovery of API routes is not implemented
* Server-side rendering (SSR) is not built-in

### Planned Features

* Integration with `bun build` CLI
* File-based routing for API endpoints
* Built-in SSR support
* Enhanced plugin ecosystem

<Note>This is a work in progress. Features and APIs may change as Bun continues to evolve.</Note>

# Hot reloading

> Hot Module Replacement (HMR) for Bun's development server

Hot Module Replacement (HMR) allows you to update modules in a running application without needing a full page reload. This preserves the application state and improves the development experience.

<Note>HMR is enabled by default when using Bun's full-stack development server.</Note>

## `import.meta.hot` API Reference

Bun implements a client-side HMR API modeled after [Vite's `import.meta.hot` API](https://vitejs.dev/guide/api-hmr.html). It can be checked for with `if (import.meta.hot)`, tree-shaking it in production.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
if (import.meta.hot) {
	// HMR APIs are available.
}
```

However, this check is often not needed as Bun will dead-code-eliminate calls to all of the HMR APIs in production builds.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// This entire function call will be removed in production!
import.meta.hot.dispose(() => {
	console.log("dispose");
});
```

<Warning>
  For this to work, Bun forces these APIs to be called without indirection. That means the following do not work:

  ```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  // INVALID: Assigning `hot` to a variable
  const hot = import.meta.hot;
  hot.accept();

  // INVALID: Assigning `import.meta` to a variable
  const meta = import.meta;
  meta.hot.accept();
  console.log(meta.hot.data);

  // INVALID: Passing to a function
  doSomething(import.meta.hot.dispose);

  // OK: The full phrase "import.meta.hot.<API>" must be called directly:
  import.meta.hot.accept();

  // OK: `data` can be passed to functions:
  doSomething(import.meta.hot.data);
  ```
</Warning>

<Note>
  The HMR API is still a work in progress. Some features are missing. HMR can be disabled in `Bun.serve` by setting the development option to `{ hmr: false }`.
</Note>

## API Methods

| Method             | Status | Notes                                                                 |
| ------------------ | ------ | --------------------------------------------------------------------- |
| `hot.accept()`     | ✅      | Indicate that a hot update can be replaced gracefully.                |
| `hot.data`         | ✅      | Persist data between module evaluations.                              |
| `hot.dispose()`    | ✅      | Add a callback function to run when a module is about to be replaced. |
| `hot.invalidate()` | ❌      |                                                                       |
| `hot.on()`         | ✅      | Attach an event listener                                              |
| `hot.off()`        | ✅      | Remove an event listener from `on`.                                   |
| `hot.send()`       | ❌      |                                                                       |
| `hot.prune()`      | 🚧     | NOTE: Callback is currently never called.                             |
| `hot.decline()`    | ✅      | No-op to match Vite's `import.meta.hot`                               |

## import.meta.hot.accept()

The `accept()` method indicates that a module can be hot-replaced. When called without arguments, it indicates that this module can be replaced simply by re-evaluating the file. After a hot update, importers of this module will be automatically patched.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// index.ts
import { getCount } from "./foo.ts";

console.log("count is ", getCount());

import.meta.hot.accept();

export function getNegativeCount() {
	return -getCount();
}
```

This creates a hot-reloading boundary for all of the files that `index.ts` imports. That means whenever `foo.ts` or any of its dependencies are saved, the update will bubble up to `index.ts` will re-evaluate. Files that import `index.ts` will then be patched to import the new version of `getNegativeCount()`. If only `index.ts` is updated, only the one file will be re-evaluated, and the counter in `foo.ts` is reused.

This may be used in combination with `import.meta.hot.data` to transfer state from the previous module to the new one.

<Info>
  When no modules call `import.meta.hot.accept()` (and there isn't React Fast Refresh or a plugin
  calling it for you), the page will reload when the file updates, and a console warning shows which
  files were invalidated. This warning is safe to ignore if it makes more sense to rely on full page
  reloads.
</Info>

### With callback

When provided one callback, `import.meta.hot.accept` will function how it does in Vite. Instead of patching the importers of this module, it will call the callback with the new module.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export const count = 0;

import.meta.hot.accept(newModule => {
	if (newModule) {
		// newModule is undefined when SyntaxError happened
		console.log("updated: count is now ", newModule.count);
	}
});
```

<Tip>
  Prefer using `import.meta.hot.accept()` without an argument as it usually makes your code easier
  to understand.
</Tip>

### Accepting other modules

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { count } from "./foo";

import.meta.hot.accept("./foo", () => {
	if (!newModule) return;

	console.log("updated: count is now ", count);
});
```

Indicates that a dependency's module can be accepted. When the dependency is updated, the callback will be called with the new module.

### With multiple dependencies

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import.meta.hot.accept(["./foo", "./bar"], newModules => {
	// newModules is an array where each item corresponds to the updated module
	// or undefined if that module had a syntax error
});
```

Indicates that multiple dependencies' modules can be accepted. This variant accepts an array of dependencies, where the callback will receive the updated modules, and `undefined` for any that had errors.

## import.meta.hot.data

`import.meta.hot.data` maintains state between module instances during hot replacement, enabling data transfer from previous to new versions. When `import.meta.hot.data` is written into, Bun will also mark this module as capable of self-accepting (equivalent of calling `import.meta.hot.accept()`).

```jsx title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { createRoot } from "react-dom/client";
import { App } from "./app";

const root = (import.meta.hot.data.root ??= createRoot(elem));
root.render(<App />); // re-use an existing root
```

In production, `data` is inlined to be `{}`, meaning it cannot be used as a state holder.

<Tip>
  The above pattern is recommended for stateful modules because Bun knows it can minify `{}.prop ??=
  	value` into `value` in production.
</Tip>

## import.meta.hot.dispose()

Attaches an on-dispose callback. This is called:

* Just before the module is replaced with another copy (before the next is loaded)
* After the module is detached (removing all imports to this module, see `import.meta.hot.prune()`)

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const sideEffect = setupSideEffect();

import.meta.hot.dispose(() => {
	sideEffect.cleanup();
});
```

<Warning>This callback is not called on route navigation or when the browser tab closes.</Warning>

Returning a promise will delay module replacement until the module is disposed. All dispose callbacks are called in parallel.

## import.meta.hot.prune()

Attaches an on-prune callback. This is called when all imports to this module are removed, but the module was previously loaded.

This can be used to clean up resources that were created when the module was loaded. Unlike `import.meta.hot.dispose()`, this pairs much better with `accept` and `data` to manage stateful resources. A full example managing a WebSocket:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { something } from "./something";

// Initialize or re-use a WebSocket connection
export const ws = (import.meta.hot.data.ws ??= new WebSocket(location.origin));

// If the module's import is removed, clean up the WebSocket connection.
import.meta.hot.prune(() => {
	ws.close();
});
```

<Info>
  If `dispose` was used instead, the WebSocket would close and re-open on every hot update. Both
  versions of the code will prevent page reloads when imported files are updated.
</Info>

## import.meta.hot.on() and off()

`on()` and `off()` are used to listen for events from the HMR runtime. Event names are prefixed with a prefix so that plugins do not conflict with each other.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import.meta.hot.on("bun:beforeUpdate", () => {
	console.log("before a hot update");
});
```

When a file is replaced, all of its event listeners are automatically removed.

### Built-in events

| Event                  | Emitted when                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `bun:beforeUpdate`     | before a hot update is applied.                                                                 |
| `bun:afterUpdate`      | after a hot update is applied.                                                                  |
| `bun:beforeFullReload` | before a full page reload happens.                                                              |
| `bun:beforePrune`      | before prune callbacks are called.                                                              |
| `bun:invalidate`       | when a module is invalidated with `import.meta.hot.invalidate()`                                |
| `bun:error`            | when a build or runtime error occurs                                                            |
| `bun:ws:disconnect`    | when the HMR WebSocket connection is lost. This can indicate the development server is offline. |
| `bun:ws:connect`       | when the HMR WebSocket connects or re-connects.                                                 |

<Note>
  For compatibility with Vite, the above events are also available via `vite:*` prefix instead of
  `bun:*`.
</Note>

# HTML & static sites

> Build static sites, landing pages, and web applications with Bun's bundler

Bun's bundler has first-class support for HTML. Build static sites, landing pages, and web applications with zero configuration. Just point Bun at your HTML file and it handles everything else.

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!doctype html>
<html>
	<head>
		<link rel="stylesheet" href="./styles.css" />
		<script src="./app.ts" type="module"></script>
	</head>
	<body>
		<img src="./logo.png" />
	</body>
</html>
```

To get started, pass HTML files to `bun`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./index.html
```

```
Bun v1.2.20
ready in 6.62ms
→ http://localhost:3000/
Press h + Enter to show shortcuts
```

Bun's development server provides powerful features with zero configuration:

* **Automatic Bundling** - Bundles and serves your HTML, JavaScript, and CSS
* **Multi-Entry Support** - Handles multiple HTML entry points and glob entry points
* **Modern JavaScript** - TypeScript & JSX support out of the box
* **Smart Configuration** - Reads `tsconfig.json` for paths, JSX options, experimental decorators, and more
* **Plugins** - Plugins for TailwindCSS and more
* **ESM & CommonJS** - Use ESM and CommonJS in your JavaScript, TypeScript, and JSX files
* **CSS Bundling & Minification** - Bundles CSS from `<link>` tags and `@import` statements
* **Asset Management** - Automatic copying & hashing of images and assets; Rewrites asset paths in JavaScript, CSS, and HTML

## Single Page Apps (SPA)

When you pass a single `.html` file to Bun, Bun will use it as a fallback route for all paths. This makes it perfect for single page apps that use client-side routing:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun index.html
```

```
Bun v1.2.20
ready in 6.62ms
→ http://localhost:3000/
Press h + Enter to show shortcuts
```

Your React or other SPA will work out of the box — no configuration needed. All routes like `/about`, `/users/123`, etc. will serve the same HTML file, letting your client-side router handle the navigation.

```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!doctype html>
<html>
	<head>
		<title>My SPA</title>
		<script src="./app.tsx" type="module"></script>
	</head>
	<body>
		<div id="root"></div>
	</body>
</html>
```

## Multi-page apps (MPA)

Some projects have several separate routes or HTML files as entry points. To support multiple entry points, pass them all to `bun`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./index.html ./about.html
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun v1.2.20
ready in 6.62ms
→ http://localhost:3000/
Routes:
  / ./index.html
  /about ./about.html
Press h + Enter to show shortcuts
```

This will serve:

* `index.html` at `/`
* `about.html` at `/about`

### Glob patterns

To specify multiple files, you can use glob patterns that end in `.html`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./**/*.html
```

```
Bun v1.2.20
ready in 6.62ms
→ http://localhost:3000/
Routes:
  / ./index.html
  /about ./about.html
Press h + Enter to show shortcuts
```

### Path normalization

The base path is chosen from the longest common prefix among all the files.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./index.html ./about/index.html ./about/foo/index.html
```

```
Bun v1.2.20
ready in 6.62ms
→ http://localhost:3000/
Routes:
  / ./index.html
  /about ./about/index.html
  /about/foo ./about/foo/index.html
Press h + Enter to show shortcuts
```

## JavaScript, TypeScript, and JSX

Bun's transpiler natively implements JavaScript, TypeScript, and JSX support. Learn more about loaders in Bun.

<Note>Bun's transpiler is also used at runtime.</Note>

### ES Modules & CommonJS

You can use ESM and CJS in your JavaScript, TypeScript, and JSX files. Bun will handle the transpilation and bundling automatically.

There is no pre-build or separate optimization step. It's all done at the same time.

Learn more about module resolution in Bun.

## CSS

Bun's CSS parser is also natively implemented (clocking in around 58,000 lines of Zig).

It's also a CSS bundler. You can use `@import` in your CSS files to import other CSS files.

For example:

<CodeGroup>
  ```css styles.css icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
  @import "./abc.css";

  .container {
  	background-color: blue;
  }
  ```

  ```css abc.css theme={"theme":{"light":"github-light","dark":"dracula"}}
  body {
  	background-color: red;
  }
  ```
</CodeGroup>

This outputs:

```css  theme={"theme":{"light":"github-light","dark":"dracula"}}
body {
	background-color: red;
}

.container {
	background-color: blue;
}
```

### Referencing local assets in CSS

You can reference local assets in your CSS files.

```css styles.css icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
body {
	background-image: url("./logo.png");
}
```

This will copy `./logo.png` to the output directory and rewrite the path in the CSS file to include a content hash.

```css styles.css icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
body {
	background-image: url("./logo-[ABC123].png");
}
```

### Importing CSS in JavaScript

To associate a CSS file with a JavaScript file, you can import it in your JavaScript file.

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import "./styles.css";
import "./more-styles.css";
```

This generates `./app.css` and `./app.js` in the output directory. All CSS files imported from JavaScript will be bundled into a single CSS file per entry point. If you import the same CSS file from multiple JavaScript files, it will only be included once in the output CSS file.

## Plugins

The dev server supports plugins.

### Tailwind CSS

To use TailwindCSS, install the `bun-plugin-tailwind` plugin:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Or any npm client
bun install --dev bun-plugin-tailwind
```

Then, add the plugin to your `bunfig.toml`:

```toml title="bunfig.toml" icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

Then, reference TailwindCSS in your HTML via `<link>` tag, `@import` in CSS, or import in JavaScript.

<Tabs>
  <Tab title="index.html">
    ```html title="index.html" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
    {/* Reference TailwindCSS in your HTML */}
    <link rel="stylesheet" href="tailwindcss" />
    ```
  </Tab>

  <Tab title="styles.css">
    `css title="styles.css" icon="file-code" @import "tailwindcss"; `
  </Tab>

  <Tab title="app.ts">
    `ts title="app.ts" icon="/icons/typescript.svg" import "tailwindcss"; `
  </Tab>
</Tabs>

<Info>Only one of those are necessary, not all three.</Info>

## Echo console logs from browser to terminal

Bun's dev server supports streaming console logs from the browser to the terminal.

To enable, pass the `--console` CLI flag.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./index.html --console
```

```
Bun v1.2.20
ready in 6.62ms
→ http://localhost:3000/
Press h + Enter to show shortcuts
```

Each call to `console.log` or `console.error` will be broadcast to the terminal that started the server. This is useful to see errors from the browser in the same place you run your server. This is also useful for AI agents that watch terminal output.

Internally, this reuses the existing WebSocket connection from hot module reloading to send the logs.

## Edit files in the browser

Bun's frontend dev server has support for Automatic Workspace Folders in Chrome DevTools, which lets you save edits to files in the browser.

## Keyboard Shortcuts

While the server is running:

* `o + Enter` - Open in browser
* `c + Enter` - Clear console
* `q + Enter` (or `Ctrl+C`) - Quit server

## Build for Production

When you're ready to deploy, use `bun build` to create optimized production bundles:

<Tabs>
  <Tab title="CLI">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun build ./index.html --minify --outdir=dist
    ```
  </Tab>

  <Tab title="API">
    ```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    await Bun.build({
      entrypoints: ["./index.html"],
      outdir: "./dist",
      minify: true,
    });
    ```
  </Tab>
</Tabs>

<Warning>
  Currently, plugins are only supported through `Bun.build`'s API or through `bunfig.toml` with the
  frontend dev server - not yet supported in `bun build`'s CLI.
</Warning>

### Watch Mode

You can run `bun build --watch` to watch for changes and rebuild automatically. This works nicely for library development.

<Info>You've never seen a watch mode this fast.</Info>

## Plugin API

Need more control? Configure the bundler through the JavaScript API and use Bun's builtin `HTMLRewriter` to preprocess HTML.

```ts title="build.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.build({
	entrypoints: ["./index.html"],
	outdir: "./dist",
	minify: true,

	plugins: [
		{
			// A plugin that makes every HTML tag lowercase
			name: "lowercase-html-plugin",
			setup({ onLoad }) {
				const rewriter = new HTMLRewriter().on("*", {
					element(element) {
						element.tagName = element.tagName.toLowerCase();
					},
					text(element) {
						element.replace(element.text.toLowerCase());
					},
				});

				onLoad({ filter: /\.html$/ }, async args => {
					const html = await Bun.file(args.path).text();

					return {
						// Bun's bundler will scan the HTML for <script> tags, <link rel="stylesheet"> tags, and other assets
						// and bundle them automatically
						contents: rewriter.transform(html),
						loader: "html",
					};
				});
			},
		},
	],
});
```

## What Gets Processed?

Bun automatically handles all common web assets:

* **Scripts** (`<script src>`) are run through Bun's JavaScript/TypeScript/JSX bundler
* **Stylesheets** (`<link rel="stylesheet">`) are run through Bun's CSS parser & bundler
* **Images** (`<img>`, `<picture>`) are copied and hashed
* **Media** (`<video>`, `<audio>`, `<source>`) are copied and hashed
* Any `<link>` tag with an `href` attribute pointing to a local file is rewritten to the new path, and hashed

All paths are resolved relative to your HTML file, making it easy to organize your project however you want.

<Warning>
  **This is a work in progress**

  * Need more plugins
  * Need more configuration options for things like asset handling
  * Need a way to configure CORS, headers, etc.

  If you want to submit a PR, most of the code is [here](https://github.com/oven-sh/bun/blob/main/src/bun.js/api/bun/html-rewriter.ts). You could even copy paste that file into your project and use it as a starting point.
</Warning>

## How this works

This is a small wrapper around Bun's support for HTML imports in JavaScript.

## Adding a backend to your frontend

To add a backend to your frontend, you can use the "routes" option in `Bun.serve`.

Learn more in the full-stack docs.

# CSS

> Bun's bundler has built-in support for CSS with modern features

Bun's bundler has built-in support for CSS with the following features:

* Transpiling modern/future features to work on all browsers (including vendor prefixing)
* Minification
* CSS Modules
* Tailwind (via a native bundler plugin)

## Transpiling

Bun's CSS bundler lets you use modern/future CSS features without having to worry about browser compatibility — all thanks to its transpiling and vendor prefixing features which are enabled by default.

Bun's CSS parser and bundler is a direct Rust → Zig port of LightningCSS, with a bundling approach inspired by esbuild. The transpiler converts modern CSS syntax into backwards-compatible equivalents that work across browsers.

<Note>A huge thanks goes to the amazing work from the authors of LightningCSS and esbuild.</Note>

## Browser Compatibility

By default, Bun's CSS bundler targets the following browsers:

* ES2020
* Edge 88+
* Firefox 78+
* Chrome 87+
* Safari 14+

## Syntax Lowering

### Nesting

The CSS Nesting specification allows you to write more concise and intuitive stylesheets by nesting selectors inside one another. Instead of repeating parent selectors across your CSS file, you can write child styles directly within their parent blocks.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* With nesting */
.card {
	background: white;
	border-radius: 4px;

	.title {
		font-size: 1.2rem;
		font-weight: bold;
	}

	.content {
		padding: 1rem;
	}
}
```

Bun's CSS bundler automatically converts this nested syntax into traditional flat CSS that works in all browsers:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Compiled output */
.card {
	background: white;
	border-radius: 4px;
}

.card .title {
	font-size: 1.2rem;
	font-weight: bold;
}

.card .content {
	padding: 1rem;
}
```

You can also nest media queries and other at-rules inside selectors, eliminating the need to repeat selector patterns:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.responsive-element {
	display: block;

	@media (min-width: 768px) {
		display: flex;
	}
}
```

This compiles to:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.responsive-element {
	display: block;
}

@media (min-width: 768px) {
	.responsive-element {
		display: flex;
	}
}
```

### Color mix

The `color-mix()` function gives you an easy way to blend two colors together according to a specified ratio in a chosen color space. This powerful feature lets you create color variations without manually calculating the resulting values.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.button {
	/* Mix blue and red in the RGB color space with a 30/70 proportion */
	background-color: color-mix(in srgb, blue 30%, red);

	/* Create a lighter variant for hover state */
	&:hover {
		background-color: color-mix(in srgb, blue 30%, red, white 20%);
	}
}
```

Bun's CSS bundler evaluates these color mixes at build time when all color values are known (not CSS variables), generating static color values that work in all browsers:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.button {
	/* Computed to the exact resulting color */
	background-color: #b31a1a;
}

.button:hover {
	background-color: #c54747;
}
```

This feature is particularly useful for creating color systems with programmatically derived shades, tints, and accents without needing preprocessors or custom tooling.

### Relative colors

CSS now allows you to modify individual components of a color using relative color syntax. This powerful feature lets you create color variations by adjusting specific attributes like lightness, saturation, or individual channels without having to recalculate the entire color.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.theme-color {
	/* Start with a base color and increase lightness by 15% */
	--accent: lch(from purple calc(l + 15%) c h);

	/* Take our brand blue and make a desaturated version */
	--subtle-blue: oklch(from var(--brand-blue) l calc(c * 0.8) h);
}
```

Bun's CSS bundler computes these relative color modifications at build time (when not using CSS variables) and generates static color values for browser compatibility:

```css  theme={"theme":{"light":"github-light","dark":"dracula"}}
.theme-color {
	--accent: lch(69.32% 58.34 328.37);
	--subtle-blue: oklch(60.92% 0.112 240.01);
}
```

This approach is extremely useful for theme generation, creating accessible color variants, or building color scales based on mathematical relationships instead of hard-coding each value.

### LAB colors

Modern CSS supports perceptually uniform color spaces like LAB, LCH, OKLAB, and OKLCH that offer significant advantages over traditional RGB. These color spaces can represent colors outside the standard RGB gamut, resulting in more vibrant and visually consistent designs.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.vibrant-element {
	/* A vibrant red that exceeds sRGB gamut boundaries */
	color: lab(55% 78 35);

	/* A smooth gradient using perceptual color space */
	background: linear-gradient(to right, oklch(65% 0.25 10deg), oklch(65% 0.25 250deg));
}
```

Bun's CSS bundler automatically converts these advanced color formats to backwards-compatible alternatives for browsers that don't yet support them:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.vibrant-element {
	/* Fallback to closest RGB approximation */
	color: #ff0f52;
	/* P3 fallback for browsers with wider gamut support */
	color: color(display-p3 1 0.12 0.37);
	/* Original value preserved for browsers that support it */
	color: lab(55% 78 35);

	background: linear-gradient(to right, #cd4e15, #3887ab);
	background: linear-gradient(to right, oklch(65% 0.25 10deg), oklch(65% 0.25 250deg));
}
```

This layered approach ensures optimal color rendering across all browsers while allowing you to use the latest color technologies in your designs.

### Color function

The `color()` function provides a standardized way to specify colors in various predefined color spaces, expanding your design options beyond the traditional RGB space. This allows you to access wider color gamuts and create more vibrant designs.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.vivid-element {
	/* Using the Display P3 color space for wider gamut colors */
	color: color(display-p3 1 0.1 0.3);

	/* Using A98 RGB color space */
	background-color: color(a98-rgb 0.44 0.5 0.37);
}
```

For browsers that don't support these advanced color functions yet, Bun's CSS bundler provides appropriate RGB fallbacks:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.vivid-element {
	/* RGB fallback first for maximum compatibility */
	color: #fa1a4c;
	/* Keep original for browsers that support it */
	color: color(display-p3 1 0.1 0.3);

	background-color: #6a805d;
	background-color: color(a98-rgb 0.44 0.5 0.37);
}
```

This functionality lets you use modern color spaces immediately while ensuring your designs remain functional across all browsers, with optimal colors displayed in supporting browsers and reasonable approximations elsewhere.

### HWB colors

The HWB (Hue, Whiteness, Blackness) color model provides an intuitive way to express colors based on how much white or black is mixed with a pure hue. Many designers find this approach more natural for creating color variations compared to manipulating RGB or HSL values.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.easy-theming {
	/* Pure cyan with no white or black added */
	--primary: hwb(180 0% 0%);

	/* Same hue, but with 20% white added (tint) */
	--primary-light: hwb(180 20% 0%);

	/* Same hue, but with 30% black added (shade) */
	--primary-dark: hwb(180 0% 30%);

	/* Muted version with both white and black added */
	--primary-muted: hwb(180 30% 20%);
}
```

Bun's CSS bundler automatically converts HWB colors to RGB for compatibility with all browsers:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.easy-theming {
	--primary: #00ffff;
	--primary-light: #33ffff;
	--primary-dark: #00b3b3;
	--primary-muted: #339999;
}
```

The HWB model makes it particularly easy to create systematic color variations for design systems, providing a more intuitive approach to creating consistent tints and shades than working directly with RGB or HSL values.

### Color notation

Modern CSS has introduced more intuitive and concise ways to express colors. Space-separated color syntax eliminates the need for commas in RGB and HSL values, while hex colors with alpha channels provide a compact way to specify transparency.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.modern-styling {
	/* Space-separated RGB notation (no commas) */
	color: rgb(50 100 200);

	/* Space-separated RGB with alpha */
	border-color: rgba(100 50 200 / 75%);

	/* Hex with alpha channel (8 digits) */
	background-color: #00aaff80;

	/* HSL with simplified notation */
	box-shadow: 0 5px 10px hsl(200 50% 30% / 40%);
}
```

Bun's CSS bundler automatically converts these modern color formats to ensure compatibility with older browsers:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.modern-styling {
	/* Converted to comma format for older browsers */
	color: rgb(50, 100, 200);

	/* Alpha channels handled appropriately */
	border-color: rgba(100, 50, 200, 0.75);

	/* Hex+alpha converted to rgba when needed */
	background-color: rgba(0, 170, 255, 0.5);

	box-shadow: 0 5px 10px rgba(38, 115, 153, 0.4);
}
```

This conversion process lets you write cleaner, more modern CSS while ensuring your styles work correctly across all browsers.

### light-dark() color function

The `light-dark()` function provides an elegant solution for implementing color schemes that respect the user's system preference without requiring complex media queries. This function accepts two color values and automatically selects the appropriate one based on the current color scheme context.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
:root {
	/* Define color scheme support */
	color-scheme: light dark;
}

.themed-component {
	/* Automatically picks the right color based on system preference */
	background-color: light-dark(#ffffff, #121212);
	color: light-dark(#333333, #eeeeee);
	border-color: light-dark(#dddddd, #555555);
}

/* Override system preference when needed */
.light-theme {
	color-scheme: light;
}

.dark-theme {
	color-scheme: dark;
}
```

For browsers that don't support this feature yet, Bun's CSS bundler converts it to use CSS variables with proper fallbacks:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
:root {
	--lightningcss-light: initial;
	--lightningcss-dark: ;
	color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
	:root {
		--lightningcss-light: ;
		--lightningcss-dark: initial;
	}
}

.light-theme {
	--lightningcss-light: initial;
	--lightningcss-dark: ;
	color-scheme: light;
}

.dark-theme {
	--lightningcss-light: ;
	--lightningcss-dark: initial;
	color-scheme: dark;
}

.themed-component {
	background-color: var(--lightningcss-light, #ffffff) var(--lightningcss-dark, #121212);
	color: var(--lightningcss-light, #333333) var(--lightningcss-dark, #eeeeee);
	border-color: var(--lightningcss-light, #dddddd) var(--lightningcss-dark, #555555);
}
```

This approach gives you a clean way to handle light and dark themes without duplicating styles or writing complex media queries, while maintaining compatibility with browsers that don't yet support the feature natively.

### Logical properties

CSS logical properties let you define layout, spacing, and sizing relative to the document's writing mode and text direction rather than physical screen directions. This is crucial for creating truly international layouts that automatically adapt to different writing systems.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.multilingual-component {
	/* Margin that adapts to writing direction */
	margin-inline-start: 1rem;

	/* Padding that makes sense regardless of text direction */
	padding-block: 1rem 2rem;

	/* Border radius for the starting corner at the top */
	border-start-start-radius: 4px;

	/* Size that respects the writing mode */
	inline-size: 80%;
	block-size: auto;
}
```

For browsers that don't fully support logical properties, Bun's CSS bundler compiles them to physical properties with appropriate directional adjustments:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* For left-to-right languages */
.multilingual-component:dir(ltr) {
	margin-left: 1rem;
	padding-top: 1rem;
	padding-bottom: 2rem;
	border-top-left-radius: 4px;
	width: 80%;
	height: auto;
}

/* For right-to-left languages */
.multilingual-component:dir(rtl) {
	margin-right: 1rem;
	padding-top: 1rem;
	padding-bottom: 2rem;
	border-top-right-radius: 4px;
	width: 80%;
	height: auto;
}
```

If the `:dir()` selector isn't supported, additional fallbacks are automatically generated to ensure your layouts work properly across all browsers and writing systems. This makes creating internationalized designs much simpler while maintaining compatibility with older browsers.

### :dir() selector

The `:dir()` pseudo-class selector allows you to style elements based on their text direction (RTL or LTR), providing a powerful way to create direction-aware designs without JavaScript. This selector matches elements based on their directionality as determined by the document or explicit direction attributes.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Apply different styles based on text direction */
.nav-arrow:dir(ltr) {
	transform: rotate(0deg);
}

.nav-arrow:dir(rtl) {
	transform: rotate(180deg);
}

/* Position elements based on text flow */
.sidebar:dir(ltr) {
	border-right: 1px solid #ddd;
}

.sidebar:dir(rtl) {
	border-left: 1px solid #ddd;
}
```

For browsers that don't support the `:dir()` selector yet, Bun's CSS bundler converts it to the more widely supported `:lang()` selector with appropriate language mappings:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Converted to use language-based selectors as fallback */
.nav-arrow:lang(en, fr, de, es, it, pt, nl) {
	transform: rotate(0deg);
}

.nav-arrow:lang(ar, he, fa, ur) {
	transform: rotate(180deg);
}

.sidebar:lang(en, fr, de, es, it, pt, nl) {
	border-right: 1px solid #ddd;
}

.sidebar:lang(ar, he, fa, ur) {
	border-left: 1px solid #ddd;
}
```

This conversion lets you write direction-aware CSS that works reliably across browsers, even those that don't yet support the `:dir()` selector natively. If multiple arguments to `:lang()` aren't supported, further fallbacks are automatically provided.

### :lang() selector

The `:lang()` pseudo-class selector allows you to target elements based on the language they're in, making it easy to apply language-specific styling. Modern CSS allows the `:lang()` selector to accept multiple language codes, letting you group language-specific rules more efficiently.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Typography adjustments for CJK languages */
:lang(zh, ja, ko) {
	line-height: 1.8;
	font-size: 1.05em;
}

/* Different quote styles by language group */
blockquote:lang(fr, it, es, pt) {
	font-style: italic;
}

blockquote:lang(de, nl, da, sv) {
	font-weight: 500;
}
```

For browsers that don't support multiple arguments in the `:lang()` selector, Bun's CSS bundler converts this syntax to use the `:is()` selector to maintain the same behavior:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Multiple languages grouped with :is() for better browser support */
:is(:lang(zh), :lang(ja), :lang(ko)) {
	line-height: 1.8;
	font-size: 1.05em;
}

blockquote:is(:lang(fr), :lang(it), :lang(es), :lang(pt)) {
	font-style: italic;
}

blockquote:is(:lang(de), :lang(nl), :lang(da), :lang(sv)) {
	font-weight: 500;
}
```

If needed, Bun can provide additional fallbacks for `:is()` as well, ensuring your language-specific styles work across all browsers. This approach simplifies creating internationalized designs with distinct typographic and styling rules for different language groups.

### :is() selector

The `:is()` pseudo-class function (formerly `:matches()`) allows you to create more concise and readable selectors by grouping multiple selectors together. It accepts a selector list as its argument and matches if any of the selectors in that list match, significantly reducing repetition in your CSS.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Instead of writing these separately */
/* 
.article h1,
.article h2,
.article h3 {
  margin-top: 1.5em;
}
*/

/* You can write this */
.article :is(h1, h2, h3) {
	margin-top: 1.5em;
}

/* Complex example with multiple groups */
:is(header, main, footer) :is(h1, h2, .title) {
	font-family: "Heading Font", sans-serif;
}
```

For browsers that don't support `:is()`, Bun's CSS bundler provides fallbacks using vendor-prefixed alternatives:

```css  theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Fallback using -webkit-any */
.article :-webkit-any(h1, h2, h3) {
	margin-top: 1.5em;
}

/* Fallback using -moz-any */
.article :-moz-any(h1, h2, h3) {
	margin-top: 1.5em;
}

/* Original preserved for modern browsers */
.article :is(h1, h2, h3) {
	margin-top: 1.5em;
}

/* Complex example with fallbacks */
:-webkit-any(header, main, footer) :-webkit-any(h1, h2, .title) {
	font-family: "Heading Font", sans-serif;
}

:-moz-any(header, main, footer) :-moz-any(h1, h2, .title) {
	font-family: "Heading Font", sans-serif;
}

:is(header, main, footer) :is(h1, h2, .title) {
	font-family: "Heading Font", sans-serif;
}
```

<Warning>
  The vendor-prefixed versions have some limitations compared to the standardized `:is()` selector,
  particularly with complex selectors. Bun handles these limitations intelligently, only using
  prefixed versions when they'll work correctly.
</Warning>

### :not() selector

The `:not()` pseudo-class allows you to exclude elements that match a specific selector. The modern version of this selector accepts multiple arguments, letting you exclude multiple patterns with a single, concise selector.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Select all buttons except primary and secondary variants */
button:not(.primary, .secondary) {
	background-color: #f5f5f5;
	border: 1px solid #ddd;
}

/* Apply styles to all headings except those inside sidebars or footers */
h2:not(.sidebar *, footer *) {
	margin-top: 2em;
}
```

For browsers that don't support multiple arguments in `:not()`, Bun's CSS bundler converts this syntax to a more compatible form while preserving the same behavior:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Converted to use :not with :is() for compatibility */
button:not(:is(.primary, .secondary)) {
	background-color: #f5f5f5;
	border: 1px solid #ddd;
}

h2:not(:is(.sidebar *, footer *)) {
	margin-top: 2em;
}
```

And if `:is()` isn't supported, Bun can generate further fallbacks:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Even more fallbacks for maximum compatibility */
button:not(:-webkit-any(.primary, .secondary)) {
	background-color: #f5f5f5;
	border: 1px solid #ddd;
}

button:not(:-moz-any(.primary, .secondary)) {
	background-color: #f5f5f5;
	border: 1px solid #ddd;
}

button:not(:is(.primary, .secondary)) {
	background-color: #f5f5f5;
	border: 1px solid #ddd;
}
```

This conversion ensures your negative selectors work correctly across all browsers while maintaining the correct specificity and behavior of the original selector.

### Math functions

CSS now includes a rich set of mathematical functions that let you perform complex calculations directly in your stylesheets. These include standard math functions (`round()`, `mod()`, `rem()`, `abs()`, `sign()`), trigonometric functions (`sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()`, `atan2()`), and exponential functions (`pow()`, `sqrt()`, `exp()`, `log()`, `hypot()`).

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.dynamic-sizing {
	/* Clamp a value between minimum and maximum */
	width: clamp(200px, 50%, 800px);

	/* Round to the nearest multiple */
	padding: round(14.8px, 5px);

	/* Trigonometry for animations or layouts */
	transform: rotate(calc(sin(45deg) * 50deg));

	/* Complex math with multiple functions */
	--scale-factor: pow(1.25, 3);
	font-size: calc(16px * var(--scale-factor));
}
```

Bun's CSS bundler evaluates these mathematical expressions at build time when all values are known constants (not variables), resulting in optimized output:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.dynamic-sizing {
	width: clamp(200px, 50%, 800px);
	padding: 15px;
	transform: rotate(35.36deg);
	--scale-factor: 1.953125;
	font-size: calc(16px * var(--scale-factor));
}
```

This approach lets you write more expressive and maintainable CSS with meaningful mathematical relationships, which then gets compiled to optimized values for maximum browser compatibility and performance.

### Media query ranges

Modern CSS supports intuitive range syntax for media queries, allowing you to specify breakpoints using comparison operators like `<`, `>`, `<=`, and `>=` instead of the more verbose `min-` and `max-` prefixes. This syntax is more readable and matches how we normally think about values and ranges.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Modern syntax with comparison operators */
@media (width >= 768px) {
	.container {
		max-width: 720px;
	}
}

/* Inclusive range using <= and >= */
@media (768px <= width <= 1199px) {
	.sidebar {
		display: flex;
	}
}

/* Exclusive range using < and > */
@media (width > 320px) and (width < 768px) {
	.mobile-only {
		display: block;
	}
}
```

Bun's CSS bundler converts these modern range queries to traditional media query syntax for compatibility with all browsers:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Converted to traditional min/max syntax */
@media (min-width: 768px) {
	.container {
		max-width: 720px;
	}
}

@media (min-width: 768px) and (max-width: 1199px) {
	.sidebar {
		display: flex;
	}
}

@media (min-width: 321px) and (max-width: 767px) {
	.mobile-only {
		display: block;
	}
}
```

This lets you write more intuitive and mathematical media queries while ensuring your stylesheets work correctly across all browsers, including those that don't support the modern range syntax.

### Shorthands

CSS has introduced several modern shorthand properties that improve code readability and maintainability. Bun's CSS bundler ensures these convenient shorthands work on all browsers by converting them to their longhand equivalents when needed.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
/* Alignment shorthands */
.flex-container {
	/* Shorthand for align-items and justify-items */
	place-items: center start;

	/* Shorthand for align-content and justify-content */
	place-content: space-between center;
}

.grid-item {
	/* Shorthand for align-self and justify-self */
	place-self: end center;
}

/* Two-value overflow */
.content-box {
	/* First value for horizontal, second for vertical */
	overflow: hidden auto;
}

/* Enhanced text-decoration */
.fancy-link {
	/* Combines multiple text decoration properties */
	text-decoration: underline dotted blue 2px;
}

/* Two-value display syntax */
.component {
	/* Outer display type + inner display type */
	display: inline flex;
}
```

For browsers that don't support these modern shorthands, Bun converts them to their component longhand properties:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.flex-container {
	/* Expanded alignment properties */
	align-items: center;
	justify-items: start;

	align-content: space-between;
	justify-content: center;
}

.grid-item {
	align-self: end;
	justify-self: center;
}

.content-box {
	/* Separate overflow properties */
	overflow-x: hidden;
	overflow-y: auto;
}

.fancy-link {
	/* Individual text decoration properties */
	text-decoration-line: underline;
	text-decoration-style: dotted;
	text-decoration-color: blue;
	text-decoration-thickness: 2px;
}

.component {
	/* Single value display */
	display: inline-flex;
}
```

This conversion ensures your stylesheets remain clean and maintainable while providing the broadest possible browser compatibility.

### Double position gradients

The double position gradient syntax is a modern CSS feature that allows you to create hard color stops in gradients by specifying the same color at two adjacent positions. This creates a sharp transition rather than a smooth fade, which is useful for creating stripes, color bands, and other multi-color designs.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.striped-background {
	/* Creates a sharp transition from green to red at 30%-40% */
	background: linear-gradient(
		to right,
		yellow 0%,
		green 20%,
		green 30%,
		red 30%,
		/* Double position creates hard stop */ red 70%,
		blue 70%,
		blue 100%
	);
}

.progress-bar {
	/* Creates distinct color sections */
	background: linear-gradient(
		to right,
		#4caf50 0% 25%,
		/* Green from 0% to 25% */ #ffc107 25% 50%,
		/* Yellow from 25% to 50% */ #2196f3 50% 75%,
		/* Blue from 50% to 75% */ #9c27b0 75% 100% /* Purple from 75% to 100% */
	);
}
```

For browsers that don't support this syntax, Bun's CSS bundler automatically converts it to the traditional format by duplicating color stops:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.striped-background {
	background: linear-gradient(
		to right,
		yellow 0%,
		green 20%,
		green 30%,
		red 30%,
		/* Split into two color stops */ red 70%,
		blue 70%,
		blue 100%
	);
}

.progress-bar {
	background: linear-gradient(
		to right,
		#4caf50 0%,
		#4caf50 25%,
		/* Two stops for green section */ #ffc107 25%,
		#ffc107 50%,
		/* Two stops for yellow section */ #2196f3 50%,
		#2196f3 75%,
		/* Two stops for blue section */ #9c27b0 75%,
		#9c27b0 100% /* Two stops for purple section */
	);
}
```

This conversion lets you use the cleaner double position syntax in your source code while ensuring gradients display correctly in all browsers.

### system-ui font

The `system-ui` generic font family lets you use the device's native UI font, creating interfaces that feel more integrated with the operating system. This provides a more native look and feel without having to specify different font stacks for each platform.

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.native-interface {
	/* Use the system's default UI font */
	font-family: system-ui;
}

.fallback-aware {
	/* System UI font with explicit fallbacks */
	font-family: system-ui, sans-serif;
}
```

For browsers that don't support `system-ui`, Bun's CSS bundler automatically expands it to a comprehensive cross-platform font stack:

```css title="styles.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.native-interface {
	/* Expanded to support all major platforms */
	font-family:
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		Roboto,
		"Noto Sans",
		Ubuntu,
		Cantarell,
		"Helvetica Neue";
}

.fallback-aware {
	/* Preserves the original fallback after the expanded stack */
	font-family:
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		Roboto,
		"Noto Sans",
		Ubuntu,
		Cantarell,
		"Helvetica Neue",
		sans-serif;
}
```

This approach gives you the simplicity of writing just `system-ui` in your source code while ensuring your interface adapts correctly to all operating systems and browsers. The expanded font stack includes appropriate system fonts for macOS/iOS, Windows, Android, Linux, and fallbacks for older browsers.

## CSS Modules

Bun's bundler also supports bundling CSS modules in addition to regular CSS with support for the following features:

* Automatically detecting CSS module files (`.module.css`) with zero configuration
* Composition (`composes` property)
* Importing CSS modules into JSX/TSX
* Warnings/errors for invalid usages of CSS modules

A CSS module is a CSS file (with the `.module.css` extension) where are all class names and animations are scoped to the file. This helps you avoid class name collisions as CSS declarations are globally scoped by default.

Under the hood, Bun's bundler transforms locally scoped class names into unique identifiers.

### Getting started

Create a CSS file with the `.module.css` extension:

```css title="styles.module.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.button {
	color: red;
}
```

```css title="other-styles.module.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.button {
	color: blue;
}
```

You can then import this file, for example into a TSX file:

```tsx title="app.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import styles from "./styles.module.css";
import otherStyles from "./other-styles.module.css";

export default function App() {
	return (
		<>
			<button className={styles.button}>Red button!</button>
			<button className={otherStyles.button}>Blue button!</button>
		</>
	);
}
```

The styles object from importing the CSS module file will be an object with all class names as keys and their unique identifiers as values:

```ts title="app.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import styles from "./styles.module.css";
import otherStyles from "./other-styles.module.css";

console.log(styles);
console.log(otherStyles);
```

This will output:

```ts title="app.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	button: "button_123";
}

{
	button: "button_456";
}
```

As you can see, the class names are unique to each file, avoiding any collisions!

### Composition

CSS modules allow you to compose class selectors together. This lets you reuse style rules across multiple classes.

For example:

```css title="styles.module.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.button {
	composes: background;
	color: red;
}

.background {
	background-color: blue;
}
```

Would be the same as writing:

```css title="styles.module.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.button {
	background-color: blue;
	color: red;
}

.background {
	background-color: blue;
}
```

There are a couple rules to keep in mind when using `composes`:

<Info>
  **Composition Rules:** - A `composes` property must come before any regular CSS properties or
  declarations - You can only use `composes` on a simple selector with a single class name
</Info>

```css title="styles.module.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
#button {
	/* Invalid! `#button` is not a class selector */
	composes: background;
}

.button,
.button-secondary {
	/* Invalid! `.button, .button-secondary` is not a simple selector */
	composes: background;
}
```

### Composing from a separate CSS module file

You can also compose from a separate CSS module file:

```css title="background.module.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.background {
	background-color: blue;
}
```

```css title="styles.module.css" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
.button {
	composes: background from "./background.module.css";
	color: red;
}
```

<Warning>
  When composing classes from separate files, be sure that they do not contain the same properties.

  The CSS module spec says that composing classes from separate files with conflicting properties is undefined behavior, meaning that the output may differ and be unreliable.
</Warning>

# Loaders

> Built-in loaders for the Bun bundler and runtime

The Bun bundler implements a set of default loaders out of the box.

> As a rule of thumb: **the bundler and the runtime both support the same set of file types out of the box.**

`.js` `.cjs` `.mjs` `.mts` `.cts` `.ts` `.tsx` `.jsx` `.toml` `.json` `.txt` `.wasm` `.node` `.html`

Bun uses the file extension to determine which built-in loader should be used to parse the file. Every loader has a name, such as `js`, `tsx`, or `json`. These names are used when building plugins that extend Bun with custom loaders.

You can explicitly specify which loader to use using the `'loader'` import attribute.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import my_toml from "./my_file" with { loader: "toml" };
```

## Built-in loaders

### `js`

**JavaScript loader.** Default for `.cjs` and `.mjs`.

Parses the code and applies a set of default transforms like dead-code elimination and tree shaking. Note that Bun does not attempt to down-convert syntax at the moment.

***

### `jsx`

**JavaScript + JSX loader.** Default for `.js` and `.jsx`.

Same as the `js` loader, but JSX syntax is supported. By default, JSX is down-converted to plain JavaScript; the details of how this is done depends on the `jsx*` compiler options in your `tsconfig.json`. Refer to the [TypeScript documentation on JSX](https://www.typescriptlang.org/tsconfig#jsx) for more information.

***

### `ts`

**TypeScript loader.** Default for `.ts`, `.mts`, and `.cts`.

Strips out all TypeScript syntax, then behaves identically to the `js` loader. Bun does not perform typechecking.

***

### `tsx`

**TypeScript + JSX loader.** Default for `.tsx`.

Transpiles both TypeScript and JSX to vanilla JavaScript.

***

### `json`

**JSON loader.** Default for `.json`.

JSON files can be directly imported.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import pkg from "./package.json";
pkg.name; // => "my-package"
```

During bundling, the parsed JSON is inlined into the bundle as a JavaScript object.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
const pkg = {
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

***

### toml

**TOML loader.** Default for `.toml`.

TOML files can be directly imported. Bun will parse them with its fast native TOML parser.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import config from "./bunfig.toml";
config.logLevel; // => "debug"

// via import attribute:
// import myCustomTOML from './my.config' with {type: "toml"};
```

During bundling, the parsed TOML is inlined into the bundle as a JavaScript object.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
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

***

### text

**Text loader.** Default for `.txt`.

The contents of the text file are read and inlined into the bundle as a string. Text files can be directly imported. The file is read and returned as a string.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import contents from "./file.txt";
console.log(contents); // => "Hello, world!"

// To import an html file as text
// The "type" attribute can be used to override the default loader.
import html from "./index.html" with { type: "text" };
```

When referenced during a build, the contents are inlined into the bundle as a string.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
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

***

### napi

**Native addon loader.** Default for `.node`.

In the runtime, native addons can be directly imported.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import addon from "./addon.node";
console.log(addon);
```

<Note>In the bundler, `.node` files are handled using the file loader.</Note>

***

### sqlite

**SQLite loader.** Requires `with { "type": "sqlite" }` import attribute.

In the runtime and bundler, SQLite databases can be directly imported. This will load the database using `bun:sqlite`.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import db from "./my.db" with { type: "sqlite" };
```

<Warning>This is only supported when the target is `bun`.</Warning>

By default, the database is external to the bundle (so that you can potentially use a database loaded elsewhere), so the database file on-disk won't be bundled into the final output.

You can change this behavior with the `"embed"` attribute:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
// embed the database into the bundle
import db from "./my.db" with { type: "sqlite", embed: "true" };
```

<Info>
  When using a standalone executable, the database is embedded into the single-file executable.

  Otherwise, the database to embed is copied into the `outdir` with a hashed filename.
</Info>

***

### html

The `html` loader processes HTML files and bundles any referenced assets. It will:

* Bundle and hash referenced JavaScript files (`<script src="...">`)
* Bundle and hash referenced CSS files (`<link rel="stylesheet" href="...">`)
* Hash referenced images (`<img src="...">`)
* Preserve external URLs (by default, anything starting with `http://` or `https://`)

For example, given this HTML file:

```html title="src/index.html" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
	<body>
		<img src="./image.jpg" alt="Local image" />
		<img src="https://example.com/image.jpg" alt="External image" />
		<script type="module" src="./script.js"></script>
	</body>
</html>
```

It will output a new HTML file with the bundled assets:

```html title="dist/index.html" theme={"theme":{"light":"github-light","dark":"dracula"}}
<!DOCTYPE html>
<html>
	<body>
		<img src="./image-HASHED.jpg" alt="Local image" />
		<img src="https://example.com/image.jpg" alt="External image" />
		<script type="module" src="./output-ALSO-HASHED.js"></script>
	</body>
</html>
```

Under the hood, it uses [`lol-html`](https://github.com/cloudflare/lol-html) to extract script and link tags as entrypoints, and other assets as external.

<Accordion title="List of supported HTML selectors">
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
</Accordion>

<Note>
  **HTML Loader Behavior in Different Contexts**

  The `html` loader behaves differently depending on how it's used:

  * Static Build: When you run `bun build ./index.html`, Bun produces a static site with all assets bundled and hashed.
  * Runtime: When you run `bun run server.ts` (where `server.ts` imports an HTML file), Bun bundles assets on-the-fly during development, enabling features like hot module replacement.
  * Full-stack Build: When you run `bun build --target=bun server.ts` (where `server.ts` imports an HTML file), the import resolves to a manifest object that `Bun.serve` uses to efficiently serve pre-bundled assets in production.
</Note>

***

### sh

**Bun Shell loader.** Default for `.sh` files.

This loader is used to parse Bun Shell scripts. It's only supported when starting Bun itself, so it's not available in the bundler or in the runtime.

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run ./script.sh
```

***

### file

**File loader.** Default for all unrecognized file types.

The file loader resolves the import as a path/URL to the imported file. It's commonly used for referencing media or font assets.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
// logo.ts
import logo from "./logo.svg";
console.log(logo);
```

In the runtime, Bun checks that the `logo.svg` file exists and converts it to an absolute path to the location of `logo.svg` on disk.

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run logo.ts
# Output: /path/to/project/logo.svg
```

In the bundler, things are slightly different. The file is copied into `outdir` as-is, and the import is resolved as a relative path pointing to the copied file.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Output
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
  The location and file name of the copied file is determined by the value of `naming.asset`.

  This loader is copied into the `outdir` as-is. The name of the copied file is determined using the value of `naming.asset`.
</Note>

# Single-file executable

> Generate standalone executables from TypeScript or JavaScript files with Bun

Bun's bundler implements a `--compile` flag for generating a standalone binary from a TypeScript or JavaScript file.

<CodeGroup>
  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun build ./cli.ts --compile --outfile mycli
  ```

  ```ts cli.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  console.log("Hello world!");
  ```
</CodeGroup>

This bundles `cli.ts` into an executable that can be executed directly:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
./mycli
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Hello world!
```

All imported files and packages are bundled into the executable, along with a copy of the Bun runtime. All built-in Bun and Node.js APIs are supported.

***

## Cross-compile to other platforms

The `--target` flag lets you compile your standalone executable for a different operating system, architecture, or version of Bun than the machine you're running `bun build` on.

To build for Linux x64 (most servers):

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --target=bun-linux-x64 ./index.ts --outfile myapp

# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-linux-x64-baseline ./index.ts --outfile myapp

# To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
# modern is faster, but baseline is more compatible.
bun build --compile --target=bun-linux-x64-modern ./index.ts --outfile myapp
```

To build for Linux ARM64 (e.g. Graviton or Raspberry Pi):

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
# Note: the default architecture is x64 if no architecture is specified.
bun build --compile --target=bun-linux-arm64 ./index.ts --outfile myapp
```

To build for Windows x64:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --target=bun-windows-x64 ./path/to/my/app.ts --outfile myapp

# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-windows-x64-baseline ./path/to/my/app.ts --outfile myapp

# To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
bun build --compile --target=bun-windows-x64-modern ./path/to/my/app.ts --outfile myapp

# note: if no .exe extension is provided, Bun will automatically add it for Windows executables
```

To build for macOS arm64:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --target=bun-darwin-arm64 ./path/to/my/app.ts --outfile myapp
```

To build for macOS x64:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --target=bun-darwin-x64 ./path/to/my/app.ts --outfile myapp
```

### Supported targets

The order of the `--target` flag does not matter, as long as they're delimited by a `-`.

| --target              | Operating System | Architecture | Modern | Baseline | Libc  |
| --------------------- | ---------------- | ------------ | ------ | -------- | ----- |
| bun-linux-x64         | Linux            | x64          | ✅      | ✅        | glibc |
| bun-linux-arm64       | Linux            | arm64        | ✅      | N/A      | glibc |
| bun-windows-x64       | Windows          | x64          | ✅      | ✅        | -     |
| ~~bun-windows-arm64~~ | Windows          | arm64        | ❌      | ❌        | -     |
| bun-darwin-x64        | macOS            | x64          | ✅      | ✅        | -     |
| bun-darwin-arm64      | macOS            | arm64        | ✅      | N/A      | -     |
| bun-linux-x64-musl    | Linux            | x64          | ✅      | ✅        | musl  |
| bun-linux-arm64-musl  | Linux            | arm64        | ✅      | N/A      | musl  |

<Warning>
  On x64 platforms, Bun uses SIMD optimizations which require a modern CPU supporting AVX2
  instructions. The `-baseline` build of Bun is for older CPUs that don't support these
  optimizations. Normally, when you install Bun we automatically detect which version to use but
  this can be harder to do when cross-compiling since you might not know the target CPU. You usually
  don't need to worry about it on Darwin x64, but it is relevant for Windows x64 and Linux x64. If
  you or your users see `"Illegal instruction"` errors, you might need to use the baseline version.
</Warning>

***

## Build-time constants

Use the `--define` flag to inject build-time constants into your executable, such as version numbers, build timestamps, or configuration values:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --define BUILD_VERSION='"1.2.3"' --define BUILD_TIME='"2024-01-15T10:30:00Z"' src/cli.ts --outfile mycli
```

These constants are embedded directly into your compiled binary at build time, providing zero runtime overhead and enabling dead code elimination optimizations.

<Note>
  For comprehensive examples and advanced patterns, see the [Build-time constants
  guide](https://bun.com/guides/runtime/build-time-constants).
</Note>

***

## Deploying to production

Compiled executables reduce memory usage and improve Bun's start time.

Normally, Bun reads and transpiles JavaScript and TypeScript files on `import` and `require`. This is part of what makes so much of Bun "just work", but it's not free. It costs time and memory to read files from disk, resolve file paths, parse, transpile, and print source code.

With compiled executables, you can move that cost from runtime to build-time.

When deploying to production, we recommend the following:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --minify --sourcemap ./path/to/my/app.ts --outfile myapp
```

### Bytecode compilation

To improve startup time, enable bytecode compilation:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --minify --sourcemap --bytecode ./path/to/my/app.ts --outfile myapp
```

Using bytecode compilation, `tsc` starts 2x faster:

<Frame>
  ![Bytecode performance
  comparison](https://github.com/user-attachments/assets/dc8913db-01d2-48f8-a8ef-ac4e984f9763)
</Frame>

Bytecode compilation moves parsing overhead for large input files from runtime to bundle time. Your app starts faster, in exchange for making the `bun build` command a little slower. It doesn't obscure source code.

<Warning>
  **Experimental:** Bytecode compilation is an experimental feature introduced in Bun v1.1.30. Only
  `cjs` format is supported (which means no top-level-await). Let us know if you run into any
  issues!
</Warning>

### What do these flags do?

The `--minify` argument optimizes the size of the transpiled output code. If you have a large application, this can save megabytes of space. For smaller applications, it might still improve start time a little.

The `--sourcemap` argument embeds a sourcemap compressed with zstd, so that errors & stacktraces point to their original locations instead of the transpiled location. Bun will automatically decompress & resolve the sourcemap when an error occurs.

The `--bytecode` argument enables bytecode compilation. Every time you run JavaScript code in Bun, JavaScriptCore (the engine) will compile your source code into bytecode. We can move this parsing work from runtime to bundle time, saving you startup time.

***

## Embedding runtime arguments

**`--compile-exec-argv="args"`** - Embed runtime arguments that are available via `process.execArgv`:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --compile-exec-argv="--smol --user-agent=MyBot" ./app.ts --outfile myapp
```

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// In the compiled app
console.log(process.execArgv); // ["--smol", "--user-agent=MyBot"]
```

***

## Act as the Bun CLI

<Note>New in Bun v1.2.16</Note>

You can run a standalone executable as if it were the `bun` CLI itself by setting the `BUN_BE_BUN=1` environment variable. When this variable is set, the executable will ignore its bundled entrypoint and instead expose all the features of Bun's CLI.

For example, consider an executable compiled from a simple script:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
echo "console.log(\"you shouldn't see this\");" > such-bun.js
bun build --compile ./such-bun.js
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
[3ms] bundle 1 modules
[89ms] compile such-bun
```

Normally, running `./such-bun` with arguments would execute the script.

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
# Executable runs its own entrypoint by default
./such-bun install
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
you shouldn't see this
```

However, with the `BUN_BE_BUN=1` environment variable, it acts just like the `bun` binary:

```bash icon="terminal" terminal theme={"theme":{"light":"github-light","dark":"dracula"}}
# With the env var, the executable acts like the `bun` CLI
bun_BE_BUN=1 ./such-bun install
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install v1.2.16-canary.1 (1d1db811)
Checked 63 installs across 64 packages (no changes) [5.00ms]
```

This is useful for building CLI tools on top of Bun that may need to install packages, bundle dependencies, run different or local files and more without needing to download a separate binary or install bun.

***

## Full-stack executables

<Note>New in Bun v1.2.17</Note>

Bun's `--compile` flag can create standalone executables that contain both server and client code, making it ideal for full-stack applications. When you import an HTML file in your server code, Bun automatically bundles all frontend assets (JavaScript, CSS, etc.) and embeds them into the executable. When Bun sees the HTML import on the server, it kicks off a frontend build process to bundle JavaScript, CSS, and other assets.

<CodeGroup>
  ```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { serve } from "bun";
  import index from "./index.html";

  const server = serve({
  	routes: {
  		"/": index,
  		"/api/hello": { GET: () => Response.json({ message: "Hello from API" }) },
  	},
  });

  console.log(`Server running at http://localhost:${server.port}`);
  ```

  ```html index.html icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
  <!DOCTYPE html>
  <html>
  	<head>
  		<title>My App</title>
  		<link rel="stylesheet" href="./styles.css" />
  	</head>
  	<body>
  		<h1>Hello World</h1>
  		<script src="./app.js"></script>
  	</body>
  </html>
  ```

  ```ts app.js icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
  console.log("Hello from the client!");
  ```

  ```css styles.css icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
  body {
  	background-color: #f0f0f0;
  }
  ```
</CodeGroup>

To build this into a single executable:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile ./server.ts --outfile myapp
```

This creates a self-contained binary that includes:

* Your server code
* The Bun runtime
* All frontend assets (HTML, CSS, JavaScript)
* Any npm packages used by your server

The result is a single file that can be deployed anywhere without needing Node.js, Bun, or any dependencies installed. Just run:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
./myapp
```

Bun automatically handles serving the frontend assets with proper MIME types and cache headers. The HTML import is replaced with a manifest object that `Bun.serve` uses to efficiently serve pre-bundled assets.

For more details on building full-stack applications with Bun, see the [full-stack guide](/bundler/fullstack).

***

## Worker

To use workers in a standalone executable, add the worker's entrypoint to the CLI arguments:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile ./index.ts ./my-worker.ts --outfile myapp
```

Then, reference the worker in your code:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log("Hello from Bun!");

// Any of these will work:
new Worker("./my-worker.ts");
new Worker(new URL("./my-worker.ts", import.meta.url));
new Worker(new URL("./my-worker.ts", import.meta.url).href);
```

As of Bun v1.1.25, when you add multiple entrypoints to a standalone executable, they will be bundled separately into the executable.

In the future, we may automatically detect usages of statically-known paths in `new Worker(path)` and then bundle those into the executable, but for now, you'll need to add it to the shell command manually like the above example.

If you use a relative path to a file not included in the standalone executable, it will attempt to load that path from disk relative to the current working directory of the process (and then error if it doesn't exist).

***

## SQLite

You can use `bun:sqlite` imports with `bun build --compile`.

By default, the database is resolved relative to the current working directory of the process.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import db from "./my.db" with { type: "sqlite" };

console.log(db.query("select * from users LIMIT 1").get());
```

That means if the executable is located at `/usr/bin/hello`, the user's terminal is located at `/home/me/Desktop`, it will look for `/home/me/Desktop/my.db`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
cd /home/me/Desktop
./hello
```

***

## Embed assets & files

Standalone executables support embedding files.

To embed files into an executable with `bun build --compile`, import the file in your code.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// this becomes an internal file path
import icon from "./icon.png" with { type: "file" };
import { file } from "bun";

export default {
	fetch(req) {
		// Embedded files can be streamed from Response objects
		return new Response(file(icon));
	},
};
```

Embedded files can be read using `Bun.file`'s functions or the Node.js `fs.readFile` function (in `"node:fs"`).

For example, to read the contents of the embedded file:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import icon from "./icon.png" with { type: "file" };
import { file } from "bun";

const bytes = await file(icon).arrayBuffer();
// await fs.promises.readFile(icon)
// fs.readFileSync(icon)
```

### Embed SQLite databases

If your application wants to embed a SQLite database, set `type: "sqlite"` in the import attribute and the `embed` attribute to `"true"`.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import myEmbeddedDb from "./my.db" with { type: "sqlite", embed: "true" };

console.log(myEmbeddedDb.query("select * from users LIMIT 1").get());
```

This database is read-write, but all changes are lost when the executable exits (since it's stored in memory).

### Embed N-API Addons

As of Bun v1.0.23, you can embed `.node` files into executables.

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const addon = require("./addon.node");

console.log(addon.hello());
```

Unfortunately, if you're using `@mapbox/node-pre-gyp` or other similar tools, you'll need to make sure the `.node` file is directly required or it won't bundle correctly.

### Embed directories

To embed a directory with `bun build --compile`, use a shell glob in your `bun build` command:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile ./index.ts ./public/**/*.png
```

Then, you can reference the files in your code:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import icon from "./public/assets/icon.png" with { type: "file" };
import { file } from "bun";

export default {
	fetch(req) {
		// Embedded files can be streamed from Response objects
		return new Response(file(icon));
	},
};
```

This is honestly a workaround, and we expect to improve this in the future with a more direct API.

### Listing embedded files

To get a list of all embedded files, use `Bun.embeddedFiles`:

```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import "./icon.png" with { type: "file" };
import { embeddedFiles } from "bun";

console.log(embeddedFiles[0].name); // `icon-${hash}.png`
```

`Bun.embeddedFiles` returns an array of `Blob` objects which you can use to get the size, contents, and other properties of the files.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
embeddedFiles: Blob[]
```

The list of embedded files excludes bundled source code like `.ts` and `.js` files.

#### Content hash

By default, embedded files have a content hash appended to their name. This is useful for situations where you want to serve the file from a URL or CDN and have fewer cache invalidation issues. But sometimes, this is unexpected and you might want the original name instead:

To disable the content hash, pass `--asset-naming` to `bun build --compile` like this:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --asset-naming="[name].[ext]" ./index.ts
```

***

## Minification

To trim down the size of the executable a little, pass `--minify` to `bun build --compile`. This uses Bun's minifier to reduce the code size. Overall though, Bun's binary is still way too big and we need to make it smaller.

***

## Windows-specific flags

When compiling a standalone executable on Windows, there are two platform-specific options that can be used to customize metadata on the generated `.exe` file:

* `--windows-icon=path/to/icon.ico` to customize the executable file icon.
* `--windows-hide-console` to disable the background terminal, which can be used for applications that do not need a TTY.

<Warning>
  These flags currently cannot be used when cross-compiling because they depend on Windows APIs.
</Warning>

***

## Code signing on macOS

To codesign a standalone executable on macOS (which fixes Gatekeeper warnings), use the `codesign` command.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
codesign --deep --force -vvvv --sign "XXXXXXXXXX" ./myapp
```

We recommend including an `entitlements.plist` file with JIT permissions.

```xml icon="xml" title="info.plist" theme={"theme":{"light":"github-light","dark":"dracula"}}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-executable-page-protection</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

To codesign with JIT support, pass the `--entitlements` flag to `codesign`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
codesign --deep --force -vvvv --sign "XXXXXXXXXX" --entitlements entitlements.plist ./myapp
```

After codesigning, verify the executable:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
codesign -vvv --verify ./myapp
./myapp: valid on disk
./myapp: satisfies its Designated Requirement
```

<Warning>Codesign support requires Bun v1.2.4 or newer.</Warning>

***

## Unsupported CLI arguments

Currently, the `--compile` flag can only accept a single entrypoint at a time and does not support the following flags:

* `--outdir` — use `outfile` instead.
* `--splitting`
* `--public-path`
* `--target=node` or `--target=browser`
* `--no-bundle` - we always bundle everything into the executable.


# Plugins

> Universal plugin API for extending Bun's runtime and bundler

Bun provides a universal plugin API that can be used to extend both the runtime and bundler.

Plugins intercept imports and perform custom loading logic: reading files, transpiling code, etc. They can be used to add support for additional file types, like `.scss` or `.yaml`. In the context of Bun's bundler, plugins can be used to implement framework-level features like CSS extraction, macros, and client-server code co-location.

## Lifecycle hooks

Plugins can register callbacks to be run at various points in the lifecycle of a bundle:

* `onStart()`: Run once the bundler has started a bundle
* `onResolve()`: Run before a module is resolved
* `onLoad()`: Run before a module is loaded
* `onBeforeParse()`: Run zero-copy native addons in the parser thread before a file is parsed

## Reference

A rough overview of the types (please refer to Bun's `bun.d.ts` for the full type definitions):

```ts title="bun.d.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
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

```ts title="myPlugin.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from "bun";

const myPlugin: BunPlugin = {
	name: "Custom loader",
	setup(build) {
		// implementation
	},
};
```

This plugin can be passed into the `plugins` array when calling `Bun.build`.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
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

### onStart

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
onStart(callback: () => void): Promise<void> | void;
```

Registers a callback to be run when the bundler starts a new bundle.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
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

The callback can return a Promise. After the bundle process has initialized, the bundler waits until all `onStart()` callbacks have completed before continuing.

For example:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const result = await Bun.build({
	entrypoints: ["./app.ts"],
	outdir: "./dist",
	sourcemap: "external",
	plugins: [
		{
			name: "Sleep for 10 seconds",
			setup(build) {
				build.onStart(async () => {
					await Bun.sleep(10_000);
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

In the above example, Bun will wait until the first `onStart()` (sleeping for 10 seconds) has completed, as well as the second `onStart()` (writing the bundle time to a file).

<Note>
  `onStart()` callbacks (like every other lifecycle callback) do not have the ability to modify the
  `build.config` object. If you want to mutate `build.config`, you must do so directly in the
  `setup()` function.
</Note>

### onResolve

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

The first argument to `onResolve()` is an object with a `filter` and `namespace` property. The `filter` is a regular expression which is run on the import string. Effectively, these allow you to filter which modules your custom resolution logic will apply to.

The second argument to `onResolve()` is a callback which is run for each module import Bun finds that matches the filter and namespace defined in the first argument.

The callback receives as input the path to the matching module. The callback can return a new path for the module. Bun will read the contents of the new path and parse it as a module.

For example, redirecting all imports to `images/` to `./public/images/`:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
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

### onLoad

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

The `onLoad()` plugin lifecycle callback allows you to modify the contents of a module before it is read and parsed by Bun.

Like `onResolve()`, the first argument to `onLoad()` allows you to filter which modules this invocation of `onLoad()` will apply to.

The second argument to `onLoad()` is a callback which is run for each matching module before Bun loads the contents of the module into memory.

This callback receives as input the path to the matching module, the importer of the module (the module that imported the module), the namespace of the module, and the kind of the module.

The callback can return a new `contents` string for the module as well as a new `loader`.

For example:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
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

#### .defer()

One of the arguments passed to the `onLoad` callback is a `defer` function. This function returns a Promise that is resolved when all other modules have been loaded.

This allows you to delay execution of the `onLoad` callback until all other modules have been loaded.

This is useful for returning contents of a module that depends on other modules.

<Accordion title="Example: tracking and reporting unused exports">
  ```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
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
</Accordion>

<Warning>
  The `.defer()` function currently has the limitation that it can only be called once per `onLoad`
  callback.
</Warning>

## Native plugins

One of the reasons why Bun's bundler is so fast is that it is written in native code and leverages multi-threading to load and parse modules in parallel.

However, one limitation of plugins written in JavaScript is that JavaScript itself is single-threaded.

Native plugins are written as NAPI modules and can be run on multiple threads. This allows native plugins to run much faster than JavaScript plugins.

In addition, native plugins can skip unnecessary work such as the UTF-8 -> UTF-16 conversion needed to pass strings to JavaScript.

These are the following lifecycle hooks which are available to native plugins:

* `onBeforeParse()`: Called on any thread before a file is parsed by Bun's bundler.

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

Now, inside the `lib.rs` file, we'll use the `bun_native_plugin::bun` proc macro to define a function which will implement our native plugin.

Here's an example implementing the `onBeforeParse` hook:

```rust title="lib.rs" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/rust.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a19fdd19ab10419707f1ba90fa0a2cde" theme={"theme":{"light":"github-light","dark":"dracula"}}
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

And to use it in `Bun.build()`:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
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

### onBeforeParse

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
onBeforeParse(
  args: { filter: RegExp; namespace?: string },
  callback: { napiModule: NapiModule; symbol: string; external?: unknown },
): void;
```

This lifecycle callback is run immediately before a file is parsed by Bun's bundler.

As input, it receives the file's contents and can optionally return new source code.

<Info>
  This callback can be called from any thread and so the napi module implementation must be
  thread-safe.
</Info>


# Macros

> Run JavaScript functions at bundle-time with Bun macros

Macros are a mechanism for running JavaScript functions at bundle-time. The value returned from these functions are directly inlined into your bundle.

As a toy example, consider this simple function that returns a random number.

```ts title="random.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function random() {
	return Math.random();
}
```

This is just a regular function in a regular file, but we can use it as a macro like so:

```tsx title="cli.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { random } from "./random.ts" with { type: "macro" };

console.log(`Your random number is ${random()}`);
```

<Note>
  Macros are indicated using import attribute syntax. If you haven't seen this syntax before, it's a
  Stage 3 TC39 proposal that lets you attach additional metadata to import statements.
</Note>

Now we'll bundle this file with `bun build`. The bundled file will be printed to stdout.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./cli.tsx
```

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(`Your random number is ${0.6805550949689833}`);
```

As you can see, the source code of the `random` function occurs nowhere in the bundle. Instead, it is executed during bundling and function call (`random()`) is replaced with the result of the function. Since the source code will never be included in the bundle, macros can safely perform privileged operations like reading from a database.

## When to use macros

If you have several build scripts for small things where you would otherwise have a one-off build script, bundle-time code execution can be easier to maintain. It lives with the rest of your code, it runs with the rest of the build, it is automatically parallelized, and if it fails, the build fails too.

If you find yourself running a lot of code at bundle-time though, consider running a server instead.

## Import attributes

Bun Macros are import statements annotated using either:

* `with { type: 'macro' }` — an import attribute, a Stage 3 ECMA Script proposal
* `assert { type: 'macro' }` — an import assertion, an earlier incarnation of import attributes that has now been abandoned (but is already supported by a number of browsers and runtimes)

## Security considerations

Macros must explicitly be imported with `{ type: "macro" }` in order to be executed at bundle-time. These imports have no effect if they are not called, unlike regular JavaScript imports which may have side effects.

You can disable macros entirely by passing the `--no-macros` flag to Bun. It produces a build error like this:

```
error: Macros are disabled

foo();
^
./hello.js:3:1 53
```

To reduce the potential attack surface for malicious packages, macros cannot be invoked from inside `node_modules/**/*`. If a package attempts to invoke a macro, you'll see an error like this:

```
error: For security reasons, macros cannot be run from node_modules.

beEvil();
^
node_modules/evil/index.js:3:1 50
```

Your application code can still import macros from `node_modules` and invoke them.

```ts title="cli.tsx" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { macro } from "some-package" with { type: "macro" };

macro();
```

## Export condition "macro"

When shipping a library containing a macro to npm or another package registry, use the `"macro"` export condition to provide a special version of your package exclusively for the macro environment.

```json title="package.json" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-package",
	"exports": {
		"import": "./index.js",
		"require": "./index.js",
		"default": "./index.js",
		"macro": "./index.macro.js"
	}
}
```

With this configuration, users can consume your package at runtime or at bundle-time using the same import specifier:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import pkg from "my-package"; // runtime import
import { macro } from "my-package" with { type: "macro" }; // macro import
```

The first import will resolve to `./node_modules/my-package/index.js`, while the second will be resolved by Bun's bundler to `./node_modules/my-package/index.macro.js`.

## Execution

When Bun's transpiler sees a macro import, it calls the function inside the transpiler using Bun's JavaScript runtime and converts the return value from JavaScript into an AST node. These JavaScript functions are called at bundle-time, not runtime.

Macros are executed synchronously in the transpiler during the visiting phase—before plugins and before the transpiler generates the AST. They are executed in the order they are imported. The transpiler will wait for the macro to finish executing before continuing. The transpiler will also await any Promise returned by a macro.

Bun's bundler is multi-threaded. As such, macros execute in parallel inside of multiple spawned JavaScript "workers".

## Dead code elimination

The bundler performs dead code elimination after running and inlining macros. So given the following macro:

```ts title="returnFalse.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function returnFalse() {
	return false;
}
```

...then bundling the following file will produce an empty bundle, provided that the minify syntax option is enabled.

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { returnFalse } from "./returnFalse.ts" with { type: "macro" };

if (returnFalse()) {
	console.log("This code is eliminated");
}
```

## Serializability

Bun's transpiler needs to be able to serialize the result of the macro so it can be inlined into the AST. All JSON-compatible data structures are supported:

```ts title="macro.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function getObject() {
	return {
		foo: "bar",
		baz: 123,
		array: [1, 2, { nested: "value" }],
	};
}
```

Macros can be async, or return Promise instances. Bun's transpiler will automatically await the Promise and inline the result.

```ts title="macro.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export async function getText() {
	return "async value";
}
```

The transpiler implements special logic for serializing common data formats like `Response`, `Blob`, `TypedArray`.

* **TypedArray**: Resolves to a base64-encoded string.
* **Response**: Bun will read the `Content-Type` and serialize accordingly; for instance, a Response with type `application/json` will be automatically parsed into an object and `text/plain` will be inlined as a string. Responses with an unrecognized or undefined type will be base-64 encoded.
* **Blob**: As with Response, the serialization depends on the `type` property.

The result of `fetch` is `Promise<Response>`, so it can be directly returned.

```ts title="macro.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function getObject() {
	return fetch("https://bun.com");
}
```

Functions and instances of most classes (except those mentioned above) are not serializable.

```ts title="macro.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function getText(url: string) {
	// this doesn't work!
	return () => {};
}
```

## Arguments

Macros can accept inputs, but only in limited cases. The value must be statically known. For example, the following is not allowed:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { getText } from "./getText.ts" with { type: "macro" };

export function howLong() {
	// the value of `foo` cannot be statically known
	const foo = Math.random() ? "foo" : "bar";

	const text = getText(`https://example.com/${foo}`);
	console.log("The page is ", text.length, " characters long");
}
```

However, if the value of `foo` is known at bundle-time (say, if it's a constant or the result of another macro) then it's allowed:

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { getText } from "./getText.ts" with { type: "macro" };
import { getFoo } from "./getFoo.ts" with { type: "macro" };

export function howLong() {
	// this works because getFoo() is statically known
	const foo = getFoo();
	const text = getText(`https://example.com/${foo}`);
	console.log("The page is", text.length, "characters long");
}
```

This outputs:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
function howLong() {
	console.log("The page is", 1322, "characters long");
}
export { howLong };
```

## Examples

### Embed latest git commit hash

```ts title="getGitCommitHash.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export function getGitCommitHash() {
	const { stdout } = Bun.spawnSync({
		cmd: ["git", "rev-parse", "HEAD"],
		stdout: "pipe",
	});

	return stdout.toString();
}
```

When we build it, the `getGitCommitHash` is replaced with the result of calling the function:

<CodeGroup>
  ```ts input theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { getGitCommitHash } from "./getGitCommitHash.ts" with { type: "macro" };

  console.log(`The current Git commit hash is ${getGitCommitHash()}`);
  ```

  ```ts output theme={"theme":{"light":"github-light","dark":"dracula"}}
  console.log(`The current Git commit hash is 3ee3259104e4507cf62c160f0ff5357ec4c7a7f8`);
  ```
</CodeGroup>

<Info>
  You're probably thinking "Why not just use `process.env.GIT_COMMIT_HASH`?" Well, you can do that
  too. But can you do this with an environment variable?
</Info>

### Make fetch() requests at bundle-time

In this example, we make an outgoing HTTP request using `fetch()`, parse the HTML response using `HTMLRewriter`, and return an object containing the title and meta tags–all at bundle-time.

```ts title="meta.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
export async function extractMetaTags(url: string) {
	const response = await fetch(url);
	const meta = {
		title: "",
	};
	new HTMLRewriter()
		.on("title", {
			text(element) {
				meta.title += element.text;
			},
		})
		.on("meta", {
			element(element) {
				const name =
					element.getAttribute("name") ||
					element.getAttribute("property") ||
					element.getAttribute("itemprop");

				if (name) meta[name] = element.getAttribute("content");
			},
		})
		.transform(response);

	return meta;
}
```

The `extractMetaTags` function is erased at bundle-time and replaced with the result of the function call. This means that the fetch request happens at bundle-time, and the result is embedded in the bundle. Also, the branch throwing the error is eliminated since it's unreachable.

<CodeGroup>
  ```jsx input theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { extractMetaTags } from "./meta.ts" with { type: "macro" };

  export const Head = () => {
  	const headTags = extractMetaTags("https://example.com");

  	if (headTags.title !== "Example Domain") {
  		throw new Error("Expected title to be 'Example Domain'");
  	}

  	return (
  		<head>
  			<title>{headTags.title}</title>
  			<meta name="viewport" content={headTags.viewport} />
  		</head>
  	);
  };
  ```

  ```jsx output theme={"theme":{"light":"github-light","dark":"dracula"}}
  export const Head = () => {
  	const headTags = {
  		title: "Example Domain",
  		viewport: "width=device-width, initial-scale=1",
  	};

  	return (
  		<head>
  			<title>{headTags.title}</title>
  			<meta name="viewport" content={headTags.viewport} />
  		</head>
  	);
  };
  ```
</CodeGroup>


# Bytecode Caching

> Speed up JavaScript execution with bytecode caching in Bun's bundler

Bytecode caching is a build-time optimization that dramatically improves application startup time by pre-compiling your JavaScript to bytecode. For example, when compiling TypeScript's `tsc` with bytecode enabled, startup time improves by **2x**.

## Usage

### Basic usage

Enable bytecode caching with the `--bytecode` flag:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./index.ts --target=bun --bytecode --outdir=./dist
```

This generates two files:

* `dist/index.js` - Your bundled JavaScript
* `dist/index.jsc` - The bytecode cache file

At runtime, Bun automatically detects and uses the `.jsc` file:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./dist/index.js  # Automatically uses index.jsc
```

### With standalone executables

When creating executables with `--compile`, bytecode is embedded into the binary:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./cli.ts --compile --bytecode --outfile=mycli
```

The resulting executable contains both the code and bytecode, giving you maximum performance in a single file.

### Combining with other optimizations

Bytecode works great with minification and source maps:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build --compile --bytecode --minify --sourcemap ./cli.ts --outfile=mycli
```

* `--minify` reduces code size before generating bytecode (less code -> less bytecode)
* `--sourcemap` preserves error reporting (errors still point to original source)
* `--bytecode` eliminates parsing overhead

## Performance impact

The performance improvement scales with your codebase size:

| Application size          | Typical startup improvement |
| ------------------------- | --------------------------- |
| Small CLI (\< 100 KB)     | 1.5-2x faster               |
| Medium-large app (> 5 MB) | 2.5x-4x faster              |

Larger applications benefit more because they have more code to parse.

## When to use bytecode

### Great for:

#### CLI tools

* Invoked frequently (linters, formatters, git hooks)
* Startup time is the entire user experience
* Users notice the difference between 90ms and 45ms startup
* Example: TypeScript compiler, Prettier, ESLint

#### Build tools and task runners

* Run hundreds or thousands of times during development
* Milliseconds saved per run compound quickly
* Developer experience improvement
* Example: Build scripts, test runners, code generators

#### Standalone executables

* Distributed to users who care about snappy performance
* Single-file distribution is convenient
* File size less important than startup time
* Example: CLIs distributed via npm or as binaries

### Skip it for:

* ❌ **Small scripts**
* ❌ **Code that runs once**
* ❌ **Development builds**
* ❌ **Size-constrained environments**
* ❌ **Code with top-level await** (not supported)

## Limitations

### CommonJS only

Bytecode caching currently works with CommonJS output format. Bun's bundler automatically converts most ESM code to CommonJS, but **top-level await** is the exception:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
// This prevents bytecode caching
const data = await fetch("https://api.example.com");
export default data;
```

**Why**: Top-level await requires async module evaluation, which can't be represented in CommonJS. The module graph becomes asynchronous, and the CommonJS wrapper function model breaks down.

**Workaround**: Move async initialization into a function:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
async function init() {
	const data = await fetch("https://api.example.com");
	return data;
}
export default init;
```

Now the module exports a function that the consumer can await when needed.

### Version compatibility

Bytecode is **not portable across Bun versions**. The bytecode format is tied to JavaScriptCore's internal representation, which changes between versions.

When you update Bun, you must regenerate bytecode:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# After updating Bun
bun build --bytecode ./index.ts --outdir=./dist
```

If bytecode doesn't match the current Bun version, it's automatically ignored and your code falls back to parsing the JavaScript source. Your app still runs - you just lose the performance optimization.

**Best practice**: Generate bytecode as part of your CI/CD build process. Don't commit `.jsc` files to git. Regenerate them whenever you update Bun.

### Source code still required

* The `.js` file (your bundled source code)
* The `.jsc` file (the bytecode cache)

At runtime:

1. Bun loads the `.js` file, sees a `@bytecode` pragma, and checks the `.jsc` file
2. Bun loads the `.jsc` file
3. Bun validates the bytecode hash matches the source
4. If valid, Bun uses the bytecode
5. If invalid, Bun falls back to parsing the source

### Bytecode is not obfuscation

Bytecode **does not obscure your source code**. It's an optimization, not a security measure.

## Production deployment

### Docker

Include bytecode generation in your Dockerfile:

```dockerfile  theme={"theme":{"light":"github-light","dark":"dracula"}}
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun build --bytecode --minify --sourcemap \
  --target=bun \
  --outdir=./dist \
  --compile \
  ./src/server.ts --outfile=./dist/server

FROM oven/bun:1 AS runner
WORKDIR /app
COPY --from=builder /dist/server /app/server
CMD ["./server"]
```

The bytecode is architecture-independent.

### CI/CD

Generate bytecode during your build pipeline:

```yaml  theme={"theme":{"light":"github-light","dark":"dracula"}}
# GitHub Actions
- name: Build with bytecode
  run: |
    bun install
    bun build --bytecode --minify \
      --outdir=./dist \
      --target=bun \
      ./src/index.ts
```

## Debugging

### Verify bytecode is being used

Check that the `.jsc` file exists:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
ls -lh dist/
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
-rw-r--r--  1 user  staff   245K  index.js
-rw-r--r--  1 user  staff   1.1M  index.jsc
```

The `.jsc` file should be 2-8x larger than the `.js` file.

To log if bytecode is being used, set `BUN_JSC_verboseDiskCache=1` in your environment.

On success, it will log something like:

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
[Disk cache] cache hit for sourceCode
```

If you see a cache miss, it will log something like:

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
[Disk cache] cache miss for sourceCode
```

It's normal for it it to log a cache miss multiple times since Bun doesn't currently bytecode cache JavaScript code used in builtin modules.

### Common issues

**Bytecode silently ignored**: Usually caused by a Bun version update. The cache version doesn't match, so bytecode is rejected. Regenerate to fix.

**File size too large**: This is expected. Consider:

* Using `--minify` to reduce code size before bytecode generation
* Compressing `.jsc` files for network transfer (gzip/brotli)
* Evaluating if the startup performance gain is worth the size increase

**Top-level await**: Not supported. Refactor to use async initialization functions.

## What is bytecode?

When you run JavaScript, the JavaScript engine doesn't execute your source code directly. Instead, it goes through several steps:

1. **Parsing**: The engine reads your JavaScript source code and converts it into an Abstract Syntax Tree (AST)
2. **Bytecode compilation**: The AST is compiled into bytecode - a lower-level representation that's faster to execute
3. **Execution**: The bytecode is executed by the engine's interpreter or JIT compiler

Bytecode is an intermediate representation - it's lower-level than JavaScript source code, but higher-level than machine code. Think of it as assembly language for a virtual machine. Each bytecode instruction represents a single operation like "load this variable," "add two numbers," or "call this function."

This happens **every single time** you run your code. If you have a CLI tool that runs 100 times a day, your code gets parsed 100 times. If you have a serverless function with frequent cold starts, parsing happens on every cold start.

With bytecode caching, Bun moves steps 1 and 2 to the build step. At runtime, the engine loads the pre-compiled bytecode and jumps straight to execution.

### Why lazy parsing makes this even better

Modern JavaScript engines use a clever optimization called **lazy parsing**. They don't parse all your code upfront - instead, functions are only parsed when they're first called:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Without bytecode caching:
function rarely_used() {
	// This 500-line function is only parsed
	// when it's actually called
}

function main() {
	console.log("Starting app");
	// rarely_used() is never called, so it's never parsed
}
```

This means parsing overhead isn't just a startup cost - it happens throughout your application's lifetime as different code paths execute. With bytecode caching, **all functions are pre-compiled**, even the ones that are lazily parsed. The parsing work happens once at build time instead of being distributed throughout your application's execution.

## The bytecode format

### Inside a .jsc file

A `.jsc` file contains a serialized bytecode structure. Understanding what's inside helps explain both the performance benefits and the file size tradeoff.

**Header section** (validated on every load):

* **Cache version**: A hash tied to the JavaScriptCore framework version. This ensures bytecode generated with one version of Bun only runs with that exact version.
* **Code block type tag**: Identifies whether this is a Program, Module, Eval, or Function code block.

**SourceCodeKey** (validates bytecode matches source):

* **Source code hash**: A hash of the original JavaScript source code. Bun verifies this matches before using the bytecode.
* **Source code length**: The exact length of the source, for additional validation.
* **Compilation flags**: Critical compilation context like strict mode, whether it's a script vs module, eval context type, etc. The same source code compiled with different flags produces different bytecode.

**Bytecode instructions**:

* **Instruction stream**: The actual bytecode opcodes - the compiled representation of your JavaScript. This is a variable-length sequence of bytecode instructions.
* **Metadata table**: Each opcode has associated metadata - things like profiling counters, type hints, and execution counts (even if not yet populated).
* **Jump targets**: Pre-computed addresses for control flow (if/else, loops, switch statements).
* **Switch tables**: Optimized lookup tables for switch statements.

**Constants and identifiers**:

* **Constant pool**: All literal values in your code - numbers, strings, booleans, null, undefined. These are stored as actual JavaScript values (JSValues) so they don't need to be parsed from source at runtime.
* **Identifier table**: All variable and function names used in the code. Stored as deduplicated strings.
* **Source code representation markers**: Flags indicating how constants should be represented (as integers, doubles, big ints, etc.).

**Function metadata** (for each function in your code):

* **Register allocation**: How many registers (local variables) the function needs - `thisRegister`, `scopeRegister`, `numVars`, `numCalleeLocals`, `numParameters`.
* **Code features**: A bitmask of function characteristics: is it a constructor? an arrow function? does it use `super`? does it have tail calls? These affect how the function is executed.
* **Lexically scoped features**: Strict mode and other lexical context.
* **Parse mode**: The mode in which the function was parsed (normal, async, generator, async generator).

**Nested structures**:

* **Function declarations and expressions**: Each nested function gets its own bytecode block, recursively. A file with 100 functions has 100 separate bytecode blocks, all nested in the structure.
* **Exception handlers**: Try/catch/finally blocks with their boundaries and handler addresses pre-computed.
* **Expression info**: Maps bytecode positions back to source code locations for error reporting and debugging.

### What bytecode does NOT contain

Importantly, **bytecode does not embed your source code**. Instead:

* The JavaScript source is stored separately (in the `.js` file)
* The bytecode only stores a hash and length of the source
* At load time, Bun validates the bytecode matches the current source code

This is why you need to deploy both the `.js` and `.jsc` files. The `.jsc` file is useless without its corresponding `.js` file.

## The tradeoff: file size

Bytecode files are significantly larger than source code - typically 2-8x larger.

### Why is bytecode so much larger?

**Bytecode instructions are verbose**:
A single line of minified JavaScript might compile to dozens of bytecode instructions. For example:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sum = arr.reduce((a, b) => a + b, 0);
```

Compiles to bytecode that:

* Loads the `arr` variable
* Gets the `reduce` property
* Creates the arrow function (which itself has bytecode)
* Loads the initial value `0`
* Sets up the call with the right number of arguments
* Actually performs the call
* Stores the result in `sum`

Each of these steps is a separate bytecode instruction with its own metadata.

**Constant pools store everything**:
Every string literal, number, property name - everything gets stored in the constant pool. Even if your source code has `"hello"` a hundred times, the constant pool stores it once, but the identifier table and constant references add overhead.

**Per-function metadata**:
Each function - even small one-line functions - gets its own complete metadata:

* Register allocation info
* Code features bitmask
* Parse mode
* Exception handlers
* Expression info for debugging

A file with 1,000 small functions has 1,000 sets of metadata.

**Profiling data structures**:
Even though profiling data isn't populated yet, the *structures* to hold profiling data are allocated. This includes:

* Value profile slots (tracking what types flow through each operation)
* Array profile slots (tracking array access patterns)
* Binary arithmetic profile slots (tracking number types in math operations)
* Unary arithmetic profile slots

These take up space even when empty.

**Pre-computed control flow**:
Jump targets, switch tables, and exception handler boundaries are all pre-computed and stored. This makes execution faster but increases file size.

### Mitigation strategies

**Compression**:
Bytecode compresses extremely well with gzip/brotli (60-70% compression). The repetitive structure and metadata compress efficiently.

**Minification first**:
Using `--minify` before bytecode generation helps:

* Shorter identifiers → smaller identifier table
* Dead code elimination → less bytecode generated
* Constant folding → fewer constants in the pool

**The tradeoff**:
You're trading 2-4x larger files for 2-4x faster startup. For CLIs, this is usually worth it. For long-running servers where a few megabytes of disk space don't matter, it's even less of an issue.

## Versioning and portability

### Cross-architecture portability: ✅

Bytecode is **architecture-independent**. You can:

* Build on macOS ARM64, deploy to Linux x64
* Build on Linux x64, deploy to AWS Lambda ARM64
* Build on Windows x64, deploy to macOS ARM64

The bytecode contains abstract instructions that work on any architecture. Architecture-specific optimizations happen during JIT compilation at runtime, not in the cached bytecode.

### Cross-version portability: ❌

Bytecode is **not stable across Bun versions**. Here's why:

**Bytecode format changes**:
JavaScriptCore's bytecode format evolves. New opcodes get added, old ones get removed or changed, metadata structures change. Each version of JavaScriptCore has a different bytecode format.

**Version validation**:
The cache version in the `.jsc` file header is a hash of the JavaScriptCore framework. When Bun loads bytecode:

1. It extracts the cache version from the `.jsc` file
2. It computes the current JavaScriptCore version
3. If they don't match, the bytecode is **silently rejected**
4. Bun falls back to parsing the `.js` source code

Your application still runs - you just lose the performance optimization.

**Graceful degradation**:
This design means bytecode caching "fails open" - if anything goes wrong (version mismatch, corrupted file, missing file), your code still runs normally. You might see slower startup, but you won't see errors.

## Unlinked vs. linked bytecode

JavaScriptCore makes a crucial distinction between "unlinked" and "linked" bytecode. This separation is what makes bytecode caching possible:

### Unlinked bytecode (what's cached)

The bytecode saved in `.jsc` files is **unlinked bytecode**. It contains:

* The compiled bytecode instructions
* Structural information about the code
* Constants and identifiers
* Control flow information

But it **doesn't** contain:

* Pointers to actual runtime objects
* JIT-compiled machine code
* Profiling data from previous runs
* Call link information (which functions call which)

Unlinked bytecode is **immutable and shareable**. Multiple executions of the same code can all reference the same unlinked bytecode.

### Linked bytecode (runtime execution)

When Bun runs bytecode, it "links" it - creating a runtime wrapper that adds:

* **Call link information**: As your code runs, the engine learns which functions call which and optimizes those call sites.
* **Profiling data**: The engine tracks how many times each instruction executes, what types of values flow through the code, array access patterns, etc.
* **JIT compilation state**: References to baseline JIT or optimizing JIT (DFG/FTL) compiled versions of hot code.
* **Runtime objects**: Pointers to actual JavaScript objects, prototypes, scopes, etc.

This linked representation is created fresh every time you run your code. This allows:

1. **Caching the expensive work** (parsing and compilation to unlinked bytecode)
2. **Still collecting runtime profiling data** to guide optimizations
3. **Still applying JIT optimizations** based on actual execution patterns

Bytecode caching moves expensive work (parsing and compiling to bytecode) from runtime to build time. For applications that start frequently, this can halve your startup time at the cost of larger files on disk.

For production CLIs and serverless deployments, the combination of `--bytecode --minify --sourcemap` gives you the best performance while maintaining debuggability.

> Reduce bundle sizes with Bun's JavaScript and TypeScript minifier

# null

Bun includes a fast JavaScript and TypeScript minifier that can reduce bundle sizes by 80% or more (depending on the codebase) and make output code run faster. The minifier performs dozens of optimizations including constant folding, dead code elimination, and syntax transformations. Unlike other minifiers, Bun's minifier makes `bun build` run faster since there's less code to print.

## CLI Usage

### Enable all minification

Use the `--minify` flag to enable all minification modes:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./index.ts --minify --outfile=out.js
```

The `--minify` flag automatically enables:

* Whitespace minification
* Syntax minification
* Identifier minification

### Production mode

The `--production` flag automatically enables minification:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./index.ts --production --outfile=out.js
```

The `--production` flag also:

* Sets `process.env.NODE_ENV` to `production`
* Enables the production-mode JSX import & transform

### Granular control

You can enable specific minification modes individually:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# Only remove whitespace
bun build ./index.ts --minify-whitespace --outfile=out.js

# Only minify syntax
bun build ./index.ts --minify-syntax --outfile=out.js

# Only minify identifiers
bun build ./index.ts --minify-identifiers --outfile=out.js

# Combine specific modes
bun build ./index.ts --minify-whitespace --minify-syntax --outfile=out.js
```

## JavaScript API

When using Bun's bundler programmatically, configure minification through the `minify` option:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.build({
	entrypoints: ["./index.ts"],
	outdir: "./out",
	minify: true, // Enable all minification modes
});
```

For granular control, pass an object:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.build({
	entrypoints: ["./index.ts"],
	outdir: "./out",
	minify: {
		whitespace: true,
		syntax: true,
		identifiers: true,
	},
});
```

## Minification Modes

Bun's minifier has three independent modes that can be enabled separately or combined.

### Whitespace minification (`--minify-whitespace`)

Removes all unnecessary whitespace, newlines, and formatting from the output.

### Syntax minification (`--minify-syntax`)

Rewrites JavaScript syntax to shorter equivalent forms and performs constant folding, dead code elimination, and other optimizations.

### Identifier minification (`--minify-identifiers`)

Renames local variables and function names to shorter identifiers using frequency-based optimization.

## All Transformations

### Boolean literal shortening

**Mode:** `--minify-syntax`

Converts boolean literals to shorter expressions.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
true;
false;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
!0;
!1;
```

### Boolean algebra optimizations

**Mode:** `--minify-syntax`

Simplifies boolean expressions using logical rules.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
!!x;
x === true;
x && true;
x || false;
!true;
!false;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x;
x;
x;
x;
!1;
!0;
```

### Undefined shortening

**Mode:** `--minify-syntax`

Replaces `undefined` with shorter equivalent.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
undefined;
let x = undefined;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
void 0;
let x = void 0;
```

### Undefined equality optimization

**Mode:** `--minify-syntax`

Optimizes loose equality checks with undefined.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
x == undefined;
x != undefined;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x == null;
x != null;
```

### Infinity shortening

**Mode:** `--minify-syntax`

Converts Infinity to mathematical expressions.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
Infinity - Infinity;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
1 / 0 - 1 / 0;
```

### Typeof optimizations

**Mode:** `--minify-syntax`

Optimizes typeof comparisons and evaluates constant typeof expressions.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
typeof x === "undefined";
typeof x !== "undefined";
typeof require;
typeof null;
typeof true;
typeof 123;
typeof "str";
typeof 123n;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
typeof x > "u";
typeof x < "u";
("function");
("object");
("boolean");
("number");
("string");
("bigint");
```

### Number formatting

**Mode:** `--minify-syntax`

Formats numbers in the most compact representation.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
10000;
100000;
1000000;
1.0 - 42.0;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
1e4;
1e5;
1e6;
1 - 42;
```

### Arithmetic constant folding

**Mode:** `--minify-syntax`

Evaluates arithmetic operations at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
1 + 2;
10 - 5;
3 * 4;
10 / 2;
10 % 3;
2 ** 3;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
3;
5;
12;
5;
1;
8;
```

### Bitwise constant folding

**Mode:** `--minify-syntax`

Evaluates bitwise operations at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
5 & 3;
5 | 3;
5 ^ 3;
8 << 2;
32 >> 2;
~5;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
1;
7;
6;
32;
8 - 6;
```

### String concatenation

**Mode:** `--minify-syntax`

Combines string literals at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
"a" + "b";
"x" + 123;
"foo" + "bar" + "baz";
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
"ab";
"x123";
"foobarbaz";
```

### String indexing

**Mode:** `--minify-syntax`

Evaluates string character access at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
"foo"[2];
"hello"[0];
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
"o";
"h";
```

### Template literal folding

**Mode:** `--minify-syntax`

Evaluates template literals with constant expressions.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
`a${123}b``result: ${5 + 10}`;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
"a123b";
"result: 15";
```

### Template literal to string conversion

**Mode:** `--minify-syntax`

Converts simple template literals to regular strings.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
`Hello World``Line 1
Line 2`;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
"Hello World";
"Line 1\nLine 2";
```

### String quote optimization

**Mode:** `--minify-syntax`

Chooses the optimal quote character to minimize escapes.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
"It's a string";
'He said "hello"'`Simple string`;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
"It's a string";
'He said "hello"';
"Simple string";
```

### Array spread inlining

**Mode:** `--minify-syntax`

Inlines array spread operations with constant arrays.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
[1, ...[2, 3], 4]
[...[a, b]]
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
[1, 2, 3, 4][(a, b)];
```

### Array indexing

**Mode:** `--minify-syntax`

Evaluates constant array access at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
[x][0]
['a', 'b', 'c'][1]
['a', , 'c'][1]
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x;
("b");
void 0;
```

### Property access optimization

**Mode:** `--minify-syntax`

Converts bracket notation to dot notation when possible.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
obj["property"];
obj["validName"];
obj["123"];
obj["invalid-name"];
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
obj.property;
obj.validName;
obj["123"];
obj["invalid-name"];
```

### Comparison folding

**Mode:** `--minify-syntax`

Evaluates constant comparisons at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
3 < 5;
5 > 3;
3 <= 3;
5 >= 6;
"a" < "b";
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
!0;
!0;
!0;
!1;
!0;
```

### Logical operation folding

**Mode:** `--minify-syntax`

Simplifies logical operations with constant values.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
true && x;
false && x;
true || x;
false || x;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x;
!1;
!0;
x;
```

### Nullish coalescing folding

**Mode:** `--minify-syntax`

Evaluates nullish coalescing with known values.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
null ?? x;
undefined ?? x;
42 ?? x;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x;
x;
42;
```

### Comma expression simplification

**Mode:** `--minify-syntax`

Removes side-effect-free expressions from comma sequences.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
(0, x)(123, "str", x);
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x;
x;
```

### Ternary conditional folding

**Mode:** `--minify-syntax`

Evaluates conditional expressions with constant conditions.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
true ? a : b;
false ? a : b;
x ? true : false;
x ? false : true;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
a;
b;
x;
!x;
```

### Unary expression folding

**Mode:** `--minify-syntax`

Simplifies unary operations.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
+123 + "123" - -x;
~~x;
!!x;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
123;
123;
x;
x;
x;
```

### Double negation removal

**Mode:** `--minify-syntax`

Removes unnecessary double negations.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
!!x;
!!!x;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x;
!x;
```

### If statement optimization

**Mode:** `--minify-syntax`

Optimizes if statements with constant conditions.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
if (true) x;
if (false) x;
if (x) {
	a;
}
if (x) {
} else y;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x;
// removed
if (x) a;
if (!x) y;
```

### Dead code elimination

**Mode:** `--minify-syntax`

Removes unreachable code and code without side effects.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
if (false) {
	unreachable();
}
function foo() {
	return x;
	deadCode();
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
function foo() {
	return x;
}
```

### Unreachable branch removal

**Mode:** `--minify-syntax`

Removes branches that can never execute.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
while (false) {
	neverRuns();
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
// removed entirely
```

### Empty block removal

**Mode:** `--minify-syntax`

Removes empty blocks and unnecessary braces.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
{
}
if (x) {
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
// removed
```

### Single statement block unwrapping

**Mode:** `--minify-syntax`

Removes unnecessary braces around single statements.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
if (condition) {
	doSomething();
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
if (condition) doSomething();
```

### TypeScript enum inlining

**Mode:** `--minify-syntax`

Inlines TypeScript enum values at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
enum Color {
	Red,
	Green,
	Blue,
}
const x = Color.Red;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
const x = 0;
```

### Pure annotation support

**Mode:** Always active

Respects `/*@__PURE__*/` annotations for tree shaking.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
const x = /*@__PURE__*/ expensive();
// If x is unused...
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
// removed entirely
```

### Identifier renaming

**Mode:** `--minify-identifiers`

Renames local variables to shorter names based on usage frequency.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
function calculateSum(firstNumber, secondNumber) {
	const result = firstNumber + secondNumber;
	return result;
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
function a(b, c) {
	const d = b + c;
	return d;
}
```

**Naming strategy:**

* Most frequently used identifiers get the shortest names (a, b, c...)
* Single letters: a-z (26 names)
* Double letters: aa-zz (676 names)
* Triple letters and beyond as needed

**Preserved identifiers:**

* JavaScript keywords and reserved words
* Global identifiers
* Named exports (to maintain API)
* CommonJS names: `exports`, `module`

### Whitespace removal

**Mode:** `--minify-whitespace`

Removes all unnecessary whitespace.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
function add(a, b) {
	return a + b;
}
let x = 10;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
function add(a, b) {
	return a + b;
}
let x = 10;
```

### Semicolon optimization

**Mode:** `--minify-whitespace`

Inserts semicolons only when necessary.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
let a = 1;
let b = 2;
return a + b;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
let a = 1;
let b = 2;
return a + b;
```

### Operator spacing removal

**Mode:** `--minify-whitespace`

Removes spaces around operators.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
a + b;
x = y * z;
(foo && bar) || baz;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
a + b;
x = y * z;
(foo && bar) || baz;
```

### Comment removal

**Mode:** `--minify-whitespace`

Removes comments except important license comments.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
// This comment is removed
/* So is this */
/*! But this license comment is kept */
function test() {
	/* inline comment */
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
/*! But this license comment is kept */
function test() {}
```

### Object and array formatting

**Mode:** `--minify-whitespace`

Removes whitespace in object and array literals.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
const obj = {
	name: "John",
	age: 30,
};
const arr = [1, 2, 3];
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
const obj = { name: "John", age: 30 };
const arr = [1, 2, 3];
```

### Control flow formatting

**Mode:** `--minify-whitespace`

Removes whitespace in control structures.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
if (condition) {
	doSomething();
}
for (let i = 0; i < 10; i++) {
	console.log(i);
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
if (condition) doSomething();
for (let i = 0; i < 10; i++) console.log(i);
```

### Function formatting

**Mode:** `--minify-whitespace`

Removes whitespace in function declarations.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
function myFunction(param1, param2) {
	return param1 + param2;
}
const arrow = (a, b) => a + b;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
function myFunction(a, b) {
	return a + b;
}
const arrow = (a, b) => a + b;
```

### Parentheses minimization

**Mode:** Always active

Only adds parentheses when necessary for operator precedence.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
(a + b) * c;
a + (b * c)(x);
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
(a + b) * c;
a + b * c;
x;
```

### Property mangling

**Mode:** `--minify-identifiers` (with configuration)

Renames object properties to shorter names when configured.

```ts#input.ts (with property mangling enabled) theme={"theme":{"light":"github-light","dark":"dracula"}}
obj.longPropertyName
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
obj.a;
```

### Template literal value folding

**Mode:** `--minify-syntax`

Converts non-string interpolated values to strings and folds them into the template.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
`hello ${123}``value: ${true}``result: ${null}``status: ${undefined}``big: ${10n}`;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
"hello 123";
"value: true";
"result: null";
"status: undefined";
"big: 10";
```

### String length constant folding

**Mode:** `--minify-syntax`

Evaluates `.length` property on string literals at compile time.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
"hello world".length;
"test".length;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
11;
4;
```

### Constructor call simplification

**Mode:** `--minify-syntax`

Simplifies constructor calls for built-in types.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
new Object();
new Object(null);
new Object({ a: 1 });
new Array();
new Array(x, y);
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
{
}
{
}
{
	a: 1;
}
[][(x, y)];
```

### Single property object inlining

**Mode:** `--minify-syntax`

Inlines property access for objects with a single property.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
({ fn: () => console.log("hi") }).fn();
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
(() => console.log("hi"))();
```

### String charCodeAt constant folding

**Mode:** Always active

Evaluates `charCodeAt()` on string literals for ASCII characters.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
"hello".charCodeAt(1);
"A".charCodeAt(0);
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
101;
65;
```

### Void 0 equality to null equality

**Mode:** `--minify-syntax`

Converts loose equality checks with `void 0` to `null` since they're equivalent.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
x == void 0;
x != void 0;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
x == null;
x != null;
```

### Negation operator optimization

**Mode:** `--minify-syntax`

Moves negation operator through comma expressions.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
-(a, b) - (x, y, z);
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
(a, -b);
(x, y, -z);
```

### Import.meta property inlining

**Mode:** Bundle mode

Inlines `import.meta` properties at build time when values are known.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
import.meta.dir;
import.meta.file;
import.meta.path;
import.meta.url;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
"/path/to/directory";
"filename.js";
"/full/path/to/file.js";
"file:///full/path/to/file.js";
```

### Variable declaration merging

**Mode:** `--minify-syntax`

Merges adjacent variable declarations of the same type.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
let a = 1;
let b = 2;
const c = 3;
const d = 4;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
let a = 1,
	b = 2;
const c = 3,
	d = 4;
```

### Expression statement merging

**Mode:** `--minify-syntax`

Merges adjacent expression statements using comma operator.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(1);
console.log(2);
console.log(3);
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
(console.log(1), console.log(2), console.log(3));
```

### Return statement merging

**Mode:** `--minify-syntax`

Merges expressions before return with comma operator.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(x);
return y;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
return (console.log(x), y);
```

### Throw statement merging

**Mode:** `--minify-syntax`

Merges expressions before throw with comma operator.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(x);
throw new Error();
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
throw (console.log(x), new Error());
```

### TypeScript enum cross-module inlining

**Mode:** `--minify-syntax` (bundle mode)

Inlines enum values across module boundaries.

```ts#input.ts (lib.ts) theme={"theme":{"light":"github-light","dark":"dracula"}}
export enum Color { Red, Green, Blue }

// Input (main.ts)
import { Color } from './lib';
const x = Color.Red;
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
const x = 0;
```

### Computed property enum inlining

**Mode:** `--minify-syntax`

Inlines enum values used as computed object properties.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
enum Keys {
	FOO = "foo",
}
const obj = { [Keys.FOO]: value };
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
const obj = { foo: value };
```

### String number to numeric index

**Mode:** `--minify-syntax`

Converts string numeric property access to numeric index.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
obj["0"];
arr["5"];
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
obj[0];
arr[5];
```

### Arrow function body shortening

**Mode:** Always active

Uses expression body syntax when an arrow function only returns a value.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
() => {
	return x;
};
a => {
	return a + 1;
};
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
() => x;
a => a + 1;
```

### Object property shorthand

**Mode:** Always active

Uses shorthand syntax when property name and value identifier match.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
{ x: x, y: y }
{ name: name, age: age }
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	(x, y);
}
{
	(name, age);
}
```

### Method shorthand

**Mode:** Always active

Uses method shorthand syntax in object literals.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
{
  foo: function() {},
  bar: async function() {}
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
{
  foo() {},
  async bar() {}
}
```

### Drop debugger statements

**Mode:** `--drop=debugger`

Removes `debugger` statements from code.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
function test() {
	debugger;
	return x;
}
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
function test() {
	return x;
}
```

### Drop console calls

**Mode:** `--drop=console`

Removes all `console.*` method calls from code.

```ts Input theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log("debug");
console.warn("warning");
x = console.error("error");
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
void 0;
void 0;
x = void 0;
```

### Drop custom function calls

**Mode:** `--drop=<name>`

Removes calls to specified global functions or methods.

```ts#input.ts with --drop=assert theme={"theme":{"light":"github-light","dark":"dracula"}}
assert(condition);
obj.assert(test);
```

```ts Output theme={"theme":{"light":"github-light","dark":"dracula"}}
void 0;
void 0;
```

## Keep Names

When minifying identifiers, you may want to preserve original function and class names for debugging purposes. Use the `--keep-names` flag:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./index.ts --minify --keep-names --outfile=out.js
```

Or in the JavaScript API:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.build({
	entrypoints: ["./index.ts"],
	outdir: "./out",
	minify: {
		identifiers: true,
		keepNames: true,
	},
});
```

This preserves the `.name` property on functions and classes while still minifying the actual identifier names in the code.

## Combined Example

Using all three minification modes together:

```ts#input.ts (158 bytes) theme={"theme":{"light":"github-light","dark":"dracula"}}
const myVariable = 42;

const myFunction = () => {
  const isValid = true;
  const result = undefined;
  return isValid ? myVariable : result;
};

const output = myFunction();
```

```ts#output.ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Output with --minify (49 bytes, 69% reduction)
const a=42,b=()=>{const c=!0,d=void 0;return c?a:d},e=b();
```

## When to Use Minification

**Use `--minify` for:**

* Production bundles
* Reducing CDN bandwidth costs
* Improving page load times

**Use individual modes for:**

* **`--minify-whitespace`:** Quick size reduction without semantic changes
* **`--minify-syntax`:** Smaller output while keeping readable identifiers for debugging
* **`--minify-identifiers`:** Maximum size reduction (combine with `--keep-names` for better stack traces)

**Avoid minification for:**

* Development builds (harder to debug)
* When you need readable error messages
* Libraries where consumers may read the source

# esbuild

> Migration guide from esbuild to Bun's bundler

Bun's bundler API is inspired heavily by esbuild. Migrating to Bun's bundler from esbuild should be relatively painless. This guide will briefly explain why you might consider migrating to Bun's bundler and provide a side-by-side API comparison reference for those who are already familiar with esbuild's API.

There are a few behavioral differences to note.

<Note>
  **Bundling by default.** Unlike esbuild, Bun always bundles by default. This is why the `--bundle`
  flag isn't necessary in the Bun example. To transpile each file individually, use
  `Bun.Transpiler`.
</Note>

<Note>
  **It's just a bundler.** Unlike esbuild, Bun's bundler does not include a built-in development
  server or file watcher. It's just a bundler. The bundler is intended for use in conjunction with
  `Bun.serve` and other runtime APIs to achieve the same effect. As such, all options relating to
  HTTP/file watching are not applicable.
</Note>

## Performance

With a performance-minded API coupled with the extensively optimized Zig-based JS/TS parser, Bun's bundler is 1.75x faster than esbuild on esbuild's three.js benchmark.

<Info>Bundling 10 copies of three.js from scratch, with sourcemaps and minification</Info>

## CLI API

Bun and esbuild both provide a command-line interface.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# esbuild
esbuild <entrypoint> --outdir=out --bundle

# bun
bun build <entrypoint> --outdir=out
```

In Bun's CLI, simple boolean flags like `--minify` do not accept an argument. Other flags like `--outdir <path>` do accept an argument; these flags can be written as `--outdir out` or `--outdir=out`. Some flags like `--define` can be specified several times: `--define foo=bar --define bar=baz`.

| esbuild                | bun build                  | Notes                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--bundle`             | n/a                        | Bun always bundles, use `--no-bundle` to disable this behavior.                                                                                                                                                                                                                                                                                                         |
| `--define:K=V`         | `--define K=V`             | Small syntax difference; no colon.<br />`esbuild --define:foo=bar`<br />`bun build --define foo=bar`                                                                                                                                                                                                                                                                    |
| `--external:<pkg>`     | `--external <pkg>`         | Small syntax difference; no colon.<br />`esbuild --external:react`<br />`bun build --external react`                                                                                                                                                                                                                                                                    |
| `--format`             | `--format`                 | Bun supports `"esm"` and `"cjs"` currently, but more module formats are planned. esbuild defaults to `"iife"`.                                                                                                                                                                                                                                                          |
| `--loader:.ext=loader` | `--loader .ext:loader`     | Bun supports a different set of built-in loaders than esbuild; see Bundler > Loaders for a complete reference. The esbuild loaders `dataurl`, `binary`, `base64`, `copy`, and `empty` are not yet implemented.<br /><br />The syntax for `--loader` is slightly different.<br />`esbuild app.ts --bundle --loader:.svg=text`<br />`bun build app.ts --loader .svg:text` |
| `--minify`             | `--minify`                 | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--outdir`             | `--outdir`                 | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--outfile`            | `--outfile`                | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--packages`           | `--packages`               | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--platform`           | `--target`                 | Renamed to `--target` for consistency with tsconfig. Does not support `neutral`.                                                                                                                                                                                                                                                                                        |
| `--serve`              | n/a                        | Not applicable                                                                                                                                                                                                                                                                                                                                                          |
| `--sourcemap`          | `--sourcemap`              | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--splitting`          | `--splitting`              | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--target`             | n/a                        | Not supported. Bun's bundler performs no syntactic down-leveling at this time.                                                                                                                                                                                                                                                                                          |
| `--watch`              | `--watch`                  | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--allow-overwrite`    | n/a                        | Overwriting is never allowed                                                                                                                                                                                                                                                                                                                                            |
| `--analyze`            | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--asset-names`        | `--asset-naming`           | Renamed for consistency with naming in JS API                                                                                                                                                                                                                                                                                                                           |
| `--banner`             | `--banner`                 | Only applies to js bundles                                                                                                                                                                                                                                                                                                                                              |
| `--footer`             | `--footer`                 | Only applies to js bundles                                                                                                                                                                                                                                                                                                                                              |
| `--certfile`           | n/a                        | Not applicable                                                                                                                                                                                                                                                                                                                                                          |
| `--charset=utf8`       | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--chunk-names`        | `--chunk-naming`           | Renamed for consistency with naming in JS API                                                                                                                                                                                                                                                                                                                           |
| `--color`              | n/a                        | Always enabled                                                                                                                                                                                                                                                                                                                                                          |
| `--drop`               | `--drop`                   |                                                                                                                                                                                                                                                                                                                                                                         |
| `--entry-names`        | `--entry-naming`           | Renamed for consistency with naming in JS API                                                                                                                                                                                                                                                                                                                           |
| `--global-name`        | n/a                        | Not applicable, Bun does not support `iife` output at this time                                                                                                                                                                                                                                                                                                         |
| `--ignore-annotations` | `--ignore-dce-annotations` |                                                                                                                                                                                                                                                                                                                                                                         |
| `--inject`             | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--jsx`                | `--jsx-runtime <runtime>`  | Supports `"automatic"` (uses jsx transform) and `"classic"` (uses `React.createElement`)                                                                                                                                                                                                                                                                                |
| `--jsx-dev`            | n/a                        | Bun reads `compilerOptions.jsx` from `tsconfig.json` to determine a default. If `compilerOptions.jsx` is `"react-jsx"`, or if `NODE_ENV=production`, Bun will use the jsx transform. Otherwise, it uses `jsxDEV`. The bundler does not support `preserve`.                                                                                                              |
| `--jsx-factory`        | `--jsx-factory`            |                                                                                                                                                                                                                                                                                                                                                                         |
| `--jsx-fragment`       | `--jsx-fragment`           |                                                                                                                                                                                                                                                                                                                                                                         |
| `--jsx-import-source`  | `--jsx-import-source`      |                                                                                                                                                                                                                                                                                                                                                                         |
| `--jsx-side-effects`   | n/a                        | JSX is always assumed to be side-effect-free                                                                                                                                                                                                                                                                                                                            |
| `--keep-names`         | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--keyfile`            | n/a                        | Not applicable                                                                                                                                                                                                                                                                                                                                                          |
| `--legal-comments`     | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--log-level`          | n/a                        | Not supported. This can be set in `bunfig.toml` as `logLevel`.                                                                                                                                                                                                                                                                                                          |
| `--log-limit`          | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--log-override:X=Y`   | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--main-fields`        | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--mangle-cache`       | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--mangle-props`       | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--mangle-quoted`      | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--metafile`           | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--minify-whitespace`  | `--minify-whitespace`      |                                                                                                                                                                                                                                                                                                                                                                         |
| `--minify-identifiers` | `--minify-identifiers`     |                                                                                                                                                                                                                                                                                                                                                                         |
| `--minify-syntax`      | `--minify-syntax`          |                                                                                                                                                                                                                                                                                                                                                                         |
| `--out-extension`      | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--outbase`            | `--root`                   |                                                                                                                                                                                                                                                                                                                                                                         |
| `--preserve-symlinks`  | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--public-path`        | `--public-path`            |                                                                                                                                                                                                                                                                                                                                                                         |
| `--pure`               | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--reserve-props`      | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--resolve-extensions` | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--servedir`           | n/a                        | Not applicable                                                                                                                                                                                                                                                                                                                                                          |
| `--source-root`        | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--sourcefile`         | n/a                        | Not supported. Bun does not support stdin input yet.                                                                                                                                                                                                                                                                                                                    |
| `--sourcemap`          | `--sourcemap`              | No differences                                                                                                                                                                                                                                                                                                                                                          |
| `--sources-content`    | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--supported`          | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                           |
| `--tree-shaking`       | n/a                        | Always true                                                                                                                                                                                                                                                                                                                                                             |
| `--tsconfig`           | `--tsconfig-override`      |                                                                                                                                                                                                                                                                                                                                                                         |
| `--version`            | n/a                        | Run `bun --version` to see the version of Bun.                                                                                                                                                                                                                                                                                                                          |

## JavaScript API

| esbuild.build()     | Bun.build()                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `absWorkingDir`     | n/a                        | Always set to `process.cwd()`                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `alias`             | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `allowOverwrite`    | n/a                        | Always false                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `assetNames`        | `naming.asset`             | Uses same templating syntax as esbuild, but `[ext]` must be included explicitly.<br /><br />`ts<br/>Bun.build({<br/>  entrypoints: ["./index.tsx"],<br/>  naming: {<br/>    asset: "[name].[ext]",<br/>  },<br/>});<br/>`                                                                                                                                                                                                                                                                |
| `banner`            | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `bundle`            | n/a                        | Always true. Use `Bun.Transpiler` to transpile without bundling.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `charset`           | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `chunkNames`        | `naming.chunk`             | Uses same templating syntax as esbuild, but `[ext]` must be included explicitly.<br /><br />`ts<br/>Bun.build({<br/>  entrypoints: ["./index.tsx"],<br/>  naming: {<br/>    chunk: "[name].[ext]",<br/>  },<br/>});<br/>`                                                                                                                                                                                                                                                                |
| `color`             | n/a                        | Bun returns logs in the `logs` property of the build result.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `conditions`        | n/a                        | Not supported. Export conditions priority is determined by `target`.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `define`            | `define`                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `drop`              | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `entryNames`        | `naming` or `naming.entry` | Bun supports a `naming` key that can either be a string or an object. Uses same templating syntax as esbuild, but `[ext]` must be included explicitly.<br /><br />`ts<br/>Bun.build({<br/>  entrypoints: ["./index.tsx"],<br/>  // when string, this is equivalent to entryNames<br/>  naming: "[name].[ext]",<br/><br/>  // granular naming options<br/>  naming: {<br/>    entry: "[name].[ext]",<br/>    asset: "[name].[ext]",<br/>    chunk: "[name].[ext]",<br/>  },<br/>});<br/>` |
| `entryPoints`       | `entrypoints`              | Capitalization difference                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `external`          | `external`                 | No differences                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `footer`            | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `format`            | `format`                   | Only supports `"esm"` currently. Support for `"cjs"` and `"iife"` is planned.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `globalName`        | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `ignoreAnnotations` | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `inject`            | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `jsx`               | `jsx`                      | Not supported in JS API, configure in `tsconfig.json`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `jsxDev`            | `jsxDev`                   | Not supported in JS API, configure in `tsconfig.json`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `jsxFactory`        | `jsxFactory`               | Not supported in JS API, configure in `tsconfig.json`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `jsxFragment`       | `jsxFragment`              | Not supported in JS API, configure in `tsconfig.json`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `jsxImportSource`   | `jsxImportSource`          | Not supported in JS API, configure in `tsconfig.json`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `jsxSideEffects`    | `jsxSideEffects`           | Not supported in JS API, configure in `tsconfig.json`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `keepNames`         | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `legalComments`     | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `loader`            | `loader`                   | Bun supports a different set of built-in loaders than esbuild; see Bundler > Loaders for a complete reference. The esbuild loaders `dataurl`, `binary`, `base64`, `copy`, and `empty` are not yet implemented.                                                                                                                                                                                                                                                                           |
| `logLevel`          | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `logLimit`          | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `logOverride`       | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mainFields`        | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mangleCache`       | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mangleProps`       | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mangleQuoted`      | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `metafile`          | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `minify`            | `minify`                   | In Bun, `minify` can be a boolean or an object.<br /><br />`ts<br/>await Bun.build({<br/>  entrypoints: ['./index.tsx'],<br/>  // enable all minification<br/>  minify: true<br/><br/>  // granular options<br/>  minify: {<br/>    identifiers: true,<br/>    syntax: true,<br/>    whitespace: true<br/>  }<br/>})<br/>`                                                                                                                                                               |
| `minifyIdentifiers` | `minify.identifiers`       | See `minify`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `minifySyntax`      | `minify.syntax`            | See `minify`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `minifyWhitespace`  | `minify.whitespace`        | See `minify`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `nodePaths`         | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `outExtension`      | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `outbase`           | `root`                     | Different name                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `outdir`            | `outdir`                   | No differences                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `outfile`           | `outfile`                  | No differences                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `packages`          | n/a                        | Not supported, use `external`                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `platform`          | `target`                   | Supports `"bun"`, `"node"` and `"browser"` (the default). Does not support `"neutral"`.                                                                                                                                                                                                                                                                                                                                                                                                  |
| `plugins`           | `plugins`                  | Bun's plugin API is a subset of esbuild's. Some esbuild plugins will work out of the box with Bun.                                                                                                                                                                                                                                                                                                                                                                                       |
| `preserveSymlinks`  | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `publicPath`        | `publicPath`               | No differences                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `pure`              | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `reserveProps`      | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `resolveExtensions` | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `sourceRoot`        | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `sourcemap`         | `sourcemap`                | Supports `"inline"`, `"external"`, and `"none"`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `sourcesContent`    | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `splitting`         | `splitting`                | No differences                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `stdin`             | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `supported`         | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `target`            | n/a                        | No support for syntax downleveling                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `treeShaking`       | n/a                        | Always true                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tsconfig`          | n/a                        | Not supported                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `write`             | n/a                        | Set to true if `outdir`/`outfile` is set, otherwise false                                                                                                                                                                                                                                                                                                                                                                                                                                |

## Plugin API

Bun's plugin API is designed to be esbuild compatible. Bun doesn't support esbuild's entire plugin API surface, but the core functionality is implemented. Many third-party esbuild plugins will work out of the box with Bun.

<Note>
  Long term, we aim for feature parity with esbuild's API, so if something doesn't work please file
  an issue to help us prioritize.
</Note>

Plugins in Bun and esbuild are defined with a builder object.

```ts title="myPlugin.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from "bun";

const myPlugin: BunPlugin = {
	name: "my-plugin",
	setup(builder) {
		// define plugin
	},
};
```

The builder object provides some methods for hooking into parts of the bundling process. Bun implements `onResolve` and `onLoad`; it does not yet implement the esbuild hooks `onStart`, `onEnd`, and `onDispose`, and `resolve` utilities. `initialOptions` is partially implemented, being read-only and only having a subset of esbuild's options; use `config` (same thing but with Bun's `BuildConfig` format) instead.

```ts title="myPlugin.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunPlugin } from "bun";
const myPlugin: BunPlugin = {
	name: "my-plugin",
	setup(builder) {
		builder.onResolve(
			{
				/* onResolve.options */
			},
			args => {
				return {
					/* onResolve.results */
				};
			},
		);
		builder.onLoad(
			{
				/* onLoad.options */
			},
			args => {
				return {
					/* onLoad.results */
				};
			},
		);
	},
};
```

### onResolve

<Tabs>
  <Tab title="options">- 🟢 `filter` - 🟢 `namespace`</Tab>

  <Tab title="arguments">
    * 🟢 `path` - 🟢 `importer` - 🔴 `namespace` - 🔴 `resolveDir` - 🔴 `kind` - 🔴 `pluginData`
  </Tab>

  <Tab title="results">
    * 🟢 `namespace` - 🟢 `path` - 🔴 `errors` - 🔴 `external` - 🔴 `pluginData` - 🔴 `pluginName` -
      🔴 `sideEffects` - 🔴 `suffix` - 🔴 `warnings` - 🔴 `watchDirs` - 🔴 `watchFiles`
  </Tab>
</Tabs>

### onLoad

<Tabs>
  <Tab title="options">- 🟢 `filter` - 🟢 `namespace`</Tab>
  <Tab title="arguments">- 🟢 `path` - 🔴 `namespace` - 🔴 `suffix` - 🔴 `pluginData`</Tab>

  <Tab title="results">
    * 🟢 `contents` - 🟢 `loader` - 🔴 `errors` - 🔴 `pluginData` - 🔴 `pluginName` - 🔴
      `resolveDir` - 🔴 `warnings` - 🔴 `watchDirs` - 🔴 `watchFiles`
  </Tab>
</Tabs>
