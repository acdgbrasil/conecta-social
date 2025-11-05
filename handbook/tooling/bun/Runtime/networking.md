# Fetch

> Send HTTP requests with Bun's fetch API

Bun implements the WHATWG `fetch` standard, with some extensions to meet the needs of server-side JavaScript.

Bun also implements `node:http`, but `fetch` is generally recommended instead.

## Sending an HTTP request

To send an HTTP request, use `fetch`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com");

console.log(response.status); // => 200

const text = await response.text(); // or response.json(), response.formData(), etc.
```

`fetch` also works with HTTPS URLs.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("https://example.com");
```

You can also pass `fetch` a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const request = new Request("http://example.com", {
	method: "POST",
	body: "Hello, world!",
});

const response = await fetch(request);
```

### Sending a POST request

To send a POST request, pass an object with the `method` property set to `"POST"`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com", {
	method: "POST",
	body: "Hello, world!",
});
```

`body` can be a string, a `FormData` object, an `ArrayBuffer`, a `Blob`, and more. See the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#setting_a_body) for more information.

### Proxying requests

To proxy a request, pass an object with the `proxy` property set to a URL.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com", {
	proxy: "http://proxy.com",
});
```

### Custom headers

To set custom headers, pass an object with the `headers` property set to an object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com", {
	headers: {
		"X-Custom-Header": "value",
	},
});
```

You can also set headers using the [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const headers = new Headers();
headers.append("X-Custom-Header", "value");

const response = await fetch("http://example.com", {
	headers,
});
```

### Response bodies

To read the response body, use one of the following methods:

* `response.text(): Promise<string>`: Returns a promise that resolves with the response body as a string.
* `response.json(): Promise<any>`: Returns a promise that resolves with the response body as a JSON object.
* `response.formData(): Promise<FormData>`: Returns a promise that resolves with the response body as a `FormData` object.
* `response.bytes(): Promise<Uint8Array>`: Returns a promise that resolves with the response body as a `Uint8Array`.
* `response.arrayBuffer(): Promise<ArrayBuffer>`: Returns a promise that resolves with the response body as an `ArrayBuffer`.
* `response.blob(): Promise<Blob>`: Returns a promise that resolves with the response body as a `Blob`.

#### Streaming response bodies

You can use async iterators to stream the response body.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com");

for await (const chunk of response.body) {
	console.log(chunk);
}
```

You can also more directly access the `ReadableStream` object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com");

const stream = response.body;

const reader = stream.getReader();
const { value, done } = await reader.read();
```

### Streaming request bodies

You can also stream data in request bodies using a `ReadableStream`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const stream = new ReadableStream({
	start(controller) {
		controller.enqueue("Hello");
		controller.enqueue(" ");
		controller.enqueue("World");
		controller.close();
	},
});

const response = await fetch("http://example.com", {
	method: "POST",
	body: stream,
});
```

When using streams with HTTP(S):

* The data is streamed directly to the network without buffering the entire body in memory
* If the connection is lost, the stream will be canceled
* The `Content-Length` header is not automatically set unless the stream has a known size

When using streams with S3:

* For PUT/POST requests, Bun automatically uses multipart upload
* The stream is consumed in chunks and uploaded in parallel
* Progress can be monitored through the S3 options

### Fetching a URL with a timeout

To fetch a URL with a timeout, use `AbortSignal.timeout`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com", {
	signal: AbortSignal.timeout(1000),
});
```

#### Canceling a request

To cancel a request, use an `AbortController`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const controller = new AbortController();

const response = await fetch("http://example.com", {
	signal: controller.signal,
});

controller.abort();
```

### Unix domain sockets

To fetch a URL using a Unix domain socket, use the `unix: string` option:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("https://hostname/a/path", {
	unix: "/var/run/path/to/unix.sock",
	method: "POST",
	body: JSON.stringify({ message: "Hello from Bun!" }),
	headers: {
		"Content-Type": "application/json",
	},
});
```

### TLS

To use a client certificate, use the `tls` option:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await fetch("https://example.com", {
	tls: {
		key: Bun.file("/path/to/key.pem"),
		cert: Bun.file("/path/to/cert.pem"),
		// ca: [Bun.file("/path/to/ca.pem")],
	},
});
```

#### Custom TLS Validation

To customize the TLS validation, use the `checkServerIdentity` option in `tls`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await fetch("https://example.com", {
	tls: {
		checkServerIdentity: (hostname, peerCertificate) => {
			// Return an Error if the certificate is invalid
		},
	},
});
```

This is similar to how it works in Node's `net` module.

#### Disable TLS validation

To disable TLS validation, set `rejectUnauthorized` to `false`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await fetch("https://example.com", {
	tls: {
		rejectUnauthorized: false,
	},
});
```

