
# Server

> Use `Bun.serve` to start a high-performance HTTP server in Bun

## Basic Setup

```ts title="index.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	// `routes` requires Bun v1.2.3+
	routes: {
		// Static routes
		"/api/status": new Response("OK"),

		// Dynamic routes
		"/users/:id": req => {
			return new Response(`Hello User ${req.params.id}!`);
		},

		// Per-HTTP method handlers
		"/api/posts": {
			GET: () => new Response("List posts"),
			POST: async req => {
				const body = await req.json();
				return Response.json({ created: true, ...body });
			},
		},

		// Wildcard route for all routes that start with "/api/" and aren't otherwise matched
		"/api/*": Response.json({ message: "Not found" }, { status: 404 }),

		// Redirect from /blog/hello to /blog/hello/world
		"/blog/hello": Response.redirect("/blog/hello/world"),

		// Serve a file by buffering it in memory
		"/favicon.ico": new Response(await Bun.file("./favicon.ico").bytes(), {
			headers: {
				"Content-Type": "image/x-icon",
			},
		}),
	},

	// (optional) fallback for unmatched routes:
	// Required if Bun's version < 1.2.3
	fetch(req) {
		return new Response("Not Found", { status: 404 });
	},
});

console.log(`Server running at ${server.url}`);
```

***

## HTML imports

Bun supports importing HTML files directly into your server code, enabling full-stack applications with both server-side and client-side code. HTML imports work in two modes:

**Development (`bun --hot`):** Assets are bundled on-demand at runtime, enabling hot module replacement (HMR) for a fast, iterative development experience. When you change your frontend code, the browser automatically updates without a full page reload.

**Production (`bun build`):** When building with `bun build --target=bun`, the `import index from "./index.html"` statement resolves to a pre-built manifest object containing all bundled client assets. `Bun.serve` consumes this manifest to serve optimized assets with zero runtime bundling overhead. This is ideal for deploying to production.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import myReactSinglePageApp from "./index.html";

Bun.serve({
	routes: {
		"/": myReactSinglePageApp,
	},
});
```

HTML imports don't just serve HTML — it's a full-featured frontend bundler, transpiler, and toolkit built using Bun's [bundler](/bundler), JavaScript transpiler and CSS parser. You can use this to build full-featured frontends with React, TypeScript, Tailwind CSS, and more.

For a complete guide on building full-stack applications with HTML imports, including detailed examples and best practices, see [/docs/bundler/fullstack](/bundler/fullstack).

***

## Configuration

### Changing the `port` and `hostname`

To configure which port and hostname the server will listen on, set `port` and `hostname` in the options object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	port: 8080, // defaults to $BUN_PORT, $PORT, $NODE_PORT otherwise 3000 // [!code ++]
	hostname: "mydomain.com", // defaults to "0.0.0.0" // [!code ++]
	fetch(req) {
		return new Response("404!");
	},
});
```

To randomly select an available port, set `port` to `0`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	port: 0, // random port // [!code ++]
	fetch(req) {
		return new Response("404!");
	},
});

// server.port is the randomly selected port
console.log(server.port);
```

You can view the chosen port by accessing the `port` property on the server object, or by accessing the `url` property.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(server.port); // 3000
console.log(server.url); // http://localhost:3000
```

### Configuring a default port

Bun supports several options and environment variables to configure the default port. The default port is used when the `port` option is not set.

* `--port` CLI flag

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --port=4002 server.ts
```

* `BUN_PORT` environment variable

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun_PORT=4002 bun server.ts
```

* `PORT` environment variable

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
PORT=4002 bun server.ts
```

* `NODE_PORT` environment variable

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
NODE_PORT=4002 bun server.ts
```

***

## Unix domain sockets

To listen on a [unix domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket), pass the `unix` option with the path to the socket.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	unix: "/tmp/my-socket.sock", // path to socket
	fetch(req) {
		return new Response(`404!`);
	},
});
```

### Abstract namespace sockets

Bun supports Linux abstract namespace sockets. To use an abstract namespace socket, prefix the `unix` path with a null byte.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	unix: "\0my-abstract-socket", // abstract namespace socket
	fetch(req) {
		return new Response(`404!`);
	},
});
```

