# Globals

> Use Bun's global objects

Bun implements the following globals.

| Global                                                                                                                  | Source         | Notes                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)                                   | Web            |                                                                                                                                                                                                                                               |
| [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)                                           | Web            |                                                                                                                                                                                                                                               |
| [`alert`](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert)                                                | Web            | Intended for command-line tools                                                                                                                                                                                                               |
| [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)                                                         | Web            |                                                                                                                                                                                                                                               |
| [`Buffer`](https://nodejs.org/api/buffer.html#class-buffer)                                                             | Node.js        | See [Node.js > `Buffer`](/runtime/nodejs-compat#node-buffer)                                                                                                                                                                                  |
| `Bun`                                                                                                                   | Bun            | Subject to change as additional APIs are added                                                                                                                                                                                                |
| [`ByteLengthQueuingStrategy`](https://developer.mozilla.org/en-US/docs/Web/API/ByteLengthQueuingStrategy)               | Web            |                                                                                                                                                                                                                                               |
| [`confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm)                                            | Web            | Intended for command-line tools                                                                                                                                                                                                               |
| [`__dirname`](https://nodejs.org/api/globals.html#__dirname)                                                            | Node.js        |                                                                                                                                                                                                                                               |
| [`__filename`](https://nodejs.org/api/globals.html#__filename)                                                          | Node.js        |                                                                                                                                                                                                                                               |
| [`atob()`](https://developer.mozilla.org/en-US/docs/Web/API/atob)                                                       | Web            |                                                                                                                                                                                                                                               |
| [`btoa()`](https://developer.mozilla.org/en-US/docs/Web/API/btoa)                                                       | Web            |                                                                                                                                                                                                                                               |
| `BuildMessage`                                                                                                          | Bun            |                                                                                                                                                                                                                                               |
| [`clearImmediate()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearImmediate)                            | Web            |                                                                                                                                                                                                                                               |
| [`clearInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval)                              | Web            |                                                                                                                                                                                                                                               |
| [`clearTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout)                                | Web            |                                                                                                                                                                                                                                               |
| [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console)                                                   | Web            |                                                                                                                                                                                                                                               |
| [`CountQueuingStrategy`](https://developer.mozilla.org/en-US/docs/Web/API/CountQueuingStrategy)                         | Web            |                                                                                                                                                                                                                                               |
| [`Crypto`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)                                                     | Web            |                                                                                                                                                                                                                                               |
| [`crypto`](https://developer.mozilla.org/en-US/docs/Web/API/crypto)                                                     | Web            |                                                                                                                                                                                                                                               |
| [`CryptoKey`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)                                               | Web            |                                                                                                                                                                                                                                               |
| [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)                                           | Web            |                                                                                                                                                                                                                                               |
| [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event)                                                       | Web            | Also [`ErrorEvent`](https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent) [`CloseEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent). |
| [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)                                           | Web            |                                                                                                                                                                                                                                               |
| [`exports`](https://nodejs.org/api/globals.html#exports)                                                                | Node.js        |                                                                                                                                                                                                                                               |
| [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)                                                       | Web            |                                                                                                                                                                                                                                               |
| [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)                                                 | Web            |                                                                                                                                                                                                                                               |
| [`global`](https://nodejs.org/api/globals.html#global)                                                                  | Node.js        | See [Node.js > `global`](/runtime/nodejs-compat#global).                                                                                                                                                                                      |
| [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)             | Cross-platform | Aliases to `global`                                                                                                                                                                                                                           |
| [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers)                                                   | Web            |                                                                                                                                                                                                                                               |
| [`HTMLRewriter`](/runtime/html-rewriter)                                                                                | Cloudflare     |                                                                                                                                                                                                                                               |
| [`JSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)                         | Web            |                                                                                                                                                                                                                                               |
| [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent)                                         | Web            |                                                                                                                                                                                                                                               |
| [`module`](https://nodejs.org/api/globals.html#module)                                                                  | Node.js        |                                                                                                                                                                                                                                               |
| [`performance`](https://developer.mozilla.org/en-US/docs/Web/API/performance)                                           | Web            |                                                                                                                                                                                                                                               |
| [`process`](https://nodejs.org/api/process.html)                                                                        | Node.js        | See [Node.js > `process`](/runtime/nodejs-compat#node-process)                                                                                                                                                                                |
| [`prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt)                                              | Web            | Intended for command-line tools                                                                                                                                                                                                               |
| [`queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)                                   | Web            |                                                                                                                                                                                                                                               |
| [`ReadableByteStreamController`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableByteStreamController)         | Web            |                                                                                                                                                                                                                                               |
| [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)                                     | Web            |                                                                                                                                                                                                                                               |
| [`ReadableStreamDefaultController`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultController)   | Web            |                                                                                                                                                                                                                                               |
| [`ReadableStreamDefaultReader`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader)           | Web            |                                                                                                                                                                                                                                               |
| [`reportError`](https://developer.mozilla.org/en-US/docs/Web/API/reportError)                                           | Web            |                                                                                                                                                                                                                                               |
| [`require()`](https://nodejs.org/api/globals.html#require)                                                              | Node.js        |                                                                                                                                                                                                                                               |
| `ResolveMessage`                                                                                                        | Bun            |                                                                                                                                                                                                                                               |
| [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)                                                 | Web            |                                                                                                                                                                                                                                               |
| [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)                                                   | Web            |                                                                                                                                                                                                                                               |
| [`setImmediate()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate)                                | Web            |                                                                                                                                                                                                                                               |
| [`setInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)                                  | Web            |                                                                                                                                                                                                                                               |
| [`setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)                                    | Web            |                                                                                                                                                                                                                                               |
| [`ShadowRealm`](https://github.com/tc39/proposal-shadowrealm)                                                           | Web            | Stage 3 proposal                                                                                                                                                                                                                              |
| [`SubtleCrypto`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)                                         | Web            |                                                                                                                                                                                                                                               |
| [`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException)                                         | Web            |                                                                                                                                                                                                                                               |
| [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)                                           | Web            |                                                                                                                                                                                                                                               |
| [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder)                                           | Web            |                                                                                                                                                                                                                                               |
| [`TransformStream`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream)                                   | Web            |                                                                                                                                                                                                                                               |
| [`TransformStreamDefaultController`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStreamDefaultController) | Web            |                                                                                                                                                                                                                                               |
| [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)                                                           | Web            |                                                                                                                                                                                                                                               |
| [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)                                   | Web            |                                                                                                                                                                                                                                               |
| [`WebAssembly`](https://nodejs.org/api/globals.html#webassembly)                                                        | Web            |                                                                                                                                                                                                                                               |
| [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream)                                     | Web            |                                                                                                                                                                                                                                               |
| [`WritableStreamDefaultController`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStreamDefaultController)   | Web            |                                                                                                                                                                                                                                               |
| [`WritableStreamDefaultWriter`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStreamDefaultWriter)           | Web            |                                                                                                                                                                                                                                               |

# Bun APIs

> Overview of Bun's native APIs available on the Bun global object and built-in modules

Bun implements a set of native APIs on the `Bun` global object and through a number of built-in modules. These APIs are heavily optimized and represent the canonical "Bun-native" way to implement some common functionality.

Bun strives to implement standard Web APIs wherever possible. Bun introduces new APIs primarily for server-side tasks where no standard exists, such as file I/O and starting an HTTP server. In these cases, Bun's approach still builds atop standard APIs like `Blob`, `URL`, and `Request`.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req: Request) {
		return new Response("Success!");
	},
});
```

Click the link in the right column to jump to the associated documentation.

| Topic                            | APIs                                                                                                                                                                                                                                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP Server                      | [`Bun.serve`](/runtime/http/server)                                                                                                                                                                                                                                                                                    |
| Shell                            | [`$`](/runtime/shell)                                                                                                                                                                                                                                                                                                  |
| Bundler                          | [`Bun.build`](/bundler)                                                                                                                                                                                                                                                                                                |
| File I/O                         | [`Bun.file`](/runtime/file-io#reading-files-bun-file), [`Bun.write`](/runtime/file-io#writing-files-bun-write), `Bun.stdin`, `Bun.stdout`, `Bun.stderr`                                                                                                                                                                |
| Child Processes                  | [`Bun.spawn`](/runtime/child-process#spawn-a-process-bun-spawn), [`Bun.spawnSync`](/runtime/child-process#blocking-api-bun-spawnsync)                                                                                                                                                                                  |
| TCP Sockets                      | [`Bun.listen`](/runtime/networking/tcp#start-a-server-bun-listen), [`Bun.connect`](/runtime/networking/tcp#start-a-server-bun-listen)                                                                                                                                                                                  |
| UDP Sockets                      | [`Bun.udpSocket`](/runtime/networking/udp)                                                                                                                                                                                                                                                                             |
| WebSockets                       | `new WebSocket()` (client), [`Bun.serve`](/runtime/http/websockets) (server)                                                                                                                                                                                                                                           |
| Transpiler                       | [`Bun.Transpiler`](/runtime/transpiler)                                                                                                                                                                                                                                                                                |
| Routing                          | [`Bun.FileSystemRouter`](/runtime/file-system-router)                                                                                                                                                                                                                                                                  |
| Streaming HTML                   | [`HTMLRewriter`](/runtime/html-rewriter)                                                                                                                                                                                                                                                                               |
| Hashing                          | [`Bun.password`](/runtime/hashing#bun-password), [`Bun.hash`](/runtime/hashing#bun-hash), [`Bun.CryptoHasher`](/runtime/hashing#bun-cryptohasher), `Bun.sha`                                                                                                                                                           |
| SQLite                           | [`bun:sqlite`](/runtime/sqlite)                                                                                                                                                                                                                                                                                        |
| PostgreSQL Client                | [`Bun.SQL`](/runtime/sql), `Bun.sql`                                                                                                                                                                                                                                                                                   |
| Redis (Valkey) Client            | [`Bun.RedisClient`](/runtime/redis), `Bun.redis`                                                                                                                                                                                                                                                                       |
| FFI (Foreign Function Interface) | [`bun:ffi`](/runtime/ffi)                                                                                                                                                                                                                                                                                              |
| DNS                              | [`Bun.dns.lookup`](/runtime/networking/dns), `Bun.dns.prefetch`, `Bun.dns.getCacheStats`                                                                                                                                                                                                                               |
| Testing                          | [`bun:test`](/test)                                                                                                                                                                                                                                                                                                    |
| Workers                          | [`new Worker()`](/runtime/workers)                                                                                                                                                                                                                                                                                     |
| Module Loaders                   | [`Bun.plugin`](/bundler/plugins)                                                                                                                                                                                                                                                                                       |
| Glob                             | [`Bun.Glob`](/runtime/glob)                                                                                                                                                                                                                                                                                            |
| Cookies                          | [`Bun.Cookie`](/runtime/cookies), [`Bun.CookieMap`](/runtime/cookies)                                                                                                                                                                                                                                                  |
| Node-API                         | [`Node-API`](/runtime/node-api)                                                                                                                                                                                                                                                                                        |
| `import.meta`                    | [`import.meta`](/runtime/module-resolution#import-meta)                                                                                                                                                                                                                                                                |
| Utilities                        | [`Bun.version`](/runtime/utils#bun-version), [`Bun.revision`](/runtime/utils#bun-revision), [`Bun.env`](/runtime/utils#bun-env), [`Bun.main`](/runtime/utils#bun-main)                                                                                                                                                 |
| Sleep & Timing                   | [`Bun.sleep()`](/runtime/utils#bun-sleep), [`Bun.sleepSync()`](/runtime/utils#bun-sleepsync), [`Bun.nanoseconds()`](/runtime/utils#bun-nanoseconds)                                                                                                                                                                    |
| Random & UUID                    | [`Bun.randomUUIDv7()`](/runtime/utils#bun-randomuuidv7)                                                                                                                                                                                                                                                                |
| System & Environment             | [`Bun.which()`](/runtime/utils#bun-which)                                                                                                                                                                                                                                                                              |
| Comparison & Inspection          | [`Bun.peek()`](/runtime/utils#bun-peek), [`Bun.deepEquals()`](/runtime/utils#bun-deepequals), `Bun.deepMatch`, [`Bun.inspect()`](/runtime/utils#bun-inspect)                                                                                                                                                           |
| String & Text Processing         | [`Bun.escapeHTML()`](/runtime/utils#bun-escapehtml), [`Bun.stringWidth()`](/runtime/utils#bun-stringwidth), `Bun.indexOfLine`                                                                                                                                                                                          |
| URL & Path Utilities             | [`Bun.fileURLToPath()`](/runtime/utils#bun-fileurltopath), [`Bun.pathToFileURL()`](/runtime/utils#bun-pathtofileurl)                                                                                                                                                                                                   |
| Compression                      | [`Bun.gzipSync()`](/runtime/utils#bun-gzipsync), [`Bun.gunzipSync()`](/runtime/utils#bun-gunzipsync), [`Bun.deflateSync()`](/runtime/utils#bun-deflatesync), [`Bun.inflateSync()`](/runtime/utils#bun-inflatesync), `Bun.zstdCompressSync()`, `Bun.zstdDecompressSync()`, `Bun.zstdCompress()`, `Bun.zstdDecompress()` |
| Stream Processing                | [`Bun.readableStreamTo*()`](/runtime/utils#bun-readablestreamto), `Bun.readableStreamToBytes()`, `Bun.readableStreamToBlob()`, `Bun.readableStreamToFormData()`, `Bun.readableStreamToJSON()`, `Bun.readableStreamToArray()`                                                                                           |
| Memory & Buffer Management       | `Bun.ArrayBufferSink`, `Bun.allocUnsafe`, `Bun.concatArrayBuffers`                                                                                                                                                                                                                                                     |
| Module Resolution                | [`Bun.resolveSync()`](/runtime/utils#bun-resolvesync)                                                                                                                                                                                                                                                                  |
| Parsing & Formatting             | [`Bun.semver`](/runtime/semver), `Bun.TOML.parse`, [`Bun.color`](/runtime/color)                                                                                                                                                                                                                                       |
| Low-level / Internals            | `Bun.mmap`, `Bun.gc`, `Bun.generateHeapSnapshot`, [`bun:jsc`](https://bun.com/reference/bun/jsc)                                                                                                                                                                                                                       |

# Web APIs

> Web-standard APIs supported by Bun for server-side JavaScript

Some Web APIs aren't relevant in the context of a server-first runtime like Bun, such as the [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API#html_dom_api_interfaces) or [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API). Many others, though, are broadly useful outside of the browser context; when possible, Bun implements these Web-standard APIs instead of introducing new APIs.

The following Web APIs are partially or completely supported.

| Category              | APIs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP                  | [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch), [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response), [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request), [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers), [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)                                                                         |
| URLs                  | [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL), [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)                                                                                                                                                                                                                                                                                                                                                                                   |
| Web Workers           | [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker), [`self.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/postMessage), [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone), [`MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort), [`MessageChannel`](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel), [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) |
| Streams               | [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream), [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream), [`TransformStream`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream), [`ByteLengthQueuingStrategy`](https://developer.mozilla.org/en-US/docs/Web/API/ByteLengthQueuingStrategy), [`CountQueuingStrategy`](https://developer.mozilla.org/en-US/docs/Web/API/CountQueuingStrategy) and associated classes                                     |
| Blob                  | [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| WebSockets            | [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Encoding and decoding | [`atob`](https://developer.mozilla.org/en-US/docs/Web/API/atob), [`btoa`](https://developer.mozilla.org/en-US/docs/Web/API/btoa), [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder), [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)                                                                                                                                                                                                                                         |
| JSON                  | [`JSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Timeouts              | [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout), [`clearTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/clearTimeout)                                                                                                                                                                                                                                                                                                                                                                           |
| Intervals             | [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/setInterval), [`clearInterval`](https://developer.mozilla.org/en-US/docs/Web/API/clearInterval)                                                                                                                                                                                                                                                                                                                                                                       |
| Crypto                | [`crypto`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto), [`SubtleCrypto`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto), [`CryptoKey`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)                                                                                                                                                                                                                                                                                                        |
| Debugging             | [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console), [`performance`](https://developer.mozilla.org/en-US/docs/Web/API/Performance)                                                                                                                                                                                                                                                                                                                                                                                   |
| Microtasks            | [`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Errors                | [`reportError`](https://developer.mozilla.org/en-US/docs/Web/API/reportError)                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| User interaction      | [`alert`](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert), [`confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm), [`prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) (intended for interactive CLIs)                                                                                                                                                                                                                                                                     |
| Realms                | [`ShadowRealm`](https://github.com/tc39/proposal-shadowrealm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Events                | [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget), [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event), [`ErrorEvent`](https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent), [`CloseEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent), [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent)                                                                                                                                            |

# Node.js Compatibility

> Bun's compatibility status with Node.js APIs, modules, and globals

Every day, Bun gets closer to 100% Node.js API compatibility. Today, popular frameworks like Next.js, Express, and millions of `npm` packages intended for Node just work with Bun. To ensure compatibility, we run thousands of tests from Node.js' test suite before every release of Bun.

**If a package works in Node.js but doesn't work in Bun, we consider it a bug in Bun.** Please [open an issue](https://bun.com/issues) and we'll fix it.

This page is updated regularly to reflect compatibility status of the latest version of Bun. The information below reflects Bun's compatibility with *Node.js v23*.

## Built-in Node.js modules

### [`node:assert`](https://nodejs.org/api/assert.html)

🟢 Fully implemented.

### [`node:buffer`](https://nodejs.org/api/buffer.html)

🟢 Fully implemented.

### [`node:console`](https://nodejs.org/api/console.html)

🟢 Fully implemented.

### [`node:dgram`](https://nodejs.org/api/dgram.html)

🟢 Fully implemented. > 90% of Node.js's test suite passes.

### [`node:diagnostics_channel`](https://nodejs.org/api/diagnostics_channel.html)

🟢 Fully implemented.

### [`node:dns`](https://nodejs.org/api/dns.html)

🟢 Fully implemented. > 90% of Node.js's test suite passes.

### [`node:events`](https://nodejs.org/api/events.html)

🟢 Fully implemented. 100% of Node.js's test suite passes. `EventEmitterAsyncResource` uses `AsyncResource` underneath.

### [`node:fs`](https://nodejs.org/api/fs.html)

🟢 Fully implemented. 92% of Node.js's test suite passes.

### [`node:http`](https://nodejs.org/api/http.html)

🟢 Fully implemented. Outgoing client request body is currently buffered instead of streamed.

### [`node:https`](https://nodejs.org/api/https.html)

🟢 APIs are implemented, but `Agent` is not always used yet.

### [`node:os`](https://nodejs.org/api/os.html)

🟢 Fully implemented. 100% of Node.js's test suite passes.

### [`node:path`](https://nodejs.org/api/path.html)

🟢 Fully implemented. 100% of Node.js's test suite passes.

### [`node:punycode`](https://nodejs.org/api/punycode.html)

🟢 Fully implemented. 100% of Node.js's test suite passes, *deprecated by Node.js*.

### [`node:querystring`](https://nodejs.org/api/querystring.html)

🟢 Fully implemented. 100% of Node.js's test suite passes.

### [`node:readline`](https://nodejs.org/api/readline.html)

🟢 Fully implemented.

### [`node:stream`](https://nodejs.org/api/stream.html)

🟢 Fully implemented.

### [`node:string_decoder`](https://nodejs.org/api/string_decoder.html)

🟢 Fully implemented. 100% of Node.js's test suite passes.

### [`node:timers`](https://nodejs.org/api/timers.html)

🟢 Recommended to use global `setTimeout`, et. al. instead.

### [`node:tty`](https://nodejs.org/api/tty.html)

🟢 Fully implemented.

### [`node:url`](https://nodejs.org/api/url.html)

🟢 Fully implemented.

### [`node:zlib`](https://nodejs.org/api/zlib.html)

🟢 Fully implemented. 98% of Node.js's test suite passes.

### [`node:async_hooks`](https://nodejs.org/api/async_hooks.html)

🟡 `AsyncLocalStorage`, and `AsyncResource` are implemented. v8 promise hooks are not called, and its usage is [strongly discouraged](https://nodejs.org/docs/latest/api/async_hooks.html#async-hooks).

### [`node:child_process`](https://nodejs.org/api/child_process.html)

🟡 Missing `proc.gid` `proc.uid`. `Stream` class not exported. IPC cannot send socket handles. Node.js ↔ Bun IPC can be used with JSON serialization.

### [`node:cluster`](https://nodejs.org/api/cluster.html)

🟡 Handles and file descriptors cannot be passed between workers, which means load-balancing HTTP requests across processes is only supported on Linux at this time (via `SO_REUSEPORT`). Otherwise, implemented but not battle-tested.

### [`node:crypto`](https://nodejs.org/api/crypto.html)

🟡 Missing `secureHeapUsed` `setEngine` `setFips`

### [`node:domain`](https://nodejs.org/api/domain.html)

🟡 Missing `Domain` `active`

### [`node:http2`](https://nodejs.org/api/http2.html)

🟡 Client & server are implemented (95.25% of gRPC's test suite passes). Missing `options.allowHTTP1`, `options.enableConnectProtocol`, ALTSVC extension, and `http2stream.pushStream`.

### [`node:module`](https://nodejs.org/api/module.html)

🟡 Missing `syncBuiltinESMExports`, `Module#load()`. Overriding `require.cache` is supported for ESM & CJS modules. `module._extensions`, `module._pathCache`, `module._cache` are no-ops. `module.register` is not implemented and we recommend using a [`Bun.plugin`](/runtime/plugins) in the meantime.

### [`node:net`](https://nodejs.org/api/net.html)

🟢 Fully implemented.

### [`node:perf_hooks`](https://nodejs.org/api/perf_hooks.html)

🟡 APIs are implemented, but Node.js test suite does not pass yet for this module.

### [`node:process`](https://nodejs.org/api/process.html)

🟡 See [`process`](#process) Global.

### [`node:sys`](https://nodejs.org/api/util.html)

🟡 See [`node:util`](#node-util).

### [`node:tls`](https://nodejs.org/api/tls.html)

🟡 Missing `tls.createSecurePair`.

### [`node:util`](https://nodejs.org/api/util.html)

🟡 Missing `getCallSite` `getCallSites` `getSystemErrorMap` `getSystemErrorMessage` `transferableAbortSignal` `transferableAbortController`

### [`node:v8`](https://nodejs.org/api/v8.html)

🟡 `writeHeapSnapshot` and `getHeapSnapshot` are implemented. `serialize` and `deserialize` use JavaScriptCore's wire format instead of V8's. Other methods are not implemented. For profiling, use [`bun:jsc`](/project/benchmarking#bunjsc) instead.

### [`node:vm`](https://nodejs.org/api/vm.html)

🟡 Core functionality and ES modules are implemented, including `vm.Script`, `vm.createContext`, `vm.runInContext`, `vm.runInNewContext`, `vm.runInThisContext`, `vm.compileFunction`, `vm.isContext`, `vm.Module`, `vm.SourceTextModule`, `vm.SyntheticModule`, and `importModuleDynamically` support. Options like `timeout` and `breakOnSigint` are fully supported. Missing `vm.measureMemory` and some `cachedData` functionality.

### [`node:wasi`](https://nodejs.org/api/wasi.html)

🟡 Partially implemented.

### [`node:worker_threads`](https://nodejs.org/api/worker_threads.html)

🟡 `Worker` doesn't support the following options: `stdin` `stdout` `stderr` `trackedUnmanagedFds` `resourceLimits`. Missing `markAsUntransferable` `moveMessagePortToContext`.

### [`node:inspector`](https://nodejs.org/api/inspector.html)

🔴 Not implemented.

### [`node:repl`](https://nodejs.org/api/repl.html)

🔴 Not implemented.

### [`node:sqlite`](https://nodejs.org/api/sqlite.html)

🔴 Not implemented.

### [`node:test`](https://nodejs.org/api/test.html)

🟡 Partly implemented. Missing mocks, snapshots, timers. Use [`bun:test`](/test) instead.

### [`node:trace_events`](https://nodejs.org/api/tracing.html)

🔴 Not implemented.

## Node.js globals

The table below lists all globals implemented by Node.js and Bun's current compatibility status.

### [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

🟢 Fully implemented.

### [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)

🟢 Fully implemented.

### [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

🟢 Fully implemented.

### [`Buffer`](https://nodejs.org/api/buffer.html#class-buffer)

🟢 Fully implemented.

### [`ByteLengthQueuingStrategy`](https://developer.mozilla.org/en-US/docs/Web/API/ByteLengthQueuingStrategy)

🟢 Fully implemented.

### [`__dirname`](https://nodejs.org/api/globals.html#__dirname)

🟢 Fully implemented.

### [`__filename`](https://nodejs.org/api/globals.html#__filename)

🟢 Fully implemented.

### [`atob()`](https://developer.mozilla.org/en-US/docs/Web/API/atob)

🟢 Fully implemented.

### [`Atomics`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)

🟢 Fully implemented.

### [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)

🟢 Fully implemented.

### [`btoa()`](https://developer.mozilla.org/en-US/docs/Web/API/btoa)

🟢 Fully implemented.

### [`clearImmediate()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearImmediate)

🟢 Fully implemented.

### [`clearInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval)

🟢 Fully implemented.

### [`clearTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout)

🟢 Fully implemented.

### [`CompressionStream`](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream)

🔴 Not implemented.

### [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console)

🟢 Fully implemented.

### [`CountQueuingStrategy`](https://developer.mozilla.org/en-US/docs/Web/API/CountQueuingStrategy)

🟢 Fully implemented.

### [`Crypto`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)

🟢 Fully implemented.

### [`SubtleCrypto (crypto)`](https://developer.mozilla.org/en-US/docs/Web/API/crypto)

🟢 Fully implemented.

### [`CryptoKey`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)

🟢 Fully implemented.

### [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)

🟢 Fully implemented.

### [`DecompressionStream`](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream)

🔴 Not implemented.

### [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event)

🟢 Fully implemented.

### [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

🟢 Fully implemented.

### [`exports`](https://nodejs.org/api/globals.html#exports)

🟢 Fully implemented.

### [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)

🟢 Fully implemented.

### [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

🟢 Fully implemented.

### [`global`](https://nodejs.org/api/globals.html#global)

🟢 Implemented. This is an object containing all objects in the global namespace. It's rarely referenced directly, as its contents are available without an additional prefix, e.g. `__dirname` instead of `global.__dirname`.

### [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)

🟢 Aliases to `global`.

### [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers)

🟢 Fully implemented.

### [`MessageChannel`](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)

🟢 Fully implemented.

### [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent)

🟢 Fully implemented.

### [`MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort)

🟢 Fully implemented.

### [`module`](https://nodejs.org/api/globals.html#module)

🟢 Fully implemented.

### [`PerformanceEntry`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry)

🟢 Fully implemented.

### [`PerformanceMark`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceMark)

🟢 Fully implemented.

### [`PerformanceMeasure`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceMeasure)

🟢 Fully implemented.

### [`PerformanceObserver`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)

🟢 Fully implemented.

### [`PerformanceObserverEntryList`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserverEntryList)

🟢 Fully implemented.

### [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)

🟢 Fully implemented.

### [`performance`](https://developer.mozilla.org/en-US/docs/Web/API/performance)

🟢 Fully implemented.

### [`process`](https://nodejs.org/api/process.html)

🟡 Mostly implemented. `process.binding` (internal Node.js bindings some packages rely on) is partially implemented. `process.title` is currently a no-op on macOS & Linux. `getActiveResourcesInfo` `setActiveResourcesInfo`, `getActiveResources` and `setSourceMapsEnabled` are stubs. Newer APIs like `process.loadEnvFile` and `process.getBuiltinModule` are not implemented yet.

### [`queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)

🟢 Fully implemented.

### [`ReadableByteStreamController`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableByteStreamController)

🟢 Fully implemented.

### [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)

🟢 Fully implemented.

### [`ReadableStreamBYOBReader`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamBYOBReader)

🟢 Fully implemented.

### [`ReadableStreamBYOBRequest`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamBYOBRequest)

🟢 Fully implemented.

### [`ReadableStreamDefaultController`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultController)

🟢 Fully implemented.

### [`ReadableStreamDefaultReader`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader)

🟢 Fully implemented.

### [`require()`](https://nodejs.org/api/globals.html#require)

🟢 Fully implemented, including [`require.main`](https://nodejs.org/api/modules.html#requiremain), [`require.cache`](https://nodejs.org/api/modules.html#requirecache), [`require.resolve`](https://nodejs.org/api/modules.html#requireresolverequest-options).

### [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)

🟢 Fully implemented.

### [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)

🟢 Fully implemented.

### [`setImmediate()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate)

🟢 Fully implemented.

### [`setInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)

🟢 Fully implemented.

### [`setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)

🟢 Fully implemented.

### [`structuredClone()`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)

🟢 Fully implemented.

### [`SubtleCrypto`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

🟢 Fully implemented.

### [`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException)

🟢 Fully implemented.

### [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)

🟢 Fully implemented.

### [`TextDecoderStream`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream)

🟢 Fully implemented.

### [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder)

🟢 Fully implemented.

### [`TextEncoderStream`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoderStream)

🟢 Fully implemented.

### [`TransformStream`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream)

🟢 Fully implemented.

### [`TransformStreamDefaultController`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStreamDefaultController)

🟢 Fully implemented.

### [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)

🟢 Fully implemented.

### [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

🟢 Fully implemented.

### [`WebAssembly`](https://nodejs.org/api/globals.html#webassembly)

🟢 Fully implemented.

### [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream)

🟢 Fully implemented.

### [`WritableStreamDefaultController`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStreamDefaultController)

🟢 Fully implemented.

### [`WritableStreamDefaultWriter`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStreamDefaultWriter)

🟢 Fully implemented.