This is especially useful to avoid SSL errors when using self-signed certificates, but this disables TLS validation and should be used with caution.

### Request options

In addition to the standard fetch options, Bun provides several extensions:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com", {
	// Control automatic response decompression (default: true)
	// Supports gzip, deflate, brotli (br), and zstd
	decompress: true,

	// Disable connection reuse for this request
	keepalive: false,

	// Debug logging level
	verbose: true, // or "curl" for more detailed output
});
```

### Protocol support

Beyond HTTP(S), Bun's fetch supports several additional protocols:

#### S3 URLs - `s3://`

Bun supports fetching from S3 buckets directly.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Using environment variables for credentials
const response = await fetch("s3://my-bucket/path/to/object");

// Or passing credentials explicitly
const response = await fetch("s3://my-bucket/path/to/object", {
	s3: {
		accessKeyId: "YOUR_ACCESS_KEY",
		secretAccessKey: "YOUR_SECRET_KEY",
		region: "us-east-1",
	},
});
```

Note: Only PUT and POST methods support request bodies when using S3. For uploads, Bun automatically uses multipart upload for streaming bodies.

You can read more about Bun's S3 support in the [S3](/runtime/s3) documentation.

#### File URLs - `file://`

You can fetch local files using the `file:` protocol:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("file:///path/to/file.txt");
const text = await response.text();
```

On Windows, paths are automatically normalized:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Both work on Windows
const response = await fetch("file:///C:/path/to/file.txt");
const response2 = await fetch("file:///c:/path\\to/file.txt");
```

#### Data URLs - `data:`

Bun supports the `data:` URL scheme:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==");
const text = await response.text(); // "Hello, World!"
```

#### Blob URLs - `blob:`

You can fetch blobs using URLs created by `URL.createObjectURL()`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const blob = new Blob(["Hello, World!"], { type: "text/plain" });
const url = URL.createObjectURL(blob);
const response = await fetch(url);
```

### Error handling

Bun's fetch implementation includes several specific error cases:

* Using a request body with GET/HEAD methods will throw an error (which is expected for the fetch API)
* Attempting to use both `proxy` and `unix` options together will throw an error
* TLS certificate validation failures when `rejectUnauthorized` is true (or undefined)
* S3 operations may throw specific errors related to authentication or permissions

### Content-Type handling

Bun automatically sets the `Content-Type` header for request bodies when not explicitly provided:

* For `Blob` objects, uses the blob's `type`
* For `FormData`, sets appropriate multipart boundary

## Debugging

To help with debugging, you can pass `verbose: true` to `fetch`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const response = await fetch("http://example.com", {
	verbose: true,
});
```

This will print the request and response headers to your terminal:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
[fetch] > HTTP/1.1 GET http://example.com/
[fetch] > Connection: keep-alive
[fetch] > User-Agent: Bun/1.3.1
[fetch] > Accept: */*
[fetch] > Host: example.com
[fetch] > Accept-Encoding: gzip, deflate, br, zstd

[fetch] < 200 OK
[fetch] < Content-Encoding: gzip
[fetch] < Age: 201555
[fetch] < Cache-Control: max-age=604800
[fetch] < Content-Type: text/html; charset=UTF-8
[fetch] < Date: Sun, 21 Jul 2024 02:41:14 GMT
[fetch] < Etag: "3147526947+gzip"
[fetch] < Expires: Sun, 28 Jul 2024 02:41:14 GMT
[fetch] < Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
[fetch] < Server: ECAcc (sac/254F)
[fetch] < Vary: Accept-Encoding
[fetch] < X-Cache: HIT
[fetch] < Content-Length: 648
```

Note: `verbose: boolean` is not part of the Web standard `fetch` API and is specific to Bun.

## Performance

Before an HTTP request can be sent, the DNS lookup must be performed. This can take a significant amount of time, especially if the DNS server is slow or the network connection is poor.

After the DNS lookup, the TCP socket must be connected and the TLS handshake might need to be performed. This can also take a significant amount of time.

After the request completes, consuming the response body can also take a significant amount of time and memory.

At every step of the way, Bun provides APIs to help you optimize the performance of your application.

### DNS prefetching

To prefetch a DNS entry, you can use the `dns.prefetch` API. This API is useful when you know you'll need to connect to a host soon and want to avoid the initial DNS lookup.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dns } from "bun";