Unlike unix domain sockets, abstract namespace sockets are not bound to the filesystem and are automatically removed when the last reference to the socket is closed.

***

## idleTimeout

To configure the idle timeout, set the `idleTimeout` field in Bun.serve.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	// 10 seconds:
	idleTimeout: 10,

	fetch(req) {
		return new Response("Bun!");
	},
});
```

This is the maximum amount of time a connection is allowed to be idle before the server closes it. A connection is idling if there is no data sent or received.

***

## export default syntax

Thus far, the examples on this page have used the explicit `Bun.serve` API. Bun also supports an alternate syntax.

```ts server.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
import { type Serve } from "bun";

export default {
	fetch(req) {
		return new Response("Bun!");
	},
} satisfies Serve;
```

Instead of passing the server options into `Bun.serve`, `export default` it. This file can be executed as-is; when Bun sees a file with a `default` export containing a `fetch` handler, it passes it into `Bun.serve` under the hood.

***

## Hot Route Reloading

Update routes without server restarts using `server.reload()`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	routes: {
		"/api/version": () => Response.json({ version: "1.0.0" }),
	},
});

// Deploy new routes without downtime
server.reload({
	routes: {
		"/api/version": () => Response.json({ version: "2.0.0" }),
	},
});
```

***

## Server Lifecycle Methods

### `server.stop()`

To stop the server from accepting new connections:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	fetch(req) {
		return new Response("Hello!");
	},
});

// Gracefully stop the server (waits for in-flight requests)
await server.stop();

// Force stop and close all active connections
await server.stop(true);
```

By default, `stop()` allows in-flight requests and WebSocket connections to complete. Pass `true` to immediately terminate all connections.

### `server.ref()` and `server.unref()`

Control whether the server keeps the Bun process alive:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Don't keep process alive if server is the only thing running
server.unref();

// Restore default behavior - keep process alive
server.ref();
```

### `server.reload()`

Update the server's handlers without restarting:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	routes: {
		"/api/version": Response.json({ version: "v1" }),
	},
	fetch(req) {
		return new Response("v1");
	},
});

// Update to new handler
server.reload({
	routes: {
		"/api/version": Response.json({ version: "v2" }),
	},
	fetch(req) {
		return new Response("v2");
	},
});
```

This is useful for development and hot reloading. Only `fetch`, `error`, and `routes` can be updated.

***

## Per-Request Controls

### `server.timeout(Request, seconds)`

Set a custom idle timeout for individual requests:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	async fetch(req, server) {
		// Set 60 second timeout for this request
		server.timeout(req, 60);

		// If they take longer than 60 seconds to send the body, the request will be aborted
		await req.text();

		return new Response("Done!");
	},
});
```

Pass `0` to disable the timeout for a request.

### `server.requestIP(Request)`

Get client IP and port information:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	fetch(req, server) {
		const address = server.requestIP(req);
		if (address) {
			return new Response(`Client IP: ${address.address}, Port: ${address.port}`);
		}
		return new Response("Unknown client");
	},
});
```

Returns `null` for closed requests or Unix domain sockets.

***

## Server Metrics

### `server.pendingRequests` and `server.pendingWebSockets`

Monitor server activity with built-in counters:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	fetch(req, server) {
		return new Response(
			`Active requests: ${server.pendingRequests}\n` +
				`Active WebSockets: ${server.pendingWebSockets}`,
		);
	},
});
```

### `server.subscriberCount(topic)`

Get count of subscribers for a WebSocket topic:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	fetch(req, server) {
		const chatUsers = server.subscriberCount("chat");
		return new Response(`${chatUsers} users in chat`);
	},
	websocket: {
		message(ws) {
			ws.subscribe("chat");
		},
	},
});
```

***

## Benchmarks

Below are Bun and Node.js implementations of a simple HTTP server that responds `Bun!` to each incoming `Request`.

```ts Bun theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req: Request) {
		return new Response("Bun!");
	},
	port: 3000,
});
```

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
require("http")
	.createServer((req, res) => res.end("Bun!"))
	.listen(8080);
```

The `Bun.serve` server can handle roughly 2.5x more requests per second than Node.js on Linux.

| Runtime | Requests per second |
| ------- | ------------------- |
| Node 16 | \~64,000            |
| Bun     | \~160,000           |

