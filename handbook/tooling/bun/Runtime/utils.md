# Secrets

> Use Bun's Secrets API to store and retrieve sensitive credentials securely

Store and retrieve sensitive credentials securely using the operating system's native credential storage APIs.

<Warning>This API is new and experimental. It may change in the future.</Warning>

```typescript index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { secrets } from "bun";

const githubToken = await secrets.get({
	service: "my-cli-tool",
	name: "github-token",
});

if (!githubToken) {
	const response = await fetch("https://api.github.com/name", {
		headers: { Authorization: `token ${githubToken}` },
	});
	console.log("Please enter your GitHub token");
} else {
	await secrets.set({
		service: "my-cli-tool",
		name: "github-token",
		value: prompt("Please enter your GitHub token"),
	});
	console.log("GitHub token stored");
}
```

***

## Overview

`Bun.secrets` provides a cross-platform API for managing sensitive credentials that CLI tools and development applications typically store in plaintext files like `~/.npmrc`, `~/.aws/credentials`, or `.env` files. It uses:

* **macOS**: Keychain Services
* **Linux**: libsecret (GNOME Keyring, KWallet, etc.)
* **Windows**: Windows Credential Manager

All operations are asynchronous and non-blocking, running on Bun's threadpool.

<Note>
  In the future, we may add an additional `provider` option to make this better for production
  deployment secrets, but today this API is mostly useful for local development tools.
</Note>

***

## API

### `Bun.secrets.get(options)`

Retrieve a stored credential.

```typescript  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { secrets } from "bun";

const password = await Bun.secrets.get({
	service: "my-app",
	name: "alice@example.com",
});
// Returns: string | null

// Or if you prefer without an object
const password = await Bun.secrets.get("my-app", "alice@example.com");
```

**Parameters:**

* `options.service` (string, required) - The service or application name
* `options.name` (string, required) - The username or account identifier

**Returns:**

* `Promise<string | null>` - The stored password, or `null` if not found

### `Bun.secrets.set(options, value)`

Store or update a credential.

```typescript  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { secrets } from "bun";

await secrets.set({
	service: "my-app",
	name: "alice@example.com",
	value: "super-secret-password",
});
```

**Parameters:**

* `options.service` (string, required) - The service or application name
* `options.name` (string, required) - The username or account identifier
* `value` (string, required) - The password or secret to store

**Notes:**

* If a credential already exists for the given service/name combination, it will be replaced
* The stored value is encrypted by the operating system

### `Bun.secrets.delete(options)`

Delete a stored credential.

```typescript  theme={"theme":{"light":"github-light","dark":"dracula"}}
const deleted = await Bun.secrets.delete({
	service: "my-app",
	name: "alice@example.com",
	value: "super-secret-password",
});
// Returns: boolean
```

**Parameters:**

* `options.service` (string, required) - The service or application name
* `options.name` (string, required) - The username or account identifier

**Returns:**

* `Promise<boolean>` - `true` if a credential was deleted, `false` if not found

***

## Examples

### Storing CLI Tool Credentials

```javascript  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Store GitHub CLI token (instead of ~/.config/gh/hosts.yml)
await Bun.secrets.set({
	service: "my-app.com",
	name: "github-token",
	value: "ghp_xxxxxxxxxxxxxxxxxxxx",
});

// Or if you prefer without an object
await Bun.secrets.set("my-app.com", "github-token", "ghp_xxxxxxxxxxxxxxxxxxxx");

// Store npm registry token (instead of ~/.npmrc)
await Bun.secrets.set({
	service: "npm-registry",
	name: "https://registry.npmjs.org",
	value: "npm_xxxxxxxxxxxxxxxxxxxx",
});

// Retrieve for API calls
const token = await Bun.secrets.get({
	service: "gh-cli",
	name: "github.com",
});

if (token) {
	const response = await fetch("https://api.github.com/name", {
		headers: {
			Authorization: `token ${token}`,
		},
	});
}
```

### Migrating from Plaintext Config Files

```javascript  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Instead of storing in ~/.aws/credentials
await Bun.secrets.set({
	service: "aws-cli",
	name: "AWS_SECRET_ACCESS_KEY",
	value: process.env.AWS_SECRET_ACCESS_KEY,
});

// Instead of .env files with sensitive data
await Bun.secrets.set({
	service: "my-app",
	name: "api-key",
	value: "sk_live_xxxxxxxxxxxxxxxxxxxx",
});

// Load at runtime
const apiKey =
	(await Bun.secrets.get({
		service: "my-app",
		name: "api-key",
	})) || process.env.API_KEY; // Fallback for CI/production
```

### Error Handling

```javascript  theme={"theme":{"light":"github-light","dark":"dracula"}}
try {
	await Bun.secrets.set({
		service: "my-app",
		name: "alice",
		value: "password123",
	});
} catch (error) {
	console.error("Failed to store credential:", error.message);
}

// Check if a credential exists
const password = await Bun.secrets.get({
	service: "my-app",
	name: "alice",
});

if (password === null) {
	console.log("No credential found");
}
```

### Updating Credentials

```javascript  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Initial password
await Bun.secrets.set({
	service: "email-server",
	name: "admin@example.com",
	value: "old-password",
});

// Update to new password
await Bun.secrets.set({
	service: "email-server",
	name: "admin@example.com",
	value: "new-password",
});

// The old password is replaced
```

***

## Platform Behavior

### macOS (Keychain)

* Credentials are stored in the name's login keychain
* The keychain may prompt for access permission on first use
* Credentials persist across system restarts
* Accessible by the name who stored them

### Linux (libsecret)

* Requires a secret service daemon (GNOME Keyring, KWallet, etc.)
* Credentials are stored in the default collection
* May prompt for unlock if the keyring is locked
* The secret service must be running

### Windows (Credential Manager)

* Credentials are stored in Windows Credential Manager
* Visible in Control Panel → Credential Manager → Windows Credentials
* Persist with `CRED_PERSIST_ENTERPRISE` flag so it's scoped per user
* Encrypted using Windows Data Protection API

## Security Considerations

1. **Encryption**: Credentials are encrypted by the operating system's credential manager
2. **Access Control**: Only the name who stored the credential can retrieve it
3. **No Plain Text**: Passwords are never stored in plain text
4. **Memory Safety**: Bun zeros out password memory after use
5. **Process Isolation**: Credentials are isolated per name account

## Limitations

* Maximum password length varies by platform (typically 2048-4096 bytes)
* Service and name names should be reasonable lengths (\< 256 characters)
* Some special characters may need escaping depending on the platform
* Requires appropriate system services:
  * Linux: Secret service daemon must be running
  * macOS: Keychain Access must be available
  * Windows: Credential Manager service must be enabled

***

## Comparison with Environment Variables

Unlike environment variables, `Bun.secrets`:

* ✅ Encrypts credentials at rest (thanks to the operating system)
* ✅ Avoids exposing secrets in process memory dumps (memory is zeroed after its no longer needed)
* ✅ Survives application restarts
* ✅ Can be updated without restarting the application
* ✅ Provides name-level access control
* ❌ Requires OS credential service
* ❌ Not very useful for deployment secrets (use environment variables in production)

***

## Best Practices

1. **Use descriptive service names**: Match the tool or application name
   If you're building a CLI for external use, you probably should use a UTI (Uniform Type Identifier) for the service name.

   ```javascript  theme={"theme":{"light":"github-light","dark":"dracula"}}
   // Good - matches the actual tool
   { service: "com.docker.hub", name: "username" }
   { service: "com.vercel.cli", name: "team-name" }

   // Avoid - too generic
   { service: "api", name: "key" }
   ```

2. **Credentials-only**: Don't store application configuration in this API
   This API is slow, you probably still need to use a config file for some things.

3. **Use for local development tools**:
   * ✅ CLI tools (gh, npm, docker, kubectl)
   * ✅ Local development servers
   * ✅ Personal API keys for testing
   * ❌ Production servers (use proper secret management)

***

## TypeScript

```typescript  theme={"theme":{"light":"github-light","dark":"dracula"}}
namespace Bun {
	interface SecretsOptions {
		service: string;
		name: string;
	}

	interface Secrets {
		get(options: SecretsOptions): Promise<string | null>;
		set(options: SecretsOptions, value: string): Promise<void>;
		delete(options: SecretsOptions): Promise<boolean>;
	}

	const secrets: Secrets;
}
```

# Console

> The console object in Bun