dns.prefetch("bun.com");
```

#### DNS caching

By default, Bun caches and deduplicates DNS queries in-memory for up to 30 seconds. You can see the cache stats by calling `dns.getCacheStats()`:

To learn more about DNS caching in Bun, see the [DNS caching](/runtime/networking/dns) documentation.

### Preconnect to a host

To preconnect to a host, you can use the `fetch.preconnect` API. This API is useful when you know you'll need to connect to a host soon and want to start the initial DNS lookup, TCP socket connection, and TLS handshake early.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { fetch } from "bun";

fetch.preconnect("https://bun.com");
```

Note: calling `fetch` immediately after `fetch.preconnect` will not make your request faster. Preconnecting only helps if you know you'll need to connect to a host soon, but you're not ready to make the request yet.

#### Preconnect at startup

To preconnect to a host at startup, you can pass `--fetch-preconnect`:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --fetch-preconnect https://bun.com ./my-script.ts
```

This is sort of like `<link rel="preconnect">` in HTML.

This feature is not implemented on Windows yet. If you're interested in using this feature on Windows, please file an issue and we can implement support for it on Windows.

### Connection pooling & HTTP keep-alive

Bun automatically reuses connections to the same host. This is known as connection pooling. This can significantly reduce the time it takes to establish a connection. You don't need to do anything to enable this; it's automatic.

#### Simultaneous connection limit

By default, Bun limits the maximum number of simultaneous `fetch` requests to 256. We do this for several reasons:

* It improves overall system stability. Operating systems have an upper limit on the number of simultaneous open TCP sockets, usually in the low thousands. Nearing this limit causes your entire computer to behave strangely. Applications hang and crash.
* It encourages HTTP Keep-Alive connection reuse. For short-lived HTTP requests, the slowest step is often the initial connection setup. Reusing connections can save a lot of time.

When the limit is exceeded, the requests are queued and sent as soon as the next request ends.

You can increase the maximum number of simultaneous connections via the `BUN_CONFIG_MAX_HTTP_REQUESTS` environment variable:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun_CONFIG_MAX_HTTP_REQUESTS=512 bun ./my-script.ts
```

The max value for this limit is currently set to 65,336. The maximum port number is 65,535, so it's quite difficult for any one computer to exceed this limit.

### Response buffering

Bun goes to great lengths to optimize the performance of reading the response body. The fastest way to read the response body is to use one of these methods:

* `response.text(): Promise<string>`
* `response.json(): Promise<any>`
* `response.formData(): Promise<FormData>`
* `response.bytes(): Promise<Uint8Array>`
* `response.arrayBuffer(): Promise<ArrayBuffer>`
* `response.blob(): Promise<Blob>`

You can also use `Bun.write` to write the response body to a file on disk:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { write } from "bun";

await write("output.txt", response);
```

### Implementation details

* Connection pooling is enabled by default but can be disabled per-request with `keepalive: false`. The `"Connection: close"` header can also be used to disable keep-alive.
* Large file uploads are optimized using the operating system's `sendfile` syscall under specific conditions:
  * The file must be larger than 32KB
  * The request must not be using a proxy
  * On macOS, only regular files (not pipes, sockets, or devices) can use `sendfile`
  * When these conditions aren't met, or when using S3/streaming uploads, Bun falls back to reading the file into memory
  * This optimization is particularly effective for HTTP (not HTTPS) requests where the file can be sent directly from the kernel to the network stack
* S3 operations automatically handle signing requests and merging authentication headers

Note: Many of these features are Bun-specific extensions to the standard fetch API.

# WebSockets

> Server-side WebSockets in Bun

`Bun.serve()` supports server-side WebSockets, with on-the-fly compression, TLS support, and a Bun-native publish-subscribe API.

<Info>
  **⚡️ 7x more throughput**

  Bun's WebSockets are fast. For a [simple chatroom](https://github.com/oven-sh/bun/tree/main/bench/websocket-server/README.md) on Linux x64, Bun can handle 7x more requests per second than Node.js + [`"ws"`](https://github.com/websockets/ws).

  | **Messages sent per second** | **Runtime**                    | **Clients** |
  | ---------------------------- | ------------------------------ | ----------- |
  | \~700,000                    | (`Bun.serve`) Bun v0.2.1 (x64) | 16          |
  | \~100,000                    | (`ws`) Node v18.10.0 (x64)     | 16          |

  Internally Bun's WebSocket implementation is built on [uWebSockets](https://github.com/uNetworking/uWebSockets).
</Info>

***

## Start a WebSocket server

Below is a simple WebSocket server built with `Bun.serve`, in which all incoming requests are [upgraded](https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism) to WebSocket connections in the `fetch` handler. The socket handlers are declared in the `websocket` parameter.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req, server) {
		// upgrade the request to a WebSocket
		if (server.upgrade(req)) {
			return; // do not return a Response
		}
		return new Response("Upgrade failed", { status: 500 });
	},
	websocket: {}, // handlers
});
```