<Frame>
  ![image](https://user-images.githubusercontent.com/709451/162389032-fc302444-9d03-46be-ba87-c12bd8ce89a0.png)
</Frame>

***

## Practical example: REST API

Here's a basic database-backed REST API using Bun's router with zero dependencies:

<CodeGroup>
  ```ts server.ts expandable icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
  import type { Post } from "./types.ts";
  import { Database } from "bun:sqlite";

  const db = new Database("posts.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  Bun.serve({
  	routes: {
  		// List posts
  		"/api/posts": {
  			GET: () => {
  				const posts = db.query("SELECT * FROM posts").all();
  				return Response.json(posts);
  			},

  			// Create post
  			POST: async req => {
  				const post: Omit<Post, "id" | "created_at"> = await req.json();
  				const id = crypto.randomUUID();

  				db.query(
  					`INSERT INTO posts (id, title, content, created_at)
             VALUES (?, ?, ?, ?)`,
  				).run(id, post.title, post.content, new Date().toISOString());

  				return Response.json({ id, ...post }, { status: 201 });
  			},
  		},

  		// Get post by ID
  		"/api/posts/:id": req => {
  			const post = db.query("SELECT * FROM posts WHERE id = ?").get(req.params.id);

  			if (!post) {
  				return new Response("Not Found", { status: 404 });
  			}

  			return Response.json(post);
  		},
  	},

  	error(error) {
  		console.error(error);
  		return new Response("Internal Server Error", { status: 500 });
  	},
  });
  ```

  ```ts types.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  export interface Post {
  	id: string;
  	title: string;
  	content: string;
  	created_at: string;
  }
  ```
</CodeGroup>

***

## Reference

```ts expandable See TypeScript Definitions theme={"theme":{"light":"github-light","dark":"dracula"}}
interface Server extends Disposable {
	/**
	 * Stop the server from accepting new connections.
	 * @param closeActiveConnections If true, immediately terminates all connections
	 * @returns Promise that resolves when the server has stopped
	 */
	stop(closeActiveConnections?: boolean): Promise<void>;

	/**
	 * Update handlers without restarting the server.
	 * Only fetch and error handlers can be updated.
	 */
	reload(options: Serve): void;

	/**
	 * Make a request to the running server.
	 * Useful for testing or internal routing.
	 */
	fetch(request: Request | string): Response | Promise<Response>;

	/**
	 * Upgrade an HTTP request to a WebSocket connection.
	 * @returns true if upgrade successful, false if failed
	 */
	upgrade<T = undefined>(
		request: Request,
		options?: {
			headers?: Bun.HeadersInit;
			data?: T;
		},
	): boolean;

	/**
	 * Publish a message to all WebSocket clients subscribed to a topic.
	 * @returns Bytes sent, 0 if dropped, -1 if backpressure applied
	 */
	publish(
		topic: string,
		data: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer,
		compress?: boolean,
	): ServerWebSocketSendStatus;

	/**
	 * Get count of WebSocket clients subscribed to a topic.
	 */
	subscriberCount(topic: string): number;

	/**
	 * Get client IP address and port.
	 * @returns null for closed requests or Unix sockets
	 */
	requestIP(request: Request): SocketAddress | null;

	/**
	 * Set custom idle timeout for a request.
	 * @param seconds Timeout in seconds, 0 to disable
	 */
	timeout(request: Request, seconds: number): void;

	/**
	 * Keep process alive while server is running.
	 */
	ref(): void;

	/**
	 * Allow process to exit if server is only thing running.
	 */
	unref(): void;

	/** Number of in-flight HTTP requests */
	readonly pendingRequests: number;

	/** Number of active WebSocket connections */
	readonly pendingWebSockets: number;

	/** Server URL including protocol, hostname and port */
	readonly url: URL;

	/** Port server is listening on */
	readonly port: number;

	/** Hostname server is bound to */
	readonly hostname: string;

	/** Whether server is in development mode */
	readonly development: boolean;

	/** Server instance identifier */
	readonly id: string;
}

interface WebSocketHandler<T = undefined> {
	/** Maximum WebSocket message size in bytes */
	maxPayloadLength?: number;

	/** Bytes of queued messages before applying backpressure */
	backpressureLimit?: number;

	/** Whether to close connection when backpressure limit hit */
	closeOnBackpressureLimit?: boolean;

	/** Called when backpressure is relieved */
	drain?(ws: ServerWebSocket<T>): void | Promise<void>;

	/** Seconds before idle timeout */
	idleTimeout?: number;

	/** Enable per-message deflate compression */
	perMessageDeflate?:
		| boolean
		| {
				compress?: WebSocketCompressor | boolean;
				decompress?: WebSocketCompressor | boolean;
		  };

	/** Send ping frames to keep connection alive */
	sendPings?: boolean;

	/** Whether server receives its own published messages */
	publishToSelf?: boolean;

	/** Called when connection opened */
	open?(ws: ServerWebSocket<T>): void | Promise<void>;

	/** Called when message received */
	message(ws: ServerWebSocket<T>, message: string | Buffer): void | Promise<void>;

	/** Called when connection closed */
	close?(ws: ServerWebSocket<T>, code: number, reason: string): void | Promise<void>;

	/** Called when ping frame received */
	ping?(ws: ServerWebSocket<T>, data: Buffer): void | Promise<void>;

	/** Called when pong frame received */
	pong?(ws: ServerWebSocket<T>, data: Buffer): void | Promise<void>;
}

interface TLSOptions {
	/** Certificate authority chain */
	ca?: string | Buffer | BunFile | Array<string | Buffer | BunFile>;

	/** Server certificate */
	cert?: string | Buffer | BunFile | Array<string | Buffer | BunFile>;

	/** Path to DH parameters file */
	dhParamsFile?: string;

	/** Private key */
	key?: string | Buffer | BunFile | Array<string | Buffer | BunFile>;

	/** Reduce TLS memory usage */
	lowMemoryMode?: boolean;

	/** Private key passphrase */
	passphrase?: string;

	/** OpenSSL options flags */
	secureOptions?: number;

	/** Server name for SNI */
	serverName?: string;
}
```

# Routing

> Define routes in `Bun.serve` using static paths, parameters, and wildcards

You can add routes to `Bun.serve()` by using the `routes` property (for static paths, parameters, and wildcards) or by handling unmatched requests with the [`fetch`](#fetch) method.

`Bun.serve()`'s router builds on top uWebSocket's [tree-based approach](https://github.com/oven-sh/bun/blob/0d1a00fa0f7830f8ecd99c027fce8096c9d459b6/packages/bun-uws/src/HttpRouter.h#L57-L64) to add [SIMD-accelerated route parameter decoding](https://github.com/oven-sh/bun/blob/main/src/bun.js/bindings/decodeURIComponentSIMD.cpp#L21-L271) and [JavaScriptCore structure caching](https://github.com/oven-sh/bun/blob/main/src/bun.js/bindings/ServerRouteList.cpp#L100-L101) to push the performance limits of what modern hardware allows.

## Basic Setup

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		"/": () => new Response("Home"),
		"/api": () => Response.json({ success: true }),
		"/users": async () => Response.json({ users: [] }),
	},
	fetch() {
		return new Response("Unmatched route");
	},
});
```

Routes in `Bun.serve()` receive a `BunRequest` (which extends [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)) and return a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) or `Promise<Response>`. This makes it easier to use the same code for both sending & receiving HTTP requests.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Simplified for brevity
interface BunRequest<T extends string> extends Request {
	params: Record<T, string>;
	readonly cookies: CookieMap;
}
```

