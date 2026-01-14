# Cookies

> Use Bun's native APIs for working with HTTP cookies

Bun provides native APIs for working with HTTP cookies through `Bun.Cookie` and `Bun.CookieMap`. These APIs offer fast, easy-to-use methods for parsing, generating, and manipulating cookies in HTTP requests and responses.

## CookieMap class

`Bun.CookieMap` provides a Map-like interface for working with collections of cookies. It implements the `Iterable` interface, allowing you to use it with `for...of` loops and other iteration methods.

```ts filename="cookies.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Empty cookie map
const cookies = new Bun.CookieMap();

// From a cookie string
const cookies1 = new Bun.CookieMap("name=value; foo=bar");

// From an object
const cookies2 = new Bun.CookieMap({
	session: "abc123",
	theme: "dark",
});

// From an array of name/value pairs
const cookies3 = new Bun.CookieMap([
	["session", "abc123"],
	["theme", "dark"],
]);
```

### In HTTP servers

In Bun's HTTP server, the `cookies` property on the request object (in `routes`) is an instance of `CookieMap`:

```ts filename="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	routes: {
		"/": req => {
			// Access request cookies
			const cookies = req.cookies;

			// Get a specific cookie
			const sessionCookie = cookies.get("session");
			if (sessionCookie != null) {
				console.log(sessionCookie);
			}

			// Check if a cookie exists
			if (cookies.has("theme")) {
				// ...
			}

			// Set a cookie, it will be automatically applied to the response
			cookies.set("visited", "true");

			return new Response("Hello");
		},
	},
});

console.log("Server listening at: " + server.url);
```

### Methods

#### `get(name: string): string | null`

Retrieves a cookie by name. Returns `null` if the cookie doesn't exist.

```ts filename="get-cookie.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Get by name
const cookie = cookies.get("session");

if (cookie != null) {
	console.log(cookie);
}
```

#### `has(name: string): boolean`

Checks if a cookie with the given name exists.

```ts filename="has-cookie.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Check if cookie exists
if (cookies.has("session")) {
	// Cookie exists
}
```

#### `set(name: string, value: string): void`

#### `set(options: CookieInit): void`

#### `set(cookie: Cookie): void`

Adds or updates a cookie in the map. Cookies default to `{ path: "/", sameSite: "lax" }`.

```ts filename="set-cookie.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Set by name and value
cookies.set("session", "abc123");

// Set using options object
cookies.set({
	name: "theme",
	value: "dark",
	maxAge: 3600,
	secure: true,
});

// Set using Cookie instance
const cookie = new Bun.Cookie("visited", "true");
cookies.set(cookie);
```

#### `delete(name: string): void`

#### `delete(options: CookieStoreDeleteOptions): void`

Removes a cookie from the map. When applied to a Response, this adds a cookie with an empty string value and an expiry date in the past. A cookie will only delete successfully on the browser if the domain and path is the same as it was when the cookie was created.

```ts filename="delete-cookie.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Delete by name using default domain and path.
cookies.delete("session");

// Delete with domain/path options.
cookies.delete({
	name: "session",
	domain: "example.com",
	path: "/admin",
});
```

#### `toJSON(): Record<string, string>`

Converts the cookie map to a serializable format.

```ts filename="cookie-to-json.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const json = cookies.toJSON();
```

#### `toSetCookieHeaders(): string[]`

Returns an array of values for Set-Cookie headers that can be used to apply all cookie changes.

When using `Bun.serve()`, you don't need to call this method explicitly. Any changes made to the `req.cookies` map are automatically applied to the response headers. This method is primarily useful when working with other HTTP server implementations.

```ts filename="node-server.js" icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { createServer } from "node:http";
import { CookieMap } from "bun";

const server = createServer((req, res) => {
	const cookieHeader = req.headers.cookie || "";
	const cookies = new CookieMap(cookieHeader);

	cookies.set("view-count", Number(cookies.get("view-count") || "0") + 1);
	cookies.delete("session");

	res.writeHead(200, {
		"Content-Type": "text/plain",
		"Set-Cookie": cookies.toSetCookieHeaders(),
	});
	res.end(`Found ${cookies.size} cookies`);
});

server.listen(3000, () => {
	console.log("Server running at http://localhost:3000/");
});
```

### Iteration

`CookieMap` provides several methods for iteration:

```ts filename="iterate-cookies.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Iterate over [name, cookie] entries
for (const [name, value] of cookies) {
	console.log(`${name}: ${value}`);
}

// Using entries()
for (const [name, value] of cookies.entries()) {
	console.log(`${name}: ${value}`);
}

// Using keys()
for (const name of cookies.keys()) {
	console.log(name);
}

// Using values()
for (const value of cookies.values()) {
	console.log(value);
}

// Using forEach
cookies.forEach((value, name) => {
	console.log(`${name}: ${value}`);
});
```

### Properties

#### `size: number`

Returns the number of cookies in the map.

```ts filename="cookie-size.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(cookies.size); // Number of cookies
```

## Cookie class

`Bun.Cookie` represents an HTTP cookie with its name, value, and attributes.

```ts filename="cookie-class.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Cookie } from "bun";

// Create a basic cookie
const cookie = new Bun.Cookie("name", "value");

// Create a cookie with options
const secureSessionCookie = new Bun.Cookie("session", "abc123", {
	domain: "example.com",
	path: "/admin",
	expires: new Date(Date.now() + 86400000), // 1 day
	httpOnly: true,
	secure: true,
	sameSite: "strict",
});

// Parse from a cookie string
const parsedCookie = new Bun.Cookie("name=value; Path=/; HttpOnly");

// Create from an options object
const objCookie = new Bun.Cookie({
	name: "theme",
	value: "dark",
	maxAge: 3600,
	secure: true,
});
```

### Constructors

```ts filename="constructors.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Basic constructor with name/value
new Bun.Cookie(name: string, value: string);

// Constructor with name, value, and options
new Bun.Cookie(name: string, value: string, options: CookieInit);

// Constructor from cookie string
new Bun.Cookie(cookieString: string);

// Constructor from cookie object
new Bun.Cookie(options: CookieInit);
```

### Properties

```ts filename="cookie-properties.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
cookie.name; // string - Cookie name
cookie.value; // string - Cookie value
cookie.domain; // string | null - Domain scope (null if not specified)
cookie.path; // string - URL path scope (defaults to "/")
cookie.expires; // number | undefined - Expiration timestamp (ms since epoch)
cookie.secure; // boolean - Require HTTPS
cookie.sameSite; // "strict" | "lax" | "none" - SameSite setting
cookie.partitioned; // boolean - Whether the cookie is partitioned (CHIPS)
cookie.maxAge; // number | undefined - Max age in seconds
cookie.httpOnly; // boolean - Accessible only via HTTP (not JavaScript)
```

### Methods

#### `isExpired(): boolean`

Checks if the cookie has expired.

```ts filename="is-expired.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Expired cookie (Date in the past)
const expiredCookie = new Bun.Cookie("name", "value", {
	expires: new Date(Date.now() - 1000),
});
console.log(expiredCookie.isExpired()); // true

// Valid cookie (Using maxAge instead of expires)
const validCookie = new Bun.Cookie("name", "value", {
	maxAge: 3600, // 1 hour in seconds
});
console.log(validCookie.isExpired()); // false

// Session cookie (no expiration)
const sessionCookie = new Bun.Cookie("name", "value");
console.log(sessionCookie.isExpired()); // false
```

#### `serialize(): string`

#### `toString(): string`

Returns a string representation of the cookie suitable for a `Set-Cookie` header.

```ts filename="serialize-cookie.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const cookie = new Bun.Cookie("session", "abc123", {
	domain: "example.com",
	path: "/admin",
	expires: new Date(Date.now() + 86400000),
	secure: true,
	httpOnly: true,
	sameSite: "strict",
});

console.log(cookie.serialize());
// => "session=abc123; Domain=example.com; Path=/admin; Expires=Sun, 19 Mar 2025 15:03:26 GMT; Secure; HttpOnly; SameSite=strict"
console.log(cookie.toString());
// => "session=abc123; Domain=example.com; Path=/admin; Expires=Sun, 19 Mar 2025 15:03:26 GMT; Secure; HttpOnly; SameSite=strict"
```

#### `toJSON(): CookieInit`

Converts the cookie to a plain object suitable for JSON serialization.

```ts filename="cookie-json.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const cookie = new Bun.Cookie("session", "abc123", {
	secure: true,
	httpOnly: true,
});

const json = cookie.toJSON();
// => {
//   name: "session",
//   value: "abc123",
//   path: "/",
//   secure: true,
//   httpOnly: true,
//   sameSite: "lax",
//   partitioned: false
// }

// Works with JSON.stringify
const jsonString = JSON.stringify(cookie);
```

### Static methods

#### `Cookie.parse(cookieString: string): Cookie`

Parses a cookie string into a `Cookie` instance.

```ts filename="parse-cookie.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const cookie = Bun.Cookie.parse("name=value; Path=/; Secure; SameSite=Lax");

console.log(cookie.name); // "name"
console.log(cookie.value); // "value"
console.log(cookie.path); // "/"
console.log(cookie.secure); // true
console.log(cookie.sameSite); // "lax"
```

#### `Cookie.from(name: string, value: string, options?: CookieInit): Cookie`

Factory method to create a cookie.

```ts filename="cookie-from.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const cookie = Bun.Cookie.from("session", "abc123", {
	httpOnly: true,
	secure: true,
	maxAge: 3600,
});
```

## Types

```ts filename="types.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
interface CookieInit {
	name?: string;
	value?: string;
	domain?: string;
	/** Defaults to '/'. To allow the browser to set the path, use an empty string. */
	path?: string;
	expires?: number | Date | string;
	secure?: boolean;
	/** Defaults to `lax`. */
	sameSite?: CookieSameSite;
	httpOnly?: boolean;
	partitioned?: boolean;
	maxAge?: number;
}

interface CookieStoreDeleteOptions {
	name: string;
	domain?: string | null;
	path?: string;
}

interface CookieStoreGetOptions {
	name?: string;
	url?: string;
}

type CookieSameSite = "strict" | "lax" | "none";

class Cookie {
	constructor(name: string, value: string, options?: CookieInit);
	constructor(cookieString: string);
	constructor(cookieObject?: CookieInit);

	readonly name: string;
	value: string;
	domain?: string;
	path: string;
	expires?: Date;
	secure: boolean;
	sameSite: CookieSameSite;
	partitioned: boolean;
	maxAge?: number;
	httpOnly: boolean;

	isExpired(): boolean;

	serialize(): string;
	toString(): string;
	toJSON(): CookieInit;

	static parse(cookieString: string): Cookie;
	static from(name: string, value: string, options?: CookieInit): Cookie;
}

class CookieMap implements Iterable<[string, string]> {
	constructor(init?: string[][] | Record<string, string> | string);

	get(name: string): string | null;

	toSetCookieHeaders(): string[];

	has(name: string): boolean;
	set(name: string, value: string, options?: CookieInit): void;
	set(options: CookieInit): void;
	delete(name: string): void;
	delete(options: CookieStoreDeleteOptions): void;
	delete(name: string, options: Omit<CookieStoreDeleteOptions, "name">): void;
	toJSON(): Record<string, string>;

	readonly size: number;

	entries(): IterableIterator<[string, string]>;
	keys(): IterableIterator<string>;
	values(): IterableIterator<string>;
	forEach(callback: (value: string, key: string, map: CookieMap) => void): void;
	[Symbol.iterator](): IterableIterator<[string, string]>;
}
```
# File I/O

> Bun provides a set of optimized APIs for reading and writing files.

<Note>
  The `Bun.file` and `Bun.write` APIs documented on this page are heavily optimized and represent the recommended way to perform file-system tasks using Bun. For operations that are not yet available with `Bun.file`, such as `mkdir` or `readdir`, you can use Bun's [nearly complete](/runtime/nodejs-compat#node-fs) implementation of the [`node:fs`](https://nodejs.org/api/fs.html) module.
</Note>

***

## Reading files (`Bun.file()`)

`Bun.file(path): BunFile`

Create a `BunFile` instance with the `Bun.file(path)` function. A `BunFile` represents a lazily-loaded file; initializing it does not actually read the file from disk.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const foo = Bun.file("foo.txt"); // relative to cwd
foo.size; // number of bytes
foo.type; // MIME type
```

The reference conforms to the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) interface, so the contents can be read in various formats.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const foo = Bun.file("foo.txt");

await foo.text(); // contents as a string
await foo.json(); // contents as a JSON object
await foo.stream(); // contents as ReadableStream
await foo.arrayBuffer(); // contents as ArrayBuffer
await foo.bytes(); // contents as Uint8Array
```

File references can also be created using numerical [file descriptors](https://en.wikipedia.org/wiki/File_descriptor) or `file://` URLs.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.file(1234);
Bun.file(new URL(import.meta.url)); // reference to the current file
```

A `BunFile` can point to a location on disk where a file does not exist.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const notreal = Bun.file("notreal.txt");
notreal.size; // 0
notreal.type; // "text/plain;charset=utf-8"
const exists = await notreal.exists(); // false
```

The default MIME type is `text/plain;charset=utf-8`, but it can be overridden by passing a second argument to `Bun.file`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const notreal = Bun.file("notreal.json", { type: "application/json" });
notreal.type; // => "application/json;charset=utf-8"
```

For convenience, Bun exposes `stdin`, `stdout` and `stderr` as instances of `BunFile`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.stdin; // readonly
Bun.stdout;
Bun.stderr;
```

### Deleting files (`file.delete()`)

You can delete a file by calling the `.delete()` function.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.file("logs.json").delete();
```

***

## Writing files (`Bun.write()`)

`Bun.write(destination, data, options?): Promise<number>`

The `Bun.write` function is a multi-tool for writing payloads of all kinds to disk.

The first argument is the `destination` which can have any of the following types:

* `string`: A path to a location on the file system. Use the `"path"` module to manipulate paths.
* `URL`: A `file://` descriptor.
* `BunFile`: A file reference.
* `S3File`: An S3 file reference.

The second argument is the data to be written. It can be any of the following:

* `string`
* `Blob` (including `BunFile`)
* `ArrayBuffer` or `SharedArrayBuffer`
* `TypedArray` (`Uint8Array`, et. al.)
* `BlobPart[]`: An array of blob parts.

The third argument is an optional `options` object with the following properties:

* `mode`: The file mode to use when creating the file. If not specified, defaults to `0o644`.
* `createPath`: Whether to create parent directories if they don't exist. Defaults to `true`.

All possible permutations are handled using the fastest available system calls on the current platform.

<Accordion title="See syscalls">
  | Output               | Input          | System call                   | Platform |
  | -------------------- | -------------- | ----------------------------- | -------- |
  | file                 | file           | copy\_file\_range             | Linux    |
  | file                 | pipe           | sendfile                      | Linux    |
  | pipe                 | pipe           | splice                        | Linux    |
  | terminal             | file           | sendfile                      | Linux    |
  | terminal             | terminal       | sendfile                      | Linux    |
  | socket               | file or pipe   | sendfile (if http, not https) | Linux    |
  | file (doesn't exist) | file (path)    | clonefile                     | macOS    |
  | file (exists)        | file           | fcopyfile                     | macOS    |
  | file                 | Blob or string | write                         | macOS    |
  | file                 | Blob or string | write                         | Linux    |
</Accordion>

To write a string to disk:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const data = `It was the best of times, it was the worst of times.`;
await Bun.write("output.txt", data);
```

To copy a file to another location on disk:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const input = Bun.file("input.txt");
const output = Bun.file("output.txt"); // doesn't exist yet!
await Bun.write(output, input);
```

To write a byte array to disk:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const encoder = new TextEncoder();
const data = encoder.encode("datadatadata"); // Uint8Array
await Bun.write("output.txt", data);
```

To write a file to `stdout`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const input = Bun.file("input.txt");
await Bun.write(Bun.stdout, input);
```

To write the body of an HTTP response to disk:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("https://bun.com");
await Bun.write("index.html", response);
```

***

## Incremental writing with `FileSink`

Bun provides a native incremental file writing API called `FileSink`. To retrieve a `FileSink` instance from a `BunFile`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const file = Bun.file("output.txt");
const writer = file.writer();
```

To incrementally write to the file, call `.write()`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const file = Bun.file("output.txt");
const writer = file.writer();

writer.write("it was the best of times\n");
writer.write("it was the worst of times\n");
```

These chunks will be buffered internally. To flush the buffer to disk, use `.flush()`. This returns the number of flushed bytes.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
writer.flush(); // write buffer to disk
```

The buffer will also auto-flush when the `FileSink`'s *high water mark* is reached; that is, when its internal buffer is full. This value can be configured.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const file = Bun.file("output.txt");
const writer = file.writer({ highWaterMark: 1024 * 1024 }); // 1MB
```

To flush the buffer and close the file:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
writer.end();
```

Note that, by default, the `bun` process will stay alive until this `FileSink` is explicitly closed with `.end()`. To opt out of this behavior, you can "unref" the instance.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
writer.unref();

// to "re-ref" it later
writer.ref();
```

***

## Directories

Bun's implementation of `node:fs` is fast, and we haven't implemented a Bun-specific API for reading directories just yet. For now, you should use `node:fs` for working with directories in Bun.

### Reading directories (readdir)

To read a directory in Bun, use `readdir` from `node:fs`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { readdir } from "node:fs/promises";

// read all the files in the current directory
const files = await readdir(import.meta.dir);
```

#### Reading directories recursively

To recursively read a directory in Bun, use `readdir` with `recursive: true`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { readdir } from "node:fs/promises";

// read all the files in the current directory, recursively
const files = await readdir("../", { recursive: true });
```

### Creating directories (mkdir)

To recursively create a directory, use `mkdir` in `node:fs`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { mkdir } from "node:fs/promises";

await mkdir("path/to/dir", { recursive: true });
```

***

## Benchmarks

The following is a 3-line implementation of the Linux `cat` command.

```ts cat.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { resolve } from "path";

const path = resolve(process.argv.at(-1));
await Bun.write(Bun.stdout, Bun.file(path));
```

To run the file:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ./cat.ts ./path-to-file
```

It runs 2x faster than GNU `cat` for large files on Linux.

<Frame><img src="https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/cat.jpg?fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=cc26ce0444c5a5953dd346ee52deb3aa" alt="Cat screenshot" data-og-width="1194" width="1194" data-og-height="1143" height="1143" data-path="images/cat.jpg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/cat.jpg?w=280&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=b5eef4c3932d3ce4fe4d9d26d38796b2 280w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/cat.jpg?w=560&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=56e438048342311306dac624b12f1531 560w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/cat.jpg?w=840&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=2ddd508c4e72b7900ea6da3dc6f3b4b6 840w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/cat.jpg?w=1100&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=018d1cb81b368954b4757487ffc8e749 1100w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/cat.jpg?w=1650&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=17fdac76d0d63ad0facc20aa7f50230d 1650w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/cat.jpg?w=2500&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=278f195f295bb5fbcd2ef04689d294c1 2500w" /></Frame>

***

## Reference

```ts Type Reference icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
interface Bun {
	stdin: BunFile;
	stdout: BunFile;
	stderr: BunFile;

	file(path: string | number | URL, options?: { type?: string }): BunFile;

	write(
		destination: BunFile | S3File | PathLike,
		input: string | Blob | ArrayBuffer | SharedArrayBuffer | TypedArray | BlobPart[],
		options?: {
			mode?: number;
			createPath?: boolean;
		},
	): Promise<number>;
}

interface BunFile {
	readonly size: number;
	readonly type: string;

	text(): Promise<string>;
	stream(): ReadableStream;
	arrayBuffer(): Promise<ArrayBuffer>;
	json(): Promise<any>;
	writer(params: { highWaterMark?: number }): FileSink;
	exists(): Promise<boolean>;
}

export interface FileSink {
	write(chunk: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer): number;
	flush(): number | Promise<number>;
	end(error?: Error): number | Promise<number>;
	start(options?: { highWaterMark?: number }): void;
	ref(): void;
	unref(): void;
}
```

# Streams

> Use Bun's streams API to work with binary data without loading it all into memory at once

Streams are an important abstraction for working with binary data without loading it all into memory at once. They are commonly used for reading and writing files, sending and receiving network requests, and processing large amounts of data.

Bun implements the Web APIs [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) and [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream).

<Note>
  Bun also implements the `node:stream` module, including
  [`Readable`](https://nodejs.org/api/stream.html#stream_readable_streams),
  [`Writable`](https://nodejs.org/api/stream.html#stream_writable_streams), and
  [`Duplex`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams). For complete
  documentation, refer to the [Node.js docs](https://nodejs.org/api/stream.html).
</Note>

To create a simple `ReadableStream`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const stream = new ReadableStream({
	start(controller) {
		controller.enqueue("hello");
		controller.enqueue("world");
		controller.close();
	},
});
```

The contents of a `ReadableStream` can be read chunk-by-chunk with `for await` syntax.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
for await (const chunk of stream) {
	console.log(chunk);
}

// hello
// world
```

***

## Direct `ReadableStream`

Bun implements an optimized version of `ReadableStream` that avoid unnecessary data copying & queue management logic.

With a traditional `ReadableStream`, chunks of data are *enqueued*. Each chunk is copied into a queue, where it sits until the stream is ready to send more data.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const stream = new ReadableStream({
	start(controller) {
		controller.enqueue("hello");
		controller.enqueue("world");
		controller.close();
	},
});
```

With a direct `ReadableStream`, chunks of data are written directly to the stream. No queueing happens, and there's no need to clone the chunk data into memory. The `controller` API is updated to reflect this; instead of `.enqueue()` you call `.write`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const stream = new ReadableStream({
	type: "direct", // [!code ++]
	pull(controller) {
		controller.write("hello");
		controller.write("world");
	},
});
```

When using a direct `ReadableStream`, all chunk queueing is handled by the destination. The consumer of the stream receives exactly what is passed to `controller.write()`, without any encoding or modification.

***

## Async generator streams

Bun also supports async generator functions as a source for `Response` and `Request`. This is an easy way to create a `ReadableStream` that fetches data from an asynchronous source.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = new Response(
	(async function* () {
		yield "hello";
		yield "world";
	})(),
);

await response.text(); // "helloworld"
```