The following WebSocket event handlers are supported:

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req, server) {}, // upgrade logic
	websocket: {
		message(ws, message) {}, // a message is received
		open(ws) {}, // a socket is opened
		close(ws, code, message) {}, // a socket is closed
		drain(ws) {}, // the socket is ready to receive more data
	},
});
```

<Accordion title="An API designed for speed">
  In Bun, handlers are declared once per server, instead of per socket.

  `ServerWebSocket` expects you to pass a `WebSocketHandler` object to the `Bun.serve()` method which has methods for `open`, `message`, `close`, `drain`, and `error`. This is different than the client-side `WebSocket` class which extends `EventTarget` (onmessage, onopen, onclose),

  Clients tend to not have many socket connections open so an event-based API makes sense.

  But servers tend to have **many** socket connections open, which means:

  * Time spent adding/removing event listeners for each connection adds up
  * Extra memory spent on storing references to callbacks function for each connection
  * Usually, people create new functions for each connection, which also means more memory

  So, instead of using an event-based API, `ServerWebSocket` expects you to pass a single object with methods for each event in `Bun.serve()` and it is reused for each connection.

  This leads to less memory usage and less time spent adding/removing event listeners.
</Accordion>

The first argument to each handler is the instance of `ServerWebSocket` handling the event. The `ServerWebSocket` class is a fast, Bun-native implementation of [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) with some additional features.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req, server) {}, // upgrade logic
	websocket: {
		message(ws, message) {
			ws.send(message); // echo back the message
		},
	},
});
```

### Sending messages

Each `ServerWebSocket` instance has a `.send()` method for sending messages to the client. It supports a range of input types.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" focus={4-6} theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req, server) {}, // upgrade logic
	websocket: {
		message(ws, message) {
			ws.send("Hello world"); // string
			ws.send(response.arrayBuffer()); // ArrayBuffer
			ws.send(new Uint8Array([1, 2, 3])); // TypedArray | DataView
		},
	},
});
```

### Headers

Once the upgrade succeeds, Bun will send a `101 Switching Protocols` response per the [spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism). Additional `headers` can be attached to this `Response` in the call to `server.upgrade()`.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req, server) {
		const sessionId = await generateSessionId();
		server.upgrade(req, {
			headers: {
				// [!code ++]
				"Set-Cookie": `SessionId=${sessionId}`, // [!code ++]
			}, // [!code ++]
		});
	},
	websocket: {}, // handlers
});
```

### Contextual data

Contextual `data` can be attached to a new WebSocket in the `.upgrade()` call. This data is made available on the `ws.data` property inside the WebSocket handlers.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
type WebSocketData = {
	createdAt: number;
	channelId: string;
	authToken: string;
};

Bun.serve({
	fetch(req, server) {
		const cookies = new Bun.CookieMap(req.headers.get("cookie")!);

		server.upgrade(req, {
			// this object must conform to WebSocketData
			data: {
				createdAt: Date.now(),
				channelId: new URL(req.url).searchParams.get("channelId"),
				authToken: cookies.get("X-Token"),
			},
		});

		return undefined;
	},
	websocket: {
		// TypeScript: specify the type of ws.data like this
		data: {} as WebSocketData,
		// handler called when a message is received
		async message(ws, message) {
			// ws.data is now properly typed as WebSocketData
			const user = getUserFromToken(ws.data.authToken);

			await saveMessageToDatabase({
				channel: ws.data.channelId,
				message: String(message),
				userId: user.id,
			});
		},
	},
});
```

To connect to this server from the browser, create a new `WebSocket`.

```ts browser.js icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = new WebSocket("ws://localhost:3000/chat");