## Asynchronous Routes

### Async/await

You can use async/await in route handlers to return a `Promise<Response>`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { sql, serve } from "bun";

serve({
	port: 3001,
	routes: {
		"/api/version": async () => {
			const [version] = await sql`SELECT version()`;
			return Response.json(version);
		},
	},
});
```

### Promise

You can also return a `Promise<Response>` from a route handler.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { sql, serve } from "bun";

serve({
	routes: {
		"/api/version": () => {
			return new Promise(resolve => {
				setTimeout(async () => {
					const [version] = await sql`SELECT version()`;
					resolve(Response.json(version));
				}, 100);
			});
		},
	},
});
```

***

## Route precedence

Routes are matched in order of specificity:

1. Exact routes (`/users/all`)
2. Parameter routes (`/users/:id`)
3. Wildcard routes (`/users/*`)
4. Global catch-all (`/*`)

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		// Most specific first
		"/api/users/me": () => new Response("Current user"),
		"/api/users/:id": req => new Response(`User ${req.params.id}`),
		"/api/*": () => new Response("API catch-all"),
		"/*": () => new Response("Global catch-all"),
	},
});
```

***

## Type-safe route parameters

TypeScript parses route parameters when passed as a string literal, so that your editor will show autocomplete when accessing `request.params`.

```ts title="index.ts" theme={"theme":{"light":"github-light","dark":"dracula"}}
import type { BunRequest } from "bun";