You can also use `[Symbol.asyncIterator]` directly.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = new Response({
	[Symbol.asyncIterator]: async function* () {
		yield "hello";
		yield "world";
	},
});

await response.text(); // "helloworld"
```

If you need more granular control over the stream, `yield` will return the direct ReadableStream controller.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = new Response({
	[Symbol.asyncIterator]: async function* () {
		const controller = yield "hello";
		await controller.end();
	},
});

await response.text(); // "hello"
```

***

## `Bun.ArrayBufferSink`

The `Bun.ArrayBufferSink` class is a fast incremental writer for constructing an `ArrayBuffer` of unknown size.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sink = new Bun.ArrayBufferSink();

sink.write("h");
sink.write("e");
sink.write("l");
sink.write("l");
sink.write("o");

sink.end();
// ArrayBuffer(5) [ 104, 101, 108, 108, 111 ]
```

To instead retrieve the data as a `Uint8Array`, pass the `asUint8Array` option to the `start` method.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sink = new Bun.ArrayBufferSink();
sink.start({
	asUint8Array: true, // [!code ++]
});

sink.write("h");
sink.write("e");
sink.write("l");
sink.write("l");
sink.write("o");

sink.end();
// Uint8Array(5) [ 104, 101, 108, 108, 111 ]
```

The `.write()` method supports strings, typed arrays, `ArrayBuffer`, and `SharedArrayBuffer`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
sink.write("h");
sink.write(new Uint8Array([101, 108]));
sink.write(Buffer.from("lo").buffer);

sink.end();
```

Once `.end()` is called, no more data can be written to the `ArrayBufferSink`. However, in the context of buffering a stream, it's useful to continuously write data and periodically `.flush()` the contents (say, into a `WriteableStream`). To support this, pass `stream: true` to the constructor.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sink = new Bun.ArrayBufferSink();
sink.start({
	stream: true, // [!code ++]
});

sink.write("h");
sink.write("e");
sink.write("l");
sink.flush();
// ArrayBuffer(5) [ 104, 101, 108 ]

sink.write("l");
sink.write("o");
sink.flush();
// ArrayBuffer(5) [ 108, 111 ]
```

The `.flush()` method returns the buffered data as an `ArrayBuffer` (or `Uint8Array` if `asUint8Array: true`) and clears internal buffer.

To manually set the size of the internal buffer in bytes, pass a value for `highWaterMark`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sink = new Bun.ArrayBufferSink();
sink.start({
	highWaterMark: 1024 * 1024, // 1 MB  // [!code ++]
});
```

***

## Reference

```ts See Typescript Definitions expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
/**
 * Fast incremental writer that becomes an `ArrayBuffer` on end().
 */
export class ArrayBufferSink {
	constructor();

	start(options?: {
		asUint8Array?: boolean;
		/**
		 * Preallocate an internal buffer of this size
		 * This can significantly improve performance when the chunk size is small
		 */
		highWaterMark?: number;
		/**
		 * On {@link ArrayBufferSink.flush}, return the written data as a `Uint8Array`.
		 * Writes will restart from the beginning of the buffer.
		 */
		stream?: boolean;
	}): void;

	write(chunk: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer): number;
	/**
	 * Flush the internal buffer
	 *
	 * If {@link ArrayBufferSink.start} was passed a `stream` option, this will return a `ArrayBuffer`
	 * If {@link ArrayBufferSink.start} was passed a `stream` option and `asUint8Array`, this will return a `Uint8Array`
	 * Otherwise, this will return the number of bytes written since the last flush
	 *
	 * This API might change later to separate Uint8ArraySink and ArrayBufferSink
	 */
	flush(): number | Uint8Array<ArrayBuffer> | ArrayBuffer;
	end(): ArrayBuffer | Uint8Array<ArrayBuffer>;
}
```
# Binary Data

> Working with binary data in JavaScript

This page is intended as an introduction to working with binary data in JavaScript. Bun implements a number of data types and utilities for working with binary data, most of which are Web-standard. Any Bun-specific APIs will be noted as such.

Below is a quick "cheat sheet" that doubles as a table of contents. Click an item in the left column to jump to that section.

| Class                       | Description                                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`TypedArray`](#typedarray) | A family of classes that provide an `Array`-like interface for interacting with binary data. Includes `Uint8Array`, `Uint16Array`, `Int8Array`, and more.                                               |
| [`Buffer`](#buffer)         | A subclass of `Uint8Array` that implements a wide range of convenience methods. Unlike the other elements in this table, this is a Node.js API (which Bun implements). It can't be used in the browser. |
| [`DataView`](#dataview)     | A class that provides a `get/set` API for writing some number of bytes to an `ArrayBuffer` at a particular byte offset. Often used reading or writing binary protocols.                                 |
| [`Blob`](#blob)             | A readonly blob of binary data usually representing a file. Has a MIME `type`, a `size`, and methods for converting to `ArrayBuffer`, `ReadableStream`, and string.                                     |
| [`File`](#file)             | A subclass of `Blob` that represents a file. Has a `name` and `lastModified` timestamp. There is experimental support in Node.js v20.                                                                   |
| [`BunFile`](#bunfile)       | *Bun only*. A subclass of `Blob` that represents a lazily-loaded file on disk. Created with `Bun.file(path)`.                                                                                           |

***

## `ArrayBuffer` and views

Until 2009, there was no language-native way to store and manipulate binary data in JavaScript. ECMAScript v5 introduced a range of new mechanisms for this. The most fundamental building block is `ArrayBuffer`, a simple data structure that represents a sequence of bytes in memory.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// this buffer can store 8 bytes
const buf = new ArrayBuffer(8);
```

Despite the name, it isn't an array and supports none of the array methods and operators one might expect. In fact, there is no way to directly read or write values from an `ArrayBuffer`. There's very little you can do with one except check its size and create "slices" from it.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = new ArrayBuffer(8);
buf.byteLength; // => 8

const slice = buf.slice(0, 4); // returns new ArrayBuffer
slice.byteLength; // => 4
```

To do anything interesting we need a construct known as a "view". A view is a class that *wraps* an `ArrayBuffer` instance and lets you read and manipulate the underlying data. There are two types of views: *typed arrays* and `DataView`.

### `DataView`

The `DataView` class is a lower-level interface for reading and manipulating the data in an `ArrayBuffer`.

Below we create a new `DataView` and set the first byte to 3.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = new ArrayBuffer(4);
// [0b00000000, 0b00000000, 0b00000000, 0b00000000]

const dv = new DataView(buf);
dv.setUint8(0, 3); // write value 3 at byte offset 0
dv.getUint8(0); // => 3
// [0b00000011, 0b00000000, 0b00000000, 0b00000000]
```

Now let's write a `Uint16` at byte offset `1`. This requires two bytes. We're using the value `513`, which is `2 * 256 + 1`; in bytes, that's `00000010 00000001`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
dv.setUint16(1, 513);
// [0b00000011, 0b00000010, 0b00000001, 0b00000000]

console.log(dv.getUint16(1)); // => 513
```

We've now assigned a value to the first three bytes in our underlying `ArrayBuffer`. Even though the second and third bytes were created using `setUint16()`, we can still read each of its component bytes using `getUint8()`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(dv.getUint8(1)); // => 2
console.log(dv.getUint8(2)); // => 1
```

Attempting to write a value that requires more space than is available in the underlying `ArrayBuffer` will cause an error. Below we attempt to write a `Float64` (which requires 8 bytes) at byte offset `0`, but there are only four total bytes in the buffer.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
dv.setFloat64(0, 3.1415);
// ^ RangeError: Out of bounds access
```

The following methods are available on `DataView`:

| Getters                                                                                                                    | Setters                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`getBigInt64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getBigInt64)   | [`setBigInt64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setBigInt64)   |
| [`getBigUint64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getBigUint64) | [`setBigUint64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setBigUint64) |
| [`getFloat32()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getFloat32)     | [`setFloat32()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat32)     |
| [`getFloat64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getFloat64)     | [`setFloat64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat64)     |
| [`getInt16()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt16)         | [`setInt16()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt16)         |
| [`getInt32()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt32)         | [`setInt32()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt32)         |
| [`getInt8()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt8)           | [`setInt8()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt8)           |
| [`getUint16()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint16)       | [`setUint16()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint16)       |
| [`getUint32()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint32)       | [`setUint32()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint32)       |
| [`getUint8()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint8)         | [`setUint8()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint8)         |

### `TypedArray`

Typed arrays are a family of classes that provide an `Array`-like interface for interacting with data in an `ArrayBuffer`. Whereas a `DataView` lets you write numbers of varying size at a particular offset, a `TypedArray` interprets the underlying bytes as an array of numbers, each of a fixed size.

<Note>
  It's common to refer to this family of classes collectively by their shared superclass
  `TypedArray`. This class as *internal* to JavaScript; you can't directly create instances of it,
  and `TypedArray` is not defined in the global scope. Think of it as an `interface` or an abstract
  class.
</Note>

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buffer = new ArrayBuffer(3);
const arr = new Uint8Array(buffer);

// contents are initialized to zero
console.log(arr); // Uint8Array(3) [0, 0, 0]

// assign values like an array
arr[0] = 0;
arr[1] = 10;
arr[2] = 255;
arr[3] = 255; // no-op, out of bounds
```

While an `ArrayBuffer` is a generic sequence of bytes, these typed array classes interpret the bytes as an array of numbers of a given byte size.
The top row contains the raw bytes, and the later rows contain how these bytes will be interpreted when *viewed* using different typed array classes.

The following classes are typed arrays, along with a description of how they interpret the bytes in an `ArrayBuffer`:

Here's the first table formatted as a markdown table:

| Class                                                                                                                     | Description                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)               | Every one (1) byte is interpreted as an unsigned 8-bit integer. Range 0 to 255.                                                                                            |
| [`Uint16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array)             | Every two (2) bytes are interpreted as an unsigned 16-bit integer. Range 0 to 65535.                                                                                       |
| [`Uint32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array)             | Every four (4) bytes are interpreted as an unsigned 32-bit integer. Range 0 to 4294967295.                                                                                 |
| [`Int8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array)                 | Every one (1) byte is interpreted as a signed 8-bit integer. Range -128 to 127.                                                                                            |
| [`Int16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array)               | Every two (2) bytes are interpreted as a signed 16-bit integer. Range -32768 to 32767.                                                                                     |
| [`Int32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array)               | Every four (4) bytes are interpreted as a signed 32-bit integer. Range -2147483648 to 2147483647.                                                                          |
| [`Float16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array)           | Every two (2) bytes are interpreted as a 16-bit floating point number. Range -6.104e5 to 6.55e4.                                                                           |
| [`Float32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array)           | Every four (4) bytes are interpreted as a 32-bit floating point number. Range -3.4e38 to 3.4e38.                                                                           |
| [`Float64Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array)           | Every eight (8) bytes are interpreted as a 64-bit floating point number. Range -1.7e308 to 1.7e308.                                                                        |
| [`BigInt64Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt64Array)         | Every eight (8) bytes are interpreted as a signed `BigInt`. Range -9223372036854775808 to 9223372036854775807 (though `BigInt` is capable of representing larger numbers). |
| [`BigUint64Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigUint64Array)       | Every eight (8) bytes are interpreted as an unsigned `BigInt`. Range 0 to 18446744073709551615 (though `BigInt` is capable of representing larger numbers).                |
| [`Uint8ClampedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray) | Same as `Uint8Array`, but automatically "clamps" to the range 0-255 when assigning a value to an element.                                                                  |

The table below demonstrates how the bytes in an `ArrayBuffer` are interpreted when viewed using different typed array classes.

|                  | Byte 0              | Byte 1     | Byte 2              | Byte 3     | Byte 4               | Byte 5     | Byte 6               | Byte 7     |
| ---------------- | ------------------- | ---------- | ------------------- | ---------- | -------------------- | ---------- | -------------------- | ---------- |
| `ArrayBuffer`    | `00000000`          | `00000001` | `00000010`          | `00000011` | `00000100`           | `00000101` | `00000110`           | `00000111` |
| `Uint8Array`     | 0                   | 1          | 2                   | 3          | 4                    | 5          | 6                    | 7          |
| `Uint16Array`    | 256 (`1 * 256 + 0`) |            | 770 (`3 * 256 + 2`) |            | 1284 (`5 * 256 + 4`) |            | 1798 (`7 * 256 + 6`) |            |
| `Uint32Array`    | 50462976            |            |                     |            | 117835012            |            |                      |            |
| `BigUint64Array` | 506097522914230528n |            |                     |            |                      |            |                      |            |

To create a typed array from a pre-defined `ArrayBuffer`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// create typed array from ArrayBuffer
const buf = new ArrayBuffer(10);
const arr = new Uint8Array(buf);

arr[0] = 30;
arr[1] = 60;

// all elements are initialized to zero
console.log(arr); // => Uint8Array(10) [ 30, 60, 0, 0, 0, 0, 0, 0, 0, 0 ];
```

If we tried to instantiate a `Uint32Array` from this same `ArrayBuffer`, we'd get an error.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = new ArrayBuffer(10);
const arr = new Uint32Array(buf);
//          ^  RangeError: ArrayBuffer length minus the byteOffset
//             is not a multiple of the element size
```

A `Uint32` value requires four bytes (16 bits). Because the `ArrayBuffer` is 10 bytes long, there's no way to cleanly divide its contents into 4-byte chunks.

To fix this, we can create a typed array over a particular "slice" of an `ArrayBuffer`. The `Uint16Array` below only "views" the *first* 8 bytes of the underlying `ArrayBuffer`. To achieve these, we specify a `byteOffset` of `0` and a `length` of `2`, which indicates the number of `Uint32` numbers we want our array to hold.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// create typed array from ArrayBuffer slice
const buf = new ArrayBuffer(10);
const arr = new Uint32Array(buf, 0, 2);

/*
  buf    _ _ _ _ _ _ _ _ _ _    10 bytes
  arr   [_______,_______]       2 4-byte elements
*/

arr.byteOffset; // 0
arr.length; // 2
```

You don't need to explicitly create an `ArrayBuffer` instance; you can instead directly specify a length in the typed array constructor:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const arr2 = new Uint8Array(5);

// all elements are initialized to zero
// => Uint8Array(5) [0, 0, 0, 0, 0]
```

Typed arrays can also be instantiated directly from an array of numbers, or another typed array:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// from an array of numbers
const arr1 = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
arr1[0]; // => 0;
arr1[7]; // => 7;

// from another typed array
const arr2 = new Uint8Array(arr);
```

Broadly speaking, typed arrays provide the same methods as regular arrays, with a few exceptions. For example, `push` and `pop` are not available on typed arrays, because they would require resizing the underlying `ArrayBuffer`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const arr = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);

// supports common array methods
arr.filter(n => n > 128); // Uint8Array(1) [255]
arr.map(n => n * 2); // Uint8Array(8) [0, 2, 4, 6, 8, 10, 12, 14]
arr.reduce((acc, n) => acc + n, 0); // 28
arr.forEach(n => console.log(n)); // 0 1 2 3 4 5 6 7
arr.every(n => n < 10); // true
arr.find(n => n > 5); // 6
arr.includes(5); // true
arr.indexOf(5); // 5
```

Refer to the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) for more information on the properties and methods of typed arrays.

### `Uint8Array`

It's worth specifically highlighting `Uint8Array`, as it represents a classic "byte array"—a sequence of 8-bit unsigned integers between 0 and 255. This is the most common typed array you'll encounter in JavaScript.

In Bun, and someday in other JavaScript engines, it has methods available for converting between byte arrays and serialized representations of those arrays as base64 or hex strings.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Uint8Array([1, 2, 3, 4, 5]).toBase64(); // "AQIDBA=="
Uint8Array.fromBase64("AQIDBA=="); // Uint8Array(4) [1, 2, 3, 4, 5]

new Uint8Array([255, 254, 253, 252, 251]).toHex(); // "fffefdfcfb=="
Uint8Array.fromHex("fffefdfcfb"); // Uint8Array(5) [255, 254, 253, 252, 251]
```