<Note>
  Bun provides a browser- and Node.js-compatible
  [console](https://developer.mozilla.org/en-US/docs/Web/API/console) global. This page only
  documents Bun-native APIs.
</Note>

***

## Object inspection depth

Bun allows you to configure how deeply nested objects are displayed in `console.log()` output:

* **CLI flag**: Use `--console-depth <number>` to set the depth for a single run
* **Configuration**: Set `console.depth` in your `bunfig.toml` for persistent configuration
* **Default**: Objects are inspected to a depth of `2` levels

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
const nested = { a: { b: { c: { d: "deep" } } } };
console.log(nested);
// Default (depth 2): { a: { b: [Object] } }
// With depth 4: { a: { b: { c: { d: 'deep' } } } }
```

The CLI flag takes precedence over the configuration file setting.

***

## Reading from stdin

In Bun, the `console` object can be used as an `AsyncIterable` to sequentially read lines from `process.stdin`.

```ts adder.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
for await (const line of console) {
	console.log(line);
}
```

This is useful for implementing interactive programs, like the following addition calculator.

```ts adder.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(`Let's add some numbers!`);
console.write(`Count: 0\n> `);

let count = 0;
for await (const line of console) {
	count += Number(line);
	console.write(`Count: ${count}\n> `);
}
```

To run the file:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun adder.ts
Let's add some numbers!
Count: 0
> 5
Count: 5
> 5
Count: 10
> 5
Count: 15
```

# YAML

> Use Bun's built-in support for YAML files through both runtime APIs and bundler integration

In Bun, YAML is a first-class citizen alongside JSON and TOML. You can:

* Parse YAML strings with `Bun.YAML.parse`
* `import` & `require` YAML files as modules at runtime (including hot reloading & watch mode support)
* `import` & `require` YAML files in frontend apps via bun's bundler

***

## Conformance

Bun's YAML parser currently passes over 90% of the official YAML test suite. While we're actively working on reaching 100% conformance, the current implementation covers the vast majority of real-world use cases. The parser is written in Zig for optimal performance and is continuously being improved.

***

## Runtime API

### `Bun.YAML.parse()`

Parse a YAML string into a JavaScript object.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { YAML } from "bun";
const text = `
name: John Doe
age: 30
email: john@example.com
hobbies:
  - reading
  - coding
  - hiking
`;

const data = YAML.parse(text);
console.log(data);
// {
//   name: "John Doe",
//   age: 30,
//   email: "john@example.com",
//   hobbies: ["reading", "coding", "hiking"]
// }
```

#### Multi-document YAML

When parsing YAML with multiple documents (separated by `---`), `Bun.YAML.parse()` returns an array:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const multiDoc = `
---
name: Document 1
---
name: Document 2
---
name: Document 3
`;

const docs = Bun.YAML.parse(multiDoc);
console.log(docs);
// [
//   { name: "Document 1" },
//   { name: "Document 2" },
//   { name: "Document 3" }
// ]
```

#### Supported YAML Features

Bun's YAML parser supports the full YAML 1.2 specification, including:

* **Scalars**: strings, numbers, booleans, null values
* **Collections**: sequences (arrays) and mappings (objects)
* **Anchors and Aliases**: reusable nodes with `&` and `*`
* **Tags**: type hints like `!!str`, `!!int`, `!!float`, `!!bool`, `!!null`
* **Multi-line strings**: literal (`|`) and folded (`>`) scalars
* **Comments**: using `#`
* **Directives**: `%YAML` and `%TAG`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const yaml = `
# Employee record
employee: &emp
  name: Jane Smith
  department: Engineering
  skills:
    - JavaScript
    - TypeScript
    - React

manager: *emp  # Reference to employee

config: !!str 123  # Explicit string type

description: |
  This is a multi-line
  literal string that preserves
  line breaks and spacing.

summary: >
  This is a folded string
  that joins lines with spaces
  unless there are blank lines.
`;

const data = Bun.YAML.parse(yaml);
```

#### Error Handling

`Bun.YAML.parse()` throws a `SyntaxError` if the YAML is invalid:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
try {
	Bun.YAML.parse("invalid: yaml: content:");
} catch (error) {
	console.error("Failed to parse YAML:", error.message);
}
```

***

## Module Import

### ES Modules

You can import YAML files directly as ES modules. The YAML content is parsed and made available as both default and named exports:

```yaml config.yaml theme={"theme":{"light":"github-light","dark":"dracula"}}
database:
  host: localhost
  port: 5432
  name: myapp

redis:
  host: localhost
  port: 6379

features:
  auth: true
  rateLimit: true
  analytics: false
```

#### Default Import

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import config from "./config.yaml";

console.log(config.database.host); // "localhost"
console.log(config.redis.port); // 6379
```

#### Named Imports

You can destructure top-level YAML properties as named imports:

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { database, redis, features } from "./config.yaml";

console.log(database.host); // "localhost"
console.log(redis.port); // 6379
console.log(features.auth); // true
```

Or combine both:

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import config, { database, features } from "./config.yaml";

// Use the full config object
console.log(config);

// Or use specific parts
if (features.rateLimit) {
	setupRateLimiting(database);
}
```

### CommonJS

YAML files can also be required in CommonJS:

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
const config = require("./config.yaml");
console.log(config.database.name); // "myapp"

// Destructuring also works
const { database, redis } = require("./config.yaml");
console.log(database.port); // 5432
```

***

## Hot Reloading with YAML

One of the most powerful features of Bun's YAML support is hot reloading. When you run your application with `bun --hot`, changes to YAML files are automatically detected and reloaded without closing connections

### Configuration Hot Reloading

```yaml config.yaml theme={"theme":{"light":"github-light","dark":"dracula"}}
server:
  port: 3000
  host: localhost

features:
  debug: true
  verbose: false
```

```ts server.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { server, features } from "./config.yaml";

console.log(`Starting server on ${server.host}:${server.port}`);

if (features.debug) {
	console.log("Debug mode enabled");
}

// Your server code here
Bun.serve({
	port: server.port,
	hostname: server.host,
	fetch(req) {
		if (features.verbose) {
			console.log(`${req.method} ${req.url}`);
		}
		return new Response("Hello World");
	},
});
```

Run with hot reloading:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --hot server.ts
```

Now when you modify `config.yaml`, the changes are immediately reflected in your running application. This is perfect for:

* Adjusting configuration during development
* Testing different settings without restarts
* Live debugging with configuration changes
* Feature flag toggling

***

## Configuration Management

### Environment-Based Configuration

YAML excels at managing configuration across different environments:

```yaml config.yaml theme={"theme":{"light":"github-light","dark":"dracula"}}
defaults: &defaults
  timeout: 5000
  retries: 3
  cache:
    enabled: true
    ttl: 3600

development:
  <<: *defaults
  api:
    url: http://localhost:4000
    key: dev_key_12345
  logging:
    level: debug
    pretty: true

staging:
  <<: *defaults
  api:
    url: https://staging-api.example.com
    key: ${STAGING_API_KEY}
  logging:
    level: info
    pretty: false

production:
  <<: *defaults
  api:
    url: https://api.example.com
    key: ${PROD_API_KEY}
  cache:
    enabled: true
    ttl: 86400
  logging:
    level: error
    pretty: false
```

```ts app.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import configs from "./config.yaml";

const env = process.env.NODE_ENV || "development";
const config = configs[env];

// Environment variables in YAML values can be interpolated
function interpolateEnvVars(obj: any): any {
	if (typeof obj === "string") {
		return obj.replace(/\${(\w+)}/g, (_, key) => process.env[key] || "");
	}
	if (typeof obj === "object") {
		for (const key in obj) {
			obj[key] = interpolateEnvVars(obj[key]);
		}
	}
	return obj;
}

export default interpolateEnvVars(config);
```

### Feature Flags Configuration

```yaml features.yaml theme={"theme":{"light":"github-light","dark":"dracula"}}
features:
  newDashboard:
    enabled: true
    rolloutPercentage: 50
    allowedUsers:
      - admin@example.com
      - beta@example.com

  experimentalAPI:
    enabled: false
    endpoints:
      - /api/v2/experimental
      - /api/v2/beta

  darkMode:
    enabled: true
    default: auto # auto, light, dark
```

```ts feature-flags.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { features } from "./features.yaml";

export function isFeatureEnabled(featureName: string, userEmail?: string): boolean {
	const feature = features[featureName];

	if (!feature?.enabled) {
		return false;
	}

	// Check rollout percentage
	if (feature.rolloutPercentage < 100) {
		const hash = hashCode(userEmail || "anonymous");
		if (hash % 100 >= feature.rolloutPercentage) {
			return false;
		}
	}

	// Check allowed users
	if (feature.allowedUsers && userEmail) {
		return feature.allowedUsers.includes(userEmail);
	}

	return true;
}

// Use with hot reloading to toggle features in real-time
if (isFeatureEnabled("newDashboard", user.email)) {
	renderNewDashboard();
} else {
	renderLegacyDashboard();
}
```

### Database Configuration

```yaml database.yaml icon="yaml" theme={"theme":{"light":"github-light","dark":"dracula"}}
connections:
  primary:
    type: postgres
    host: ${DB_HOST:-localhost}
    port: ${DB_PORT:-5432}
    database: ${DB_NAME:-myapp}
    username: ${DB_USER:-postgres}
    password: ${DB_PASS}
    pool:
      min: 2
      max: 10
      idleTimeout: 30000

  cache:
    type: redis
    host: ${REDIS_HOST:-localhost}
    port: ${REDIS_PORT:-6379}
    password: ${REDIS_PASS}
    db: 0

  analytics:
    type: clickhouse
    host: ${ANALYTICS_HOST:-localhost}
    port: 8123
    database: analytics

migrations:
  autoRun: ${AUTO_MIGRATE:-false}
  directory: ./migrations

seeds:
  enabled: ${SEED_DB:-false}
  directory: ./seeds
```

```ts db.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { connections, migrations } from "./database.yaml";
import { createConnection } from "./database-driver";

// Parse environment variables with defaults
function parseConfig(config: any) {
	return JSON.parse(
		JSON.stringify(config).replace(
			/\${([^:-]+)(?::([^}]+))?}/g,
			(_, key, defaultValue) => process.env[key] || defaultValue || "",
		),
	);
}

const dbConfig = parseConfig(connections);

export const db = await createConnection(dbConfig.primary);
export const cache = await createConnection(dbConfig.cache);
export const analytics = await createConnection(dbConfig.analytics);

// Auto-run migrations if configured
if (parseConfig(migrations).autoRun === "true") {
	await runMigrations(db, migrations.directory);
}
```

### Bundler Integration

When you import YAML files in your application and bundle it with Bun, the YAML is parsed at build time and included as a JavaScript module:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build app.ts --outdir=dist
```

This means:

* Zero runtime YAML parsing overhead in production
* Smaller bundle sizes
* Tree-shaking support for unused configuration (named imports)

### Dynamic Imports

YAML files can be dynamically imported, useful for loading configuration on demand:

```ts Load configuration based on environment theme={"theme":{"light":"github-light","dark":"dracula"}}
const env = process.env.NODE_ENV || "development";
const config = await import(`./configs/${env}.yaml`);

// Load user-specific settings
async function loadUserSettings(userId: string) {
	try {
		const settings = await import(`./users/${userId}/settings.yaml`);
		return settings.default;
	} catch {
		return await import("./users/default-settings.yaml");
	}
}
```

# HTMLRewriter

> Use Bun's HTMLRewriter to transform HTML documents with CSS selectors