Bun.serve({
	routes: {
		// TypeScript knows the shape of params when passed as a string literal
		"/orgs/:orgId/repos/:repoId": req => {
			const { orgId, repoId } = req.params;
			return Response.json({ orgId, repoId });
		},

		"/orgs/:orgId/repos/:repoId/settings": (
			// optional: you can explicitly pass a type to BunRequest:
			req: BunRequest<"/orgs/:orgId/repos/:repoId/settings">,
		) => {
			const { orgId, repoId } = req.params;
			return Response.json({ orgId, repoId });
		},
	},
});
```

Percent-encoded route parameter values are automatically decoded. Unicode characters are supported. Invalid unicode is replaced with the unicode replacement character `&0xFFFD;`.

### Static responses

Routes can also be `Response` objects (without the handler function). Bun.serve() optimizes it for zero-allocation dispatch - perfect for health checks, redirects, and fixed content:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		// Health checks
		"/health": new Response("OK"),
		"/ready": new Response("Ready", {
			headers: {
				// Pass custom headers
				"X-Ready": "1",
			},
		}),

		// Redirects
		"/blog": Response.redirect("https://bun.com/blog"),

		// API responses
		"/api/config": Response.json({
			version: "1.0.0",
			env: "production",
		}),
	},
});
```

Static responses do not allocate additional memory after initialization. You can generally expect at least a 15% performance improvement over manually returning a `Response` object.

Static route responses are cached for the lifetime of the server object. To reload static routes, call `server.reload(options)`.

### File Responses vs Static Responses

When serving files in routes, there are two distinct behaviors depending on whether you buffer the file content or serve it directly:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		// Static route - content is buffered in memory at startup
		"/logo.png": new Response(await Bun.file("./logo.png").bytes()),

		// File route - content is read from filesystem on each request
		"/download.zip": new Response(Bun.file("./download.zip")),
	},
});
```

**Static routes** (`new Response(await file.bytes())`) buffer content in memory at startup:

* **Zero filesystem I/O** during requests - content served entirely from memory
* **ETag support** - Automatically generates and validates ETags for caching
* **If-None-Match** - Returns `304 Not Modified` when client ETag matches
* **No 404 handling** - Missing files cause startup errors, not runtime 404s
* **Memory usage** - Full file content stored in RAM
* **Best for**: Small static assets, API responses, frequently accessed files

**File routes** (`new Response(Bun.file(path))`) read from filesystem per request:

* **Filesystem reads** on each request - checks file existence and reads content
* **Built-in 404 handling** - Returns `404 Not Found` if file doesn't exist or becomes inaccessible
* **Last-Modified support** - Uses file modification time for `If-Modified-Since` headers
* **If-Modified-Since** - Returns `304 Not Modified` when file hasn't changed since client's cached version
* **Range request support** - Automatically handles partial content requests with `Content-Range` headers
* **Streaming transfers** - Uses buffered reader with backpressure handling for efficient memory usage
* **Memory efficient** - Only buffers small chunks during transfer, not entire file
* **Best for**: Large files, dynamic content, user uploads, files that change frequently

***

## Streaming files

To stream a file, return a `Response` object with a `BunFile` object as the body.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req) {
		return new Response(Bun.file("./hello.txt"));
	},
});
```