It is the return value of [`TextEncoder#encode`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder), and the input type of [`TextDecoder#decode`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder), two utility classes designed to translate strings and various binary encodings, most notably `"utf-8"`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const encoder = new TextEncoder();
const bytes = encoder.encode("hello world");
// => Uint8Array(11) [ 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100 ]

const decoder = new TextDecoder();
const text = decoder.decode(bytes);
// => hello world
```

### `Buffer`

Bun implements `Buffer`, a Node.js API for working with binary data that pre-dates the introduction of typed arrays in the JavaScript spec. It has since been re-implemented as a subclass of `Uint8Array`. It provides a wide range of methods, including several Array-like and `DataView`-like methods.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = Buffer.from("hello world");
// => Buffer(11) [ 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100 ]

buf.length; // => 11
buf[0]; // => 104, ascii for 'h'
buf.writeUInt8(72, 0); // => ascii for 'H'

console.log(buf.toString());
// => Hello world
```

For complete documentation, refer to the [Node.js documentation](https://nodejs.org/api/buffer.html).

## `Blob`

`Blob` is a Web API commonly used for representing files. `Blob` was initially implemented in browsers (unlike `ArrayBuffer` which is part of JavaScript itself), but it is now supported in Node and Bun.

It isn't common to directly create `Blob` instances. More often, you'll receive instances of `Blob` from an external source (like an `<input type="file">` element in the browser) or library. That said, it is possible to create a `Blob` from one or more string or binary "blob parts".

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const blob = new Blob(["<html>Hello</html>"], {
	type: "text/html",
});

blob.type; // => text/html
blob.size; // => 19
```

These parts can be `string`, `ArrayBuffer`, `TypedArray`, `DataView`, or other `Blob` instances. The blob parts are concatenated together in the order they are provided.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const blob = new Blob([
	"<html>",
	new Blob(["<body>"]),
	new Uint8Array([104, 101, 108, 108, 111]), // "hello" in binary
	"</body></html>",
]);
```

The contents of a `Blob` can be asynchronously read in various formats.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await blob.text(); // => <html><body>hello</body></html>
await blob.bytes(); // => Uint8Array (copies contents)
await blob.arrayBuffer(); // => ArrayBuffer (copies contents)
await blob.stream(); // => ReadableStream
```

### `BunFile`

`BunFile` is a subclass of `Blob` used to represent a lazily-loaded file on disk. Like `File`, it adds a `name` and `lastModified` property. Unlike `File`, it does not require the file to be loaded into memory.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const file = Bun.file("index.txt");
// => BunFile
```

### `File`

<Warning>Browser only. Experimental support in Node.js 20.</Warning>

[`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) is a subclass of `Blob` that adds a `name` and `lastModified` property. It's commonly used in the browser to represent files uploaded via a `<input type="file">` element. Node.js and Bun implement `File`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// on browser!
// <input type="file" id="file" />

const files = document.getElementById("file").files;
// => File[]
```

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const file = new File(["<html>Hello</html>"], "index.html", {
	type: "text/html",
});
```

Refer to the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Blob) for complete docs information.

***

## Streams

Streams are an important abstraction for working with binary data without loading it all into memory at once. They are commonly used for reading and writing files, sending and receiving network requests, and processing large amounts of data.

Bun implements the Web APIs [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) and [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

<Note>
  Bun also implements the `node:stream` module, including
  [`Readable`](https://nodejs.org/api/stream.html#stream_readable_streams),
  [`Writable`](https://nodejs.org/api/stream.html#stream_writable_streams), and
  [`Duplex`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams). For complete
  documentation, refer to the Node.js docs.
</Note>

To create a simple readable stream:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const stream = new ReadableStream({
	start(controller) {
		controller.enqueue("hello");
		controller.enqueue("world");
		controller.close();
	},
});
```

The contents of this stream can be read chunk-by-chunk with `for await` syntax.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
for await (const chunk of stream) {
	console.log(chunk);
}

// => "hello"
// => "world"
```

For a more complete discussion of streams in Bun, see [API > Streams](/runtime/streams).

***

## Conversion

Converting from one binary format to another is a common task. This section is intended as a reference.

### From `ArrayBuffer`

Since `ArrayBuffer` stores the data that underlies other binary structures like `TypedArray`, the snippets below are not *converting* from `ArrayBuffer` to another format. Instead, they are *creating* a new instance using the data stored underlying data.

#### To `TypedArray`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Uint8Array(buf);
```

#### To `DataView`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new DataView(buf);
```

#### To `Buffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// create Buffer over entire ArrayBuffer
Buffer.from(buf);

// create Buffer over a slice of the ArrayBuffer
Buffer.from(buf, 0, 10);
```

#### To `string`

As UTF-8:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new TextDecoder().decode(buf);
```

#### To `number[]`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Array.from(new Uint8Array(buf));
```

#### To `Blob`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Blob([buf], { type: "text/plain" });
```

#### To `ReadableStream`

The following snippet creates a `ReadableStream` and enqueues the entire `ArrayBuffer` as a single chunk.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new ReadableStream({
	start(controller) {
		controller.enqueue(buf);
		controller.close();
	},
});
```

<Accordion title="With chunking">
  To stream the `ArrayBuffer` in chunks, use a `Uint8Array` view and enqueue each chunk.

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  const view = new Uint8Array(buf);
  const chunkSize = 1024;

  new ReadableStream({
  	start(controller) {
  		for (let i = 0; i < view.length; i += chunkSize) {
  			controller.enqueue(view.slice(i, i + chunkSize));
  		}
  		controller.close();
  	},
  });
  ```
</Accordion>

### From `TypedArray`

#### To `ArrayBuffer`

This retrieves the underlying `ArrayBuffer`. Note that a `TypedArray` can be a view of a *slice* of the underlying buffer, so the sizes may differ.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
arr.buffer;
```

#### To `DataView`

To creates a `DataView` over the same byte range as the TypedArray.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
```

#### To `Buffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Buffer.from(arr);
```

#### To `string`

As UTF-8:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new TextDecoder().decode(arr);
```

#### To `number[]`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Array.from(arr);
```

#### To `Blob`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// only if arr is a view of its entire backing TypedArray
new Blob([arr.buffer], { type: "text/plain" });
```

#### To `ReadableStream`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new ReadableStream({
	start(controller) {
		controller.enqueue(arr);
		controller.close();
	},
});
```

<Accordion title="With chunking">
  To stream the `ArrayBuffer` in chunks, split the `TypedArray` into chunks and enqueue each one individually.

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  new ReadableStream({
  	start(controller) {
  		for (let i = 0; i < arr.length; i += chunkSize) {
  			controller.enqueue(arr.slice(i, i + chunkSize));
  		}
  		controller.close();
  	},
  });
  ```
</Accordion>

### From `DataView`

#### To `ArrayBuffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
view.buffer;
```

#### To `TypedArray`

Only works if the `byteLength` of the `DataView` is a multiple of the `BYTES_PER_ELEMENT` of the `TypedArray` subclass.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
new Uint16Array(view.buffer, view.byteOffset, view.byteLength / 2);
new Uint32Array(view.buffer, view.byteOffset, view.byteLength / 4);
// etc...
```

#### To `Buffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Buffer.from(view.buffer, view.byteOffset, view.byteLength);
```

#### To `string`

As UTF-8:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new TextDecoder().decode(view);
```

#### To `number[]`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Array.from(view);
```

#### To `Blob`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Blob([view.buffer], { type: "text/plain" });
```

#### To `ReadableStream`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new ReadableStream({
	start(controller) {
		controller.enqueue(view.buffer);
		controller.close();
	},
});
```

<Accordion title="With chunking">
  To stream the `ArrayBuffer` in chunks, split the `DataView` into chunks and enqueue each one individually.

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  new ReadableStream({
  	start(controller) {
  		for (let i = 0; i < view.byteLength; i += chunkSize) {
  			controller.enqueue(view.buffer.slice(i, i + chunkSize));
  		}
  		controller.close();
  	},
  });
  ```
</Accordion>

### From `Buffer`

#### To `ArrayBuffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
buf.buffer;
```

#### To `TypedArray`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Uint8Array(buf);
```

#### To `DataView`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
```

#### To `string`

As UTF-8:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
buf.toString();
```

As base64:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
buf.toString("base64");
```

As hex:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
buf.toString("hex");
```

#### To `number[]`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Array.from(buf);
```

#### To `Blob`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Blob([buf], { type: "text/plain" });
```

#### To `ReadableStream`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new ReadableStream({
	start(controller) {
		controller.enqueue(buf);
		controller.close();
	},
});
```

<Accordion title="With chunking">
  To stream the `ArrayBuffer` in chunks, split the `Buffer` into chunks and enqueue each one individually.

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  new ReadableStream({
  	start(controller) {
  		for (let i = 0; i < buf.length; i += chunkSize) {
  			controller.enqueue(buf.slice(i, i + chunkSize));
  		}
  		controller.close();
  	},
  });
  ```
</Accordion>

### From `Blob`

#### To `ArrayBuffer`

The `Blob` class provides a convenience method for this purpose.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await blob.arrayBuffer();
```

#### To `TypedArray`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await blob.bytes();
```

#### To `DataView`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new DataView(await blob.arrayBuffer());
```

#### To `Buffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Buffer.from(await blob.arrayBuffer());
```

#### To `string`

As UTF-8:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await blob.text();
```

#### To `number[]`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Array.from(await blob.bytes());
```

#### To `ReadableStream`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
blob.stream();
```

### From `ReadableStream`

It's common to use [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) as a convenient intermediate representation to make it easier to convert `ReadableStream` to other formats.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
stream; // ReadableStream

const buffer = new Response(stream).arrayBuffer();
```

However this approach is verbose and adds overhead that slows down overall performance unnecessarily. Bun implements a set of optimized convenience functions for converting `ReadableStream` various binary formats.

#### To `ArrayBuffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Response
new Response(stream).arrayBuffer();

// with Bun function
Bun.readableStreamToArrayBuffer(stream);
```

#### To `Uint8Array`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Response
new Response(stream).bytes();

// with Bun function
Bun.readableStreamToBytes(stream);
```

#### To `TypedArray`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Response
const buf = await new Response(stream).arrayBuffer();
new Int8Array(buf);

// with Bun function
new Int8Array(Bun.readableStreamToArrayBuffer(stream));
```

#### To `DataView`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Response
const buf = await new Response(stream).arrayBuffer();
new DataView(buf);

// with Bun function
new DataView(Bun.readableStreamToArrayBuffer(stream));
```

#### To `Buffer`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Response
const buf = await new Response(stream).arrayBuffer();
Buffer.from(buf);

// with Bun function
Buffer.from(Bun.readableStreamToArrayBuffer(stream));
```

#### To `string`

As UTF-8:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Response
await new Response(stream).text();

// with Bun function
await Bun.readableStreamToText(stream);
```

#### To `number[]`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Response
const arr = await new Response(stream).bytes();
Array.from(arr);

// with Bun function
Array.from(new Uint8Array(Bun.readableStreamToArrayBuffer(stream)));
```

Bun provides a utility for resolving a `ReadableStream` to an array of its chunks. Each chunk may be a string, typed array, or `ArrayBuffer`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// with Bun function
Bun.readableStreamToArray(stream);
```

#### To `Blob`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
new Response(stream).blob();
```

#### To `ReadableStream`

To split a `ReadableStream` into two streams that can be consumed independently:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const [a, b] = stream.tee();
```

# SQL

> Bun provides native bindings for working with SQL databases through a unified Promise-based API that supports PostgreSQL, MySQL, and SQLite.

The interface is designed to be simple and performant, using tagged template literals for queries and offering features like connection pooling, transactions, and prepared statements.

```ts title="db.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { sql, SQL } from "bun";

// PostgreSQL (default)
const users = await sql`
  SELECT * FROM users
  WHERE active = ${true}
  LIMIT ${10}
`;

// With MySQL
const mysql = new SQL("mysql://user:pass@localhost:3306/mydb");
const mysqlResults = await mysql`
  SELECT * FROM users 
  WHERE active = ${true}
`;

// With SQLite
const sqlite = new SQL("sqlite://myapp.db");
const sqliteResults = await sqlite`
  SELECT * FROM users 
  WHERE active = ${1}
`;
```

### Features

* Tagged template literals to protect against SQL injection
* Transactions
* Named & positional parameters
* Connection pooling
* `BigInt` support
* SASL Auth support (SCRAM-SHA-256), MD5, and Clear Text
* Connection timeouts
* Returning rows as data objects, arrays of arrays, or Buffer
* Binary protocol support makes it faster
* TLS support (and auth mode)
* Automatic configuration with environment variable

***

## Database Support

`Bun.SQL` provides a unified API for multiple database systems:

### PostgreSQL

PostgreSQL is used when:

* The connection string doesn't match SQLite or MySQL patterns (it's the fallback adapter)
* The connection string explicitly uses `postgres://` or `postgresql://` protocols
* No connection string is provided and environment variables point to PostgreSQL

```ts title="db.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { sql } from "bun";
// Uses PostgreSQL if DATABASE_URL is not set or is a PostgreSQL URL
await sql`SELECT ...`;

import { SQL } from "bun";
const pg = new SQL("postgres://user:pass@localhost:5432/mydb");
await pg`SELECT ...`;
```

### MySQL

MySQL support is built into Bun.SQL, providing the same tagged template literal interface with full compatibility for MySQL 5.7+ and MySQL 8.0+:

```ts title="db.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { SQL } from "bun";

// MySQL connection
const mysql = new SQL("mysql://user:password@localhost:3306/database");
const mysql2 = new SQL("mysql2://user:password@localhost:3306/database"); // mysql2 protocol also works

// Using options object
const mysql3 = new SQL({
	adapter: "mysql",
	hostname: "localhost",
	port: 3306,
	database: "myapp",
	username: "dbuser",
	password: "secretpass",
});

// Works with parameters - automatically uses prepared statements
const users = await mysql`SELECT * FROM users WHERE id = ${userId}`;

// Transactions work the same as PostgreSQL
await mysql.begin(async tx => {
	await tx`INSERT INTO users (name) VALUES (${"Alice"})`;
	await tx`UPDATE accounts SET balance = balance - 100 WHERE user_id = ${userId}`;
});

// Bulk inserts
const newUsers = [
	{ name: "Alice", email: "alice@example.com" },
	{ name: "Bob", email: "bob@example.com" },
];
await mysql`INSERT INTO users ${mysql(newUsers)}`;
```

<Accordion title="MySQL Connection String Formats">
  MySQL accepts various URL formats for connection strings:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  // Standard mysql:// protocol
  new SQL("mysql://user:pass@localhost:3306/database");
  new SQL("mysql://user:pass@localhost/database"); // Default port 3306

  // mysql2:// protocol (compatibility with mysql2 npm package)
  new SQL("mysql2://user:pass@localhost:3306/database");

  // With query parameters
  new SQL("mysql://user:pass@localhost/db?ssl=true");

  // Unix socket connection
  new SQL("mysql://user:pass@/database?socket=/var/run/mysqld/mysqld.sock");
  ```
</Accordion>

<Accordion title="MySQL-Specific Features">
  MySQL databases support:

  * **Prepared statements**: Automatically created for parameterized queries with statement caching
  * **Binary protocol**: For better performance with prepared statements and accurate type handling
  * **Multiple result sets**: Support for stored procedures returning multiple result sets
  * **Authentication plugins**: Support for mysql\_native\_password, caching\_sha2\_password (MySQL 8.0 default), and sha256\_password
  * **SSL/TLS connections**: Configurable SSL modes similar to PostgreSQL
  * **Connection attributes**: Client information sent to server for monitoring
  * **Query pipelining**: Execute multiple prepared statements without waiting for responses
</Accordion>

### SQLite

SQLite support is built into Bun.SQL, providing the same tagged template literal interface:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { SQL } from "bun";

// In-memory database
const memory = new SQL(":memory:");
const memory2 = new SQL("sqlite://:memory:");

// File-based database
const db = new SQL("sqlite://myapp.db");

// Using options object
const db2 = new SQL({
	adapter: "sqlite",
	filename: "./data/app.db",
});

// For simple filenames, specify adapter explicitly
const db3 = new SQL("myapp.db", { adapter: "sqlite" });
```

<Accordion title="SQLite Connection String Formats">
  SQLite accepts various URL formats for connection strings:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  // Standard sqlite:// protocol
  new SQL("sqlite://path/to/database.db");
  new SQL("sqlite:path/to/database.db"); // Without slashes

  // file:// protocol (also recognized as SQLite)
  new SQL("file://path/to/database.db");
  new SQL("file:path/to/database.db");

  // Special :memory: database
  new SQL(":memory:");
  new SQL("sqlite://:memory:");
  new SQL("file://:memory:");

  // Relative and absolute paths
  new SQL("sqlite://./local.db"); // Relative to current directory
  new SQL("sqlite://../parent/db.db"); // Parent directory
  new SQL("sqlite:///absolute/path.db"); // Absolute path

  // With query parameters
  new SQL("sqlite://data.db?mode=ro"); // Read-only mode
  new SQL("sqlite://data.db?mode=rw"); // Read-write mode (no create)
  new SQL("sqlite://data.db?mode=rwc"); // Read-write-create mode (default)
  ```

  <Note>
    Simple filenames without a protocol (like `"myapp.db"`) require explicitly specifying `{ adapter: "sqlite" }` to avoid ambiguity with PostgreSQL.
  </Note>
</Accordion>

<Accordion title="SQLite-Specific Options">
  SQLite databases support additional configuration options:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  const db = new SQL({
  	adapter: "sqlite",
  	filename: "app.db",

  	// SQLite-specific options
  	readonly: false, // Open in read-only mode
  	create: true, // Create database if it doesn't exist
  	readwrite: true, // Open for reading and writing

  	// Additional Bun:sqlite options
  	strict: true, // Enable strict mode
  	safeIntegers: false, // Use JavaScript numbers for integers
  });
  ```

  Query parameters in the URL are parsed to set these options:

  * `?mode=ro` → `readonly: true`
  * `?mode=rw` → `readonly: false, create: false`
  * `?mode=rwc` → `readonly: false, create: true` (default)
</Accordion>

## Inserting data

You can pass JavaScript values directly to the SQL template literal and escaping will be handled for you.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { sql } from "bun";

// Basic insert with direct values
const [user] = await sql`
  INSERT INTO users (name, email) 
  VALUES (${name}, ${email})
  RETURNING *
`;

// Using object helper for cleaner syntax
const userData = {
	name: "Alice",
	email: "alice@example.com",
};

const [newUser] = await sql`
  INSERT INTO users ${sql(userData)}
  RETURNING *
`;
// Expands to: INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')
```

### Bulk Insert

You can also pass arrays of objects to the SQL template literal and it will be expanded to a `INSERT INTO ... VALUES ...` statement.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const users = [
	{ name: "Alice", email: "alice@example.com" },
	{ name: "Bob", email: "bob@example.com" },
	{ name: "Charlie", email: "charlie@example.com" },
];

await sql`INSERT INTO users ${sql(users)}`;
```