socket.addEventListener("message", event => {
	console.log(event.data);
});
```

<Info>
  **Identifying users**

  The cookies that are currently set on the page will be sent with the WebSocket upgrade request and available on `req.headers` in the `fetch` handler. Parse these cookies to determine the identity of the connecting user and set the value of `data` accordingly.
</Info>

### Pub/Sub

Bun's `ServerWebSocket` implementation implements a native publish-subscribe API for topic-based broadcasting. Individual sockets can `.subscribe()` to a topic (specified with a string identifier) and `.publish()` messages to all other subscribers to that topic (excluding itself). This topic-based broadcast API is similar to [MQTT](https://en.wikipedia.org/wiki/MQTT) and [Redis Pub/Sub](https://redis.io/topics/pubsub).

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname === "/chat") {
			console.log(`upgrade!`);
			const username = getUsernameFromReq(req);
			const success = server.upgrade(req, { data: { username } });
			return success ? undefined : new Response("WebSocket upgrade error", { status: 400 });
		}

		return new Response("Hello world");
	},
	websocket: {
		// TypeScript: specify the type of ws.data like this
		data: {} as { username: string },
		open(ws) {
			const msg = `${ws.data.username} has entered the chat`;
			ws.subscribe("the-group-chat");
			server.publish("the-group-chat", msg);
		},
		message(ws, message) {
			// this is a group chat
			// so the server re-broadcasts incoming message to everyone
			server.publish("the-group-chat", `${ws.data.username}: ${message}`);
		},
		close(ws) {
			const msg = `${ws.data.username} has left the chat`;
			ws.unsubscribe("the-group-chat");
			server.publish("the-group-chat", msg);
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);
```

Calling `.publish(data)` will send the message to all subscribers of a topic *except* the socket that called `.publish()`. To send a message to all subscribers of a topic, use the `.publish()` method on the `Server` instance.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.serve({
	websocket: {
		// ...
	},
});

// listen for some external event
server.publish("the-group-chat", "Hello world");
```

### Compression

Per-message [compression](https://websockets.readthedocs.io/en/stable/topics/compression.html) can be enabled with the `perMessageDeflate` parameter.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	websocket: {
		perMessageDeflate: true, // [!code ++]
	},
});
```

Compression can be enabled for individual messages by passing a `boolean` as the second argument to `.send()`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
ws.send("Hello world", true);
```

For fine-grained control over compression characteristics, refer to the [Reference](#reference).

### Backpressure

The `.send(message)` method of `ServerWebSocket` returns a `number` indicating the result of the operation.

* `-1` — The message was enqueued but there is backpressure
* `0` — The message was dropped due to a connection issue
* `1+` — The number of bytes sent

This gives you better control over backpressure in your server.

### Timeouts and limits

By default, Bun will close a WebSocket connection if it is idle for 120 seconds. This can be configured with the `idleTimeout` parameter.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req, server) {}, // upgrade logic
	websocket: {
		idleTimeout: 60, // 60 seconds  // [!code ++]
	},
});
```

Bun will also close a WebSocket connection if it receives a message that is larger than 16 MB. This can be configured with the `maxPayloadLength` parameter.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.serve({
	fetch(req, server) {}, // upgrade logic
	websocket: {
		maxPayloadLength: 1024 * 1024, // 1 MB  // [!code ++]
	},
});
```

***

## Connect to a `Websocket` server

Bun implements the `WebSocket` class. To create a WebSocket client that connects to a `ws://` or `wss://` server, create an instance of `WebSocket`, as you would in the browser.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = new WebSocket("ws://localhost:3000");

// With subprotocol negotiation
const socket2 = new WebSocket("ws://localhost:3000", ["soap", "wamp"]);
```

In browsers, the cookies that are currently set on the page will be sent with the WebSocket upgrade request. This is a standard feature of the `WebSocket` API.

For convenience, Bun lets you setting custom headers directly in the constructor. This is a Bun-specific extension of the `WebSocket` standard. *This will not work in browsers.*

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = new WebSocket("ws://localhost:3000", {
	headers: {
		/* custom headers */
	}, // [!code ++]
});
```

To add event listeners to the socket:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// message is received
socket.addEventListener("message", event => {});

// socket opened
socket.addEventListener("open", event => {});

// socket closed
socket.addEventListener("close", event => {});

// error handler
socket.addEventListener("error", event => {});
```

***

## Reference

```ts See Typescript Definitions expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
namespace Bun {
	export function serve(params: {
		fetch: (req: Request, server: Server) => Response | Promise<Response>;
		websocket?: {
			message: (ws: ServerWebSocket, message: string | ArrayBuffer | Uint8Array) => void;
			open?: (ws: ServerWebSocket) => void;
			close?: (ws: ServerWebSocket, code: number, reason: string) => void;
			error?: (ws: ServerWebSocket, error: Error) => void;
			drain?: (ws: ServerWebSocket) => void;

			maxPayloadLength?: number; // default: 16 * 1024 * 1024 = 16 MB
			idleTimeout?: number; // default: 120 (seconds)
			backpressureLimit?: number; // default: 1024 * 1024 = 1 MB
			closeOnBackpressureLimit?: boolean; // default: false
			sendPings?: boolean; // default: true
			publishToSelf?: boolean; // default: false

			perMessageDeflate?:
				| boolean
				| {
						compress?: boolean | Compressor;
						decompress?: boolean | Compressor;
				  };
		};
	}): Server;
}