<Info>
  ⚡️ **Speed** — Bun automatically uses the
  [`sendfile(2)`](https://man7.org/linux/man-pages/man2/sendfile.2.html) system call when possible,
  enabling zero-copy file transfers in the kernel—the fastest way to send files.
</Info>

You can send part of a file using the [`slice(start, end)`](https://developer.mozilla.org/en-US/docs/Web/API/Blob/slice) method on the `Bun.file` object. This automatically sets the `Content-Range` and `Content-Length` headers on the `Response` object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req) {
		// parse `Range` header
		const [start = 0, end = Infinity] = req.headers
			.get("Range") // Range: bytes=0-100
			.split("=") // ["Range: bytes", "0-100"]
			.at(-1) // "0-100"
			.split("-") // ["0", "100"]
			.map(Number); // [0, 100]

		// return a slice of the file
		const bigFile = Bun.file("./big-video.mp4");
		return new Response(bigFile.slice(start, end));
	},
});
```

***

## `fetch` request handler

The `fetch` handler handles incoming requests that weren't matched by any route. It receives a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object and returns a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) or [`Promise<Response>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req) {
		const url = new URL(req.url);
		if (url.pathname === "/") return new Response("Home page!");
		if (url.pathname === "/blog") return new Response("Blog!");
		return new Response("404!");
	},
});
```

The `fetch` handler supports async/await:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { sleep, serve } from "bun";

serve({
	async fetch(req) {
		const start = performance.now();
		await sleep(10);
		const end = performance.now();
		return new Response(`Slept for ${end - start}ms`);
	},
});
```

Promise-based responses are also supported:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req) {
		// Forward the request to another server.
		return fetch("https://example.com");
	},
});
```

You can also access the `Server` object from the `fetch` handler. It's the second argument passed to the `fetch` function.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// `server` is passed in as the second argument to `fetch`.
const server = Bun.serve({
	fetch(req, server) {
		const ip = server.requestIP(req);
		return new Response(`Your IP is ${ip}`);
	},
});
```

# Cookies

> Work with cookies in HTTP requests and responses using Bun's built-in Cookie API.

Bun provides a built-in API for working with cookies in HTTP requests and responses. The `BunRequest` object includes a `cookies` property that provides a `CookieMap` for easily accessing and manipulating cookies. When using `routes`, `Bun.serve()` automatically tracks `request.cookies.set` and applies them to the response.

## Reading cookies

Read cookies from incoming requests using the `cookies` property on the `BunRequest` object:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		"/profile": req => {
			// Access cookies from the request
			const userId = req.cookies.get("user_id");
			const theme = req.cookies.get("theme") || "light";

			return Response.json({
				userId,
				theme,
				message: "Profile page",
			});
		},
	},
});
```

## Setting cookies

To set cookies, use the `set` method on the `CookieMap` from the `BunRequest` object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		"/login": req => {
			const cookies = req.cookies;

			// Set a cookie with various options
			cookies.set("user_id", "12345", {
				maxAge: 60 * 60 * 24 * 7, // 1 week
				httpOnly: true,
				secure: true,
				path: "/",
			});

			// Add a theme preference cookie
			cookies.set("theme", "dark");

			// Modified cookies from the request are automatically applied to the response
			return new Response("Login successful");
		},
	},
});
```

`Bun.serve()` automatically tracks modified cookies from the request and applies them to the response.

## Deleting cookies

To delete a cookie, use the `delete` method on the `request.cookies` (`CookieMap`) object:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	routes: {
		"/logout": req => {
			// Delete the user_id cookie
			req.cookies.delete("user_id", {
				path: "/",
			});

			return new Response("Logged out successfully");
		},
	},
});
```

Deleted cookies become a `Set-Cookie` header on the response with the `maxAge` set to `0` and an empty `value`.

# TLS

> Enable TLS in Bun.serve

Bun supports TLS out of the box, powered by [BoringSSL](https://boringssl.googlesource.com/boringssl). Enable TLS by passing in a value for `key` and `cert`; both are required to enable TLS.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	tls: {
		key: Bun.file("./key.pem"), // [!code ++]
		cert: Bun.file("./cert.pem"), // [!code ++]
	},
});
```