### Picking columns to insert

You can use `sql(object, ...string)` to pick which columns to insert. Each of the columns must be defined on the object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const user = {
	name: "Alice",
	email: "alice@example.com",
	age: 25,
};

await sql`INSERT INTO users ${sql(user, "name", "email")}`;
// Only inserts name and email columns, ignoring other fields
```

***

## Query Results

By default, Bun's SQL client returns query results as arrays of objects, where each object represents a row with column names as keys. However, there are cases where you might want the data in a different format. The client provides two additional methods for this purpose.

### `sql``.values()` format

The `sql``.values()` method returns rows as arrays of values rather than objects. Each row becomes an array where the values are in the same order as the columns in your query.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const rows = await sql`SELECT * FROM users`.values();
console.log(rows);
```

This returns something like:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
[
	["Alice", "alice@example.com"],
	["Bob", "bob@example.com"],
];
```

`sql``.values()` is especially useful if duplicate column names are returned in the query results. When using objects (the default), the last column name is used as the key in the object, which means duplicate column names overwrite each other — but when using `sql``.values()`, each column is present in the array so you can access the values of duplicate columns by index.

### `sql``.raw()` format

The `.raw()` method returns rows as arrays of `Buffer` objects. This can be useful for working with binary data or for performance reasons.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const rows = await sql`SELECT * FROM users`.raw();
console.log(rows); // [[Buffer, Buffer], [Buffer, Buffer], [Buffer, Buffer]]
```

***

## SQL Fragments

A common need in database applications is the ability to construct queries dynamically based on runtime conditions. Bun provides safe ways to do this without risking SQL injection.

### Dynamic Table Names

When you need to reference tables or schemas dynamically, use the `sql()` helper to ensure proper escaping:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Safely reference tables dynamically
await sql`SELECT * FROM ${sql("users")}`;

// With schema qualification
await sql`SELECT * FROM ${sql("public.users")}`;
```

### Conditional Queries

You can use the `sql()` helper to build queries with conditional clauses. This allows you to create flexible queries that adapt to your application's needs:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Optional WHERE clauses
const filterAge = true;
const minAge = 21;
const ageFilter = sql`AND age > ${minAge}`;
await sql`
  SELECT * FROM users
  WHERE active = ${true}
  ${filterAge ? ageFilter : sql``}
`;
```

### Dynamic columns in updates

You can use `sql(object, ...string)` to pick which columns to update. Each of the columns must be defined on the object. If the columns are not informed all keys will be used to update the row.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await sql`UPDATE users SET ${sql(user, "name", "email")} WHERE id = ${user.id}`;
// uses all keys from the object to update the row
await sql`UPDATE users SET ${sql(user)} WHERE id = ${user.id}`;
```

### Dynamic values and `where in`

Value lists can also be created dynamically, making where in queries simple too. Optionally you can pass a array of objects and inform what key to use to create the list.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await sql`SELECT * FROM users WHERE id IN ${sql([1, 2, 3])}`;

const users = [
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
	{ id: 3, name: "Charlie" },
];
await sql`SELECT * FROM users WHERE id IN ${sql(users, "id")}`;
```

### `sql.array` helper

The `sql.array` helper creates PostgreSQL array literals from JavaScript arrays:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Create array literals for PostgreSQL
await sql`INSERT INTO tags (items) VALUES (${sql.array(["red", "blue", "green"])})`;
// Generates: INSERT INTO tags (items) VALUES (ARRAY['red', 'blue', 'green'])

// Works with numeric arrays too
await sql`SELECT * FROM products WHERE ids = ANY(${sql.array([1, 2, 3])})`;
// Generates: SELECT * FROM products WHERE ids = ANY(ARRAY[1, 2, 3])
```

<Note>
  `sql.array` is PostgreSQL-only. Multi-dimensional arrays and NULL elements may not be supported
  yet.
</Note>

***

## `sql``.simple()`

The PostgreSQL wire protocol supports two types of queries: "simple" and "extended". Simple queries can contain multiple statements but don't support parameters, while extended queries (the default) support parameters but only allow one statement.

To run multiple statements in a single query, use `sql``.simple()`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Multiple statements in one query
await sql`
  SELECT 1;
  SELECT 2;
`.simple();
```

Simple queries are often useful for database migrations and setup scripts.

Note that simple queries cannot use parameters (`${value}`). If you need parameters, you must split your query into separate statements.

### Queries in files

You can use the `sql.file` method to read a query from a file and execute it, if the file includes $1, $2, etc you can pass parameters to the query. If no parameters are used it can execute multiple commands per file.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const result = await sql.file("query.sql", [1, 2, 3]);
```

### Unsafe Queries

You can use the `sql.unsafe` function to execute raw SQL strings. Use this with caution, as it will not escape user input. Executing more than one command per query is allowed if no parameters are used.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Multiple commands without parameters
const result = await sql.unsafe(`
  SELECT ${userColumns} FROM users;
  SELECT ${accountColumns} FROM accounts;
`);

// Using parameters (only one command is allowed)
const result = await sql.unsafe("SELECT " + dangerous + " FROM users WHERE id = $1", [id]);
```

### Execute and Cancelling Queries

Bun's SQL is lazy, which means it will only start executing when awaited or executed with `.execute()`.
You can cancel a query that is currently executing by calling the `cancel()` method on the query object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = await sql`SELECT * FROM users`.execute();
setTimeout(() => query.cancel(), 100);
await query;
```

***

## Database Environment Variables

`sql` connection parameters can be configured using environment variables. The client checks these variables in a specific order of precedence and automatically detects the database type based on the connection string format.

### Automatic Database Detection

When using `Bun.sql()` without arguments or `new SQL()` with a connection string, the adapter is automatically detected based on the URL format:

#### MySQL Auto-Detection

MySQL is automatically selected when the connection string matches these patterns:

* `mysql://...` - MySQL protocol URLs
* `mysql2://...` - MySQL2 protocol URLs (compatibility alias)

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// These all use MySQL automatically (no adapter needed)
const sql1 = new SQL("mysql://user:pass@localhost/mydb");
const sql2 = new SQL("mysql2://user:pass@localhost:3306/mydb");

// Works with DATABASE_URL environment variable
DATABASE_URL="mysql://user:pass@localhost/mydb" bun run app.js
DATABASE_URL="mysql2://user:pass@localhost:3306/mydb" bun run app.js
```

#### SQLite Auto-Detection

SQLite is automatically selected when the connection string matches these patterns:

* `:memory:` - In-memory database
* `sqlite://...` - SQLite protocol URLs
* `sqlite:...` - SQLite protocol without slashes
* `file://...` - File protocol URLs
* `file:...` - File protocol without slashes

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// These all use SQLite automatically (no adapter needed)
const sql1 = new SQL(":memory:");
const sql2 = new SQL("sqlite://app.db");
const sql3 = new SQL("file://./database.db");

// Works with DATABASE_URL environment variable
DATABASE_URL=":memory:" bun run app.js
DATABASE_URL="sqlite://myapp.db" bun run app.js
DATABASE_URL="file://./data/app.db" bun run app.js
```

#### PostgreSQL Auto-Detection

PostgreSQL is the default for connection strings that don't match MySQL or SQLite patterns:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# PostgreSQL is detected for these patterns
DATABASE_URL="postgres://user:pass@localhost:5432/mydb" bun run app.js
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb" bun run app.js

# Or any URL that doesn't match MySQL or SQLite patterns
DATABASE_URL="localhost:5432/mydb" bun run app.js
```

### MySQL Environment Variables

MySQL connections can be configured via environment variables:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# Primary connection URL (checked first)
MYSQL_URL="mysql://user:pass@localhost:3306/mydb"

# Alternative: DATABASE_URL with MySQL protocol
DATABASE_URL="mysql://user:pass@localhost:3306/mydb"
DATABASE_URL="mysql2://user:pass@localhost:3306/mydb"
```

If no connection URL is provided, MySQL checks these individual parameters:

| Environment Variable     | Default Value | Description                      |
| ------------------------ | ------------- | -------------------------------- |
| `MYSQL_HOST`             | `localhost`   | Database host                    |
| `MYSQL_PORT`             | `3306`        | Database port                    |
| `MYSQL_USER`             | `root`        | Database user                    |
| `MYSQL_PASSWORD`         | (empty)       | Database password                |
| `MYSQL_DATABASE`         | `mysql`       | Database name                    |
| `MYSQL_URL`              | (empty)       | Primary connection URL for MySQL |
| `TLS_MYSQL_DATABASE_URL` | (empty)       | SSL/TLS-enabled connection URL   |

### PostgreSQL Environment Variables

The following environment variables can be used to define the PostgreSQL connection:

| Environment Variable        | Description                                |
| --------------------------- | ------------------------------------------ |
| `POSTGRES_URL`              | Primary connection URL for PostgreSQL      |
| `DATABASE_URL`              | Alternative connection URL (auto-detected) |
| `PGURL`                     | Alternative connection URL                 |
| `PG_URL`                    | Alternative connection URL                 |
| `TLS_POSTGRES_DATABASE_URL` | SSL/TLS-enabled connection URL             |
| `TLS_DATABASE_URL`          | Alternative SSL/TLS-enabled connection URL |

If no connection URL is provided, the system checks for the following individual parameters:

| Environment Variable | Fallback Variables           | Default Value | Description       |
| -------------------- | ---------------------------- | ------------- | ----------------- |
| `PGHOST`             | -                            | `localhost`   | Database host     |
| `PGPORT`             | -                            | `5432`        | Database port     |
| `PGUSERNAME`         | `PGUSER`, `USER`, `USERNAME` | `postgres`    | Database user     |
| `PGPASSWORD`         | -                            | (empty)       | Database password |
| `PGDATABASE`         | -                            | username      | Database name     |

### SQLite Environment Variables

SQLite connections can be configured via `DATABASE_URL` when it contains a SQLite-compatible URL:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# These are all recognized as SQLite
DATABASE_URL=":memory:"
DATABASE_URL="sqlite://./app.db"
DATABASE_URL="file:///absolute/path/to/db.sqlite"
```

**Note:** PostgreSQL-specific environment variables (`POSTGRES_URL`, `PGHOST`, etc.) are ignored when using SQLite.

***

## Runtime Preconnection

Bun can preconnect to PostgreSQL at startup to improve performance by establishing database connections before your application code runs. This is useful for reducing connection latency on the first database query.

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# Enable PostgreSQL preconnection
bun --sql-preconnect index.js

# Works with DATABASE_URL environment variable
DATABASE_URL=postgres://user:pass@localhost:5432/db bun --sql-preconnect index.js

# Can be combined with other runtime flags
bun --sql-preconnect --hot index.js
```

The `--sql-preconnect` flag will automatically establish a PostgreSQL connection using your configured environment variables at startup. If the connection fails, it won't crash your application - the error will be handled gracefully.

***

## Connection Options

You can configure your database connection manually by passing options to the SQL constructor. Options vary depending on the database adapter:

### MySQL Options

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { SQL } from "bun";

const db = new SQL({
	// Required for MySQL when using options object
	adapter: "mysql",

	// Connection details
	hostname: "localhost",
	port: 3306,
	database: "myapp",
	username: "dbuser",
	password: "secretpass",

	// Unix socket connection (alternative to hostname/port)
	// socket: "/var/run/mysqld/mysqld.sock",

	// Connection pool settings
	max: 20, // Maximum connections in pool (default: 10)
	idleTimeout: 30, // Close idle connections after 30s
	maxLifetime: 0, // Connection lifetime in seconds (0 = forever)
	connectionTimeout: 30, // Timeout when establishing new connections

	// SSL/TLS options
	ssl: "prefer", // or "disable", "require", "verify-ca", "verify-full"
	// tls: {
	//   rejectUnauthorized: true,
	//   ca: "path/to/ca.pem",
	//   key: "path/to/key.pem",
	//   cert: "path/to/cert.pem",
	// },

	// Callbacks
	onconnect: client => {
		console.log("Connected to MySQL");
	},
	onclose: (client, err) => {
		if (err) {
			console.error("MySQL connection error:", err);
		} else {
			console.log("MySQL connection closed");
		}
	},
});
```

### PostgreSQL Options

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { SQL } from "bun";

const db = new SQL({
	// Connection details (adapter is auto-detected as PostgreSQL)
	url: "postgres://user:pass@localhost:5432/dbname",

	// Alternative connection parameters
	hostname: "localhost",
	port: 5432,
	database: "myapp",
	username: "dbuser",
	password: "secretpass",

	// Connection pool settings
	max: 20, // Maximum connections in pool
	idleTimeout: 30, // Close idle connections after 30s
	maxLifetime: 0, // Connection lifetime in seconds (0 = forever)
	connectionTimeout: 30, // Timeout when establishing new connections

	// SSL/TLS options
	tls: true,
	// tls: {
	//   rejectUnauthorized: true,
	//   requestCert: true,
	//   ca: "path/to/ca.pem",
	//   key: "path/to/key.pem",
	//   cert: "path/to/cert.pem",
	//   checkServerIdentity(hostname, cert) {
	//     ...
	//   },
	// },

	// Callbacks
	onconnect: client => {
		console.log("Connected to PostgreSQL");
	},
	onclose: client => {
		console.log("PostgreSQL connection closed");
	},
});
```

### SQLite Options

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { SQL } from "bun";

const db = new SQL({
	// Required for SQLite
	adapter: "sqlite",
	filename: "./data/app.db", // or ":memory:" for in-memory database

	// SQLite-specific access modes
	readonly: false, // Open in read-only mode
	create: true, // Create database if it doesn't exist
	readwrite: true, // Allow read and write operations

	// SQLite data handling
	strict: true, // Enable strict mode for better type safety
	safeIntegers: false, // Use BigInt for integers exceeding JS number range

	// Callbacks
	onconnect: client => {
		console.log("SQLite database opened");
	},
	onclose: client => {
		console.log("SQLite database closed");
	},
});
```

<Accordion title="SQLite Connection Notes">
  * **Connection Pooling**: SQLite doesn't use connection pooling as it's a file-based database. Each `SQL` instance represents a single connection.
  * **Transactions**: SQLite supports nested transactions through savepoints, similar to PostgreSQL.
  * **Concurrent Access**: SQLite handles concurrent access through file locking. Use WAL mode for better concurrency.
  * **Memory Databases**: Using `:memory:` creates a temporary database that exists only for the connection lifetime.
</Accordion>

***

## Dynamic passwords

When clients need to use alternative authentication schemes such as access tokens or connections to databases with rotating passwords, provide either a synchronous or asynchronous function that will resolve the dynamic password value at connection time.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { SQL } from "bun";

const sql = new SQL(url, {
  // Other connection config
  ...
  // Password function for the database user
  password: async () => await signer.getAuthToken(),
});
```

***

## SQLite-Specific Features

### Query Execution

SQLite executes queries synchronously, unlike PostgreSQL which uses asynchronous I/O. However, the API remains consistent using Promises:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sqlite = new SQL("sqlite://app.db");

// Works the same as PostgreSQL, but executes synchronously under the hood
const users = await sqlite`SELECT * FROM users`;

// Parameters work identically
const user = await sqlite`SELECT * FROM users WHERE id = ${userId}`;
```

### SQLite Pragmas

You can use PRAGMA statements to configure SQLite behavior:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sqlite = new SQL("sqlite://app.db");

// Enable foreign keys
await sqlite`PRAGMA foreign_keys = ON`;

// Set journal mode to WAL for better concurrency
await sqlite`PRAGMA journal_mode = WAL`;

// Check integrity
const integrity = await sqlite`PRAGMA integrity_check`;
```

### Data Type Differences

SQLite has a more flexible type system than PostgreSQL:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// SQLite stores data in 5 storage classes: NULL, INTEGER, REAL, TEXT, BLOB
const sqlite = new SQL("sqlite://app.db");

// SQLite is more lenient with types
await sqlite`
  CREATE TABLE flexible (
    id INTEGER PRIMARY KEY,
    data TEXT,        -- Can store numbers as strings
    value NUMERIC,    -- Can store integers, reals, or text
    blob BLOB         -- Binary data
  )
`;

// JavaScript values are automatically converted
await sqlite`INSERT INTO flexible VALUES (${1}, ${"text"}, ${123.45}, ${Buffer.from("binary")})`;
```

***

## Transactions

To start a new transaction, use `sql.begin`. This method works for both PostgreSQL and SQLite. For PostgreSQL, it reserves a dedicated connection from the pool. For SQLite, it begins a transaction on the single connection.

The `BEGIN` command is sent automatically, including any optional configurations you specify. If an error occurs during the transaction, a `ROLLBACK` is triggered to ensure the process continues smoothly.

### Basic Transactions

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await sql.begin(async tx => {
	// All queries in this function run in a transaction
	await tx`INSERT INTO users (name) VALUES (${"Alice"})`;
	await tx`UPDATE accounts SET balance = balance - 100 WHERE user_id = 1`;

	// Transaction automatically commits if no errors are thrown
	// Rolls back if any error occurs
});
```

It's also possible to pipeline the requests in a transaction if needed by returning an array with queries from the callback function like this:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await sql.begin(async tx => {
	return [
		tx`INSERT INTO users (name) VALUES (${"Alice"})`,
		tx`UPDATE accounts SET balance = balance - 100 WHERE user_id = 1`,
	];
});
```

### Savepoints

Savepoints in SQL create intermediate checkpoints within a transaction, enabling partial rollbacks without affecting the entire operation. They are useful in complex transactions, allowing error recovery and maintaining consistent results.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await sql.begin(async tx => {
	await tx`INSERT INTO users (name) VALUES (${"Alice"})`;

	await tx.savepoint(async sp => {
		// This part can be rolled back separately
		await sp`UPDATE users SET status = 'active'`;
		if (someCondition) {
			throw new Error("Rollback to savepoint");
		}
	});

	// Continue with transaction even if savepoint rolled back
	await tx`INSERT INTO audit_log (action) VALUES ('user_created')`;
});
```

### Distributed Transactions

Two-Phase Commit (2PC) is a distributed transaction protocol where Phase 1 has the coordinator preparing nodes by ensuring data is written and ready to commit, while Phase 2 finalizes with nodes either committing or rolling back based on the coordinator's decision. This process ensures data durability and proper lock management.

In PostgreSQL and MySQL, distributed transactions persist beyond their original session, allowing privileged users or coordinators to commit or rollback them later. This supports robust distributed transactions, recovery processes, and administrative operations.

Each database system implements distributed transactions differently:

PostgreSQL natively supports them through prepared transactions, while MySQL uses XA Transactions.

If any exceptions occur during the distributed transaction and aren't caught, the system will automatically rollback all changes. When everything proceeds normally, you maintain the flexibility to either commit or rollback the transaction later.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Begin a distributed transaction
await sql.beginDistributed("tx1", async tx => {
	await tx`INSERT INTO users (name) VALUES (${"Alice"})`;
});

// Later, commit or rollback
await sql.commitDistributed("tx1");
// or
await sql.rollbackDistributed("tx1");
```