type Compressor =
	| `"disable"`
	| `"shared"`
	| `"dedicated"`
	| `"3KB"`
	| `"4KB"`
	| `"8KB"`
	| `"16KB"`
	| `"32KB"`
	| `"64KB"`
	| `"128KB"`
	| `"256KB"`;

interface Server {
	pendingWebSockets: number;
	publish(topic: string, data: string | ArrayBufferView | ArrayBuffer, compress?: boolean): number;
	upgrade(
		req: Request,
		options?: {
			headers?: HeadersInit;
			data?: any;
		},
	): boolean;
}

interface ServerWebSocket {
	readonly data: any;
	readonly readyState: number;
	readonly remoteAddress: string;
	send(message: string | ArrayBuffer | Uint8Array, compress?: boolean): number;
	close(code?: number, reason?: string): void;
	subscribe(topic: string): void;
	unsubscribe(topic: string): void;
	publish(topic: string, message: string | ArrayBuffer | Uint8Array): void;
	isSubscribed(topic: string): boolean;
	cork(cb: (ws: ServerWebSocket) => void): void;
}
```
# TCP

> Use Bun's native TCP API to implement performance sensitive systems like database clients, game servers, or anything that needs to communicate over TCP (instead of HTTP)

This is a low-level API intended for library authors and for advanced use cases.

## Start a server (`Bun.listen()`)

To start a TCP server with `Bun.listen`:

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.listen({
	hostname: "localhost",
	port: 8080,
	socket: {
		data(socket, data) {}, // message received from client
		open(socket) {}, // socket opened
		close(socket, error) {}, // socket closed
		drain(socket) {}, // socket ready for more data
		error(socket, error) {}, // error handler
	},
});
```

<Accordion title="An API designed for speed">
  In Bun, a set of handlers are declared once per server instead of assigning callbacks to each socket, as with Node.js `EventEmitters` or the web-standard `WebSocket` API.

  ```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  Bun.listen({
  	hostname: "localhost",
  	port: 8080,
  	socket: {
  		open(socket) {},
  		data(socket, data) {},
  		drain(socket) {},
  		close(socket, error) {},
  		error(socket, error) {},
  	},
  });
  ```

  For performance-sensitive servers, assigning listeners to each socket can cause significant garbage collector pressure and increase memory usage. By contrast, Bun only allocates one handler function for each event and shares it among all sockets. This is a small optimization, but it adds up.
</Accordion>

Contextual data can be attached to a socket in the `open` handler.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
type SocketData = { sessionId: string };

Bun.listen<SocketData>({
	hostname: "localhost",
	port: 8080,
	socket: {
		data(socket, data) {
			socket.write(`${socket.data.sessionId}: ack`); // [!code ++]
		},
		open(socket) {
			socket.data = { sessionId: "abcd" }; // [!code ++]
		},
	},
});
```

To enable TLS, pass a `tls` object containing `key` and `cert` fields.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.listen({
	hostname: "localhost",
	port: 8080,
	socket: {
		data(socket, data) {},
	},
	tls: {
		// can be string, BunFile, TypedArray, Buffer, or array thereof
		key: Bun.file("./key.pem"), // [!code ++]
		cert: Bun.file("./cert.pem"), // [!code ++]
	},
});
```

The `key` and `cert` fields expect the *contents* of your TLS key and certificate. This can be a string, `BunFile`, `TypedArray`, or `Buffer`.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.listen({
	// ...
	tls: {
		key: Bun.file("./key.pem"), // BunFile
		key: fs.readFileSync("./key.pem"), // Buffer
		key: fs.readFileSync("./key.pem", "utf8"), // string
		key: [Bun.file("./key1.pem"), Bun.file("./key2.pem")], // array of above
	},
});
```

The result of `Bun.listen` is a server that conforms to the `TCPSocket` interface.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = Bun.listen({
	/* config*/
});

// stop listening
// parameter determines whether active connections are closed
server.stop(true);

// let Bun process exit even if server is still listening
server.unref();
```

***

## Create a connection (`Bun.connect()`)