HTMLRewriter lets you use CSS selectors to transform HTML documents. It works with `Request`, `Response`, as well as `string`. Bun's implementation is based on Cloudflare's [lol-html](https://github.com/cloudflare/lol-html).

***

## Usage

A common usecase is rewriting URLs in HTML content. Here's an example that rewrites image sources and link URLs to use a CDN domain:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Replace all images with a rickroll
const rewriter = new HTMLRewriter().on("img", {
	element(img) {
		// Famous rickroll video thumbnail
		img.setAttribute("src", "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg");

		// Wrap the image in a link to the video
		img.before('<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">', {
			html: true,
		});
		img.after("</a>", { html: true });

		// Add some fun alt text
		img.setAttribute("alt", "Definitely not a rickroll");
	},
});

// An example HTML document
const html = `
<html>
<body>
  <img src="/cat.jpg">
  <img src="dog.png">
  <img src="https://example.com/bird.webp">
</body>
</html>
`;

const result = rewriter.transform(html);
console.log(result);
```

This replaces all images with a thumbnail of Rick Astley and wraps each `<img>` in a link, producing a diff like this:

```html  theme={"theme":{"light":"github-light","dark":"dracula"}}
<html>
	<body>
		<img src="/cat.jpg" /> // [!code --] <img src="dog.png" /> // [!code --]
		<img src="https://example.com/bird.webp" /> // [!code --]
		<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
			// [!code ++]
			<img
				src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
				alt="Definitely not a rickroll"
			/>
			// [!code ++]
		</a>
		// [!code ++]
		<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
			// [!code ++]
			<img
				src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
				alt="Definitely not a rickroll"
			/>
			// [!code ++]
		</a>
		// [!code ++]
		<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
			// [!code ++]
			<img
				src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
				alt="Definitely not a rickroll"
			/>
			// [!code ++]
		</a>
		// [!code ++]
	</body>
</html>
```

Now every image on the page will be replaced with a thumbnail of Rick Astley, and clicking any image will lead to [a very famous video](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

### Input types

HTMLRewriter can transform HTML from various sources. The input is automatically handled based on its type:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// From Response
rewriter.transform(new Response("<div>content</div>"));

// From string
rewriter.transform("<div>content</div>");

// From ArrayBuffer
rewriter.transform(new TextEncoder().encode("<div>content</div>").buffer);

// From Blob
rewriter.transform(new Blob(["<div>content</div>"]));

// From File
rewriter.transform(Bun.file("index.html"));
```

Note that Cloudflare Workers implementation of HTMLRewriter only supports `Response` objects.

### Element Handlers

The `on(selector, handlers)` method allows you to register handlers for HTML elements that match a CSS selector. The handlers are called for each matching element during parsing:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
rewriter.on("div.content", {
	// Handle elements
	element(element) {
		element.setAttribute("class", "new-content");
		element.append("<p>New content</p>", { html: true });
	},
	// Handle text nodes
	text(text) {
		text.replace("new text");
	},
	// Handle comments
	comments(comment) {
		comment.remove();
	},
});
```

The handlers can be asynchronous and return a Promise. Note that async operations will block the transformation until they complete:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
rewriter.on("div", {
	async element(element) {
		await Bun.sleep(1000);
		element.setInnerContent("<span>replace</span>", { html: true });
	},
});
```

### CSS Selector Support

The `on()` method supports a wide range of CSS selectors:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// Tag selectors
rewriter.on("p", handler);

// Class selectors
rewriter.on("p.red", handler);

// ID selectors
rewriter.on("h1#header", handler);

// Attribute selectors
rewriter.on("p[data-test]", handler); // Has attribute
rewriter.on('p[data-test="one"]', handler); // Exact match
rewriter.on('p[data-test="one" i]', handler); // Case-insensitive
rewriter.on('p[data-test="one" s]', handler); // Case-sensitive
rewriter.on('p[data-test~="two"]', handler); // Word match
rewriter.on('p[data-test^="a"]', handler); // Starts with
rewriter.on('p[data-test$="1"]', handler); // Ends with
rewriter.on('p[data-test*="b"]', handler); // Contains
rewriter.on('p[data-test|="a"]', handler); // Dash-separated

// Combinators
rewriter.on("div span", handler); // Descendant
rewriter.on("div > span", handler); // Direct child

// Pseudo-classes
rewriter.on("p:nth-child(2)", handler);
rewriter.on("p:first-child", handler);
rewriter.on("p:nth-of-type(2)", handler);
rewriter.on("p:first-of-type", handler);
rewriter.on("p:not(:first-child)", handler);

// Universal selector
rewriter.on("*", handler);
```

### Element Operations

Elements provide various methods for manipulation. All modification methods return the element instance for chaining:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
rewriter.on("div", {
	element(el) {
		// Attributes
		el.setAttribute("class", "new-class").setAttribute("data-id", "123");

		const classAttr = el.getAttribute("class"); // "new-class"
		const hasId = el.hasAttribute("id"); // boolean
		el.removeAttribute("class");

		// Content manipulation
		el.setInnerContent("New content"); // Escapes HTML by default
		el.setInnerContent("<p>HTML content</p>", { html: true }); // Parses HTML
		el.setInnerContent(""); // Clear content

		// Position manipulation
		el.before("Content before").after("Content after").prepend("First child").append("Last child");

		// HTML content insertion
		el.before("<span>before</span>", { html: true })
			.after("<span>after</span>", { html: true })
			.prepend("<span>first</span>", { html: true })
			.append("<span>last</span>", { html: true });

		// Removal
		el.remove(); // Remove element and contents
		el.removeAndKeepContent(); // Remove only the element tags

		// Properties
		console.log(el.tagName); // Lowercase tag name
		console.log(el.namespaceURI); // Element's namespace URI
		console.log(el.selfClosing); // Whether element is self-closing (e.g. <div />)
		console.log(el.canHaveContent); // Whether element can contain content (false for void elements like <br>)
		console.log(el.removed); // Whether element was removed

		// Attributes iteration
		for (const [name, value] of el.attributes) {
			console.log(name, value);
		}

		// End tag handling
		el.onEndTag(endTag => {
			endTag.before("Before end tag");
			endTag.after("After end tag");
			endTag.remove(); // Remove the end tag
			console.log(endTag.name); // Tag name in lowercase
		});
	},
});
```

### Text Operations

Text handlers provide methods for text manipulation. Text chunks represent portions of text content and provide information about their position in the text node:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
rewriter.on("p", {
	text(text) {
		// Content
		console.log(text.text); // Text content
		console.log(text.lastInTextNode); // Whether this is the last chunk
		console.log(text.removed); // Whether text was removed

		// Manipulation
		text.before("Before text").after("After text").replace("New text").remove();

		// HTML content insertion
		text
			.before("<span>before</span>", { html: true })
			.after("<span>after</span>", { html: true })
			.replace("<span>replace</span>", { html: true });
	},
});
```

### Comment Operations

Comment handlers allow comment manipulation with similar methods to text nodes:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
rewriter.on("*", {
	comments(comment) {
		// Content
		console.log(comment.text); // Comment text
		comment.text = "New comment text"; // Set comment text
		console.log(comment.removed); // Whether comment was removed

		// Manipulation
		comment.before("Before comment").after("After comment").replace("New comment").remove();

		// HTML content insertion
		comment
			.before("<span>before</span>", { html: true })
			.after("<span>after</span>", { html: true })
			.replace("<span>replace</span>", { html: true });
	},
});
```

### Document Handlers

The `onDocument(handlers)` method allows you to handle document-level events. These handlers are called for events that occur at the document level rather than within specific elements:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
rewriter.onDocument({
	// Handle doctype
	doctype(doctype) {
		console.log(doctype.name); // "html"
		console.log(doctype.publicId); // public identifier if present
		console.log(doctype.systemId); // system identifier if present
	},
	// Handle text nodes
	text(text) {
		console.log(text.text);
	},
	// Handle comments
	comments(comment) {
		console.log(comment.text);
	},
	// Handle document end
	end(end) {
		end.append("<!-- Footer -->", { html: true });
	},
});
```

### Response Handling

When transforming a Response:

* The status code, headers, and other response properties are preserved
* The body is transformed while maintaining streaming capabilities
* Content-encoding (like gzip) is handled automatically
* The original response body is marked as used after transformation
* Headers are cloned to the new response

## Error Handling

HTMLRewriter operations can throw errors in several cases:

* Invalid selector syntax in `on()` method
* Invalid HTML content in transformation methods
* Stream errors when processing Response bodies
* Memory allocation failures
* Invalid input types (e.g., passing Symbol)
* Body already used errors

Errors should be caught and handled appropriately:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
try {
	const result = rewriter.transform(input);
	// Process result
} catch (error) {
	console.error("HTMLRewriter error:", error);
}
```

***

## See also

You can also read the [Cloudflare documentation](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/), which this API is intended to be compatible with.

# Hashing

> Bun provides a set of utility functions for hashing and verifying passwords with various cryptographically secure algorithms

<Note>
  Bun implements the `createHash` and `createHmac` functions from
  [`node:crypto`](https://nodejs.org/api/crypto.html) in addition to the Bun-native APIs documented
  below.
</Note>

***

## `Bun.password`

`Bun.password` is a collection of utility functions for hashing and verifying passwords with various cryptographically secure algorithms.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const password = "super-secure-pa$$word";

const hash = await Bun.password.hash(password);
// => $argon2id$v=19$m=65536,t=2,p=1$tFq+9AVr1bfPxQdh6E8DQRhEXg/M/SqYCNu6gVdRRNs$GzJ8PuBi+K+BVojzPfS5mjnC8OpLGtv8KJqF99eP6a4

const isMatch = await Bun.password.verify(password, hash);
// => true
```

The second argument to `Bun.password.hash` accepts a params object that lets you pick and configure the hashing algorithm.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const password = "super-secure-pa$$word";

// use argon2 (default)
const argonHash = await Bun.password.hash(password, {
	algorithm: "argon2id", // "argon2id" | "argon2i" | "argon2d"
	memoryCost: 4, // memory usage in kibibytes
	timeCost: 3, // the number of iterations
});

// use bcrypt
const bcryptHash = await Bun.password.hash(password, {
	algorithm: "bcrypt",
	cost: 4, // number between 4-31
});
```

The algorithm used to create the hash is stored in the hash itself. When using `bcrypt`, the returned hash is encoded in [Modular Crypt Format](https://passlib.readthedocs.io/en/stable/modular_crypt_format.html) for compatibility with most existing `bcrypt` implementations; with `argon2` the result is encoded in the newer [PHC format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).

The `verify` function automatically detects the algorithm based on the input hash and use the correct verification method. It can correctly infer the algorithm from both PHC- or MCF-encoded hashes.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const password = "super-secure-pa$$word";

const hash = await Bun.password.hash(password, {
	/* config */
});

const isMatch = await Bun.password.verify(password, hash);
// => true
```

Synchronous versions of all functions are also available. Keep in mind that these functions are computationally expensive, so using a blocking API may degrade application performance.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const password = "super-secure-pa$$word";

const hash = Bun.password.hashSync(password, {
	/* config */
});

const isMatch = Bun.password.verifySync(password, hash);
// => true
```

### Salt

When you use `Bun.password.hash`, a salt is automatically generated and included in the hash.

### bcrypt - Modular Crypt Format

In the following [Modular Crypt Format](https://passlib.readthedocs.io/en/stable/modular_crypt_format.html) hash (used by `bcrypt`):

Input:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.password.hash("hello", {
	algorithm: "bcrypt",
});
```

Output:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
$2b$10$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi;
```

The format is composed of:

* `bcrypt`: `$2b`
* `rounds`: `$10` - rounds (log10 of the actual number of rounds)
* `salt`: `$Lyj9kHYZtiyfxh2G60TEfeqs7xkkGiEFFDi3iJGc50ZG/XJ1sxIFi`
* `hash`: `$GzJ8PuBi+K+BVojzPfS5mjnC8OpLGtv8KJqF99eP6a4`

By default, the bcrypt library truncates passwords longer than 72 bytes. In Bun, if you pass `Bun.password.hash` a password longer than 72 bytes and use the `bcrypt` algorithm, the password will be hashed via SHA-512 before being passed to bcrypt.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.password.hash("hello".repeat(100), {
	algorithm: "bcrypt",
});
```

So instead of sending bcrypt a 500-byte password silently truncated to 72 bytes, Bun will hash the password using SHA-512 and send the hashed password to bcrypt (only if it exceeds 72 bytes). This is a more secure default behavior.

### argon2 - PHC format

In the following [PHC format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md) hash (used by `argon2`):

Input:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await Bun.password.hash("hello", {
	algorithm: "argon2id",
});
```

Output:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
$argon2id$v=19$m=65536,t=2,p=1$xXnlSvPh4ym5KYmxKAuuHVlDvy2QGHBNuI6bJJrRDOs$2YY6M48XmHn+s5NoBaL+ficzXajq2Yj8wut3r0vnrwI
```

The format is composed of:

* `algorithm`: `$argon2id`
* `version`: `$v=19`
* `memory cost`: `65536`
* `iterations`: `t=2`
* `parallelism`: `p=1`
* `salt`: `$xXnlSvPh4ym5KYmxKAuuHVlDvy2QGHBNuI6bJJrRDOs`
* `hash`: `$2YY6M48XmHn+s5NoBaL+ficzXajq2Yj8wut3r0vnrwI`

***

## `Bun.hash`

`Bun.hash` is a collection of utilities for *non-cryptographic* hashing. Non-cryptographic hashing algorithms are optimized for speed of computation over collision-resistance or security.

The standard `Bun.hash` functions uses [Wyhash](https://github.com/wangyi-fudan/wyhash) to generate a 64-bit hash from an input of arbitrary size.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.hash("some data here");
// 11562320457524636935n
```

The input can be a string, `TypedArray`, `DataView`, `ArrayBuffer`, or `SharedArrayBuffer`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const arr = new Uint8Array([1, 2, 3, 4]);

Bun.hash("some data here");
Bun.hash(arr);
Bun.hash(arr.buffer);
Bun.hash(new DataView(arr.buffer));
```

Optionally, an integer seed can be specified as the second parameter. For 64-bit hashes seeds above `Number.MAX_SAFE_INTEGER` should be given as BigInt to avoid loss of precision.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.hash("some data here", 1234);
// 15724820720172937558n
```

Additional hashing algorithms are available as properties on `Bun.hash`. The API is the same for each, only changing the return type from number for 32-bit hashes to bigint for 64-bit hashes.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.hash.wyhash("data", 1234); // equivalent to Bun.hash()
Bun.hash.crc32("data", 1234);
Bun.hash.adler32("data", 1234);
Bun.hash.cityHash32("data", 1234);
Bun.hash.cityHash64("data", 1234);
Bun.hash.xxHash32("data", 1234);
Bun.hash.xxHash64("data", 1234);
Bun.hash.xxHash3("data", 1234);
Bun.hash.murmur32v3("data", 1234);
Bun.hash.murmur32v2("data", 1234);
Bun.hash.murmur64v2("data", 1234);
Bun.hash.rapidhash("data", 1234);
```

***

## `Bun.CryptoHasher`

`Bun.CryptoHasher` is a general-purpose utility class that lets you incrementally compute a hash of string or binary data using a range of cryptographic hash algorithms. The following algorithms are supported:

* `"blake2b256"`
* `"blake2b512"`
* `"md4"`
* `"md5"`
* `"ripemd160"`
* `"sha1"`
* `"sha224"`
* `"sha256"`
* `"sha384"`
* `"sha512"`
* `"sha512-224"`
* `"sha512-256"`
* `"sha3-224"`
* `"sha3-256"`
* `"sha3-384"`
* `"sha3-512"`
* `"shake128"`
* `"shake256"`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const hasher = new Bun.CryptoHasher("sha256");
hasher.update("hello world");
hasher.digest();
// Uint8Array(32) [ <byte>, <byte>, ... ]
```

Once initialized, data can be incrementally fed to to the hasher using `.update()`. This method accepts `string`, `TypedArray`, and `ArrayBuffer`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const hasher = new Bun.CryptoHasher("sha256");

hasher.update("hello world");
hasher.update(new Uint8Array([1, 2, 3]));
hasher.update(new ArrayBuffer(10));
```

If a `string` is passed, an optional second parameter can be used to specify the encoding (default `'utf-8'`). The following encodings are supported:

| Category                   | Encodings                                   |
| -------------------------- | ------------------------------------------- |
| Binary encodings           | `"base64"` `"base64url"` `"hex"` `"binary"` |
| Character encodings        | `"utf8"` `"utf-8"` `"utf16le"` `"latin1"`   |
| Legacy character encodings | `"ascii"` `"binary"` `"ucs2"` `"ucs-2"`     |

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
hasher.update("hello world"); // defaults to utf8
hasher.update("hello world", "hex");
hasher.update("hello world", "base64");
hasher.update("hello world", "latin1");
```

After the data has been feed into the hasher, a final hash can be computed using `.digest()`. By default, this method returns a `Uint8Array` containing the hash.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const hasher = new Bun.CryptoHasher("sha256");
hasher.update("hello world");

hasher.digest();
// => Uint8Array(32) [ 185, 77, 39, 185, 147, ... ]
```

The `.digest()` method can optionally return the hash as a string. To do so, specify an encoding:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
hasher.digest("base64");
// => "uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek="

hasher.digest("hex");
// => "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
```

Alternatively, the method can write the hash into a pre-existing `TypedArray` instance. This may be desirable in some performance-sensitive applications.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const arr = new Uint8Array(32);

hasher.digest(arr);

console.log(arr);
// => Uint8Array(32) [ 185, 77, 39, 185, 147, ... ]
```

### HMAC in `Bun.CryptoHasher`

`Bun.CryptoHasher` can be used to compute HMAC digests. To do so, pass the key to the constructor.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const hasher = new Bun.CryptoHasher("sha256", "secret-key");
hasher.update("hello world");
console.log(hasher.digest("hex"));
// => "095d5a21fe6d0646db223fdf3de6436bb8dfb2fab0b51677ecf6441fcf5f2a67"
```

When using HMAC, a more limited set of algorithms are supported:

* `"blake2b512"`
* `"md5"`
* `"sha1"`
* `"sha224"`
* `"sha256"`
* `"sha384"`
* `"sha512-224"`
* `"sha512-256"`
* `"sha512"`

Unlike the non-HMAC `Bun.CryptoHasher`, the HMAC `Bun.CryptoHasher` instance is not reset after `.digest()` is called, and attempting to use the same instance again will throw an error.

Other methods like `.copy()` and `.update()` are supported (as long as it's before `.digest()`), but methods like `.digest()` that finalize the hasher are not.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const hasher = new Bun.CryptoHasher("sha256", "secret-key");
hasher.update("hello world");

const copy = hasher.copy();
copy.update("!");
console.log(copy.digest("hex"));
// => "3840176c3d8923f59ac402b7550404b28ab11cb0ef1fa199130a5c37864b5497"

console.log(hasher.digest("hex"));
// => "095d5a21fe6d0646db223fdf3de6436bb8dfb2fab0b51677ecf6441fcf5f2a67"
```

# Glob

> Use Bun's fast native implementation of file globbing

## Quickstart

**Scan a directory for files matching `*.ts`**:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Glob } from "bun";

const glob = new Glob("**/*.ts");

// Scans the current working directory and each of its sub-directories recursively
for await (const file of glob.scan(".")) {
	console.log(file); // => "index.ts"
}
```

**Match a string against a glob pattern**:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { Glob } from "bun";

const glob = new Glob("*.ts");

glob.match("index.ts"); // => true
glob.match("index.js"); // => false
```

`Glob` is a class which implements the following interface:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
class Glob {
	scan(root: string | ScanOptions): AsyncIterable<string>;
	scanSync(root: string | ScanOptions): Iterable<string>;

	match(path: string): boolean;
}

interface ScanOptions {
	/**
	 * The root directory to start matching from. Defaults to `process.cwd()`
	 */
	cwd?: string;

	/**
	 * Allow patterns to match entries that begin with a period (`.`).
	 *
	 * @default false
	 */
	dot?: boolean;

	/**
	 * Return the absolute path for entries.
	 *
	 * @default false
	 */
	absolute?: boolean;

	/**
	 * Indicates whether to traverse descendants of symbolic link directories.
	 *
	 * @default false
	 */
	followSymlinks?: boolean;

	/**
	 * Throw an error when symbolic link is broken
	 *
	 * @default false
	 */
	throwErrorOnBrokenSymlink?: boolean;

	/**
	 * Return only files.
	 *
	 * @default true
	 */
	onlyFiles?: boolean;
}
```

## Supported Glob Patterns

Bun supports the following glob patterns:

### `?` - Match any single character

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("???.ts");
glob.match("foo.ts"); // => true
glob.match("foobar.ts"); // => false
```

### `*` - Matches zero or more characters, except for path separators (`/` or `\`)

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("*.ts");
glob.match("index.ts"); // => true
glob.match("src/index.ts"); // => false
```

### `**` - Match any number of characters including `/`

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("**/*.ts");
glob.match("index.ts"); // => true
glob.match("src/index.ts"); // => true
glob.match("src/index.js"); // => false
```

### `[ab]` - Matches one of the characters contained in the brackets, as well as character ranges

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("ba[rz].ts");
glob.match("bar.ts"); // => true
glob.match("baz.ts"); // => true
glob.match("bat.ts"); // => false
```

You can use character ranges (e.g `[0-9]`, `[a-z]`) as well as the negation operators `^` or `!` to match anything *except* the characters contained within the braces (e.g `[^ab]`, `[!a-z]`)

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("ba[a-z][0-9][^4-9].ts");
glob.match("bar01.ts"); // => true
glob.match("baz83.ts"); // => true
glob.match("bat22.ts"); // => true
glob.match("bat24.ts"); // => false
glob.match("ba0a8.ts"); // => false
```

### `{a,b,c}` - Match any of the given patterns

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("{a,b,c}.ts");
glob.match("a.ts"); // => true
glob.match("b.ts"); // => true
glob.match("c.ts"); // => true
glob.match("d.ts"); // => false
```

These match patterns can be deeply nested (up to 10 levels), and contain any of the wildcards from above.

### `!` - Negates the result at the start of a pattern

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("!index.ts");
glob.match("index.ts"); // => false
glob.match("foo.ts"); // => true
```

### `\` - Escapes any of the special characters above

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const glob = new Glob("\\!index.ts");
glob.match("!index.ts"); // => true
glob.match("index.ts"); // => false
```

## Node.js `fs.glob()` compatibility

Bun also implements Node.js's `fs.glob()` functions with additional features:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { glob, globSync, promises } from "node:fs";

// Array of patterns
const files = await promises.glob(["**/*.ts", "**/*.js"]);

// Exclude patterns
const filtered = await promises.glob("**/*", {
	exclude: ["node_modules/**", "*.test.*"],
});
```

All three functions (`fs.glob()`, `fs.globSync()`, `fs.promises.glob()`) support:

* Array of patterns as the first argument
* `exclude` option to filter results

# Semver

> Use Bun's semantic versioning API

Bun implements a semantic versioning API which can be used to compare versions and determine if a version is compatible with another range of versions. The versions and ranges are designed to be compatible with `node-semver`, which is used by npm clients.

It's about 20x faster than `node-semver`.

<Frame>
  ![Benchmark](https://github.com/oven-sh/bun/assets/709451/94746adc-8aba-4baf-a143-3c355f8e0f78)
</Frame>

Currently, this API provides two functions:

## `Bun.semver.satisfies(version: string, range: string): boolean`

Returns `true` if `version` satisfies `range`, otherwise `false`.

Example:

```typescript  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { semver } from "bun";

semver.satisfies("1.0.0", "^1.0.0"); // true
semver.satisfies("1.0.0", "^1.0.1"); // false
semver.satisfies("1.0.0", "~1.0.0"); // true
semver.satisfies("1.0.0", "~1.0.1"); // false
semver.satisfies("1.0.0", "1.0.0"); // true
semver.satisfies("1.0.0", "1.0.1"); // false
semver.satisfies("1.0.1", "1.0.0"); // false
semver.satisfies("1.0.0", "1.0.x"); // true
semver.satisfies("1.0.0", "1.x.x"); // true
semver.satisfies("1.0.0", "x.x.x"); // true
semver.satisfies("1.0.0", "1.0.0 - 2.0.0"); // true
semver.satisfies("1.0.0", "1.0.0 - 1.0.1"); // true
```

If `range` is invalid, it returns false. If `version` is invalid, it returns false.

## `Bun.semver.order(versionA: string, versionB: string): 0 | 1 | -1`

Returns `0` if `versionA` and `versionB` are equal, `1` if `versionA` is greater than `versionB`, and `-1` if `versionA` is less than `versionB`.

Example:

```typescript  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { semver } from "bun";

semver.order("1.0.0", "1.0.0"); // 0
semver.order("1.0.0", "1.0.1"); // -1
semver.order("1.0.1", "1.0.0"); // 1

const unsorted = ["1.0.0", "1.0.1", "1.0.0-alpha", "1.0.0-beta", "1.0.0-rc"];
unsorted.sort(semver.order); // ["1.0.0-alpha", "1.0.0-beta", "1.0.0-rc", "1.0.0", "1.0.1"]
console.log(unsorted);
```

If you need other semver functions, feel free to open an issue or pull request.

# Color

> Format colors as CSS, ANSI, numbers, hex strings, and more

`Bun.color(input, outputFormat?)` leverages Bun's CSS parser to parse, normalize, and convert colors from user input to a variety of output formats, including:

| Format       | Example                          |
| ------------ | -------------------------------- |
| `"css"`      | `"red"`                          |
| `"ansi"`     | `"\x1b[38;2;255;0;0m"`           |
| `"ansi-16"`  | `"\x1b[38;5;\tm"`                |
| `"ansi-256"` | `"\x1b[38;5;196m"`               |
| `"ansi-16m"` | `"\x1b[38;2;255;0;0m"`           |
| `"number"`   | `0x1a2b3c`                       |
| `"rgb"`      | `"rgb(255, 99, 71)"`             |
| `"rgba"`     | `"rgba(255, 99, 71, 0.5)"`       |
| `"hsl"`      | `"hsl(120, 50%, 50%)"`           |
| `"hex"`      | `"#1a2b3c"`                      |
| `"HEX"`      | `"#1A2B3C"`                      |
| `"{rgb}"`    | `{ r: 255, g: 99, b: 71 }`       |
| `"{rgba}"`   | `{ r: 255, g: 99, b: 71, a: 1 }` |
| `"[rgb]"`    | `[ 255, 99, 71 ]`                |
| `"[rgba]"`   | `[ 255, 99, 71, 255]`            |

There are many different ways to use this API:

* Validate and normalize colors to persist in a database (`number` is the most database-friendly)
* Convert colors to different formats
* Colorful logging beyond the 16 colors many use today (use `ansi` if you don't want to figure out what the user's terminal supports, otherwise use `ansi-16`, `ansi-256`, or `ansi-16m` for how many colors the terminal supports)
* Format colors for use in CSS injected into HTML
* Get the `r`, `g`, `b`, and `a` color components as JavaScript objects or numbers from a CSS color string

You can think of this as an alternative to the popular npm packages [`color`](https://github.com/Qix-/color) and [`tinycolor2`](https://github.com/bgrins/TinyColor) except with full support for parsing CSS color strings and zero dependencies built directly into Bun.

### Flexible input

You can pass in any of the following:

* Standard CSS color names like `"red"`
* Numbers like `0xff0000`
* Hex strings like `"#f00"`
* RGB strings like `"rgb(255, 0, 0)"`
* RGBA strings like `"rgba(255, 0, 0, 1)"`
* HSL strings like `"hsl(0, 100%, 50%)"`
* HSLA strings like `"hsla(0, 100%, 50%, 1)"`
* RGB objects like `{ r: 255, g: 0, b: 0 }`
* RGBA objects like `{ r: 255, g: 0, b: 0, a: 1 }`
* RGB arrays like `[255, 0, 0]`
* RGBA arrays like `[255, 0, 0, 255]`
* LAB strings like `"lab(50% 50% 50%)"`
* ... anything else that CSS can parse as a single color value

### Format colors as CSS

The `"css"` format outputs valid CSS for use in stylesheets, inline styles, CSS variables, css-in-js, etc. It returns the most compact representation of the color as a string.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("red", "css"); // "red"
Bun.color(0xff0000, "css"); // "#f000"
Bun.color("#f00", "css"); // "red"
Bun.color("#ff0000", "css"); // "red"
Bun.color("rgb(255, 0, 0)", "css"); // "red"
Bun.color("rgba(255, 0, 0, 1)", "css"); // "red"
Bun.color("hsl(0, 100%, 50%)", "css"); // "red"
Bun.color("hsla(0, 100%, 50%, 1)", "css"); // "red"
Bun.color({ r: 255, g: 0, b: 0 }, "css"); // "red"
Bun.color({ r: 255, g: 0, b: 0, a: 1 }, "css"); // "red"
Bun.color([255, 0, 0], "css"); // "red"
Bun.color([255, 0, 0, 255], "css"); // "red"
```

If the input is unknown or fails to parse, `Bun.color` returns `null`.

### Format colors as ANSI (for terminals)

The `"ansi"` format outputs ANSI escape codes for use in terminals to make text colorful.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("red", "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color(0xff0000, "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color("#f00", "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color("#ff0000", "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color("rgb(255, 0, 0)", "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color("rgba(255, 0, 0, 1)", "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color("hsl(0, 100%, 50%)", "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color("hsla(0, 100%, 50%, 1)", "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color({ r: 255, g: 0, b: 0 }, "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color({ r: 255, g: 0, b: 0, a: 1 }, "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color([255, 0, 0], "ansi"); // "\u001b[38;2;255;0;0m"
Bun.color([255, 0, 0, 255], "ansi"); // "\u001b[38;2;255;0;0m"
```

This gets the color depth of stdout and automatically chooses one of `"ansi-16m"`, `"ansi-256"`, `"ansi-16"` based on the environment variables. If stdout doesn't support any form of ANSI color, it returns an empty string. As with the rest of Bun's color API, if the input is unknown or fails to parse, it returns `null`.

#### 24-bit ANSI colors (`ansi-16m`)

The `"ansi-16m"` format outputs 24-bit ANSI colors for use in terminals to make text colorful. 24-bit color means you can display 16 million colors on supported terminals, and requires a modern terminal that supports it.

This converts the input color to RGBA, and then outputs that as an ANSI color.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("red", "ansi-16m"); // "\x1b[38;2;255;0;0m"
Bun.color(0xff0000, "ansi-16m"); // "\x1b[38;2;255;0;0m"
Bun.color("#f00", "ansi-16m"); // "\x1b[38;2;255;0;0m"
Bun.color("#ff0000", "ansi-16m"); // "\x1b[38;2;255;0;0m"
```

#### 256 ANSI colors (`ansi-256`)

The `"ansi-256"` format approximates the input color to the nearest of the 256 ANSI colors supported by some terminals.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("red", "ansi-256"); // "\u001b[38;5;196m"
Bun.color(0xff0000, "ansi-256"); // "\u001b[38;5;196m"
Bun.color("#f00", "ansi-256"); // "\u001b[38;5;196m"
Bun.color("#ff0000", "ansi-256"); // "\u001b[38;5;196m"
```

To convert from RGBA to one of the 256 ANSI colors, we ported the algorithm that [`tmux` uses](https://github.com/tmux/tmux/blob/dae2868d1227b95fd076fb4a5efa6256c7245943/colour.c#L44-L55).

#### 16 ANSI colors (`ansi-16`)

The `"ansi-16"` format approximates the input color to the nearest of the 16 ANSI colors supported by most terminals.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("red", "ansi-16"); // "\u001b[38;5;\tm"
Bun.color(0xff0000, "ansi-16"); // "\u001b[38;5;\tm"
Bun.color("#f00", "ansi-16"); // "\u001b[38;5;\tm"
Bun.color("#ff0000", "ansi-16"); // "\u001b[38;5;\tm"
```

This works by first converting the input to a 24-bit RGB color space, then to `ansi-256`, and then we convert that to the nearest 16 ANSI color.

### Format colors as numbers

The `"number"` format outputs a 24-bit number for use in databases, configuration, or any other use case where a compact representation of the color is desired.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("red", "number"); // 16711680
Bun.color(0xff0000, "number"); // 16711680
Bun.color({ r: 255, g: 0, b: 0 }, "number"); // 16711680
Bun.color([255, 0, 0], "number"); // 16711680
Bun.color("rgb(255, 0, 0)", "number"); // 16711680
Bun.color("rgba(255, 0, 0, 1)", "number"); // 16711680
Bun.color("hsl(0, 100%, 50%)", "number"); // 16711680
Bun.color("hsla(0, 100%, 50%, 1)", "number"); // 16711680
```

### Get the red, green, blue, and alpha channels

You can use the `"{rgba}"`, `"{rgb}"`, `"[rgba]"` and `"[rgb]"` formats to get the red, green, blue, and alpha channels as objects or arrays.

#### `{rgba}` object

The `"{rgba}"` format outputs an object with the red, green, blue, and alpha channels.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
type RGBAObject = {
	// 0 - 255
	r: number;
	// 0 - 255
	g: number;
	// 0 - 255
	b: number;
	// 0 - 1
	a: number;
};
```

Example:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("hsl(0, 0%, 50%)", "{rgba}"); // { r: 128, g: 128, b: 128, a: 1 }
Bun.color("red", "{rgba}"); // { r: 255, g: 0, b: 0, a: 1 }
Bun.color(0xff0000, "{rgba}"); // { r: 255, g: 0, b: 0, a: 1 }
Bun.color({ r: 255, g: 0, b: 0 }, "{rgba}"); // { r: 255, g: 0, b: 0, a: 1 }
Bun.color([255, 0, 0], "{rgba}"); // { r: 255, g: 0, b: 0, a: 1 }
```

To behave similarly to CSS, the `a` channel is a decimal number between `0` and `1`.

The `"{rgb}"` format is similar, but it doesn't include the alpha channel.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("hsl(0, 0%, 50%)", "{rgb}"); // { r: 128, g: 128, b: 128 }
Bun.color("red", "{rgb}"); // { r: 255, g: 0, b: 0 }
Bun.color(0xff0000, "{rgb}"); // { r: 255, g: 0, b: 0 }
Bun.color({ r: 255, g: 0, b: 0 }, "{rgb}"); // { r: 255, g: 0, b: 0 }
Bun.color([255, 0, 0], "{rgb}"); // { r: 255, g: 0, b: 0 }
```

#### `[rgba]` array

The `"[rgba]"` format outputs an array with the red, green, blue, and alpha channels.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// All values are 0 - 255
type RGBAArray = [number, number, number, number];
```

Example:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("hsl(0, 0%, 50%)", "[rgba]"); // [128, 128, 128, 255]
Bun.color("red", "[rgba]"); // [255, 0, 0, 255]
Bun.color(0xff0000, "[rgba]"); // [255, 0, 0, 255]
Bun.color({ r: 255, g: 0, b: 0 }, "[rgba]"); // [255, 0, 0, 255]
Bun.color([255, 0, 0], "[rgba]"); // [255, 0, 0, 255]
```

Unlike the `"{rgba}"` format, the alpha channel is an integer between `0` and `255`. This is useful for typed arrays where each channel must be the same underlying type.

The `"[rgb]"` format is similar, but it doesn't include the alpha channel.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("hsl(0, 0%, 50%)", "[rgb]"); // [128, 128, 128]
Bun.color("red", "[rgb]"); // [255, 0, 0]
Bun.color(0xff0000, "[rgb]"); // [255, 0, 0]
Bun.color({ r: 255, g: 0, b: 0 }, "[rgb]"); // [255, 0, 0]
Bun.color([255, 0, 0], "[rgb]"); // [255, 0, 0]
```

### Format colors as hex strings

The `"hex"` format outputs a lowercase hex string for use in CSS or other contexts.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("hsl(0, 0%, 50%)", "hex"); // "#808080"
Bun.color("red", "hex"); // "#ff0000"
Bun.color(0xff0000, "hex"); // "#ff0000"
Bun.color({ r: 255, g: 0, b: 0 }, "hex"); // "#ff0000"
Bun.color([255, 0, 0], "hex"); // "#ff0000"
```

The `"HEX"` format is similar, but it outputs a hex string with uppercase letters instead of lowercase letters.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.color("hsl(0, 0%, 50%)", "HEX"); // "#808080"
Bun.color("red", "HEX"); // "#FF0000"
Bun.color(0xff0000, "HEX"); // "#FF0000"
Bun.color({ r: 255, g: 0, b: 0 }, "HEX"); // "#FF0000"
Bun.color([255, 0, 0], "HEX"); // "#FF0000"
```

### Bundle-time client-side color formatting

Like many of Bun's APIs, you can use macros to invoke `Bun.color` at bundle-time for use in client-side JavaScript builds:

```ts client-side.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
import { color } from "bun" with { type: "macro" };

console.log(color("#f00", "css"));
```

Then, build the client-side code:

```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun build ./client-side.ts
```

This will output the following to `client-side.js`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
// client-side.ts
console.log("red");
```
# Utils

> Use Bun's utility functions to work with the runtime

## `Bun.version`

A `string` containing the version of the `bun` CLI that is currently running.

```ts terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.version;
// => "0.6.4"
```

## `Bun.revision`

The git commit of [Bun](https://github.com/oven-sh/bun) that was compiled to create the current `bun` CLI.

```ts terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.revision;
// => "f02561530fda1ee9396f51c8bc99b38716e38296"
```

## `Bun.env`

An alias for `process.env`.

## `Bun.main`

An absolute path to the entrypoint of the current program (the file that was executed with `bun run`).

```ts script.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.main;
// /path/to/script.ts
```

This is particular useful for determining whether a script is being directly executed, as opposed to being imported by another script.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
if (import.meta.path === Bun.main) {
	// this script is being directly executed
} else {
	// this file is being imported from another script
}
```

This is analogous to the [`require.main = module` trick](https://stackoverflow.com/questions/6398196/detect-if-called-through-require-or-directly-by-command-line) in Node.js.

## `Bun.sleep()`

`Bun.sleep(ms: number)`

Returns a `Promise` that resolves after the given number of milliseconds.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log("hello");
await Bun.sleep(1000);
console.log("hello one second later!");
```

Alternatively, pass a `Date` object to receive a `Promise` that resolves at that point in time.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const oneSecondInFuture = new Date(Date.now() + 1000);

console.log("hello");
await Bun.sleep(oneSecondInFuture);
console.log("hello one second later!");
```

## `Bun.sleepSync()`

`Bun.sleepSync(ms: number)`

A blocking synchronous version of `Bun.sleep`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log("hello");
Bun.sleepSync(1000); // blocks thread for one second
console.log("hello one second later!");
```

## `Bun.which()`

`Bun.which(bin: string)`

Returns the path to an executable, similar to typing `which` in your terminal.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const ls = Bun.which("ls");
console.log(ls); // "/usr/bin/ls"
```

By default Bun looks at the current `PATH` environment variable to determine the path. To configure `PATH`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const ls = Bun.which("ls", {
	PATH: "/usr/local/bin:/usr/bin:/bin",
});
console.log(ls); // "/usr/bin/ls"
```

Pass a `cwd` option to resolve for executable from within a specific directory.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const ls = Bun.which("ls", {
	cwd: "/tmp",
	PATH: "",
});

console.log(ls); // null
```

You can think of this as a builtin alternative to the [`which`](https://www.npmjs.com/package/which) npm package.

## `Bun.randomUUIDv7()`

`Bun.randomUUIDv7()` returns a [UUID v7](https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-01.html#name-uuidv7-layout-and-bit-order), which is monotonic and suitable for sorting and databases.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { randomUUIDv7 } from "bun";

const id = randomUUIDv7();
// => "0192ce11-26d5-7dc3-9305-1426de888c5a"
```

A UUID v7 is a 128-bit value that encodes the current timestamp, a random value, and a counter. The timestamp is encoded using the lowest 48 bits, and the random value and counter are encoded using the remaining bits.

The `timestamp` parameter defaults to the current time in milliseconds. When the timestamp changes, the counter is reset to a pseudo-random integer wrapped to 4096. This counter is atomic and threadsafe, meaning that using `Bun.randomUUIDv7()` in many Workers within the same process running at the same timestamp will not have colliding counter values.

The final 8 bytes of the UUID are a cryptographically secure random value. It uses the same random number generator used by `crypto.randomUUID()` (which comes from BoringSSL, which in turn comes from the platform-specific system random number generator usually provided by the underlying hardware).

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
namespace Bun {
	function randomUUIDv7(
		encoding?: "hex" | "base64" | "base64url" = "hex",
		timestamp?: number = Date.now(),
	): string;
	/**
	 * If you pass "buffer", you get a 16-byte buffer instead of a string.
	 */
	function randomUUIDv7(encoding: "buffer", timestamp?: number = Date.now()): Buffer;

	// If you only pass a timestamp, you get a hex string
	function randomUUIDv7(timestamp?: number = Date.now()): string;
}
```

You can optionally set encoding to `"buffer"` to get a 16-byte buffer instead of a string. This can sometimes avoid string conversion overhead.

```ts buffer.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
const buffer = Bun.randomUUIDv7("buffer");
```

`base64` and `base64url` encodings are also supported when you want a slightly shorter string.

```ts base64.ts theme={"theme":{"light":"github-light","dark":"dracula"}}
const base64 = Bun.randomUUIDv7("base64");
const base64url = Bun.randomUUIDv7("base64url");
```

## `Bun.peek()`

`Bun.peek(prom: Promise)`

Reads a promise's result without `await` or `.then`, but only if the promise has already fulfilled or rejected.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { peek } from "bun";

const promise = Promise.resolve("hi");

// no await!
const result = peek(promise);
console.log(result); // "hi"
```

This is important when attempting to reduce number of extraneous microticks in performance-sensitive code. It's an advanced API and you probably shouldn't use it unless you know what you're doing.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { peek } from "bun";
import { expect, test } from "bun:test";

test("peek", () => {
	const promise = Promise.resolve(true);

	// no await necessary!
	expect(peek(promise)).toBe(true);

	// if we peek again, it returns the same value
	const again = peek(promise);
	expect(again).toBe(true);

	// if we peek a non-promise, it returns the value
	const value = peek(42);
	expect(value).toBe(42);

	// if we peek a pending promise, it returns the promise again
	const pending = new Promise(() => {});
	expect(peek(pending)).toBe(pending);

	// If we peek a rejected promise, it:
	// - returns the error
	// - does not mark the promise as handled
	const rejected = Promise.reject(new Error("Successfully tested promise rejection"));
	expect(peek(rejected).message).toBe("Successfully tested promise rejection");
});
```

The `peek.status` function lets you read the status of a promise without resolving it.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { peek } from "bun";
import { expect, test } from "bun:test";

test("peek.status", () => {
	const promise = Promise.resolve(true);
	expect(peek.status(promise)).toBe("fulfilled");

	const pending = new Promise(() => {});
	expect(peek.status(pending)).toBe("pending");

	const rejected = Promise.reject(new Error("oh nooo"));
	expect(peek.status(rejected)).toBe("rejected");
});
```

## `Bun.openInEditor()`

Opens a file in your default editor. Bun auto-detects your editor via the `$VISUAL` or `$EDITOR` environment variables.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const currentFile = import.meta.url;
Bun.openInEditor(currentFile);
```

You can override this via the `debug.editor` setting in your [`bunfig.toml`](/runtime/bunfig).

```toml bunfig.toml theme={"theme":{"light":"github-light","dark":"dracula"}}
[debug] // [!code ++]
editor = "code" // [!code ++]
```

Or specify an editor with the `editor` param. You can also specify a line and column number.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.openInEditor(import.meta.url, {
	editor: "vscode", // or "subl"
	line: 10,
	column: 5,
});
```

## `Bun.deepEquals()`

Recursively checks if two objects are equivalent. This is used internally by `expect().toEqual()` in `bun:test`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const foo = { a: 1, b: 2, c: { d: 3 } };

// true
Bun.deepEquals(foo, { a: 1, b: 2, c: { d: 3 } });

// false
Bun.deepEquals(foo, { a: 1, b: 2, c: { d: 4 } });
```

A third boolean parameter can be used to enable "strict" mode. This is used by `expect().toStrictEqual()` in the test runner.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const a = { entries: [1, 2] };
const b = { entries: [1, 2], extra: undefined };

Bun.deepEquals(a, b); // => true
Bun.deepEquals(a, b, true); // => false
```

In strict mode, the following are considered unequal:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
// undefined values
Bun.deepEquals({}, { a: undefined }, true); // false

// undefined in arrays
Bun.deepEquals(["asdf"], ["asdf", undefined], true); // false

// sparse arrays
Bun.deepEquals([, 1], [undefined, 1], true); // false

// object literals vs instances w/ same properties
class Foo {
	a = 1;
}
Bun.deepEquals(new Foo(), { a: 1 }, true); // false
```

## `Bun.escapeHTML()`

`Bun.escapeHTML(value: string | object | number | boolean): string`

Escapes the following characters from an input string:

* `"` becomes `&quot;`
* `&` becomes `&amp;`
* `'` becomes `&#x27;`
* `<` becomes `&lt;`
* `>` becomes `&gt;`

This function is optimized for large input. On an M1X, it processes 480 MB/s -
20 GB/s, depending on how much data is being escaped and whether there is non-ascii
text. Non-string types will be converted to a string before escaping.

## `Bun.stringWidth()`

<Note>\~6,756x faster `string-width` alternative</Note>

Get the column count of a string as it would be displayed in a terminal.
Supports ANSI escape codes, emoji, and wide characters.

Example usage:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.stringWidth("hello"); // => 5
Bun.stringWidth("\u001b[31mhello\u001b[0m"); // => 5
Bun.stringWidth("\u001b[31mhello\u001b[0m", { countAnsiEscapeCodes: true }); // => 12
```

This is useful for:

* Aligning text in a terminal
* Quickly checking if a string contains ANSI escape codes
* Measuring the width of a string in a terminal

This API is designed to match the popular "string-width" package, so that
existing code can be easily ported to Bun and vice versa.

[In this benchmark](https://github.com/oven-sh/bun/blob/5147c0ba7379d85d4d1ed0714b84d6544af917eb/bench/snippets/string-width.mjs#L13), `Bun.stringWidth` is a \~6,756x faster than the `string-width` npm package for input larger than about 500 characters. Big thanks to [sindresorhus](https://github.com/sindresorhus) for their work on `string-width`!

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
❯ bun string-width.mjs
cpu: 13th Gen Intel(R) Core(TM) i9-13900
runtime: bun 1.0.29 (x64-linux)

benchmark                                          time (avg)             (min … max)       p75       p99      p995
------------------------------------------------------------------------------------- -----------------------------
Bun.stringWidth     500 chars ascii              37.09 ns/iter   (36.77 ns … 41.11 ns)  37.07 ns  38.84 ns  38.99 ns

❯ node string-width.mjs

benchmark                                          time (avg)             (min … max)       p75       p99      p995
------------------------------------------------------------------------------------- -----------------------------
npm/string-width    500 chars ascii             249,710 ns/iter (239,970 ns … 293,180 ns) 250,930 ns  276,700 ns 281,450 ns
```

To make `Bun.stringWidth` fast, we've implemented it in Zig using optimized SIMD instructions, accounting for Latin1, UTF-16, and UTF-8 encodings. It passes `string-width`'s tests.

<Accordion title="View full benchmark">
  As a reminder, 1 nanosecond (ns) is 1 billionth of a second. Here's a quick reference for converting between units:

  | Unit | 1 Millisecond |
  | ---- | ------------- |
  | ns   | 1,000,000     |
  | µs   | 1,000         |
  | ms   | 1             |

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  ❯ bun string-width.mjs
  cpu: 13th Gen Intel(R) Core(TM) i9-13900
  runtime: bun 1.0.29 (x64-linux)

  benchmark                                          time (avg)             (min … max)       p75       p99      p995
  ------------------------------------------------------------------------------------- -----------------------------
  Bun.stringWidth      5 chars ascii              16.45 ns/iter   (16.27 ns … 19.71 ns)  16.48 ns  16.93 ns  17.21 ns
  Bun.stringWidth     50 chars ascii              19.42 ns/iter   (18.61 ns … 27.85 ns)  19.35 ns   21.7 ns  22.31 ns
  Bun.stringWidth    500 chars ascii              37.09 ns/iter   (36.77 ns … 41.11 ns)  37.07 ns  38.84 ns  38.99 ns
  Bun.stringWidth  5,000 chars ascii              216.9 ns/iter  (215.8 ns … 228.54 ns) 216.23 ns 228.52 ns 228.53 ns
  Bun.stringWidth 25,000 chars ascii               1.01 µs/iter     (1.01 µs … 1.01 µs)   1.01 µs   1.01 µs   1.01 µs
  Bun.stringWidth      7 chars ascii+emoji         54.2 ns/iter   (53.36 ns … 58.19 ns)  54.23 ns  57.55 ns  57.94 ns
  Bun.stringWidth     70 chars ascii+emoji       354.26 ns/iter (350.51 ns … 363.96 ns) 355.93 ns 363.11 ns 363.96 ns
  Bun.stringWidth    700 chars ascii+emoji          3.3 µs/iter      (3.27 µs … 3.4 µs)    3.3 µs    3.4 µs    3.4 µs
  Bun.stringWidth  7,000 chars ascii+emoji        32.69 µs/iter   (32.22 µs … 45.27 µs)   32.7 µs  34.57 µs  34.68 µs
  Bun.stringWidth 35,000 chars ascii+emoji       163.35 µs/iter (161.17 µs … 170.79 µs) 163.82 µs 169.66 µs 169.93 µs
  Bun.stringWidth      8 chars ansi+emoji         66.15 ns/iter   (65.17 ns … 69.97 ns)  66.12 ns   69.8 ns  69.87 ns
  Bun.stringWidth     80 chars ansi+emoji        492.95 ns/iter  (488.05 ns … 499.5 ns)  494.8 ns 498.58 ns  499.5 ns
  Bun.stringWidth    800 chars ansi+emoji          4.73 µs/iter     (4.71 µs … 4.88 µs)   4.72 µs   4.88 µs   4.88 µs
  Bun.stringWidth  8,000 chars ansi+emoji         47.02 µs/iter   (46.37 µs … 67.44 µs)  46.96 µs  49.57 µs  49.63 µs
  Bun.stringWidth 40,000 chars ansi+emoji        234.45 µs/iter (231.78 µs … 240.98 µs) 234.92 µs 236.34 µs 236.62 µs
  Bun.stringWidth     19 chars ansi+emoji+ascii  135.46 ns/iter (133.67 ns … 143.26 ns) 135.32 ns 142.55 ns 142.77 ns
  Bun.stringWidth    190 chars ansi+emoji+ascii    1.17 µs/iter     (1.16 µs … 1.17 µs)   1.17 µs   1.17 µs   1.17 µs
  Bun.stringWidth  1,900 chars ansi+emoji+ascii   11.45 µs/iter   (11.26 µs … 20.41 µs)  11.45 µs  12.08 µs  12.11 µs
  Bun.stringWidth 19,000 chars ansi+emoji+ascii  114.06 µs/iter (112.86 µs … 120.06 µs) 114.25 µs 115.86 µs 116.15 µs
  Bun.stringWidth 95,000 chars ansi+emoji+ascii  572.69 µs/iter (565.52 µs … 607.22 µs) 572.45 µs 604.86 µs 605.21 µs
  ```

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  ❯ node string-width.mjs
  cpu: 13th Gen Intel(R) Core(TM) i9-13900
  runtime: node v21.4.0 (x64-linux)

  benchmark                                           time (avg)             (min … max)       p75       p99      p995
  -------------------------------------------------------------------------------------- -----------------------------
  npm/string-width      5 chars ascii               3.19 µs/iter     (3.13 µs … 3.48 µs)   3.25 µs   3.48 µs   3.48 µs
  npm/string-width     50 chars ascii              20.09 µs/iter  (18.93 µs … 435.06 µs)  19.49 µs  21.89 µs  22.59 µs
  npm/string-width    500 chars ascii             249.71 µs/iter (239.97 µs … 293.18 µs) 250.93 µs  276.7 µs 281.45 µs
  npm/string-width  5,000 chars ascii               6.69 ms/iter     (6.58 ms … 6.76 ms)   6.72 ms   6.76 ms   6.76 ms
  npm/string-width 25,000 chars ascii             139.57 ms/iter (137.17 ms … 143.28 ms) 140.49 ms 143.28 ms 143.28 ms
  npm/string-width      7 chars ascii+emoji          3.7 µs/iter     (3.62 µs … 3.94 µs)   3.73 µs   3.94 µs   3.94 µs
  npm/string-width     70 chars ascii+emoji        23.93 µs/iter   (22.44 µs … 331.2 µs)  23.15 µs  25.98 µs   30.2 µs
  npm/string-width    700 chars ascii+emoji       251.65 µs/iter (237.78 µs … 444.69 µs) 252.92 µs 325.89 µs 354.08 µs
  npm/string-width  7,000 chars ascii+emoji         4.95 ms/iter     (4.82 ms … 5.19 ms)      5 ms   5.04 ms   5.19 ms
  npm/string-width 35,000 chars ascii+emoji        96.93 ms/iter  (94.39 ms … 102.58 ms)  97.68 ms 102.58 ms 102.58 ms
  npm/string-width      8 chars ansi+emoji          3.92 µs/iter     (3.45 µs … 4.57 µs)   4.09 µs   4.57 µs   4.57 µs
  npm/string-width     80 chars ansi+emoji         24.46 µs/iter     (22.87 µs … 4.2 ms)  23.54 µs  25.89 µs  27.41 µs
  npm/string-width    800 chars ansi+emoji        259.62 µs/iter (246.76 µs … 480.12 µs) 258.65 µs 349.84 µs 372.55 µs
  npm/string-width  8,000 chars ansi+emoji          5.46 ms/iter     (5.41 ms … 5.57 ms)   5.48 ms   5.55 ms   5.57 ms
  npm/string-width 40,000 chars ansi+emoji        108.91 ms/iter  (107.55 ms … 109.5 ms) 109.25 ms  109.5 ms  109.5 ms
  npm/string-width     19 chars ansi+emoji+ascii    6.53 µs/iter     (6.35 µs … 6.75 µs)   6.54 µs   6.75 µs   6.75 µs
  npm/string-width    190 chars ansi+emoji+ascii   55.52 µs/iter  (52.59 µs … 352.73 µs)  54.19 µs  80.77 µs 167.21 µs
  npm/string-width  1,900 chars ansi+emoji+ascii  701.71 µs/iter (653.94 µs … 893.78 µs)  715.3 µs 855.37 µs  872.9 µs
  npm/string-width 19,000 chars ansi+emoji+ascii   27.19 ms/iter   (26.89 ms … 27.41 ms)  27.28 ms  27.41 ms  27.41 ms
  npm/string-width 95,000 chars ansi+emoji+ascii     3.68 s/iter        (3.66 s … 3.7 s)    3.69 s     3.7 s     3.7 s
  ```
</Accordion>

TypeScript definition:

```ts expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
namespace Bun {
	export function stringWidth(
		/**
		 * The string to measure
		 */
		input: string,
		options?: {
			/**
			 * If `true`, count ANSI escape codes as part of the string width. If `false`, ANSI escape codes are ignored when calculating the string width.
			 *
			 * @default false
			 */
			countAnsiEscapeCodes?: boolean;
			/**
			 * When it's ambiugous and `true`, count emoji as 1 characters wide. If `false`, emoji are counted as 2 character wide.
			 *
			 * @default true
			 */
			ambiguousIsNarrow?: boolean;
		},
	): number;
}
```

***

## `Bun.fileURLToPath()`

Converts a `file://` URL to an absolute path.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const path = Bun.fileURLToPath(new URL("file:///foo/bar.txt"));
console.log(path); // "/foo/bar.txt"
```

***

## `Bun.pathToFileURL()`

Converts an absolute path to a `file://` URL.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const url = Bun.pathToFileURL("/foo/bar.txt");
console.log(url); // "file:///foo/bar.txt"
```

***

## `Bun.gzipSync()`

Compresses a `Uint8Array` using zlib's GZIP algorithm.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = Buffer.from("hello".repeat(100)); // Buffer extends Uint8Array
const compressed = Bun.gzipSync(buf);

buf; // => Uint8Array(500)
compressed; // => Uint8Array(30)
```

Optionally, pass a parameters object as the second argument:

<Accordion title="zlib compression options">
  ```ts expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
  export type ZlibCompressionOptions = {
  	/**
  	 * The compression level to use. Must be between `-1` and `9`.
  	 * - A value of `-1` uses the default compression level (Currently `6`)
  	 * - A value of `0` gives no compression
  	 * - A value of `1` gives least compression, fastest speed
  	 * - A value of `9` gives best compression, slowest speed
  	 */
  	level?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  	/**
  	 * How much memory should be allocated for the internal compression state.
  	 *
  	 * A value of `1` uses minimum memory but is slow and reduces compression ratio.
  	 *
  	 * A value of `9` uses maximum memory for optimal speed. The default is `8`.
  	 */
  	memLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  	/**
  	 * The base 2 logarithm of the window size (the size of the history buffer).
  	 *
  	 * Larger values of this parameter result in better compression at the expense of memory usage.
  	 *
  	 * The following value ranges are supported:
  	 * - `9..15`: The output will have a zlib header and footer (Deflate)
  	 * - `-9..-15`: The output will **not** have a zlib header or footer (Raw Deflate)
  	 * - `25..31` (16+`9..15`): The output will have a gzip header and footer (gzip)
  	 *
  	 * The gzip header will have no file name, no extra data, no comment, no modification time (set to zero) and no header CRC.
  	 */
  	windowBits?:
  		| -9
  		| -10
  		| -11
  		| -12
  		| -13
  		| -14
  		| -15
  		| 9
  		| 10
  		| 11
  		| 12
  		| 13
  		| 14
  		| 15
  		| 25
  		| 26
  		| 27
  		| 28
  		| 29
  		| 30
  		| 31;
  	/**
  	 * Tunes the compression algorithm.
  	 *
  	 * - `Z_DEFAULT_STRATEGY`: For normal data **(Default)**
  	 * - `Z_FILTERED`: For data produced by a filter or predictor
  	 * - `Z_HUFFMAN_ONLY`: Force Huffman encoding only (no string match)
  	 * - `Z_RLE`: Limit match distances to one (run-length encoding)
  	 * - `Z_FIXED` prevents the use of dynamic Huffman codes
  	 *
  	 * `Z_RLE` is designed to be almost as fast as `Z_HUFFMAN_ONLY`, but give better compression for PNG image data.
  	 *
  	 * `Z_FILTERED` forces more Huffman coding and less string matching, it is
  	 * somewhat intermediate between `Z_DEFAULT_STRATEGY` and `Z_HUFFMAN_ONLY`.
  	 * Filtered data consists mostly of small values with a somewhat random distribution.
  	 */
  	strategy?: number;
  };
  ```
</Accordion>

***

## `Bun.gunzipSync()`

Decompresses a `Uint8Array` using zlib's GUNZIP algorithm.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = Buffer.from("hello".repeat(100)); // Buffer extends Uint8Array
const compressed = Bun.gzipSync(buf);

const dec = new TextDecoder();
const uncompressed = Bun.gunzipSync(compressed);
dec.decode(uncompressed);
// => "hellohellohello..."
```

***

## `Bun.deflateSync()`

Compresses a `Uint8Array` using zlib's DEFLATE algorithm.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = Buffer.from("hello".repeat(100));
const compressed = Bun.deflateSync(buf);

buf; // => Buffer(500)
compressed; // => Uint8Array(12)
```

The second argument supports the same set of configuration options as [`Bun.gzipSync`](#bun-gzipsync).

***

## `Bun.inflateSync()`

Decompresses a `Uint8Array` using zlib's INFLATE algorithm.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = Buffer.from("hello".repeat(100));
const compressed = Bun.deflateSync(buf);

const dec = new TextDecoder();
const decompressed = Bun.inflateSync(compressed);
dec.decode(decompressed);
// => "hellohellohello..."
```

***

## `Bun.zstdCompress()` / `Bun.zstdCompressSync()`

Compresses a `Uint8Array` using the Zstandard algorithm.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = Buffer.from("hello".repeat(100));

// Synchronous
const compressedSync = Bun.zstdCompressSync(buf);
// Asynchronous
const compressedAsync = await Bun.zstdCompress(buf);

// With compression level (1-22, default: 3)
const compressedLevel = Bun.zstdCompressSync(buf, { level: 6 });
```

## `Bun.zstdDecompress()` / `Bun.zstdDecompressSync()`

Decompresses a `Uint8Array` using the Zstandard algorithm.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const buf = Buffer.from("hello".repeat(100));
const compressed = Bun.zstdCompressSync(buf);

// Synchronous
const decompressedSync = Bun.zstdDecompressSync(compressed);
// Asynchronous
const decompressedAsync = await Bun.zstdDecompress(compressed);

const dec = new TextDecoder();
dec.decode(decompressedSync);
// => "hellohellohello..."
```

***

## `Bun.inspect()`

Serializes an object to a `string` exactly as it would be printed by `console.log`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const obj = { foo: "bar" };
const str = Bun.inspect(obj);
// => '{\nfoo: "bar" \n}'

const arr = new Uint8Array([1, 2, 3]);
const str = Bun.inspect(arr);
// => "Uint8Array(3) [ 1, 2, 3 ]"
```

### `Bun.inspect.custom`

This is the symbol that Bun uses to implement `Bun.inspect`. You can override this to customize how your objects are printed. It is identical to `util.inspect.custom` in Node.js.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
class Foo {
	[Bun.inspect.custom]() {
		return "foo";
	}
}

const foo = new Foo();
console.log(foo); // => "foo"
```

### `Bun.inspect.table(tabularData, properties, options)`

Format tabular data into a string. Like [`console.table`](https://developer.mozilla.org/en-US/docs/Web/API/console/table_static), except it returns a string rather than printing to the console.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(
	Bun.inspect.table([
		{ a: 1, b: 2, c: 3 },
		{ a: 4, b: 5, c: 6 },
		{ a: 7, b: 8, c: 9 },
	]),
);
//
// ┌───┬───┬───┬───┐
// │   │ a │ b │ c │
// ├───┼───┼───┼───┤
// │ 0 │ 1 │ 2 │ 3 │
// │ 1 │ 4 │ 5 │ 6 │
// │ 2 │ 7 │ 8 │ 9 │
// └───┴───┴───┴───┘
```

Additionally, you can pass an array of property names to display only a subset of properties.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(
	Bun.inspect.table(
		[
			{ a: 1, b: 2, c: 3 },
			{ a: 4, b: 5, c: 6 },
		],
		["a", "c"],
	),
);
//
// ┌───┬───┬───┐
// │   │ a │ c │
// ├───┼───┼───┤
// │ 0 │ 1 │ 3 │
// │ 1 │ 4 │ 6 │
// └───┴───┴───┘
```

You can also conditionally enable ANSI colors by passing `{ colors: true }`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
console.log(
	Bun.inspect.table(
		[
			{ a: 1, b: 2, c: 3 },
			{ a: 4, b: 5, c: 6 },
		],
		{
			colors: true,
		},
	),
);
```

***

## `Bun.nanoseconds()`

Returns the number of nanoseconds since the current `bun` process started, as a `number`. Useful for high-precision timing and benchmarking.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.nanoseconds();
// => 7288958
```

***

## `Bun.readableStreamTo*()`

Bun implements a set of convenience functions for asynchronously consuming the body of a `ReadableStream` and converting it to various binary formats.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const stream = (await fetch("https://bun.com")).body;
stream; // => ReadableStream

await Bun.readableStreamToArrayBuffer(stream);
// => ArrayBuffer

await Bun.readableStreamToBytes(stream);
// => Uint8Array

await Bun.readableStreamToBlob(stream);
// => Blob

await Bun.readableStreamToJSON(stream);
// => object

await Bun.readableStreamToText(stream);
// => string

// returns all chunks as an array
await Bun.readableStreamToArray(stream);
// => unknown[]

// returns all chunks as a FormData object (encoded as x-www-form-urlencoded)
await Bun.readableStreamToFormData(stream);

// returns all chunks as a FormData object (encoded as multipart/form-data)
await Bun.readableStreamToFormData(stream, multipartFormBoundary);
```

***

## `Bun.resolveSync()`

Resolves a file path or module specifier using Bun's internal module resolution algorithm. The first argument is the path to resolve, and the second argument is the "root". If no match is found, an `Error` is thrown.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.resolveSync("./foo.ts", "/path/to/project");
// => "/path/to/project/foo.ts"

Bun.resolveSync("zod", "/path/to/project");
// => "/path/to/project/node_modules/zod/index.ts"
```

To resolve relative to the current working directory, pass `process.cwd()` or `"."` as the root.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.resolveSync("./foo.ts", process.cwd());
Bun.resolveSync("./foo.ts", "/path/to/project");
```

To resolve relative to the directory containing the current file, pass `import.meta.dir`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
Bun.resolveSync("./foo.ts", import.meta.dir);
```

***

## `Bun.stripANSI()`

<Note>\~6-57x faster `strip-ansi` alternative</Note>

`Bun.stripANSI(text: string): string`

Strip ANSI escape codes from a string. This is useful for removing colors and formatting from terminal output.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const coloredText = "\u001b[31mHello\u001b[0m \u001b[32mWorld\u001b[0m";
const plainText = Bun.stripANSI(coloredText);
console.log(plainText); // => "Hello World"

// Works with various ANSI codes
const formatted = "\u001b[1m\u001b[4mBold and underlined\u001b[0m";
console.log(Bun.stripANSI(formatted)); // => "Bold and underlined"
```

`Bun.stripANSI` is significantly faster than the popular [`strip-ansi`](https://www.npmjs.com/package/strip-ansi) npm package:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun bench/snippets/strip-ansi.mjs
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
cpu: Apple M3 Max
runtime: bun 1.2.21 (arm64-darwin)

benchmark                               avg (min … max) p75 / p99
------------------------------------------------------- ----------
Bun.stripANSI      11 chars no-ansi        8.13 ns/iter   8.27 ns
                                   (7.45 ns … 33.59 ns)  10.29 ns

Bun.stripANSI      13 chars ansi          51.68 ns/iter  52.51 ns
                                 (46.16 ns … 113.71 ns)  57.71 ns

Bun.stripANSI  16,384 chars long-no-ansi 298.39 ns/iter 305.44 ns
                                (281.50 ns … 331.65 ns) 320.70 ns

Bun.stripANSI 212,992 chars long-ansi    227.65 µs/iter 234.50 µs
                                (216.46 µs … 401.92 µs) 262.25 µs
```

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
node bench/snippets/strip-ansi.mjs
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
cpu: Apple M3 Max
runtime: node 24.6.0 (arm64-darwin)

benchmark                                avg (min … max) p75 / p99
-------------------------------------------------------- ---------
npm/strip-ansi      11 chars no-ansi      466.79 ns/iter 468.67 ns
                                 (454.08 ns … 570.67 ns) 543.67 ns

npm/strip-ansi      13 chars ansi         546.77 ns/iter 550.23 ns
                                 (532.74 ns … 651.08 ns) 590.35 ns

npm/strip-ansi  16,384 chars long-no-ansi   4.85 µs/iter   4.89 µs
                                     (4.71 µs … 5.00 µs)   4.98 µs

npm/strip-ansi 212,992 chars long-ansi      1.36 ms/iter   1.38 ms
                                     (1.27 ms … 1.73 ms)   1.49 ms

```

***

## `serialize` & `deserialize` in `bun:jsc`

To save a JavaScript value into an ArrayBuffer & back, use `serialize` and `deserialize` from the `"bun:jsc"` module.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { serialize, deserialize } from "bun:jsc";

const buf = serialize({ foo: "bar" });
const obj = deserialize(buf);
console.log(obj); // => { foo: "bar" }
```

Internally, [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) and [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) serialize and deserialize the same way. This exposes the underlying [HTML Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) to JavaScript as an ArrayBuffer.

***

## `estimateShallowMemoryUsageOf` in `bun:jsc`

The `estimateShallowMemoryUsageOf` function returns a best-effort estimate of the memory usage of an object in bytes, excluding the memory usage of properties or other objects it references. For accurate per-object memory usage, use `Bun.generateHeapSnapshot`.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { estimateShallowMemoryUsageOf } from "bun:jsc";

const obj = { foo: "bar" };
const usage = estimateShallowMemoryUsageOf(obj);
console.log(usage); // => 16

const buffer = Buffer.alloc(1024 * 1024);
estimateShallowMemoryUsageOf(buffer);
// => 1048624

const req = new Request("https://bun.com");
estimateShallowMemoryUsageOf(req);
// => 167

const array = Array(1024).fill({ a: 1 });
// Arrays are usually not stored contiguously in memory, so this will not return a useful value (which isn't a bug).
estimateShallowMemoryUsageOf(array);
// => 16
```