***

## Authentication

Bun supports SCRAM-SHA-256 (SASL), MD5, and Clear Text authentication. SASL is recommended for better security. Check [Postgres SASL Authentication](https://www.postgresql.org/docs/current/sasl-authentication.html) for more information.

### SSL Modes Overview

PostgreSQL supports different SSL/TLS modes to control how secure connections are established. These modes determine the behavior when connecting and the level of certificate verification performed.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sql = new SQL({
	hostname: "localhost",
	username: "user",
	password: "password",
	ssl: "disable", // | "prefer" | "require" | "verify-ca" | "verify-full"
});
```

| SSL Mode      | Description                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `disable`     | No SSL/TLS used. Connections fail if server requires SSL.                                                            |
| `prefer`      | Tries SSL first, falls back to non-SSL if SSL fails. Default mode if none specified.                                 |
| `require`     | Requires SSL without certificate verification. Fails if SSL cannot be established.                                   |
| `verify-ca`   | Verifies server certificate is signed by trusted CA. Fails if verification fails.                                    |
| `verify-full` | Most secure mode. Verifies certificate and hostname match. Protects against untrusted certificates and MITM attacks. |

### Using With Connection Strings

The SSL mode can also be specified in connection strings:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Using prefer mode
const sql = new SQL("postgres://user:password@localhost/mydb?sslmode=prefer");

// Using verify-full mode
const sql = new SQL("postgres://user:password@localhost/mydb?sslmode=verify-full");
```

***

## Connection Pooling

Bun's SQL client automatically manages a connection pool, which is a pool of database connections that are reused for multiple queries. This helps to reduce the overhead of establishing and closing connections for each query, and it also helps to manage the number of concurrent connections to the database.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const db = new SQL({
	// Pool configuration
	max: 20, // Maximum 20 concurrent connections
	idleTimeout: 30, // Close idle connections after 30s
	maxLifetime: 3600, // Max connection lifetime 1 hour
	connectionTimeout: 10, // Connection timeout 10s
});
```

No connection will be made until a query is made.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sql = Bun.sql(); // no connection are created

await sql`...`; // pool is started until max is reached (if possible), first available connection is used
await sql`...`; // previous connection is reused

// two connections are used now at the same time
await Promise.all([
	sql`INSERT INTO users ${sql({ name: "Alice" })}`,
	sql`UPDATE users SET name = ${user.name} WHERE id = ${user.id}`,
]);

await sql.close(); // await all queries to finish and close all connections from the pool
await sql.close({ timeout: 5 }); // wait 5 seconds and close all connections from the pool
await sql.close({ timeout: 0 }); // close all connections from the pool immediately
```

***

## Reserved Connections

Bun enables you to reserve a connection from the pool, and returns a client that wraps the single connection. This can be used for running queries on an isolated connection.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Get exclusive connection from pool
const reserved = await sql.reserve();

try {
	await reserved`INSERT INTO users (name) VALUES (${"Alice"})`;
} finally {
	// Important: Release connection back to pool
	reserved.release();
}

// Or using Symbol.dispose
{
	using reserved = await sql.reserve();
	await reserved`SELECT 1`;
} // Automatically released
```

***

## Prepared Statements

By default, Bun's SQL client automatically creates named prepared statements for queries where it can be inferred that the query is static. This provides better performance. However, you can change this behavior by setting `prepare: false` in the connection options:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sql = new SQL({
	// ... other options ...
	prepare: false, // Disable persisting named prepared statements on the server
});
```

When `prepare: false` is set:

Queries are still executed using the "extended" protocol, but they are executed using [unnamed prepared statements](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY), an unnamed prepared statement lasts only until the next Parse statement specifying the unnamed statement as destination is issued.

* Parameter binding is still safe against SQL injection
* Each query is parsed and planned from scratch by the server
* Queries will not be [pipelined](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-PIPELINING)

You might want to use `prepare: false` when:

* Using PGBouncer in transaction mode (though since PGBouncer 1.21.0, protocol-level named prepared statements are supported when configured properly)
* Debugging query execution plans
* Working with dynamic SQL where query plans need to be regenerated frequently
* More than one command per query will not be supported (unless you use `sql``.simple()`)

Note that disabling prepared statements may impact performance for queries that are executed frequently with different parameters, as the server needs to parse and plan each query from scratch.

***

## Error Handling

The client provides typed errors for different failure scenarios. Errors are database-specific and extend from base error classes:

### Error Classes

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { SQL } from "bun";

try {
	await sql`SELECT * FROM users`;
} catch (error) {
	if (error instanceof SQL.PostgresError) {
		// PostgreSQL-specific error
		console.log(error.code); // PostgreSQL error code
		console.log(error.detail); // Detailed error message
		console.log(error.hint); // Helpful hint from PostgreSQL
	} else if (error instanceof SQL.SQLiteError) {
		// SQLite-specific error
		console.log(error.code); // SQLite error code (e.g., "SQLITE_CONSTRAINT")
		console.log(error.errno); // SQLite error number
		console.log(error.byteOffset); // Byte offset in SQL statement (if available)
	} else if (error instanceof SQL.SQLError) {
		// Generic SQL error (base class)
		console.log(error.message);
	}
}
```

<Accordion title="PostgreSQL-Specific Error Codes">
  ### PostgreSQL Connection Errors

  | Connection Errors                 | Description                                          |
  | --------------------------------- | ---------------------------------------------------- |
  | `ERR_POSTGRES_CONNECTION_CLOSED`  | Connection was terminated or never established       |
  | `ERR_POSTGRES_CONNECTION_TIMEOUT` | Failed to establish connection within timeout period |
  | `ERR_POSTGRES_IDLE_TIMEOUT`       | Connection closed due to inactivity                  |
  | `ERR_POSTGRES_LIFETIME_TIMEOUT`   | Connection exceeded maximum lifetime                 |
  | `ERR_POSTGRES_TLS_NOT_AVAILABLE`  | SSL/TLS connection not available                     |
  | `ERR_POSTGRES_TLS_UPGRADE_FAILED` | Failed to upgrade connection to SSL/TLS              |

  ### Authentication Errors

  | Authentication Errors                            | Description                              |
  | ------------------------------------------------ | ---------------------------------------- |
  | `ERR_POSTGRES_AUTHENTICATION_FAILED_PBKDF2`      | Password authentication failed           |
  | `ERR_POSTGRES_UNKNOWN_AUTHENTICATION_METHOD`     | Server requested unknown auth method     |
  | `ERR_POSTGRES_UNSUPPORTED_AUTHENTICATION_METHOD` | Server requested unsupported auth method |
  | `ERR_POSTGRES_INVALID_SERVER_KEY`                | Invalid server key during authentication |
  | `ERR_POSTGRES_INVALID_SERVER_SIGNATURE`          | Invalid server signature                 |
  | `ERR_POSTGRES_SASL_SIGNATURE_INVALID_BASE64`     | Invalid SASL signature encoding          |
  | `ERR_POSTGRES_SASL_SIGNATURE_MISMATCH`           | SASL signature verification failed       |

  ### Query Errors

  | Query Errors                         | Description                                |
  | ------------------------------------ | ------------------------------------------ |
  | `ERR_POSTGRES_SYNTAX_ERROR`          | Invalid SQL syntax (extends `SyntaxError`) |
  | `ERR_POSTGRES_SERVER_ERROR`          | General error from PostgreSQL server       |
  | `ERR_POSTGRES_INVALID_QUERY_BINDING` | Invalid parameter binding                  |
  | `ERR_POSTGRES_QUERY_CANCELLED`       | Query was cancelled                        |
  | `ERR_POSTGRES_NOT_TAGGED_CALL`       | Query was called without a tagged call     |

  ### Data Type Errors

  | Data Type Errors                                        | Description                           |
  | ------------------------------------------------------- | ------------------------------------- |
  | `ERR_POSTGRES_INVALID_BINARY_DATA`                      | Invalid binary data format            |
  | `ERR_POSTGRES_INVALID_BYTE_SEQUENCE`                    | Invalid byte sequence                 |
  | `ERR_POSTGRES_INVALID_BYTE_SEQUENCE_FOR_ENCODING`       | Encoding error                        |
  | `ERR_POSTGRES_INVALID_CHARACTER`                        | Invalid character in data             |
  | `ERR_POSTGRES_OVERFLOW`                                 | Numeric overflow                      |
  | `ERR_POSTGRES_UNSUPPORTED_BYTEA_FORMAT`                 | Unsupported binary format             |
  | `ERR_POSTGRES_UNSUPPORTED_INTEGER_SIZE`                 | Integer size not supported            |
  | `ERR_POSTGRES_MULTIDIMENSIONAL_ARRAY_NOT_SUPPORTED_YET` | Multidimensional arrays not supported |
  | `ERR_POSTGRES_NULLS_IN_ARRAY_NOT_SUPPORTED_YET`         | NULL values in arrays not supported   |

  ### Protocol Errors

  | Protocol Errors                         | Description                 |
  | --------------------------------------- | --------------------------- |
  | `ERR_POSTGRES_EXPECTED_REQUEST`         | Expected client request     |
  | `ERR_POSTGRES_EXPECTED_STATEMENT`       | Expected prepared statement |
  | `ERR_POSTGRES_INVALID_BACKEND_KEY_DATA` | Invalid backend key data    |
  | `ERR_POSTGRES_INVALID_MESSAGE`          | Invalid protocol message    |
  | `ERR_POSTGRES_INVALID_MESSAGE_LENGTH`   | Invalid message length      |
  | `ERR_POSTGRES_UNEXPECTED_MESSAGE`       | Unexpected message type     |

  ### Transaction Errors

  | Transaction Errors                       | Description                           |
  | ---------------------------------------- | ------------------------------------- |
  | `ERR_POSTGRES_UNSAFE_TRANSACTION`        | Unsafe transaction operation detected |
  | `ERR_POSTGRES_INVALID_TRANSACTION_STATE` | Invalid transaction state             |
</Accordion>

### SQLite-Specific Errors

SQLite errors provide error codes and numbers that correspond to SQLite's standard error codes:

<Accordion title="Common SQLite Error Codes">
  | Error Code          | errno | Description                                          |
  | ------------------- | ----- | ---------------------------------------------------- |
  | `SQLITE_CONSTRAINT` | 19    | Constraint violation (UNIQUE, CHECK, NOT NULL, etc.) |
  | `SQLITE_BUSY`       | 5     | Database is locked                                   |
  | `SQLITE_LOCKED`     | 6     | Table in the database is locked                      |
  | `SQLITE_READONLY`   | 8     | Attempt to write to a readonly database              |
  | `SQLITE_IOERR`      | 10    | Disk I/O error                                       |
  | `SQLITE_CORRUPT`    | 11    | Database disk image is malformed                     |
  | `SQLITE_FULL`       | 13    | Database or disk is full                             |
  | `SQLITE_CANTOPEN`   | 14    | Unable to open database file                         |
  | `SQLITE_PROTOCOL`   | 15    | Database lock protocol error                         |
  | `SQLITE_SCHEMA`     | 17    | Database schema has changed                          |
  | `SQLITE_TOOBIG`     | 18    | String or BLOB exceeds size limit                    |
  | `SQLITE_MISMATCH`   | 20    | Data type mismatch                                   |
  | `SQLITE_MISUSE`     | 21    | Library used incorrectly                             |
  | `SQLITE_AUTH`       | 23    | Authorization denied                                 |

  Example error handling:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  const sqlite = new SQL("sqlite://app.db");

  try {
  	await sqlite`INSERT INTO users (id, name) VALUES (1, 'Alice')`;
  	await sqlite`INSERT INTO users (id, name) VALUES (1, 'Bob')`; // Duplicate ID
  } catch (error) {
  	if (error instanceof SQL.SQLiteError) {
  		if (error.code === "SQLITE_CONSTRAINT") {
  			console.log("Constraint violation:", error.message);
  			// Handle unique constraint violation
  		}
  	}
  }
  ```
</Accordion>

***

## Numbers and BigInt

Bun's SQL client includes special handling for large numbers that exceed the range of a 53-bit integer. Here's how it works:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { sql } from "bun";

const [{ x, y }] = await sql`SELECT 9223372036854777 as x, 12345 as y`;

console.log(typeof x, x); // "string" "9223372036854777"
console.log(typeof y, y); // "number" 12345
```

***

## BigInt Instead of Strings

If you need large numbers as BigInt instead of strings, you can enable this by setting the `bigint` option to `true` when initializing the SQL client:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const sql = new SQL({
	bigint: true,
});

const [{ x }] = await sql`SELECT 9223372036854777 as x`;

console.log(typeof x, x); // "bigint" 9223372036854777n
```

***

## Roadmap

There's still some things we haven't finished yet.

* Connection preloading via `--db-preconnect` Bun CLI flag
* Column name transforms (e.g. `snake_case` to `camelCase`). This is mostly blocked on a unicode-aware implementation of changing the case in C++ using WebKit's `WTF::String`.
* Column type transforms

***

## Database-Specific Features

#### Authentication Methods

MySQL supports multiple authentication plugins that are automatically negotiated:

* **`mysql_native_password`** - Traditional MySQL authentication, widely compatible
* **`caching_sha2_password`** - Default in MySQL 8.0+, more secure with RSA key exchange
* **`sha256_password`** - SHA-256 based authentication

The client automatically handles authentication plugin switching when requested by the server, including secure password exchange over non-SSL connections.

#### Prepared Statements & Performance

MySQL uses server-side prepared statements for all parameterized queries:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// This automatically creates a prepared statement on the server
const user = await mysql`SELECT * FROM users WHERE id = ${userId}`;

// Prepared statements are cached and reused for identical queries
for (const id of userIds) {
	// Same prepared statement is reused
	await mysql`SELECT * FROM users WHERE id = ${id}`;
}

// Query pipelining - multiple statements sent without waiting
const [users, orders, products] = await Promise.all([
	mysql`SELECT * FROM users WHERE active = ${true}`,
	mysql`SELECT * FROM orders WHERE status = ${"pending"}`,
	mysql`SELECT * FROM products WHERE in_stock = ${true}`,
]);
```

#### Multiple Result Sets

MySQL can return multiple result sets from multi-statement queries:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const mysql = new SQL("mysql://user:pass@localhost/mydb");

// Multi-statement queries with simple() method
const multiResults = await mysql`
  SELECT * FROM users WHERE id = 1;
  SELECT * FROM orders WHERE user_id = 1;
`.simple();
```

#### Character Sets & Collations

Bun.SQL automatically uses `utf8mb4` character set for MySQL connections, ensuring full Unicode support including emojis. This is the recommended character set for modern MySQL applications.

#### Connection Attributes

Bun automatically sends client information to MySQL for better monitoring:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// These attributes are sent automatically:
// _client_name: "Bun"
// _client_version: <bun version>
// You can see these in MySQL's performance_schema.session_connect_attrs
```

#### Type Handling

MySQL types are automatically converted to JavaScript types:

| MySQL Type                              | JavaScript Type          | Notes                                                                                                |
| --------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| INT, TINYINT, MEDIUMINT                 | number                   | Within safe integer range                                                                            |
| BIGINT                                  | string, number or BigInt | If the value fits in i32/u32 size will be number otherwise string or BigInt Based on `bigint` option |
| DECIMAL, NUMERIC                        | string                   | To preserve precision                                                                                |
| FLOAT, DOUBLE                           | number                   |                                                                                                      |
| DATE                                    | Date                     | JavaScript Date object                                                                               |
| DATETIME, TIMESTAMP                     | Date                     | With timezone handling                                                                               |
| TIME                                    | number                   | Total of microseconds                                                                                |
| YEAR                                    | number                   |                                                                                                      |
| CHAR, VARCHAR, VARSTRING, STRING        | string                   |                                                                                                      |
| TINY TEXT, MEDIUM TEXT, TEXT, LONG TEXT | string                   |                                                                                                      |
| TINY BLOB, MEDIUM BLOB, BLOG, LONG BLOB | string                   | BLOB Types are alias for TEXT types                                                                  |
| JSON                                    | object/array             | Automatically parsed                                                                                 |
| BIT(1)                                  | boolean                  | BIT(1) in MySQL                                                                                      |
| GEOMETRY                                | string                   | Geometry data                                                                                        |

#### Differences from PostgreSQL

While the API is unified, there are some behavioral differences:

1. **Parameter placeholders**: MySQL uses `?` internally but Bun converts `$1, $2` style automatically
2. **RETURNING clause**: MySQL doesn't support RETURNING; use `result.lastInsertRowid` or a separate SELECT
3. **Array types**: MySQL doesn't have native array types like PostgreSQL

### MySQL-Specific Features

We haven't implemented `LOAD DATA INFILE` support yet

### PostgreSQL-Specific Features

We haven't implemented these yet:

* `COPY` support
* `LISTEN` support
* `NOTIFY` support

We also haven't implemented some of the more uncommon features like:

* GSSAPI authentication
* `SCRAM-SHA-256-PLUS` support
* Point & PostGIS types
* All the multi-dimensional integer array types (only a couple of the types are supported)

***

## Common Patterns & Best Practices

### Working with MySQL Result Sets

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Getting insert ID after INSERT
const result = await mysql`INSERT INTO users (name) VALUES (${"Alice"})`;
console.log(result.lastInsertRowid); // MySQL's LAST_INSERT_ID()

// Handling affected rows
const updated = await mysql`UPDATE users SET active = ${false} WHERE age < ${18}`;
console.log(updated.affectedRows); // Number of rows updated

// Using MySQL-specific functions
const now = await mysql`SELECT NOW() as current_time`;
const uuid = await mysql`SELECT UUID() as id`;
```

### MySQL Error Handling

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
try {
	await mysql`INSERT INTO users (email) VALUES (${"duplicate@email.com"})`;
} catch (error) {
	if (error.code === "ER_DUP_ENTRY") {
		console.log("Duplicate entry detected");
	} else if (error.code === "ER_ACCESS_DENIED_ERROR") {
		console.log("Access denied");
	} else if (error.code === "ER_BAD_DB_ERROR") {
		console.log("Database does not exist");
	}
	// MySQL error codes are compatible with mysql/mysql2 packages
}
```

### Performance Tips for MySQL

1. **Use connection pooling**: Set appropriate `max` pool size based on your workload
2. **Enable prepared statements**: They're enabled by default and improve performance
3. **Use transactions for bulk operations**: Group related queries in transactions
4. **Index properly**: MySQL relies heavily on indexes for query performance
5. **Use `utf8mb4` charset**: It's set by default and handles all Unicode characters

***

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Why is this `Bun.sql` and not `Bun.postgres`?">
    The plan was to add more database drivers in the future. Now with MySQL support added, this unified API supports PostgreSQL, MySQL, and SQLite.
  </Accordion>

  <Accordion title="How do I know which database adapter is being used?">
    The adapter is automatically detected from the connection string:

    * URLs starting with `mysql://` or `mysql2://` use MySQL
    * URLs matching SQLite patterns (`:memory:`, `sqlite://`, `file://`) use SQLite
    * Everything else defaults to PostgreSQL
  </Accordion>

  <Accordion title="Are MySQL stored procedures supported?">
    Yes, stored procedures are fully supported including OUT parameters and multiple result sets:

    ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
    // Call stored procedure
    const results = await mysql`CALL GetUserStats(${userId}, @total_orders)`;

    // Get OUT parameter
    const outParam = await mysql`SELECT @total_orders as total`;
    ```
  </Accordion>

  <Accordion title="Can I use MySQL-specific SQL syntax?">
    Yes, you can use any MySQL-specific syntax:

    ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
    // MySQL-specific syntax works fine
    await mysql`SET @user_id = ${userId}`;
    await mysql`SHOW TABLES`;
    await mysql`DESCRIBE users`;
    await mysql`EXPLAIN SELECT * FROM users WHERE id = ${id}`;
    ```
  </Accordion>