Use `Bun.connect` to connect to a TCP server. Specify the server to connect to with `hostname` and `port`. TCP clients can define the same set of handlers as `Bun.listen`, plus a couple client-specific handlers.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
// The client
const socket = await Bun.connect({
	hostname: "localhost",
	port: 8080,

	socket: {
		data(socket, data) {},
		open(socket) {},
		close(socket, error) {},
		drain(socket) {},
		error(socket, error) {},

		// client-specific handlers
		connectError(socket, error) {}, // connection failed
		end(socket) {}, // connection closed by server
		timeout(socket) {}, // connection timed out
	},
});
```

To require TLS, specify `tls: true`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// The client
const socket = await Bun.connect({
	// ... config
	tls: true, // [!code ++]
});
```

***

## Hot reloading

Both TCP servers and sockets can be hot reloaded with new handlers.

<CodeGroup>
  ```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  const server = Bun.listen({
  	/* config */
  });

  // reloads handlers for all active server-side sockets
  server.reload({
  	socket: {
  		data() {
  			// new 'data' handler
  		},
  	},
  });
  ```

  ```ts client.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  const socket = await Bun.connect({
  	/* config */
  });

  socket.reload({
  	data() {
  		// new 'data' handler
  	},
  });
  ```
</CodeGroup>

***

## Buffering

Currently, TCP sockets in Bun do not buffer data. For performance-sensitive code, it's important to consider buffering carefully. For example, this:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
socket.write("h");
socket.write("e");
socket.write("l");
socket.write("l");
socket.write("o");
```

...performs significantly worse than this:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
socket.write("hello");
```

To simplify this for now, consider using Bun's `ArrayBufferSink` with the `{stream: true}` option:

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { ArrayBufferSink } from "bun";

const sink = new ArrayBufferSink();
sink.start({
	stream: true, // [!code ++]
	highWaterMark: 1024,
});

sink.write("h");
sink.write("e");
sink.write("l");
sink.write("l");
sink.write("o");

queueMicrotask(() => {
	const data = sink.flush();
	const wrote = socket.write(data);
	if (wrote < data.byteLength) {
		// put it back in the sink if the socket is full
		sink.write(data.subarray(wrote));
	}
});
```

<Note>
  **Corking**

  Support for corking is planned, but in the meantime backpressure must be managed manually with the `drain` handler.
</Note>

# UDP

> Use Bun's UDP API to implement services with advanced real-time requirements, such as voice chat.

## Bind a UDP socket (`Bun.udpSocket()`)

To create a new (bound) UDP socket:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = await Bun.udpSocket({});
console.log(socket.port); // assigned by the operating system
```

Specify a port:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = await Bun.udpSocket({
	port: 41234, // [!code ++]
});

console.log(socket.port); // 41234
```

### Send a datagram

Specify the data to send, as well as the destination port and address.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
socket.send("Hello, world!", 41234, "127.0.0.1");
```

Note that the address must be a valid IP address - `send` does not perform
DNS resolution, as it is intended for low-latency operations.

### Receive datagrams

When creating your socket, add a callback to specify what should be done when packets are received:

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = await Bun.udpSocket({
	socket: {
		data(socket, buf, port, addr) {
			console.log(`message from ${addr}:${port}:`);
			console.log(buf.toString());
		},
	},
});

const client = await Bun.udpSocket({});
client.send("Hello!", server.port, "127.0.0.1");
```

### Connections

While UDP does not have a concept of a connection, many UDP communications (especially as a client) involve only one peer.
In such cases it can be beneficial to connect the socket to that peer, which specifies to which address all packets are sent
and restricts incoming packets to that peer only.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const server = await Bun.udpSocket({
	socket: {
		data(socket, buf, port, addr) {
			console.log(`message from ${addr}:${port}:`);
			console.log(buf.toString());
		},
	},
});

const client = await Bun.udpSocket({
	connect: {
		port: server.port,
		hostname: "127.0.0.1",
	},
});

client.send("Hello");
```

Because connections are implemented on the operating system level, you can potentially observe performance benefits, too.

### Send many packets at once using `sendMany()`

If you want to send a large volume of packets at once, it can make sense to batch them all together to avoid the overhead
of making a system call for each. This is made possible by the `sendMany()` API:

For an unconnected socket, `sendMany` takes an array as its only argument. Each set of three array elements describes a packet:
The first item is the data to be sent, the second is the target port, and the last is the target address.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = await Bun.udpSocket({});