The `key` and `cert` fields expect the *contents* of your TLS key and certificate, *not a path to it*. This can be a string, `BunFile`, `TypedArray`, or `Buffer`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	tls: {
		key: Bun.file("./key.pem"), // BunFile
		key: fs.readFileSync("./key.pem"), // Buffer
		key: fs.readFileSync("./key.pem", "utf8"), // string
		key: [Bun.file("./key1.pem"), Bun.file("./key2.pem")], // array of above
	},
});
```

### Passphrase

If your private key is encrypted with a passphrase, provide a value for `passphrase` to decrypt it.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	tls: {
		key: Bun.file("./key.pem"),
		cert: Bun.file("./cert.pem"),
		passphrase: "my-secret-passphrase", // [!code ++]
	},
});
```

### CA Certificates

Optionally, you can override the trusted CA certificates by passing a value for `ca`. By default, the server will trust the list of well-known CAs curated by Mozilla. When `ca` is specified, the Mozilla list is overwritten.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	tls: {
		key: Bun.file("./key.pem"), // path to TLS key
		cert: Bun.file("./cert.pem"), // path to TLS cert
		ca: Bun.file("./ca.pem"), // path to root CA certificate  // [!code ++]
	},
});
```

### Diffie-Hellman

To override Diffie-Hellman parameters:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	tls: {
		dhParamsFile: "/path/to/dhparams.pem", // path to Diffie Hellman parameters // [!code ++]
	},
});
```

***

## Server name indication (SNI)

To configure the server name indication (SNI) for the server, set the `serverName` field in the `tls` object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	tls: {
		serverName: "my-server.com", // SNI // [!code ++]
	},
});
```

To allow multiple server names, pass an array of objects to `tls`, each with a `serverName` field.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	tls: [
		{
			key: Bun.file("./key1.pem"),
			cert: Bun.file("./cert1.pem"),
			serverName: "my-server1.com", // [!code ++]
		},
		{
			key: Bun.file("./key2.pem"),
			cert: Bun.file("./cert2.pem"),
			serverName: "my-server2.com", // [!code ++]
		},
	],
});
```

# Error Handling

> Learn how to handle errors in Bun's development server

To activate development mode, set `development: true`.

```ts title="server.ts" icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	development: true, // [!code ++]
	fetch(req) {
		throw new Error("woops!");
	},
});
```

In development mode, Bun will surface errors in-browser with a built-in error page.

<Frame><img src="https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/exception_page.png?fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=26f9bec162e97288f1f0d736773b2b6e" alt="Bun's built-in 500 page" data-og-width="800" width="800" data-og-height="579" height="579" data-path="images/exception_page.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/exception_page.png?w=280&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=77f5e65f2bd86c0c9f8aa548169764f6 280w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/exception_page.png?w=560&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=87988ad4288c5a0a06214ef0d7687f87 560w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/exception_page.png?w=840&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=5c605029819509b6e1dbba7ff684ef4f 840w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/exception_page.png?w=1100&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=5b1da6d3ac8b8583e9869385c0c9a8eb 1100w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/exception_page.png?w=1650&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=32e2a5d5903287da38118ea5016c44e1 1650w, https://mintcdn.com/bun-1dd33a4e/PY1574V41bdK8wNs/images/exception_page.png?w=2500&fit=max&auto=format&n=PY1574V41bdK8wNs&q=85&s=5015e6ff9569ae31243c6214021cd9f6 2500w" /></Frame>

### `error` callback

To handle server-side errors, implement an `error` handler. This function should return a `Response` to serve to the client when an error occurs. This response will supersede Bun's default error page in `development` mode.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req) {
		throw new Error("woops!");
	},
	error(error) {
		return new Response(`<pre>${error}\n${error.stack}</pre>`, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	},
});
```

<Info>[Learn more about debugging in Bun](/runtime/debugger)</Info>

# Metrics

> Monitor server activity with built-in metrics

### `server.pendingRequests` and `server.pendingWebSockets`

Monitor server activity with built-in counters:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	fetch(req, server) {
		return new Response(
			`Active requests: ${server.pendingRequests}\n` +
				`Active WebSockets: ${server.pendingWebSockets}`,
		);
	},
});
```

### `server.subscriberCount(topic)`

Get count of subscribers for a WebSocket topic:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	fetch(req, server) {
		const chatUsers = server.subscriberCount("chat");
		return new Response(`${chatUsers} users in chat`);
	},
	websocket: {
		message(ws) {
			ws.subscribe("chat");
		},
	},
});
```