</AccordionGroup>

***

## Why not just use an existing library?

npm packages like postgres.js, pg, and node-postgres can be used in Bun too. They're great options.

Two reasons why:

1. We think it's simpler for developers to have a database driver built into Bun. The time you spend library shopping is time you could be building your app.
2. We leverage some JavaScriptCore engine internals to make it faster to create objects that would be difficult to implement in a library

## Credits

Huge thanks to [@porsager](https://github.com/porsager)'s [postgres.js](https://github.com/porsager/postgres) for the inspiration for the API interface.

# SQLite

> Bun natively implements a high-performance SQLite3 driver.

Bun natively implements a high-performance [SQLite3](https://www.sqlite.org/) driver. To use it import from the built-in `bun:sqlite` module.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const db = new Database(":memory:");
const query = db.query("select 'Hello world' as message;");
query.get();
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
{ message: "Hello world" }
```

The API is simple, synchronous, and fast. Credit to [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3) and its contributors for inspiring the API of `bun:sqlite`.

Features include:

* Transactions
* Parameters (named & positional)
* Prepared statements
* Datatype conversions (`BLOB` becomes `Uint8Array`)
* Map query results to classes without an ORM - `query.as(MyClass)`
* The fastest performance of any SQLite driver for JavaScript
* `bigint` support
* Multi-query statements (e.g. `SELECT 1; SELECT 2;`) in a single call to database.run(query)

The `bun:sqlite` module is roughly 3-6x faster than `better-sqlite3` and 8-9x faster than `deno.land/x/sqlite` for read queries. Each driver was benchmarked against the [Northwind Traders](https://github.com/jpwhite3/northwind-SQLite3/blob/46d5f8a64f396f87cd374d1600dbf521523980e8/Northwind_large.sqlite.zip) dataset. View and run the [benchmark source](https://github.com/oven-sh/bun/tree/main/bench/sqlite).

<Frame caption="Benchmarked on an M1 MacBook Pro (64GB) running macOS 12.3.1">
  ![SQLite benchmarks for Bun, better-sqlite3, and
  deno.land/x/sqlite](https://user-images.githubusercontent.com/709451/168459263-8cd51ca3-a924-41e9-908d-cf3478a3b7f3.png)
</Frame>

***

## Database

To open or create a SQLite3 database:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite");
```

To open an in-memory database:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

// all of these do the same thing
const db = new Database(":memory:");
const db = new Database();
const db = new Database("");
```

To open in `readonly` mode:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { readonly: true });
```

To create the database if the file doesn't exist:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { create: true });
```

### Strict mode

By default, `bun:sqlite` requires binding parameters to include the `$`, `:`, or `@` prefix, and does not throw an error if a parameter is missing.

To instead throw an error when a parameter is missing and allow binding without a prefix, set `strict: true` on the `Database` constructor:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const strict = new Database(":memory:", { strict: true });

// throws error because of the typo:
const query = strict.query("SELECT $message;").all({ message: "Hello world" });

const notStrict = new Database(":memory:");
// does not throw error:
notStrict.query("SELECT $message;").all({ message: "Hello world" });
```

### Load via ES module import

You can also use an import attribute to load a database.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={1} theme={"theme":{"light":"github-light","dark":"dracula"}}
import db from "./mydb.sqlite" with { type: "sqlite" };

console.log(db.query("select * from users LIMIT 1").get());
```

This is equivalent to the following:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";
const db = new Database("./mydb.sqlite");
```

### `.close(throwOnError: boolean = false)`

To close a database connection, but allow existing queries to finish, call `.close(false)`:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
const db = new Database();
// ... do stuff
db.close(false);
```

To close the database and throw an error if there are any pending queries, call `.close(true)`:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
const db = new Database();
// ... do stuff
db.close(true);
```

<Note>
  `close(false)` is called automatically when the database is garbage collected. It is safe to call
  multiple times but has no effect after the first.
</Note>

### `using` statement

You can use the `using` statement to ensure that a database connection is closed when the `using` block is exited.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={4, 5} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

{
	using db = new Database("mydb.sqlite");
	using query = db.query("select 'Hello world' as message;");
	console.log(query.get());
}
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
{ message: "Hello world" }
```

### `.serialize()`

`bun:sqlite` supports SQLite's built-in mechanism for [serializing](https://www.sqlite.org/c3ref/serialize.html) and [deserializing](https://www.sqlite.org/c3ref/deserialize.html) databases to and from memory.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const olddb = new Database("mydb.sqlite");
const contents = olddb.serialize(); // => Uint8Array
const newdb = Database.deserialize(contents);
```

Internally, `.serialize()` calls [`sqlite3_serialize`](https://www.sqlite.org/c3ref/serialize.html).

### `.query()`

Use the `db.query()` method on your `Database` instance to [prepare](https://www.sqlite.org/c3ref/prepare.html) a SQL query. The result is a `Statement` instance that will be cached on the `Database` instance. *The query will not be executed.*

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`select "Hello world" as message`);
```

<Note>
  Use the `.prepare()` method to prepare a query *without* caching it on the `Database` instance.

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  // compile the prepared statement
  const query = db.prepare("SELECT * FROM foo WHERE bar = ?");
  ```
</Note>

***

## WAL mode

SQLite supports [write-ahead log mode](https://www.sqlite.org/wal.html) (WAL) which dramatically improves performance, especially in situations with many concurrent readers and a single writer. It's broadly recommended to enable WAL mode for most typical applications.

To enable WAL mode, run this pragma query at the beginning of your application:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
db.exec("PRAGMA journal_mode = WAL;");
```

<Accordion title="What is WAL mode?">
  In WAL mode, writes to the database are written directly to a separate file called the "WAL file" (write-ahead log). This file will be later integrated into the main database file. Think of it as a buffer for pending writes. Refer to the [SQLite docs](https://www.sqlite.org/wal.html) for a more detailed overview.

  On macOS, WAL files may be persistent by default. This is not a bug, it is how macOS configured the system version of SQLite.
</Accordion>

***

## Statements

A `Statement` is a *prepared query*, which means it's been parsed and compiled into an efficient binary form. It can be executed multiple times in a performant way.

Create a statement with the `.query` method on your `Database` instance.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`select "Hello world" as message`);
```

Queries can contain parameters. These can be numerical (`?1`) or named (`$param` or `:param` or `@param`).

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`SELECT ?1, ?2;`);
const query = db.query(`SELECT $param1, $param2;`);
```

Values are bound to these parameters when the query is executed. A `Statement` can be executed with several different methods, each returning the results in a different form.

### Binding values

To bind values to a statement, pass an object to the `.all()`, `.get()`, `.run()`, or `.values()` method.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`select $message;`);
query.all({ $message: "Hello world" });
```

You can bind using positional parameters too:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`select ?1;`);
query.all("Hello world");
```

#### `strict: true` lets you bind values without prefixes

By default, the `$`, `:`, and `@` prefixes are **included** when binding values to named parameters. To bind without these prefixes, use the `strict` option in the `Database` constructor.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const db = new Database(":memory:", {
	// bind values without prefixes
	strict: true, // [!code ++]
});

const query = db.query(`select $message;`);

// strict: true
query.all({ message: "Hello world" });

// strict: false
// query.all({ $message: "Hello world" });
```

### `.all()`

Use `.all()` to run a query and get back the results as an array of objects.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`select $message;`);
query.all({ $message: "Hello world" });
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
[{ message: "Hello world" }]
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) and repeatedly calls [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) until it returns `SQLITE_DONE`.

### `.get()`

Use `.get()` to run a query and get back the first result as an object.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`select $message;`);
query.get({ $message: "Hello world" });
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
{ $message: "Hello world" }
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) followed by [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) until it no longer returns `SQLITE_ROW`. If the query returns no rows, `undefined` is returned.

### `.run()`

Use `.run()` to run a query and get back `undefined`. This is useful for schema-modifying queries (e.g. `CREATE TABLE`) or bulk write operations.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`create table foo;`);
query.run();
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
{
  lastInsertRowid: 0,
  changes: 0,
}
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) and calls [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) once. Stepping through all the rows is not necessary when you don't care about the results.

The `lastInsertRowid` property returns the ID of the last row inserted into the database. The `changes` property is the number of rows affected by the query.

### `.as(Class)` - Map query results to a class

Use `.as(Class)` to run a query and get back the results as instances of a class. This lets you attach methods & getters/setters to results.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={10} theme={"theme":{"light":"github-light","dark":"dracula"}}
class Movie {
	title: string;
	year: number;

	get isMarvel() {
		return this.title.includes("Marvel");
	}
}

const query = db.query("SELECT title, year FROM movies").as(Movie);
const movies = query.all();
const first = query.get();

console.log(movies[0].isMarvel);
console.log(first.isMarvel);
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
true
true
```

As a performance optimization, the class constructor is not called, default initializers are not run, and private fields are not accessible. This is more like using `Object.create` than `new`. The class's prototype is assigned to the object, methods are attached, and getters/setters are set up, but the constructor is not called.

The database columns are set as properties on the class instance.

### `.iterate()` (`@@iterator`)

Use `.iterate()` to run a query and incrementally return results. This is useful for large result sets that you want to process one row at a time without loading all the results into memory.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query("SELECT * FROM foo");
for (const row of query.iterate()) {
	console.log(row);
}
```

You can also use the `@@iterator` protocol:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query("SELECT * FROM foo");
for (const row of query) {
	console.log(row);
}
```

This feature was added in Bun v1.1.31.

### `.values()`

Use `values()` to run a query and get back all results as an array of arrays.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3, 4} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query(`select $message;`);

query.values({ $message: "Hello world" });
query.values(2);
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
[
  [ "Iron Man", 2008 ],
  [ "The Avengers", 2012 ],
  [ "Ant-Man: Quantumania", 2023 ],
]
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) and repeatedly calls [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) until it returns `SQLITE_DONE`.

### `.finalize()`

Use `.finalize()` to destroy a `Statement` and free any resources associated with it. Once finalized, a `Statement` cannot be executed again. Typically, the garbage collector will do this for you, but explicit finalization may be useful in performance-sensitive applications.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query("SELECT title, year FROM movies");
const movies = query.all();
query.finalize();
```

### `.toString()`

Calling `toString()` on a `Statement` instance prints the expanded SQL query. This is useful for debugging.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={6, 9, 12} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

// setup
const query = db.query("SELECT $param;");

console.log(query.toString()); // => "SELECT NULL"

query.run(42);
console.log(query.toString()); // => "SELECT 42"

query.run(365);
console.log(query.toString()); // => "SELECT 365"
```

Internally, this calls [`sqlite3_expanded_sql`](https://www.sqlite.org/capi3ref.html#sqlite3_expanded_sql). The parameters are expanded using the most recently bound values.

## Parameters

Queries can contain parameters. These can be numerical (`?1`) or named (`$param` or `:param` or `@param`). Bind values to these parameters when executing the query:

```ts title="query.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query("SELECT * FROM foo WHERE bar = $bar");
const results = query.all({
	$bar: "bar",
});
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
[{ "$bar": "bar" }]
```

Numbered (positional) parameters work too:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const query = db.query("SELECT ?1, ?2");
const results = query.all("hello", "goodbye");
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
[
	{
		"?1": "hello",
		"?2": "goodbye",
	},
];
```

***

## Integers

sqlite supports signed 64 bit integers, but JavaScript only supports signed 52 bit integers or arbitrary precision integers with `bigint`.

`bigint` input is supported everywhere, but by default `bun:sqlite` returns integers as `number` types. If you need to handle integers larger than 2^53, set `safeIntegers` option to `true` when creating a `Database` instance. This also validates that `bigint` passed to `bun:sqlite` do not exceed 64 bits.

By default, `bun:sqlite` returns integers as `number` types. If you need to handle integers larger than 2^53, you can use the `bigint` type.

### `safeIntegers: true`

When `safeIntegers` is `true`, `bun:sqlite` will return integers as `bigint` types:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const db = new Database(":memory:", { safeIntegers: true });
const query = db.query(`SELECT ${BigInt(Number.MAX_SAFE_INTEGER) + 102n} as max_int`);
const result = query.get();

console.log(result.max_int);
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
9007199254741093n
```

When `safeIntegers` is `true`, `bun:sqlite` will throw an error if a `bigint` value in a bound parameter exceeds 64 bits:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const db = new Database(":memory:", { safeIntegers: true });
db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, value INTEGER)");

const query = db.query("INSERT INTO test (value) VALUES ($value)");

try {
	query.run({ $value: BigInt(Number.MAX_SAFE_INTEGER) ** 2n });
} catch (e) {
	console.log(e.message);
}
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
BigInt value '81129638414606663681390495662081' is out of range
```

### `safeIntegers: false` (default)

When `safeIntegers` is `false`, `bun:sqlite` will return integers as `number` types and truncate any bits beyond 53:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const db = new Database(":memory:", { safeIntegers: false });
const query = db.query(`SELECT ${BigInt(Number.MAX_SAFE_INTEGER) + 102n} as max_int`);
const result = query.get();
console.log(result.max_int);
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
9007199254741092
```

***

## Transactions

Transactions are a mechanism for executing multiple queries in an *atomic* way; that is, either all of the queries succeed or none of them do. Create a transaction with the `db.transaction()` method:

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2} theme={"theme":{"light":"github-light","dark":"dracula"}}
const insertCat = db.prepare("INSERT INTO cats (name) VALUES ($name)");
const insertCats = db.transaction(cats => {
	for (const cat of cats) insertCat.run(cat);
});
```

At this stage, we haven't inserted any cats! The call to `db.transaction()` returns a new function (`insertCats`) that *wraps* the function that executes the queries.

To execute the transaction, call this function. All arguments will be passed through to the wrapped function; the return value of the wrapped function will be returned by the transaction function. The wrapped function also has access to the `this` context as defined where the transaction is executed.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
const insert = db.prepare("INSERT INTO cats (name) VALUES ($name)");
const insertCats = db.transaction(cats => {
	for (const cat of cats) insert.run(cat);
	return cats.length;
});

const count = insertCats([{ $name: "Keanu" }, { $name: "Salem" }, { $name: "Crookshanks" }]);

console.log(`Inserted ${count} cats`);
```

The driver will automatically [`begin`](https://www.sqlite.org/lang_transaction.html) a transaction when `insertCats` is called and `commit` it when the wrapped function returns. If an exception is thrown, the transaction will be rolled back. The exception will propagate as usual; it is not caught.

<Note>
  **Nested transactions** — Transaction functions can be called from inside other transaction functions. When doing so, the inner transaction becomes a [savepoint](https://www.sqlite.org/lang_savepoint.html).

  <Accordion title="View nested transaction example">
    ```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    // setup
    import { Database } from "bun:sqlite";
    const db = Database.open(":memory:");
    db.run("CREATE TABLE expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, note TEXT, dollars INTEGER);");
    db.run("CREATE TABLE cats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, age INTEGER)");
    const insertExpense = db.prepare("INSERT INTO expenses (note, dollars) VALUES (?, ?)");
    const insert = db.prepare("INSERT INTO cats (name, age) VALUES ($name, $age)");
    const insertCats = db.transaction(cats => {
    	for (const cat of cats) insert.run(cat);
    });

    const adopt = db.transaction(cats => {
    	insertExpense.run("adoption fees", 20);
    	insertCats(cats); // nested transaction
    });

    adopt([
    	{ $name: "Joey", $age: 2 },
    	{ $name: "Sally", $age: 4 },
    	{ $name: "Junior", $age: 1 },
    ]);
    ```
  </Accordion>
</Note>

Transactions also come with `deferred`, `immediate`, and `exclusive` versions.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
insertCats(cats); // uses "BEGIN"
insertCats.deferred(cats); // uses "BEGIN DEFERRED"
insertCats.immediate(cats); // uses "BEGIN IMMEDIATE"
insertCats.exclusive(cats); // uses "BEGIN EXCLUSIVE"
```

### `.loadExtension()`

To load a [SQLite extension](https://www.sqlite.org/loadext.html), call `.loadExtension(name)` on your `Database` instance

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={4} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database } from "bun:sqlite";

const db = new Database();
db.loadExtension("myext");
```

<Note>
  **MacOS users** By default, macOS ships with Apple's proprietary build of SQLite, which doesn't support extensions. To use extensions, you'll need to install a vanilla build of SQLite.

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  brew install sqlite
  which sqlite # get path to binary
  ```

  To point `bun:sqlite` to the new build, call `Database.setCustomSQLite(path)` before creating any `Database` instances. (On other operating systems, this is a no-op.) Pass a path to the SQLite `.dylib` file, *not* the executable. With recent versions of Homebrew this is something like `/opt/homebrew/Cellar/sqlite/<version>/libsqlite3.dylib`.

  ```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3} theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { Database } from "bun:sqlite";

  Database.setCustomSQLite("/path/to/libsqlite.dylib");

  const db = new Database();
  db.loadExtension("myext");
  ```
</Note>

### `.fileControl(cmd: number, value: any)`

To use the advanced `sqlite3_file_control` API, call `.fileControl(cmd, value)` on your `Database` instance.

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={6} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Database, constants } from "bun:sqlite";

const db = new Database();
// Ensure WAL mode is NOT persistent
// this prevents wal files from lingering after the database is closed
db.fileControl(constants.SQLITE_FCNTL_PERSIST_WAL, 0);
```

`value` can be:

* `number`
* `TypedArray`
* `undefined` or `null`

***

## Reference

```ts Type Reference icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
class Database {
	constructor(
		filename: string,
		options?:
			| number
			| {
					readonly?: boolean;
					create?: boolean;
					readwrite?: boolean;
			  },
	);

	query<Params, ReturnType>(sql: string): Statement<Params, ReturnType>;
	run(sql: string, params?: SQLQueryBindings): { lastInsertRowid: number; changes: number };
	exec = this.run;
}

class Statement<Params, ReturnType> {
	all(params: Params): ReturnType[];
	get(params: Params): ReturnType | undefined;
	run(params: Params): {
		lastInsertRowid: number;
		changes: number;
	};
	values(params: Params): unknown[][];

	finalize(): void; // destroy statement and clean up resources
	toString(): string; // serialize to SQL