// sends 'Hello' to 127.0.0.1:41234, and 'foo' to 1.1.1.1:53 in a single operation
socket.sendMany(["Hello", 41234, "127.0.0.1", "foo", 53, "1.1.1.1"]);
```

With a connected socket, `sendMany` simply takes an array, where each element represents the data to be sent to the peer.

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = await Bun.udpSocket({
	connect: {
		port: 41234,
		hostname: "localhost",
	},
});

socket.sendMany(["foo", "bar", "baz"]);
```

`sendMany` returns the number of packets that were successfully sent. As with `send`, `sendMany` only takes valid IP addresses
as destinations, as it does not perform DNS resolution.

### Handle backpressure

It may happen that a packet that you're sending does not fit into the operating system's packet buffer. You can detect that this
has happened when:

* `send` returns `false`
* `sendMany` returns a number smaller than the number of packets you specified. In this case, the `drain` socket handler will be called once the socket becomes writable again:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const socket = await Bun.udpSocket({
	socket: {
		drain(socket) {
			// continue sending data
		},
	},
});
```

# DNS

> Use Bun's DNS module to resolve DNS records

Bun implements it's own `dns` module, and the `node:dns` module.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import * as dns from "node:dns";

const addrs = await dns.promises.resolve4("bun.com", { ttl: true });
console.log(addrs);
// => [{ address: "172.67.161.226", family: 4, ttl: 0 }, ...]
```

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dns } from "bun";

dns.prefetch("bun.com", 443);
```

***

## DNS caching in Bun

In Bun v1.1.9, we added support for DNS caching. This cache makes repeated connections to the same hosts faster.

At the time of writing, we cache up to 255 entries for a maximum of 30 seconds (each). If any connections to a host fail, we remove the entry from the cache. When multiple connections are made to the same host simultaneously, DNS lookups are deduplicated to avoid making multiple requests for the same host.

This cache is automatically used by:

* `bun install`
* `fetch()`
* `node:http` (client)
* `Bun.connect`
* `node:net`
* `node:tls`

### When should I prefetch a DNS entry?

Web browsers expose [`<link rel="dns-prefetch">`](https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch) to allow developers to prefetch DNS entries. This is useful when you know you'll need to connect to a host in the near future and want to avoid the initial DNS lookup.

In Bun, you can use the `dns.prefetch` API to achieve the same effect.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dns } from "bun";

dns.prefetch("my.database-host.com", 5432);
```

An example where you might want to use this is a database driver. When your application first starts up, you can prefetch the DNS entry for the database host so that by the time it finishes loading everything, the DNS query to resolve the database host may already be completed.

### `dns.prefetch`

<Warning>This API is experimental and may change in the future.</Warning>

To prefetch a DNS entry, you can use the `dns.prefetch` API. This API is useful when you know you'll need to connect to a host soon and want to avoid the initial DNS lookup.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
dns.prefetch(hostname: string, port: number): void;
```

Here's an example:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dns } from "bun";

dns.prefetch("bun.com", 443);
//
// ... sometime later ...
await fetch("https://bun.com");
```

### `dns.getCacheStats()`

<Warning>This API is experimental and may change in the future.</Warning>

To get the current cache stats, you can use the `dns.getCacheStats` API. This API returns an object with the following properties:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	cacheHitsCompleted: number; // Cache hits completed
	cacheHitsInflight: number; // Cache hits in flight
	cacheMisses: number; // Cache misses
	size: number; // Number of items in the DNS cache
	errors: number; // Number of times a connection failed
	totalCount: number; // Number of times a connection was requested at all (including cache hits and misses)
}
```

Example:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dns } from "bun";

const stats = dns.getCacheStats();
console.log(stats);
// => { cacheHitsCompleted: 0, cacheHitsInflight: 0, cacheMisses: 0, size: 0, errors: 0, totalCount: 0 }
```

### Configuring DNS cache TTL

Bun defaults to 30 seconds for the TTL of DNS cache entries. To change this, you can set the environment variable `$BUN_CONFIG_DNS_TIME_TO_LIVE_SECONDS`. For example, to set the TTL to 5 seconds:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
BUN_CONFIG_DNS_TIME_TO_LIVE_SECONDS=5 bun run my-script.ts
```

#### Why is 30 seconds the default?

Unfortunately, the system API underneath (`getaddrinfo`) does not provide a way to get the TTL of a DNS entry. This means we have to pick a number arbitrarily. We chose 30 seconds because it's long enough to see the benefits of caching, and short enough to be unlikely to cause issues if a DNS entry changes. [Amazon Web Services recommends 5 seconds](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/jvm-ttl-dns.html) for the Java Virtual Machine, however the JVM defaults to cache indefinitely.