	columnNames: string[]; // the column names of the result set
	columnTypes: string[]; // types based on actual values in first row (call .get()/.all() first)
	declaredTypes: (string | null)[]; // types from CREATE TABLE schema (call .get()/.all() first)
	paramsCount: number; // the number of parameters expected by the statement
	native: any; // the native object representing the statement

	as(Class: new () => ReturnType): this;
}

type SQLQueryBindings =
	| string
	| bigint
	| TypedArray
	| number
	| boolean
	| null
	| Record<string, string | bigint | TypedArray | number | boolean | null>;
```

### Datatypes

| JavaScript type | SQLite type            |
| --------------- | ---------------------- |
| `string`        | `TEXT`                 |
| `number`        | `INTEGER` or `DECIMAL` |
| `boolean`       | `INTEGER` (1 or 0)     |
| `Uint8Array`    | `BLOB`                 |
| `Buffer`        | `BLOB`                 |
| `bigint`        | `INTEGER`              |
| `null`          | `NULL`                 |


# S3

> Bun provides fast, native bindings for interacting with S3-compatible object storage services.

Production servers often read, upload, and write files to S3-compatible object storage services instead of the local filesystem. Historically, that means local filesystem APIs you use in development can't be used in production. When you use Bun, things are different.

### Bun's S3 API is fast

<Frame caption="Left: Bun v1.1.44. Right: Node.js v23.6.0">
  <img src="https://mintcdn.com/bun-1dd33a4e/DJXb5ll7I0cV-M4b/images/bun-s3-node.gif?s=2aa9cc04d2ae08fae0838cac5d18154b" alt="Bun's S3 API is fast" data-og-width="1800" width="1800" data-og-height="1095" height="1095" data-path="images/bun-s3-node.gif" data-optimize="true" data-opv="3" />
</Frame>

Bun provides fast, native bindings for interacting with S3-compatible object storage services. Bun's S3 API is designed to be simple and feel similar to fetch's `Response` and `Blob` APIs (like Bun's local filesystem APIs).

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { s3, write, S3Client } from "bun";

// Bun.s3 reads environment variables for credentials
// file() returns a lazy reference to a file on S3
const metadata = s3.file("123.json");

// Download from S3 as JSON
const data = await metadata.json();

// Upload to S3
await write(metadata, JSON.stringify({ name: "John", age: 30 }));

// Presign a URL (synchronous - no network request needed)
const url = metadata.presign({
	acl: "public-read",
	expiresIn: 60 * 60 * 24, // 1 day
});

// Delete the file
await metadata.delete();
```

S3 is the [de facto standard](https://en.wikipedia.org/wiki/De_facto_standard) internet filesystem. Bun's S3 API works with S3-compatible storage services like:

* AWS S3
* Cloudflare R2
* DigitalOcean Spaces
* MinIO
* Backblaze B2
* ...and any other S3-compatible storage service

## Basic Usage

There are several ways to interact with Bun's S3 API.

### `Bun.S3Client` & `Bun.s3`

`Bun.s3` is equivalent to `new Bun.S3Client()`, relying on environment variables for credentials.

To explicitly set credentials, pass them to the `Bun.S3Client` constructor.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const client = new S3Client({
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// sessionToken: "..."
	// acl: "public-read",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
	// endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
	// endpoint: "https://<region>.digitaloceanspaces.com", // DigitalOcean Spaces
	// endpoint: "http://localhost:9000", // MinIO
});

// Bun.s3 is a global singleton that is equivalent to `new Bun.S3Client()`
```

### Working with S3 Files

The **`file`** method in `S3Client` returns a **lazy reference to a file on S3**.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// A lazy reference to a file on S3
const s3file: S3File = client.file("123.json");
```

Like `Bun.file(path)`, the `S3Client`'s `file` method is synchronous. It does zero network requests until you call a method that depends on a network request.

### Reading files from S3

If you've used the `fetch` API, you're familiar with the `Response` and `Blob` APIs. `S3File` extends `Blob`. The same methods that work on `Blob` also work on `S3File`.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Read an S3File as text
const text = await s3file.text();

// Read an S3File as JSON
const json = await s3file.json();

// Read an S3File as an ArrayBuffer
const buffer = await s3file.arrayBuffer();

// Get only the first 1024 bytes
const partial = await s3file.slice(0, 1024).text();

// Stream the file
const stream = s3file.stream();
for await (const chunk of stream) {
	console.log(chunk);
}
```

#### Memory optimization

Methods like `text()`, `json()`, `bytes()`, or `arrayBuffer()` avoid duplicating the string or bytes in memory when possible.

If the text happens to be ASCII, Bun directly transfers the string to JavaScriptCore (the engine) without transcoding and without duplicating the string in memory. When you use `.bytes()` or `.arrayBuffer()`, it will also avoid duplicating the bytes in memory.

These helper methods not only simplify the API, they also make it faster.

### Writing & uploading files to S3

Writing to S3 is just as simple.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Write a string (replacing the file)
await s3file.write("Hello World!");

// Write a Buffer (replacing the file)
await s3file.write(Buffer.from("Hello World!"));

// Write a Response (replacing the file)
await s3file.write(new Response("Hello World!"));

// Write with content type
await s3file.write(JSON.stringify({ name: "John", age: 30 }), {
	type: "application/json",
});

// Write using a writer (streaming)
const writer = s3file.writer({ type: "application/json" });
writer.write("Hello");
writer.write(" World!");
await writer.end();

// Write using Bun.write
await Bun.write(s3file, "Hello World!");
```

### Working with large files (streams)

Bun automatically handles multipart uploads for large files and provides streaming capabilities. The same API that works for local files also works for S3 files.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Write a large file
const bigFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
const writer = s3file.writer({
	// Automatically retry on network errors up to 3 times
	retry: 3,

	// Queue up to 10 requests at a time
	queueSize: 10,

	// Upload in 5 MB chunks
	partSize: 5 * 1024 * 1024,
});
for (let i = 0; i < 10; i++) {
	writer.write(bigFile);
	await writer.flush();
}
await writer.end();
```

***

## Presigning URLs

When your production service needs to let users upload files to your server, it's often more reliable for the user to upload directly to S3 instead of your server acting as an intermediary.

To facilitate this, you can presign URLs for S3 files. This generates a URL with a signature that allows a user to securely upload that specific file to S3, without exposing your credentials or granting them unnecessary access to your bucket.

The default behaviour is to generate a `GET` URL that expires in 24 hours. Bun attempts to infer the content type from the file extension. If inference is not possible, it will default to `application/octet-stream`.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { s3 } from "bun";

// Generate a presigned URL that expires in 24 hours (default)
const download = s3.presign("my-file.txt"); // GET, text/plain, expires in 24 hours

const upload = s3.presign("my-file", {
	expiresIn: 3600, // 1 hour
	method: "PUT",
	type: "application/json", // No extension for inferring, so we can specify the content type to be JSON
});

// You can call .presign() if on a file reference, but avoid doing so
// unless you already have a reference (to avoid memory usage).
const myFile = s3.file("my-file.txt");
const presignedFile = myFile.presign({
	expiresIn: 3600, // 1 hour
});
```

### Setting ACLs

To set an ACL (access control list) on a presigned URL, pass the `acl` option:

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const url = s3file.presign({
	acl: "public-read",
	expiresIn: 3600,
});
```

You can pass any of the following ACLs:

| ACL                           | Explanation                                                         |
| ----------------------------- | ------------------------------------------------------------------- |
| `"public-read"`               | The object is readable by the public.                               |
| `"private"`                   | The object is readable only by the bucket owner.                    |
| `"public-read-write"`         | The object is readable and writable by the public.                  |
| `"authenticated-read"`        | The object is readable by the bucket owner and authenticated users. |
| `"aws-exec-read"`             | The object is readable by the AWS account that made the request.    |
| `"bucket-owner-read"`         | The object is readable by the bucket owner.                         |
| `"bucket-owner-full-control"` | The object is readable and writable by the bucket owner.            |
| `"log-delivery-write"`        | The object is writable by AWS services used for log delivery.       |

### Expiring URLs

To set an expiration time for a presigned URL, pass the `expiresIn` option.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const url = s3file.presign({
	// Seconds
	expiresIn: 3600, // 1 hour

	// access control list
	acl: "public-read",

	// HTTP method
	method: "PUT",
});
```

### `method`

To set the HTTP method for a presigned URL, pass the `method` option.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const url = s3file.presign({
	method: "PUT",
	// method: "DELETE",
	// method: "GET",
	// method: "HEAD",
	// method: "POST",
	// method: "PUT",
});
```

### `new Response(S3File)`

To quickly redirect users to a presigned URL for an S3 file, pass an `S3File` instance to a `Response` object as the body.

This will automatically redirect the user to the presigned URL for the S3 file, saving you the memory, time, and bandwidth cost of downloading the file to your server and sending it back to the user.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = new Response(s3file);
console.log(response);
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Response (0 KB) {
  ok: false,
  url: "",
  status: 302,
  statusText: "",
  headers: Headers {
    "location": "https://<account-id>.r2.cloudflarestorage.com/...",
  },
  redirected: true,
  bodyUsed: false
}
```

***

## Support for S3-Compatible Services

Bun's S3 implementation works with any S3-compatible storage service. Just specify the appropriate endpoint:

### Using Bun's S3Client with AWS S3

AWS S3 is the default. You can also pass a `region` option instead of an `endpoint` option for AWS S3.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

// AWS S3
const s3 = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	bucket: "my-bucket",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
	// region: "us-east-1",
});
```

### Using Bun's S3Client with Google Cloud Storage

To use Bun's S3 client with [Google Cloud Storage](https://cloud.google.com/storage), set `endpoint` to `"https://storage.googleapis.com"` in the `S3Client` constructor.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={8} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

// Google Cloud Storage
const gcs = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	bucket: "my-bucket",
	endpoint: "https://storage.googleapis.com",
});
```

### Using Bun's S3Client with Cloudflare R2

To use Bun's S3 client with [Cloudflare R2](https://developers.cloudflare.com/r2/), set `endpoint` to the R2 endpoint in the `S3Client` constructor. The R2 endpoint includes your account ID.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={8} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

// CloudFlare R2
const r2 = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	bucket: "my-bucket",
	endpoint: "https://<account-id>.r2.cloudflarestorage.com",
});
```

### Using Bun's S3Client with DigitalOcean Spaces

To use Bun's S3 client with [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), set `endpoint` to the DigitalOcean Spaces endpoint in the `S3Client` constructor.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={8} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const spaces = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	bucket: "my-bucket",
	// region: "nyc3",
	endpoint: "https://<region>.digitaloceanspaces.com",
});
```

### Using Bun's S3Client with MinIO

To use Bun's S3 client with [MinIO](https://min.io/), set `endpoint` to the URL that MinIO is running on in the `S3Client` constructor.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={10} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const minio = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	bucket: "my-bucket",

	// Make sure to use the correct endpoint URL
	// It might not be localhost in production!
	endpoint: "http://localhost:9000",
});
```

### Using Bun's S3Client with supabase

To use Bun's S3 client with [supabase](https://supabase.com/), set `endpoint` to the supabase endpoint in the `S3Client` constructor. The supabase endpoint includes your account ID and /storage/v1/s3 path. Make sure to set Enable connection via S3 protocol on in the supabase dashboard in `https://supabase.com/dashboard/project/<account-id>/settings/storage` and to set the region informed in the same section.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3-10} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const supabase = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	bucket: "my-bucket",
	region: "us-west-1",
	endpoint: "https://<account-id>.supabase.co/storage/v1/s3/storage",
});
```

### Using Bun's S3Client with S3 Virtual Hosted-Style endpoints

When using a S3 Virtual Hosted-Style endpoint, you need to set the `virtualHostedStyle` option to `true`.

<Note>
  * If you don’t specify an endpoint, Bun will automatically determine the AWS S3 endpoint using the
    provided region and bucket. - If no region is specified, Bun defaults to us-east-1. - If you
    explicitly provide an endpoint, you don’t need to specify a bucket name.
</Note>

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={17, 25} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

// AWS S3 endpoint inferred from region and bucket
const s3 = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	bucket: "my-bucket",
	virtualHostedStyle: true, // [!code ++]
	// endpoint: "https://my-bucket.s3.us-east-1.amazonaws.com",
	// region: "us-east-1",
});

// AWS S3
const s3WithEndpoint = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	endpoint: "https://<bucket-name>.s3.<region>.amazonaws.com",
	virtualHostedStyle: true, // [!code ++]
});

// Cloudflare R2
const r2WithEndpoint = new S3Client({
	accessKeyId: "access-key",
	secretAccessKey: "secret-key",
	endpoint: "https://<bucket-name>.<account-id>.r2.cloudflarestorage.com",
	virtualHostedStyle: true, // [!code ++]
});
```

***

## Credentials

Credentials are one of the hardest parts of using S3, and we've tried to make it as easy as possible. By default, Bun reads the following environment variables for credentials.

| Option name       | Environment variable   |
| ----------------- | ---------------------- |
| `accessKeyId`     | `S3_ACCESS_KEY_ID`     |
| `secretAccessKey` | `S3_SECRET_ACCESS_KEY` |
| `region`          | `S3_REGION`            |
| `endpoint`        | `S3_ENDPOINT`          |
| `bucket`          | `S3_BUCKET`            |
| `sessionToken`    | `S3_SESSION_TOKEN`     |

If the `S3_*` environment variable is not set, Bun will also check for the `AWS_*` environment variable, for each of the above options.

| Option name       | Fallback environment variable |
| ----------------- | ----------------------------- |
| `accessKeyId`     | `AWS_ACCESS_KEY_ID`           |
| `secretAccessKey` | `AWS_SECRET_ACCESS_KEY`       |
| `region`          | `AWS_REGION`                  |
| `endpoint`        | `AWS_ENDPOINT`                |
| `bucket`          | `AWS_BUCKET`                  |
| `sessionToken`    | `AWS_SESSION_TOKEN`           |

These environment variables are read from [`.env` files](/runtime/environment-variables) or from the process environment at initialization time (`process.env` is not used for this).

These defaults are overridden by the options you pass to `s3.file(credentials)`, `new Bun.S3Client(credentials)`, or any of the methods that accept credentials. So if, for example, you use the same credentials for different buckets, you can set the credentials once in your `.env` file and then pass `bucket: "my-bucket"` to the `s3.file()` function without having to specify all the credentials again.

### `S3Client` objects

When you're not using environment variables or using multiple buckets, you can create a `S3Client` object to explicitly set credentials.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={3-11} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const client = new S3Client({
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// sessionToken: "..."
	endpoint: "https://s3.us-east-1.amazonaws.com",
	// endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
	// endpoint: "http://localhost:9000", // MinIO
});

// Write using a Response
await file.write(new Response("Hello World!"));

// Presign a URL
const url = file.presign({
	expiresIn: 60 * 60 * 24, // 1 day
	acl: "public-read",
});

// Delete the file
await file.delete();
```

### `S3Client.prototype.write`

To upload or write a file to S3, call `write` on the `S3Client` instance.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={8, 9} theme={"theme":{"light":"github-light","dark":"dracula"}}
const client = new Bun.S3Client({
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	endpoint: "https://s3.us-east-1.amazonaws.com",
	bucket: "my-bucket",
});

await client.write("my-file.txt", "Hello World!");
await client.write("my-file.txt", new Response("Hello World!"));

// equivalent to
// await client.file("my-file.txt").write("Hello World!");
```

### `S3Client.prototype.delete`

To delete a file from S3, call `delete` on the `S3Client` instance.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={7} theme={"theme":{"light":"github-light","dark":"dracula"}}
const client = new Bun.S3Client({
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
});

await client.delete("my-file.txt");
// equivalent to
// await client.file("my-file.txt").delete();
```

### `S3Client.prototype.exists`

To check if a file exists in S3, call `exists` on the `S3Client` instance.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={7} theme={"theme":{"light":"github-light","dark":"dracula"}}
const client = new Bun.S3Client({
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
});

const exists = await client.exists("my-file.txt");
// equivalent to
// const exists = await client.file("my-file.txt").exists();
```

## `S3File`

`S3File` instances are created by calling the `S3Client` instance method or the `s3.file()` function. Like `Bun.file()`, `S3File` instances are lazy. They don't refer to something that necessarily exists at the time of creation. That's why all the methods that don't involve network requests are fully synchronous.

```ts Type Reference icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240"  expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
interface S3File extends Blob {
	slice(start: number, end?: number): S3File;
	exists(): Promise<boolean>;
	unlink(): Promise<void>;
	presign(options: S3Options): string;
	text(): Promise<string>;
	json(): Promise<any>;
	bytes(): Promise<Uint8Array>;
	arrayBuffer(): Promise<ArrayBuffer>;
	stream(options: S3Options): ReadableStream;
	write(
		data: string | Uint8Array | ArrayBuffer | Blob | ReadableStream | Response | Request,
		options?: BlobPropertyBag,
	): Promise<number>;

	exists(options?: S3Options): Promise<boolean>;
	unlink(options?: S3Options): Promise<void>;
	delete(options?: S3Options): Promise<void>;
	presign(options?: S3Options): string;

	stat(options?: S3Options): Promise<S3Stat>;
	/**
	 * Size is not synchronously available because it requires a network request.
	 *
	 * @deprecated Use `stat()` instead.
	 */
	size: NaN;

	// ... more omitted for brevity
}
```

Like `Bun.file()`, `S3File` extends [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob), so all the methods that are available on `Blob` are also available on `S3File`. The same API for reading data from a local file is also available for reading data from S3.

| Method                       | Output           |
| ---------------------------- | ---------------- |
| `await s3File.text()`        | `string`         |
| `await s3File.bytes()`       | `Uint8Array`     |
| `await s3File.json()`        | `JSON`           |
| `await s3File.stream()`      | `ReadableStream` |
| `await s3File.arrayBuffer()` | `ArrayBuffer`    |

That means using `S3File` instances with `fetch()`, `Response`, and other web APIs that accept `Blob` instances just works.

### Partial reads with `slice`

To read a partial range of a file, you can use the `slice` method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240"  highlight={1} theme={"theme":{"light":"github-light","dark":"dracula"}}
const partial = s3file.slice(0, 1024);

// Read the partial range as a Uint8Array
const bytes = await partial.bytes();

// Read the partial range as a string
const text = await partial.text();
```

Internally, this works by using the HTTP `Range` header to request only the bytes you want. This `slice` method is the same as [`Blob.prototype.slice`](https://developer.mozilla.org/en-US/docs/Web/API/Blob/slice).

### Deleting files from S3

To delete a file from S3, you can use the `delete` method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={1} theme={"theme":{"light":"github-light","dark":"dracula"}}
await s3file.delete();
// await s3File.unlink();
```

`delete` is the same as `unlink`.

## Error codes

When Bun's S3 API throws an error, it will have a `code` property that matches one of the following values:

* `ERR_S3_MISSING_CREDENTIALS`
* `ERR_S3_INVALID_METHOD`
* `ERR_S3_INVALID_PATH`
* `ERR_S3_INVALID_ENDPOINT`
* `ERR_S3_INVALID_SIGNATURE`
* `ERR_S3_INVALID_SESSION_TOKEN`

When the S3 Object Storage service returns an error (that is, not Bun), it will be an `S3Error` instance (an `Error` instance with the name `"S3Error"`).

## `S3Client` static methods

The `S3Client` class provides several static methods for interacting with S3.

### `S3Client.write` (static)

To write data directly to a path in the bucket, you can use the `S3Client.write` static method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={12, 15-18, 22, 25-29} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const credentials = {
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
	// endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
};

// Write string
await S3Client.write("my-file.txt", "Hello World");

// Write JSON with type
await S3Client.write("data.json", JSON.stringify({ hello: "world" }), {
	...credentials,
	type: "application/json",
});

// Write from fetch
const res = await fetch("https://example.com/data");
await S3Client.write("data.bin", res, credentials);

// Write with ACL
await S3Client.write("public.html", html, {
	...credentials,
	acl: "public-read",
	type: "text/html",
});
```

This is equivalent to calling `new S3Client(credentials).write("my-file.txt", "Hello World")`.

### `S3Client.presign` (static)

To generate a presigned URL for an S3 file, you can use the `S3Client.presign` static method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={11-14} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const credentials = {
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
	// endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
};

const url = S3Client.presign("my-file.txt", {
	...credentials,
	expiresIn: 3600,
});
```

This is equivalent to calling `new S3Client(credentials).presign("my-file.txt", { expiresIn: 3600 })`.

### `S3Client.list` (static)

To list some or all (up to 1,000) objects in a bucket, you can use the `S3Client.list` static method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={12, 15-20, 24-29} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const credentials = { ... }
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  bucket: "my-bucket",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
  // endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
};

// List (up to) 1000 objects in the bucket
const allObjects = await S3Client.list(null, credentials);

// List (up to) 500 objects under `uploads/` prefix, with owner field for each object
const uploads = await S3Client.list({
  prefix: 'uploads/',
  maxKeys: 500,
  fetchOwner: true,
}, credentials);

// Check if more results are available
if (uploads.isTruncated) {
  // List next batch of objects under `uploads/` prefix
  const moreUploads = await S3Client.list({
    prefix: 'uploads/',
    maxKeys: 500,
    startAfter: uploads.contents!.at(-1).key
    fetchOwner: true,
  }, credentials);
}
```

This is equivalent to calling `new S3Client(credentials).list()`.

### `S3Client.exists` (static)

To check if an S3 file exists, you can use the `S3Client.exists` static method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240"  highlight={11} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const credentials = {
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
	// endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
};

const exists = await S3Client.exists("my-file.txt", credentials);
```

The same method also works on `S3File` instances.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight=7} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { s3 } from "bun";

const s3file = s3.file("my-file.txt", {
	// ...credentials,
});

const exists = await s3file.exists();
```

### `S3Client.size` (static)

To quickly check the size of S3 file without downloading it, you can use the `S3Client.size` static method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={11} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const credentials = {
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
	// endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
};

const bytes = await S3Client.size("my-file.txt", credentials);
```

This is equivalent to calling `new S3Client(credentials).size("my-file.txt")`.

### `S3Client.stat` (static)

To get the size, etag, and other metadata of an S3 file, you can use the `S3Client.stat` static method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const credentials = {
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
	// endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
};

const stat = await S3Client.stat("my-file.txt", credentials);
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
{
  etag: "\"7a30b741503c0b461cc14157e2df4ad8\"",
  lastModified: 2025-01-07T00:19:10.000Z,
  size: 1024,
  type: "text/plain;charset=utf-8",
}
```

### `S3Client.delete` (static)

To delete an S3 file, you can use the `S3Client.delete` static method.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={10, 15} theme={"theme":{"light":"github-light","dark":"dracula"}}
import { S3Client } from "bun";

const credentials = {
	accessKeyId: "your-access-key",
	secretAccessKey: "your-secret-key",
	bucket: "my-bucket",
	// endpoint: "https://s3.us-east-1.amazonaws.com",
};

await S3Client.delete("my-file.txt", credentials);
// equivalent to
// await new S3Client(credentials).delete("my-file.txt");

// S3Client.unlink is alias of S3Client.delete
await S3Client.unlink("my-file.txt", credentials);
```

## `s3://` protocol

To make it easier to use the same code for local files and S3 files, the `s3://` protocol is supported in `fetch` and `Bun.file()`.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("s3://my-bucket/my-file.txt");
const file = Bun.file("s3://my-bucket/my-file.txt");
```

You can additionally pass `s3` options to the `fetch` and `Bun.file` functions.

```ts s3.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" highlight={2-6} theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("s3://my-bucket/my-file.txt", {
	s3: {
		accessKeyId: "your-access-key",
		secretAccessKey: "your-secret-key",
		endpoint: "https://s3.us-east-1.amazonaws.com",
	},
	headers: {
		range: "bytes=0-1023",
	},
});
```

### UTF-8, UTF-16, and BOM (byte order mark)

Like `Response` and `Blob`, `S3File` assumes UTF-8 encoding by default.

When calling one of the `text()` or `json()` methods on an `S3File`:

* When a UTF-16 byte order mark (BOM) is detected, it will be treated as UTF-16. JavaScriptCore natively supports UTF-16, so it skips the UTF-8 transcoding process (and strips the BOM). This is mostly good, but it does mean if you have invalid surrogate pairs characters in your UTF-16 string, they will be passed through to JavaScriptCore (same as source code).
* When a UTF-8 BOM is detected, it gets stripped before the string is passed to JavaScriptCore and invalid UTF-8 codepoints are replaced with the Unicode replacement character (`\uFFFD`).
* UTF-32 is not supported.

# Redis

> Use Bun's native Redis client with a Promise-based API

<Note>Bun's Redis client supports Redis server versions 7.2 and up.</Note>

Bun provides native bindings for working with Redis databases with a modern, Promise-based API. The interface is designed to be simple and performant, with built-in connection management, fully typed responses, and TLS support.

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { redis } from "bun";

// Set a key
await redis.set("greeting", "Hello from Bun!");

// Get a key
const greeting = await redis.get("greeting");
console.log(greeting); // "Hello from Bun!"

// Increment a counter
await redis.set("counter", 0);
await redis.incr("counter");

// Check if a key exists
const exists = await redis.exists("greeting");

// Delete a key
await redis.del("greeting");
```

***

## Getting Started

To use the Redis client, you first need to create a connection:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { redis, RedisClient } from "bun";

// Using the default client (reads connection info from environment)
// process.env.REDIS_URL is used by default
await redis.set("hello", "world");
const result = await redis.get("hello");

// Creating a custom client
const client = new RedisClient("redis://username:password@localhost:6379");
await client.set("counter", "0");
await client.incr("counter");
```

By default, the client reads connection information from the following environment variables (in order of precedence):

* `REDIS_URL`
* If not set, defaults to `"redis://localhost:6379"`

### Connection Lifecycle

The Redis client automatically handles connections in the background:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// No connection is made until a command is executed
const client = new RedisClient();

// First command initiates the connection
await client.set("key", "value");

// Connection remains open for subsequent commands
await client.get("key");

// Explicitly close the connection when done
client.close();
```

You can also manually control the connection lifecycle:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const client = new RedisClient();

// Explicitly connect
await client.connect();

// Run commands
await client.set("key", "value");

// Disconnect when done
client.close();
```

***

## Basic Operations

### String Operations

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Set a key
await redis.set("user:1:name", "Alice");

// Get a key
const name = await redis.get("user:1:name");

// Get a key as Uint8Array
const buffer = await redis.getBuffer("user:1:name");

// Delete a key
await redis.del("user:1:name");

// Check if a key exists
const exists = await redis.exists("user:1:name");

// Set expiration (in seconds)
await redis.set("session:123", "active");
await redis.expire("session:123", 3600); // expires in 1 hour

// Get time to live (in seconds)
const ttl = await redis.ttl("session:123");
```

### Numeric Operations

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Set initial value
await redis.set("counter", "0");

// Increment by 1
await redis.incr("counter");

// Decrement by 1
await redis.decr("counter");
```

### Hash Operations

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Set multiple fields in a hash
await redis.hmset("user:123", ["name", "Alice", "email", "alice@example.com", "active", "true"]);

// Get multiple fields from a hash
const userFields = await redis.hmget("user:123", ["name", "email"]);
console.log(userFields); // ["Alice", "alice@example.com"]

// Get single field from hash (returns value directly, null if missing)
const userName = await redis.hget("user:123", "name");
console.log(userName); // "Alice"

// Increment a numeric field in a hash
await redis.hincrby("user:123", "visits", 1);

// Increment a float field in a hash
await redis.hincrbyfloat("user:123", "score", 1.5);
```

### Set Operations

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Add member to set
await redis.sadd("tags", "javascript");

// Remove member from set
await redis.srem("tags", "javascript");

// Check if member exists in set
const isMember = await redis.sismember("tags", "javascript");

// Get all members of a set
const allTags = await redis.smembers("tags");

// Get a random member
const randomTag = await redis.srandmember("tags");

// Pop (remove and return) a random member
const poppedTag = await redis.spop("tags");
```

***

## Pub/Sub

Bun provides native bindings for the [Redis
Pub/Sub](https://redis.io/docs/latest/develop/pubsub/) protocol. **New in Bun
1.2.23**

<Warning>
  The Redis Pub/Sub feature is experimental. Although we expect it to be stable, we're currently
  actively looking for feedback and areas for improvement.
</Warning>

### Basic Usage

To get started publishing messages, you can set up a publisher in
`publisher.ts`:

```typescript publisher.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { RedisClient } from "bun";

const writer = new RedisClient("redis://localhost:6739");
await writer.connect();

writer.publish("general", "Hello everyone!");

writer.close();
```

In another file, create the subscriber in `subscriber.ts`:

```typescript subscriber.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { RedisClient } from "bun";

const listener = new RedisClient("redis://localhost:6739");
await listener.connect();

await listener.subscribe("general", (message, channel) => {
	console.log(`Received: ${message}`);
});
```

In one shell, run your subscriber:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run subscriber.ts
```

and, in another, run your publisher:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run publisher.ts
```

<Note>
  The subscription mode takes over the `RedisClient` connection. A
  client with subscriptions can only call `RedisClient.prototype.subscribe()`. In
  other words, applications which need to message Redis need a separate
  connection, acquirable through `.duplicate()`:

  ```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { RedisClient } from "bun";

  const redis = new RedisClient("redis://localhost:6379");
  await redis.connect();
  const subscriber = await redis.duplicate(); // [!code ++]

  await subscriber.subscribe("foo", () => {});
  await redis.set("bar", "baz");
  ```
</Note>

### Publishing

Publishing messages is done through the `publish()` method:

```typescript redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
await client.publish(channelName, message);
```

### Subscriptions

The Bun `RedisClient` allows you to subscribe to channels through the
`.subscribe()` method:

```typescript redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
await client.subscribe(channel, (message, channel) => {});
```

You can unsubscribe through the `.unsubscribe()` method:

```typescript redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
await client.unsubscribe(); // Unsubscribe from all channels.
await client.unsubscribe(channel); // Unsubscribe a particular channel.
await client.unsubscribe(channel, listener); // Unsubscribe a particular listener.
```

## Advanced Usage

### Command Execution and Pipelining

The client automatically pipelines commands, improving performance by sending multiple commands in a batch and processing responses as they arrive.

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Commands are automatically pipelined by default
const [infoResult, listResult] = await Promise.all([
	redis.get("user:1:name"),
	redis.get("user:2:email"),
]);
```

To disable automatic pipelining, you can set the `enableAutoPipelining` option to `false`:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const client = new RedisClient("redis://localhost:6379", {
	enableAutoPipelining: false, // [!code ++]
});
```

### Raw Commands

When you need to use commands that don't have convenience methods, you can use the `send` method:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Run any Redis command
const info = await redis.send("INFO", []);

// LPUSH to a list
await redis.send("LPUSH", ["mylist", "value1", "value2"]);

// Get list range
const list = await redis.send("LRANGE", ["mylist", "0", "-1"]);
```

The `send` method allows you to use any Redis command, even ones that don't have dedicated methods in the client. The first argument is the command name, and the second argument is an array of string arguments.

### Connection Events

You can register handlers for connection events:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const client = new RedisClient();

// Called when successfully connected to Redis server
client.onconnect = () => {
	console.log("Connected to Redis server");
};

// Called when disconnected from Redis server
client.onclose = error => {
	console.error("Disconnected from Redis server:", error);
};

// Manually connect/disconnect
await client.connect();
client.close();
```

### Connection Status and Monitoring

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Check if connected
console.log(client.connected); // boolean indicating connection status

// Check amount of data buffered (in bytes)
console.log(client.bufferedAmount);
```

### Type Conversion

The Redis client handles automatic type conversion for Redis responses:

* Integer responses are returned as JavaScript numbers
* Bulk strings are returned as JavaScript strings
* Simple strings are returned as JavaScript strings
* Null bulk strings are returned as `null`
* Array responses are returned as JavaScript arrays
* Error responses throw JavaScript errors with appropriate error codes
* Boolean responses (RESP3) are returned as JavaScript booleans
* Map responses (RESP3) are returned as JavaScript objects
* Set responses (RESP3) are returned as JavaScript arrays

Special handling for specific commands:

* `EXISTS` returns a boolean instead of a number (1 becomes true, 0 becomes false)
* `SISMEMBER` returns a boolean (1 becomes true, 0 becomes false)

The following commands disable automatic pipelining:

* `AUTH`
* `INFO`
* `QUIT`
* `EXEC`
* `MULTI`
* `WATCH`
* `SCRIPT`
* `SELECT`
* `CLUSTER`
* `DISCARD`
* `UNWATCH`
* `PIPELINE`
* `SUBSCRIBE`
* `UNSUBSCRIBE`
* `UNPSUBSCRIBE`

***

## Connection Options

When creating a client, you can pass various options to configure the connection:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const client = new RedisClient("redis://localhost:6379", {
	// Connection timeout in milliseconds (default: 10000)
	connectionTimeout: 5000,

	// Idle timeout in milliseconds (default: 0 = no timeout)
	idleTimeout: 30000,

	// Whether to automatically reconnect on disconnection (default: true)
	autoReconnect: true,

	// Maximum number of reconnection attempts (default: 10)
	maxRetries: 10,

	// Whether to queue commands when disconnected (default: true)
	enableOfflineQueue: true,

	// Whether to automatically pipeline commands (default: true)
	enableAutoPipelining: true,

	// TLS options (default: false)
	tls: true,
	// Alternatively, provide custom TLS config:
	// tls: {
	//   rejectUnauthorized: true,
	//   ca: "path/to/ca.pem",
	//   cert: "path/to/cert.pem",
	//   key: "path/to/key.pem",
	// }
});
```

### Reconnection Behavior

When a connection is lost, the client automatically attempts to reconnect with exponential backoff:

1. The client starts with a small delay (50ms) and doubles it with each attempt
2. Reconnection delay is capped at 2000ms (2 seconds)
3. The client attempts to reconnect up to `maxRetries` times (default: 10)
4. Commands executed during disconnection are:
   * Queued if `enableOfflineQueue` is true (default)
   * Rejected immediately if `enableOfflineQueue` is false

***

## Supported URL Formats

The Redis client supports various URL formats:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// Standard Redis URL
new RedisClient("redis://localhost:6379");
new RedisClient("redis://localhost:6379");

// With authentication
new RedisClient("redis://username:password@localhost:6379");

// With database number
new RedisClient("redis://localhost:6379/0");

// TLS connections
new RedisClient("rediss://localhost:6379");
new RedisClient("rediss://localhost:6379");
new RedisClient("redis+tls://localhost:6379");
new RedisClient("redis+tls://localhost:6379");

// Unix socket connections
new RedisClient("redis+unix:///path/to/socket");
new RedisClient("redis+unix:///path/to/socket");

// TLS over Unix socket
new RedisClient("redis+tls+unix:///path/to/socket");
new RedisClient("redis+tls+unix:///path/to/socket");
```

***

## Error Handling

The Redis client throws typed errors for different scenarios:

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
try {
	await redis.get("non-existent-key");
} catch (error) {
	if (error.code === "ERR_REDIS_CONNECTION_CLOSED") {
		console.error("Connection to Redis server was closed");
	} else if (error.code === "ERR_REDIS_AUTHENTICATION_FAILED") {
		console.error("Authentication failed");
	} else {
		console.error("Unexpected error:", error);
	}
}
```

Common error codes:

* `ERR_REDIS_CONNECTION_CLOSED` - Connection to the server was closed
* `ERR_REDIS_AUTHENTICATION_FAILED` - Failed to authenticate with the server
* `ERR_REDIS_INVALID_RESPONSE` - Received an invalid response from the server

***

## Example Use Cases

### Caching

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
async function getUserWithCache(userId) {
	const cacheKey = `user:${userId}`;

	// Try to get from cache first
	const cachedUser = await redis.get(cacheKey);
	if (cachedUser) {
		return JSON.parse(cachedUser);
	}

	// Not in cache, fetch from database
	const user = await database.getUser(userId);

	// Store in cache for 1 hour
	await redis.set(cacheKey, JSON.stringify(user));
	await redis.expire(cacheKey, 3600);

	return user;
}
```

### Rate Limiting

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
async function rateLimit(ip, limit = 100, windowSecs = 3600) {
	const key = `ratelimit:${ip}`;

	// Increment counter
	const count = await redis.incr(key);

	// Set expiry if this is the first request in window
	if (count === 1) {
		await redis.expire(key, windowSecs);
	}

	// Check if limit exceeded
	return {
		limited: count > limit,
		remaining: Math.max(0, limit - count),
	};
}
```

### Session Storage

```ts redis.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
async function createSession(userId, data) {
	const sessionId = crypto.randomUUID();
	const key = `session:${sessionId}`;

	// Store session with expiration
	await redis.hmset(key, [
		"userId",
		userId.toString(),
		"created",
		Date.now().toString(),
		"data",
		JSON.stringify(data),
	]);
	await redis.expire(key, 86400); // 24 hours

	return sessionId;
}

async function getSession(sessionId) {
	const key = `session:${sessionId}`;

	// Get session data
	const exists = await redis.exists(key);
	if (!exists) return null;

	const [userId, created, data] = await redis.hmget(key, ["userId", "created", "data"]);

	return {
		userId: Number(userId),
		created: Number(created),
		data: JSON.parse(data),
	};
}
```

***

## Implementation Notes

Bun's Redis client is implemented in Zig and uses the Redis Serialization Protocol (RESP3). It manages connections efficiently and provides automatic reconnection with exponential backoff.

The client supports pipelining commands, meaning multiple commands can be sent without waiting for the replies to previous commands. This significantly improves performance when sending multiple commands in succession.

## Limitations and Future Plans

Current limitations of the Redis client we are planning to address in future versions:

* Transactions (MULTI/EXEC) must be done through raw commands for now

Unsupported features:

* Redis Sentinel
* Redis Cluster





