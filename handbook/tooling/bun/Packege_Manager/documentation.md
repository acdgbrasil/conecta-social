# bun install

> Install packages with Bun's fast package manager

## Basic Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install react
bun install react@19.1.1 # specific version
bun install react@latest # specific tag
```

The `bun` CLI contains a Node.js-compatible package manager designed to be a dramatically faster replacement for `npm`, `yarn`, and `pnpm`. It's a standalone tool that will work in pre-existing Node.js projects; if your project has a `package.json`, `bun install` can help you speed up your workflow.

<Note>
  **⚡️ 25x faster** — Switch from `npm install` to `bun install` in any Node.js project to make your installations up to 25x faster.

  <Frame>
    ![Bun installation speed
    comparison](https://user-images.githubusercontent.com/709451/147004342-571b6123-17a9-49a2-8bfd-dcfc5204047e.png)
  </Frame>
</Note>

<Accordion title="For Linux users">
  The recommended minimum Linux Kernel version is 5.6. If you're on Linux kernel 5.1 - 5.5, `bun install` will work, but HTTP requests will be slow due to a lack of support for io\_uring's `connect()` operation.

  If you're using Ubuntu 20.04, here's how to install a [newer kernel](https://wiki.ubuntu.com/Kernel/LTSEnablementStack):

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  # If this returns a version >= 5.6, you don't need to do anything
  uname -r

  # Install the official Ubuntu hardware enablement kernel
  sudo apt install --install-recommends linux-generic-hwe-20.04
  ```
</Accordion>

To install all dependencies of a project:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install
```

Running `bun install` will:

* **Install** all `dependencies`, `devDependencies`, and `optionalDependencies`. Bun will install `peerDependencies` by default.
* **Run** your project's `{pre|post}install` and `{pre|post}prepare` scripts at the appropriate time. For security reasons Bun *does not execute* lifecycle scripts of installed dependencies.
* **Write** a `bun.lock` lockfile to the project root.

***

## Logging

To modify logging verbosity:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --verbose # debug logging
bun install --silent  # no logging
```

***

## Lifecycle scripts

Unlike other npm clients, Bun does not execute arbitrary lifecycle scripts like `postinstall` for installed dependencies. Executing arbitrary scripts represents a potential security risk.

To tell Bun to allow lifecycle scripts for a particular package, add the package to `trustedDependencies` in your package.json.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"version": "1.0.0",
	"trustedDependencies": ["my-trusted-package"] // [!code ++]
}
```

Then re-install the package. Bun will read this field and run lifecycle scripts for `my-trusted-package`.

Lifecycle scripts will run in parallel during installation. To adjust the maximum number of concurrent scripts, use the `--concurrent-scripts` flag. The default is two times the reported cpu count or GOMAXPROCS.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --concurrent-scripts 5
```

***

## Workspaces

Bun supports `"workspaces"` in package.json. For complete documentation refer to [Package manager > Workspaces](/pm/workspaces).

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"version": "1.0.0",
	"workspaces": ["packages/*"], // [!code ++]
	"dependencies": {
		"preact": "^10.5.13"
	}
}
```

***

## Installing dependencies for specific packages

In a monorepo, you can install the dependencies for a subset of packages using the `--filter` flag.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Install dependencies for all workspaces except `pkg-c`
bun install --filter '!pkg-c'

# Install dependencies for only `pkg-a` in `./packages/pkg-a`
bun install --filter './packages/pkg-a'
```

For more information on filtering with `bun install`, refer to [Package Manager > Filtering](/pm/filter#bun-install-and-bun-outdated)

***

## Overrides and resolutions

Bun supports npm's `"overrides"` and Yarn's `"resolutions"` in `package.json`. These are mechanisms for specifying a version range for *metadependencies*—the dependencies of your dependencies. Refer to [Package manager > Overrides and resolutions](/pm/overrides) for complete documentation.

```json package.json file="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	},
	"overrides": {
		// [!code ++]
		"bar": "~4.4.0" // [!code ++]
	} // [!code ++]
}
```

***

## Global packages

To install a package globally, use the `-g`/`--global` flag. Typically this is used for installing command-line tools.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --global cowsay # or `bun install -g cowsay`
cowsay "Bun!"
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
 ______
< Bun! >
 ------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

***

## Production mode

To install in production mode (i.e. without `devDependencies` or `optionalDependencies`):

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --production
```

For reproducible installs, use `--frozen-lockfile`. This will install the exact versions of each package specified in the lockfile. If your `package.json` disagrees with `bun.lock`, Bun will exit with an error. The lockfile will not be updated.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --frozen-lockfile
```

For more information on Bun's lockfile `bun.lock`, refer to [Package manager > Lockfile](/pm/lockfile).

***

## Omitting dependencies

To omit dev, peer, or optional dependencies use the `--omit` flag.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Exclude "devDependencies" from the installation. This will apply to the
# root package and workspaces if they exist. Transitive dependencies will
# not have "devDependencies".
bun install --omit dev

# Install only dependencies from "dependencies"
bun install --omit=dev --omit=peer --omit=optional
```

***

## Dry run

To perform a dry run (i.e. don't actually install anything):

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --dry-run
```

***

## Non-npm dependencies

Bun supports installing dependencies from Git, GitHub, and local or remotely-hosted tarballs. For complete documentation refer to [Package manager > Git, GitHub, and tarball dependencies](/pm/cli/add).

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"dependencies": {
		"dayjs": "git+https://github.com/iamkun/dayjs.git",
		"lodash": "git+ssh://github.com/lodash/lodash.git#4.17.21",
		"moment": "git@github.com:moment/moment.git",
		"zod": "github:colinhacks/zod",
		"react": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
		"bun-types": "npm:@types/bun"
	}
}
```

***

## Installation strategies

Bun supports two package installation strategies that determine how dependencies are organized in `node_modules`:

### Hoisted installs (default for single projects)

The traditional npm/Yarn approach that flattens dependencies into a shared `node_modules` directory:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --linker hoisted
```

### Isolated installs

A pnpm-like approach that creates strict dependency isolation to prevent phantom dependencies:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --linker isolated
```

Isolated installs create a central package store in `node_modules/.bun/` with symlinks in the top-level `node_modules`. This ensures packages can only access their declared dependencies.

For complete documentation on isolated installs, refer to [Package manager > Isolated installs](/pm/isolated-installs).

***

## Minimum release age

To protect against supply chain attacks where malicious packages are quickly published, you can configure a minimum age requirement for npm packages. Package versions published more recently than the specified threshold (in seconds) will be filtered out during installation.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Only install package versions published at least 3 days ago
bun add @types/bun --minimum-release-age 259200 # seconds
```

You can also configure this in `bunfig.toml`:

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# Only install package versions published at least 3 days ago
minimumReleaseAge = 259200 # seconds

# Exclude trusted packages from the age gate
minimumReleaseAgeExcludes = ["@types/node", "typescript"]
```

When the minimum age filter is active:

* Only affects new package resolution - existing packages in `bun.lock` remain unchanged
* All dependencies (direct and transitive) are filtered to meet the age requirement when being resolved
* When versions are blocked by the age gate, a stability check detects rapid bugfix patterns
  * If multiple versions were published close together just outside your age gate, it extends the filter to skip those potentially unstable versions and selects an older, more mature version
  * Searches up to 7 days after the age gate, however if still finding rapid releases it ignores stability check
  * Exact version requests (like `package@1.1.1`) still respect the age gate but bypass the stability check
* Versions without a `time` field are treated as passing the age check (npm registry should always provide timestamps)

For more advanced security scanning, including integration with services & custom filtering, see [Package manager > Security Scanner API](/pm/security-scanner-api).

***

## Configuration

The default behavior of `bun install` can be configured in `bunfig.toml`. The default values are shown below.

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]

# whether to install optionalDependencies
optional = true

# whether to install devDependencies
dev = true

# whether to install peerDependencies
peer = true

# equivalent to `--production` flag
production = false

# equivalent to `--save-text-lockfile` flag
saveTextLockfile = false

# equivalent to `--frozen-lockfile` flag
frozenLockfile = false

# equivalent to `--dry-run` flag
dryRun = false

# equivalent to `--concurrent-scripts` flag
concurrentScripts = 16 # (cpu count or GOMAXPROCS) x2

# installation strategy: "hoisted" or "isolated"
# default: "hoisted" (for single-project projects)
# default: "isolated" (for monorepo projects)
linker = "hoisted"


# minimum age config
minimumReleaseAge = 259200 # seconds
minimumReleaseAgeExcludes = ["@types/node", "typescript"]
```

***

## CI/CD

Use the official [`oven-sh/setup-bun`](https://github.com/oven-sh/setup-bun) action to install `bun` in a GitHub Actions pipeline:

```yaml .github/workflows/release.yml icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
name: bun-types
jobs:
  build:
    name: build-app
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      - name: Install bun
        uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun install
      - name: Build app
        run: bun run build
```

For CI/CD environments that want to enforce reproducible builds, use `bun ci` to fail the build if the package.json is out of sync with the lockfile:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun ci
```

This is equivalent to `bun install --frozen-lockfile`. It installs exact versions from `bun.lock` and fails if `package.json` doesn't match the lockfile. To use `bun ci` or `bun install --frozen-lockfile`, you must commit `bun.lock` to version control.

And instead of running `bun install`, run `bun ci`.

```yaml .github/workflows/release.yml icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
name: bun-types
jobs:
  build:
    name: build-app
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      - name: Install bun
        uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun ci
      - name: Build app
        run: bun run build
```

## pnpm migration

Bun automatically migrates projects from pnpm to bun. When a `pnpm-lock.yaml` file is detected and no `bun.lock` file exists, Bun will automatically migrate the lockfile to `bun.lock` during installation. The original `pnpm-lock.yaml` file remains unmodified.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install
```

**Note**: Migration only runs when `bun.lock` is absent. There is currently no opt-out flag for pnpm migration.

The migration process handles:

### Lockfile Migration

* Converts `pnpm-lock.yaml` to `bun.lock` format
* Preserves package versions and resolution information
* Maintains dependency relationships and peer dependencies
* Handles patched dependencies with integrity hashes

### Workspace Configuration

When a `pnpm-workspace.yaml` file exists, Bun migrates workspace settings to your root `package.json`:

```yaml pnpm-workspace.yaml icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
packages:
  - "apps/*"
  - "packages/*"

catalog:
  react: ^18.0.0
  typescript: ^5.0.0

catalogs:
  build:
    webpack: ^5.0.0
    babel: ^7.0.0
```

The workspace packages list and catalogs are moved to the `workspaces` field in `package.json`:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"workspaces": {
		"packages": ["apps/*", "packages/*"],
		"catalog": {
			"react": "^18.0.0",
			"typescript": "^5.0.0"
		},
		"catalogs": {
			"build": {
				"webpack": "^5.0.0",
				"babel": "^7.0.0"
			}
		}
	}
}
```

### Catalog Dependencies

Dependencies using pnpm's `catalog:` protocol are preserved:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"dependencies": {
		"react": "catalog:",
		"webpack": "catalog:build"
	}
}
```

### Configuration Migration

The following pnpm configuration is migrated from both `pnpm-lock.yaml` and `pnpm-workspace.yaml`:

* **Overrides**: Moved from `pnpm.overrides` to root-level `overrides` in `package.json`
* **Patched Dependencies**: Moved from `pnpm.patchedDependencies` to root-level `patchedDependencies` in `package.json`
* **Workspace Overrides**: Applied from `pnpm-workspace.yaml` to root `package.json`

### Requirements

* Requires pnpm lockfile version 7 or higher
* Workspace packages must have a `name` field in their `package.json`
* All catalog entries referenced by dependencies must exist in the catalogs definition

After migration, you can safely remove `pnpm-lock.yaml` and `pnpm-workspace.yaml` files.

***

## CLI Usage

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install <name>@<version>
```

### General Configuration

<ParamField path="--config" type="string">
  Specify path to config file (bunfig.toml)
</ParamField>

<ParamField path="--cwd" type="string">
  Set a specific cwd
</ParamField>

### Dependency Scope & Management

<ParamField path="--production" type="boolean">
  Don't install devDependencies
</ParamField>

<ParamField path="--no-save" type="boolean">
  Don't update package.json or save a lockfile
</ParamField>

<ParamField path="--save" type="boolean" default="true">
  Save to package.json
</ParamField>

<ParamField path="--omit" type="string">
  Exclude 'dev', 'optional', or 'peer' dependencies from install
</ParamField>

<ParamField path="--only-missing" type="boolean">
  Only add dependencies to package.json if they are not already present
</ParamField>

### Dependency Type & Versioning

<ParamField path="--dev" type="boolean">
  Add dependency to "devDependencies"
</ParamField>

<ParamField path="--optional" type="boolean">
  Add dependency to "optionalDependencies"
</ParamField>

<ParamField path="--peer" type="boolean">
  Add dependency to "peerDependencies"
</ParamField>

<ParamField path="--exact" type="boolean">
  Add the exact version instead of the ^range
</ParamField>

### Lockfile Control

<ParamField path="--yarn" type="boolean">
  Write a yarn.lock file (yarn v1)
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--save-text-lockfile" type="boolean">
  Save a text-based lockfile
</ParamField>

<ParamField path="--lockfile-only" type="boolean">
  Generate a lockfile without installing dependencies
</ParamField>

### Network & Registry Settings

<ParamField path="--ca" type="string">
  Provide a Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  File path to Certificate Authority signing certificate
</ParamField>

<ParamField path="--registry" type="string">
  Use a specific registry by default, overriding .npmrc, bunfig.toml and environment variables
</ParamField>

### Installation Process Control

<ParamField path="--dry-run" type="boolean">
  Don't install anything
</ParamField>

<ParamField path="--force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies
</ParamField>

<ParamField path="--global" type="boolean">
  Install globally
</ParamField>

<ParamField path="--backend" type="string" default="clonefile">
  Platform-specific optimizations: "clonefile", "hardlink", "symlink", "copyfile"
</ParamField>

<ParamField path="--filter" type="string">
  Install packages for the matching workspaces
</ParamField>

<ParamField path="--analyze" type="boolean">
  Analyze & install all dependencies of files passed as arguments recursively
</ParamField>

### Caching Options

<ParamField path="--cache-dir" type="string">
  Store & load cached data from a specific directory path
</ParamField>

<ParamField path="--no-cache" type="boolean">
  Ignore manifest cache entirely
</ParamField>

### Output & Logging

<ParamField path="--silent" type="boolean">
  Don't log anything
</ParamField>

<ParamField path="--verbose" type="boolean">
  Excessively verbose logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Disable the progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print a summary
</ParamField>

### Security & Integrity

<ParamField path="--no-verify" type="boolean">
  Skip verifying integrity of newly downloaded packages
</ParamField>

<ParamField path="--trust" type="boolean">
  Add to trustedDependencies in the project's package.json and install the package(s)
</ParamField>

### Concurrency & Performance

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum number of concurrent jobs for lifecycle scripts
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum number of concurrent network requests
</ParamField>

### Lifecycle Script Management

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts in the project's package.json (dependency scripts are never run)
</ParamField>

### Help Information

<ParamField path="--help" type="boolean">
  Print this help menu
</ParamField>

# bun add

> Add packages to your project with Bun's fast package manager

To add a particular package:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add preact
```

To specify a version, version range, or tag:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add zod@3.20.0
bun add zod@^3.0.0
bun add zod@latest
```

## `--dev`

<Note>**Alias** — `--development`, `-d`, `-D`</Note>

To add a package as a dev dependency (`"devDependencies"`):

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add --dev @types/react
bun add -d @types/react
```

## `--optional`

To add a package as an optional dependency (`"optionalDependencies"`):

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add --optional lodash
```

## `--peer`

To add a package as a peer dependency (`"peerDependencies"`):

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add --peer @types/bun
```

## `--exact`

<Note>**Alias** — `-E`</Note>

To add a package and pin to the resolved version, use `--exact`. This will resolve the version of the package and add it to your `package.json` with an exact version number instead of a version range.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add react --exact
bun add react -E
```

This will add the following to your `package.json`:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"dependencies": {
		// without --exact
		"react": "^18.2.0", // this matches >= 18.2.0 < 19.0.0

		// with --exact
		"react": "18.2.0" // this matches only 18.2.0 exactly
	}
}
```

To view a complete list of options for this command:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add --help
```

## `--global`

<Note>
  **Note** — This would not modify package.json of your current project folder. **Alias** - `bun add 	--global`, `bun add -g`, `bun install --global` and `bun install -g`
</Note>

To install a package globally, use the `-g`/`--global` flag. This will not modify the `package.json` of your current project. Typically this is used for installing command-line tools.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add --global cowsay # or `bun add -g cowsay`
cowsay "Bun!"
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
 ______
< Bun! >
 ------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

<Accordion title="Configuring global installation behavior">
  ```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
  [install]
  # where `bun add --global` installs packages
  globalDir = "~/.bun/install/global"

  # where globally-installed package bins are linked
  globalBinDir = "~/.bun/bin"
  ```
</Accordion>

## Trusted dependencies

Unlike other npm clients, Bun does not execute arbitrary lifecycle scripts for installed dependencies, such as `postinstall`. These scripts represent a potential security risk, as they can execute arbitrary code on your machine.

To tell Bun to allow lifecycle scripts for a particular package, add the package to `trustedDependencies` in your package.json.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"version": "1.0.0",
	"trustedDependencies": ["my-trusted-package"] // [!code ++]
}
```

Bun reads this field and will run lifecycle scripts for `my-trusted-package`.

## Git dependencies

To add a dependency from a public or private git repository:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add git@github.com:moment/moment.git
```

<Note>
  To install private repositories, your system needs the appropriate SSH credentials to access the
  repository.
</Note>

Bun supports a variety of protocols, including [`github`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#github-urls), [`git`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#git-urls-as-dependencies), `git+ssh`, `git+https`, and many more.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"dependencies": {
		"dayjs": "git+https://github.com/iamkun/dayjs.git",
		"lodash": "git+ssh://github.com/lodash/lodash.git#4.17.21",
		"moment": "git@github.com:moment/moment.git",
		"zod": "github:colinhacks/zod"
	}
}
```

## Tarball dependencies

A package name can correspond to a publicly hosted `.tgz` file. During installation, Bun will download and install the package from the specified tarball URL, rather than from the package registry.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add zod@https://registry.npmjs.org/zod/-/zod-3.21.4.tgz
```

This will add the following line to your `package.json`:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"dependencies": {
		"zod": "https://registry.npmjs.org/zod/-/zod-3.21.4.tgz"
	}
}
```

***

## CLI Usage

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add <package> <@version>
```

### Dependency Management

<ParamField path="--production" type="boolean">
  Don't install devDependencies. Alias: <code>-p</code>
</ParamField>

<ParamField path="--omit" type="string">
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install
</ParamField>

<ParamField path="--global" type="boolean">
  Install globally. Alias: <code>-g</code>
</ParamField>

<ParamField path="--dev" type="boolean">
  Add dependency to <code>devDependencies</code>. Alias: <code>-d</code>
</ParamField>

<ParamField path="--optional" type="boolean">
  Add dependency to <code>optionalDependencies</code>
</ParamField>

<ParamField path="--peer" type="boolean">
  Add dependency to <code>peerDependencies</code>
</ParamField>

<ParamField path="--exact" type="boolean">
  Add the exact version instead of the <code>^</code> range. Alias: <code>-E</code>
</ParamField>

<ParamField path="--only-missing" type="boolean">
  Only add dependencies to <code>package.json</code> if they are not already present
</ParamField>

### Project Files & Lockfiles

<ParamField path="--yarn" type="boolean">
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>
</ParamField>

<ParamField path="--no-save" type="boolean">
  Don't update <code>package.json</code> or save a lockfile
</ParamField>

<ParamField path="--save" type="boolean" default="true">
  Save to <code>package.json</code> (true by default)
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--trust" type="boolean">
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the
  package(s)
</ParamField>

<ParamField path="--save-text-lockfile" type="boolean">
  Save a text-based lockfile
</ParamField>

<ParamField path="--lockfile-only" type="boolean">
  Generate a lockfile without installing dependencies
</ParamField>

### Installation Control

<ParamField path="--dry-run" type="boolean">
  Don't install anything
</ParamField>

<ParamField path="--force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies. Alias:{" "}
  <code>-f</code>
</ParamField>

<ParamField path="--no-verify" type="boolean">
  Skip verifying integrity of newly downloaded packages
</ParamField>

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts in the project's <code>package.json</code> (dependency scripts are never
  run)
</ParamField>

<ParamField path="--analyze" type="boolean">
  Recursively analyze & install dependencies of files passed as arguments (using Bun's bundler).
  Alias: <code>-a</code>
</ParamField>

### Network & Registry

<ParamField path="--ca" type="string">
  Provide a Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  Same as <code>--ca</code>, but as a file path to the certificate
</ParamField>

<ParamField path="--registry" type="string">
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code>, and
  environment variables
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum number of concurrent network requests (default 48)
</ParamField>

### Performance & Resource

<ParamField path="--backend" type="string" default="clonefile">
  Platform-specific optimizations for installing dependencies. Possible values:{" "}
  <code>clonefile</code> (default), <code>hardlink</code>, <code>symlink</code>,{" "}
  <code>copyfile</code>
</ParamField>

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum number of concurrent jobs for lifecycle scripts (default 5)
</ParamField>

### Caching

<ParamField path="--cache-dir" type="string">
  Store & load cached data from a specific directory path
</ParamField>

<ParamField path="--no-cache" type="boolean">
  Ignore manifest cache entirely
</ParamField>

### Output & Logging

<ParamField path="--silent" type="boolean">
  Don't log anything
</ParamField>

<ParamField path="--verbose" type="boolean">
  Excessively verbose logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Disable the progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print a summary
</ParamField>

### Global Configuration & Context

<ParamField path="--config" type="string">
  Specify path to config file (<code>bunfig.toml</code>). Alias: <code>-c</code>
</ParamField>

<ParamField path="--cwd" type="string">
  Set a specific current working directory
</ParamField>

### Help

<ParamField path="--help" type="boolean">
  Print this help menu. Alias: <code>-h</code>
</ParamField>

# bun remove

> Remove dependencies from your project

## Basic Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun remove ts-node
```

***

## CLI Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun remove <package>
```

### General Information

<ParamField path="--help" type="boolean">
  Print this help menu. Alias: <code>-h</code>
</ParamField>

### Configuration

<ParamField path="--config" type="string">
  Specify path to config file (<code>bunfig.toml</code>). Alias: <code>-c</code>
</ParamField>

### Package.json Interaction

<ParamField path="--no-save" type="boolean">
  Don't update <code>package.json</code> or save a lockfile
</ParamField>

<ParamField path="--save" type="boolean" default="true">
  Save to <code>package.json</code> (true by default)
</ParamField>

<ParamField path="--trust" type="boolean">
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the
  package(s)
</ParamField>

### Lockfile Behavior

<ParamField path="--yarn" type="boolean">
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--save-text-lockfile" type="boolean">
  Save a text-based lockfile
</ParamField>

<ParamField path="--lockfile-only" type="boolean">
  Generate a lockfile without installing dependencies
</ParamField>

### Dependency Filtering

<ParamField path="--production" type="boolean">
  Don't install devDependencies. Alias: <code>-p</code>
</ParamField>

<ParamField path="--omit" type="string">
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install
</ParamField>

### Network & Registry

<ParamField path="--ca" type="string">
  Provide a Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  Same as <code>--ca</code>, but as a file path to the certificate
</ParamField>

<ParamField path="--registry" type="string">
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code> and
  environment variables
</ParamField>

### Execution Control & Validation

<ParamField path="--dry-run" type="boolean">
  Don't install anything
</ParamField>

<ParamField path="--force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies. Alias:{" "}
  <code>-f</code>
</ParamField>

<ParamField path="--no-verify" type="boolean">
  Skip verifying integrity of newly downloaded packages
</ParamField>

### Output & Logging

<ParamField path="--silent" type="boolean">
  Don't log anything
</ParamField>

<ParamField path="--verbose" type="boolean">
  Excessively verbose logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Disable the progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print a summary
</ParamField>

### Caching

<ParamField path="--cache-dir" type="string">
  Store & load cached data from a specific directory path
</ParamField>

<ParamField path="--no-cache" type="boolean">
  Ignore manifest cache entirely
</ParamField>

### Script Execution

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts in the project's <code>package.json</code> (dependency scripts are never
  run)
</ParamField>

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum number of concurrent jobs for lifecycle scripts (default 5)
</ParamField>

### Scope & Path

<ParamField path="--global" type="boolean">
  Install globally. Alias: <code>-g</code>
</ParamField>

<ParamField path="--cwd" type="string">
  Set a specific cwd
</ParamField>

### Advanced & Performance

<ParamField path="--backend" type="string" default="clonefile">
  Platform-specific optimizations for installing dependencies. Possible values:{" "}
  <code>clonefile</code> (default), <code>hardlink</code>, <code>symlink</code>,{" "}
  <code>copyfile</code>
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum number of concurrent network requests (default 48)
</ParamField>

# bun update

> Update dependencies to latest versions

<Note>To upgrade your Bun CLI version, see [`bun upgrade`](/installation#upgrading).</Note>

To update all dependencies to the latest version:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun update
```

To update a specific dependency to the latest version:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun update [package]
```

## `--interactive`

For a more controlled update experience, use the `--interactive` flag to select which packages to update:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun update --interactive
bun update -i
```

This launches an interactive terminal interface that shows all outdated packages with their current and target versions. You can then select which packages to update.

### Interactive Interface

The interface displays packages grouped by dependency type:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun update --interactive
bun update -i
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
? Select packages to update - Space to toggle, Enter to confirm, a to select all, n to select none, i to invert, l to toggle latest

  dependencies                Current  Target   Latest
    □ react                   17.0.2   18.2.0   18.3.1
    □ lodash                  4.17.20  4.17.21  4.17.21

  devDependencies             Current  Target   Latest
    □ typescript              4.8.0    5.0.0    5.3.3
    □ @types/node             16.11.7  18.0.0   20.11.5

  optionalDependencies        Current  Target   Latest
    □ some-optional-package   1.0.0    1.1.0    1.2.0
```

**Sections:**

* Packages are grouped under section headers: `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`
* Each section shows column headers aligned with the package data

**Columns:**

* **Package**: Package name (may have suffix like ` dev`, ` peer`, ` optional` for clarity)
* **Current**: Currently installed version
* **Target**: Version that would be installed (respects semver constraints)
* **Latest**: Latest available version

### Keyboard Controls

**Selection:**

* **Space**: Toggle package selection
* **Enter**: Confirm selections and update
* **a/A**: Select all packages
* **n/N**: Select none
* **i/I**: Invert selection

**Navigation:**

* **↑/↓ Arrow keys** or **j/k**: Move cursor
* **l/L**: Toggle between target and latest version for current package

**Exit:**

* **Ctrl+C** or **Ctrl+D**: Cancel without updating

### Visual Indicators

* **☑** Selected packages (will be updated)
* **□** Unselected packages
* **>** Current cursor position
* **Colors**: Red (major), yellow (minor), green (patch) version changes
* **Underlined**: Currently selected update target

### Package Grouping

Packages are organized in sections by dependency type:

* **dependencies** - Regular runtime dependencies
* **devDependencies** - Development dependencies
* **peerDependencies** - Peer dependencies
* **optionalDependencies** - Optional dependencies

Within each section, individual packages may have additional suffixes (` dev`, ` peer`, ` optional`) for extra clarity.

## `--recursive`

Use the `--recursive` flag with `--interactive` to update dependencies across all workspaces in a monorepo:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun update --interactive --recursive
bun update -i -r
```

This displays an additional "Workspace" column showing which workspace each dependency belongs to.

## `--latest`

By default, `bun update` will update to the latest version of a dependency that satisfies the version range specified in your `package.json`.

To update to the latest version, regardless of if it's compatible with the current version range, use the `--latest` flag:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun update --latest
```

In interactive mode, you can toggle individual packages between their target version (respecting semver) and latest version using the **l** key.

For example, with the following `package.json`:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"dependencies": {
		"react": "^17.0.2"
	}
}
```

* `bun update` would update to a version that matches `17.x`.
* `bun update --latest` would update to a version that matches `18.x` or later.

***

## CLI Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun update <package> <version>
```

### Update Strategy

<ParamField path="--force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies. Alias:{" "}
  <code>-f</code>
</ParamField>

<ParamField path="--latest" type="boolean">
  Update packages to their latest versions
</ParamField>

### Dependency Scope

<ParamField path="--production" type="boolean">
  Don't install devDependencies. Alias: <code>-p</code>
</ParamField>

<ParamField path="--global" type="boolean">
  Install globally. Alias: <code>-g</code>
</ParamField>

<ParamField path="--omit" type="string">
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install
</ParamField>

### Project File Management

<ParamField path="--yarn" type="boolean">
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>
</ParamField>

<ParamField path="--no-save" type="boolean">
  Don't update <code>package.json</code> or save a lockfile
</ParamField>

<ParamField path="--save" type="boolean" default="true">
  Save to <code>package.json</code> (true by default)
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--save-text-lockfile" type="boolean">
  Save a text-based lockfile
</ParamField>

<ParamField path="--lockfile-only" type="boolean">
  Generate a lockfile without installing dependencies
</ParamField>

### Network & Registry

<ParamField path="--ca" type="string">
  Provide a Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  Same as <code>--ca</code>, but as a file path to the certificate
</ParamField>

<ParamField path="--registry" type="string">
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code> and
  environment variables
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum number of concurrent network requests (default 48)
</ParamField>

### Caching

<ParamField path="--cache-dir" type="string">
  Store & load cached data from a specific directory path
</ParamField>

<ParamField path="--no-cache" type="boolean">
  Ignore manifest cache entirely
</ParamField>

### Output & Logging

<ParamField path="--silent" type="boolean">
  Don't log anything
</ParamField>

<ParamField path="--verbose" type="boolean">
  Excessively verbose logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Disable the progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print a summary
</ParamField>

### Script Execution

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts in the project's <code>package.json</code> (dependency scripts are never
  run)
</ParamField>

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum number of concurrent jobs for lifecycle scripts (default 5)
</ParamField>

### Installation Controls

<ParamField path="--no-verify" type="boolean">
  Skip verifying integrity of newly downloaded packages
</ParamField>

<ParamField path="--trust" type="boolean">
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the
  package(s)
</ParamField>

<ParamField path="--backend" type="string" default="clonefile">
  Platform-specific optimizations for installing dependencies. Possible values:{" "}
  <code>clonefile</code> (default), <code>hardlink</code>, <code>symlink</code>,{" "}
  <code>copyfile</code>
</ParamField>

### General & Environment

<ParamField path="--config" type="string">
  Specify path to config file (<code>bunfig.toml</code>). Alias: <code>-c</code>
</ParamField>

<ParamField path="--dry-run" type="boolean">
  Don't install anything
</ParamField>

<ParamField path="--cwd" type="string">
  Set a specific cwd
</ParamField>

<ParamField path="--help" type="boolean">
  Print this help menu. Alias: <code>-h</code>
</ParamField>

# bunx

> Run packages from npm

<Note>
  `bunx` is an alias for `bun x`. The `bunx` CLI will be auto-installed when you install `bun`.
</Note>

Use `bunx` to auto-install and run packages from `npm`. It's Bun's equivalent of `npx` or `yarn dlx`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bunx cowsay "Hello world!"
```

<Note>
  ⚡️ **Speed** — With Bun's fast startup times, `bunx` is [roughly 100x
  faster](https://twitter.com/jarredsumner/status/1606163655527059458) than `npx` for locally
  installed packages.
</Note>

Packages can declare executables in the `"bin"` field of their `package.json`. These are known as *package executables* or *package binaries*.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	// ... other fields
	"name": "my-cli",
	"bin": {
		"my-cli": "dist/index.js"
	}
}
```

These executables are commonly plain JavaScript files marked with a [shebang line](https://en.wikipedia.org/wiki/Shebang_\(Unix\)) to indicate which program should be used to execute them. The following file indicates that it should be executed with `node`.

```ts dist/index.js icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
#!/usr/bin/env node

console.log("Hello world!");
```

These executables can be run with `bunx`,

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bunx my-cli
```

As with `npx`, `bunx` will check for a locally installed package first, then fall back to auto-installing the package from `npm`. Installed packages will be stored in Bun's global cache for future use.

## Arguments and flags

To pass additional command-line flags and arguments through to the executable, place them after the executable name.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bunx my-cli --foo bar
```

## Shebangs

By default, Bun respects shebangs. If an executable is marked with `#!/usr/bin/env node`, Bun will spin up a `node` process to execute the file. However, in some cases it may be desirable to run executables using Bun's runtime, even if the executable indicates otherwise. To do so, include the `--bun` flag.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bunx --bun my-cli
```

The `--bun` flag must occur *before* the executable name. Flags that appear *after* the name are passed through to the executable.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bunx --bun my-cli # good
bunx my-cli --bun # bad
```

## Package flag

**`--package <pkg>` or `-p <pkg>`** - Run binary from specific package. Useful when binary name differs from package name:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bunx -p renovate renovate-config-validator
bunx --package @angular/cli ng
```

To force bun to always be used with a script, use a shebang.

```ts dist/index.js icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/javascript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=81efd0ad0d779debfa163bfd906ef6a6" theme={"theme":{"light":"github-light","dark":"dracula"}}
#!/usr/bin/env bun
```

# bun publish

> Use `bun publish` to publish a package to the npm registry

`bun publish` will automatically pack your package into a tarball, strip catalog and workspace protocols from the `package.json` (resolving versions if necessary), and publish to the registry specified in your configuration files. Both `bunfig.toml` and `.npmrc` files are supported.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
## Publishing the package from the current working directory
bun publish
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish v1.3.1 (ca7428e9)

packed 203B package.json
packed 224B README.md
packed 30B index.ts
packed 0.64KB tsconfig.json

Total files: 4
Shasum: 79e2b4377b63f4de38dc7ea6e5e9dbee08311a69
Integrity: sha512-6QSNlDdSwyG/+[...]X6wXHriDWr6fA==
Unpacked size: 1.1KB
Packed size: 0.76KB
Tag: latest
Access: default
Registry: http://localhost:4873/

 + publish-1@1.0.0
```

Alternatively, you can pack and publish your package separately by using `bun pm pack` followed by `bun publish` with the path to the output tarball.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm pack
...
bun publish ./package.tgz
```

<Note>
  `bun publish` will not run lifecycle scripts
  (`prepublishOnly/prepack/prepare/postpack/publish/postpublish`) if a tarball path is provided.
  Scripts will only be run if the package is packed by `bun publish`.
</Note>

### `--access`

The `--access` flag can be used to set the access level of the package being published. The access level can be one of `public` or `restricted`. Unscoped packages are always public, and attempting to publish an unscoped package with `--access restricted` will result in an error.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish --access public
```

`--access` can also be set in the `publishConfig` field of your `package.json`.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"publishConfig": {
		"access": "restricted"
	}
}
```

### `--tag`

Set the tag of the package version being published. By default, the tag is `latest`. The initial version of a package is always given the `latest` tag in addition to the specified tag.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish --tag alpha
```

`--tag` can also be set in the `publishConfig` field of your `package.json`.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"publishConfig": {
		"tag": "next"
	}
}
```

### `--dry-run`

The `--dry-run` flag can be used to simulate the publish process without actually publishing the package. This is useful for verifying the contents of the published package without actually publishing the package.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish --dry-run
```

### `--gzip-level`

Specify the level of gzip compression to use when packing the package. Only applies to `bun publish` without a tarball path argument. Values range from `0` to `9` (default is `9`).

### `--auth-type`

If you have 2FA enabled for your npm account, `bun publish` will prompt you for a one-time password. This can be done through a browser or the CLI. The `--auth-type` flag can be used to tell the npm registry which method you prefer. The possible values are `web` and `legacy`, with `web` being the default.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish --auth-type legacy
...
This operation requires a one-time password.
Enter OTP: 123456
...
```

### `--otp`

Provide a one-time password directly to the CLI. If the password is valid, this will skip the extra prompt for a one-time password before publishing. Example usage:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish --otp 123456
```

<Note>
  `bun publish` respects the `NPM_CONFIG_TOKEN` environment variable which can be used when
  publishing in github actions or automated workflows.
</Note>

***

## CLI Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish dist
```

### Publishing Options

<ParamField path="--access" type="string">
  The `--access` flag can be used to set the access level of the package being published. The access level can be one of `public` or `restricted`. Unscoped packages are always public, and attempting to publish an unscoped package with `--access restricted` will result in an error.

  ```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun publish --access public
  ```

  `--access` can also be set in the `publishConfig` field of your `package.json`.

  ```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
  {
  	"publishConfig": {
  		"access": "restricted" // [!code ++]
  	}
  }
  ```
</ParamField>

<ParamField path="--tag" type="string" default="latest">
  Set the tag of the package version being published. By default, the tag is `latest`. The initial version of a package is always given the `latest` tag in addition to the specified tag.

  ```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun publish --tag alpha
  ```

  `--tag` can also be set in the `publishConfig` field of your `package.json`.

  ```json package.json file="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
  {
  	"publishConfig": {
  		"tag": "next" // [!code ++]
  	}
  }
  ```
</ParamField>

<ParamField path="--dry-run=<val>" type="string">
  The `--dry-run` flag can be used to simulate the publish process without actually publishing the package. This is useful for verifying the contents of the published package without actually publishing the package.

  ```sh  theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun publish --dry-run
  ```
</ParamField>

<ParamField path="--gzip-level" type="string" default="9">
  Specify the level of gzip compression to use when packing the package. Only applies to `bun
  	publish` without a tarball path argument. Values range from `0` to `9` (default is `9`).
</ParamField>

<ParamField path="--auth-type" type="string" default="web">
  If you have 2FA enabled for your npm account, `bun publish` will prompt you for a one-time password. This can be done through a browser or the CLI. The `--auth-type` flag can be used to tell the npm registry which method you prefer. The possible values are `web` and `legacy`, with `web` being the default.

  ```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun publish --auth-type legacy
  ...
  This operation requires a one-time password.
  Enter OTP: 123456
  ...
  ```
</ParamField>

<ParamField path="--otp" type="string" default="web">
  Provide a one-time password directly to the CLI. If the password is valid, this will skip the extra prompt for a one-time password before publishing. Example usage:

  ```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun publish --otp 123456
  ```

  <Note>
    `bun publish` respects the `NPM_CONFIG_TOKEN` environment variable which can be used when
    publishing in github actions or automated workflows.
  </Note>
</ParamField>

### Registry Configuration

#### Custom Registry

<ParamField path="--registry" type="string">
  Specify registry URL, overriding .npmrc and bunfig.toml
</ParamField>

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun publish --registry https://my-private-registry.com
```

#### SSL Certificates

<ParamField path="--ca" type="string">
  Provide Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  Path to Certificate Authority certificate file
</ParamField>

<CodeGroup>
  ```bash Inline Certificate theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun publish --ca "-----BEGIN CERTIFICATE-----..."
  ```

  ```bash Certificate File theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun publish --cafile ./ca-cert.pem
  ```
</CodeGroup>

### Publishing Options

#### Dependency Management

<ParamField path="-p, --production" type="boolean">
  Don't install devDependencies
</ParamField>

<ParamField path="--omit" type="string">
  Exclude dependency types: `dev`, `optional`, or `peer`
</ParamField>

<ParamField path="-f, --force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies
</ParamField>

#### Script Control

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts during packing and publishing
</ParamField>

<ParamField path="--trust" type="boolean">
  Add packages to trustedDependencies and run their scripts
</ParamField>

<Note>
  **Lifecycle Scripts** — When providing a pre-built tarball, lifecycle scripts (prepublishOnly,
  prepack, etc.) are not executed. Scripts only run when Bun packs the package itself.
</Note>

#### File Management

<ParamField path="--no-save" type="boolean">
  Don't update package.json or lockfile
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--yarn" type="boolean">
  Generate yarn.lock file (yarn v1 compatible)
</ParamField>

#### Performance

<ParamField path="--backend" type="string">
  Platform optimizations: `clonefile` (default), `hardlink`, `symlink`, or `copyfile`
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum concurrent network requests
</ParamField>

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum concurrent lifecycle scripts
</ParamField>

#### Output Control

<ParamField path="--silent" type="boolean">
  Suppress all output
</ParamField>

<ParamField path="--verbose" type="boolean">
  Show detailed logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Hide progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print publish summary
</ParamField>

# bun outdated

> Check for outdated dependencies

Use `bun outdated` to check for outdated dependencies in your project. This command displays a table of dependencies that have newer versions available.

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package                        | Current | Update    | Latest     |
| ------------------------------ | ------- | --------- | ---------- |
| @sinclair/typebox              | 0.34.15 | 0.34.16   | 0.34.16    |
| @types/bun (dev)               | 1.2.0   | 1.2.23    | 1.2.23     |
| eslint (dev)                   | 8.57.1  | 8.57.1    | 9.20.0     |
| eslint-plugin-security (dev)   | 2.1.1   | 2.1.1     | 3.0.1      |
| eslint-plugin-sonarjs (dev)    | 0.23.0  | 0.23.0    | 3.0.1      |
| expect-type (dev)              | 0.16.0  | 0.16.0    | 1.1.0      |
| prettier (dev)                 | 3.4.2   | 3.5.0     | 3.5.0      |
| tsup (dev)                     | 8.3.5   | 8.3.6     | 8.3.6      |
| typescript (dev)               | 5.7.2   | 5.7.3     | 5.7.3      |

```

## Version Information

The output table shows three version columns:

* **Current**: The version currently installed
* **Update**: The latest version that satisfies your package.json version range
* **Latest**: The latest version published to the registry

### Dependency Filters

`bun outdated` supports searching for outdated dependencies by package names and glob patterns.

To check if specific dependencies are outdated, pass the package names as positional arguments:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated eslint-plugin-security eslint-plugin-sonarjs
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package                        | Current | Update | Latest    |
| ------------------------------ | ------- | ------ | --------- |
| eslint-plugin-security (dev)   | 2.1.1   | 2.1.1  | 3.0.1     |
| eslint-plugin-sonarjs (dev)    | 0.23.0  | 0.23.0 | 3.0.1     |

```

You can also pass glob patterns to check for outdated packages:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated eslint*
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package                        | Current | Update | Latest     |
| ------------------------------ | ------- | ------ | ---------- |
| eslint (dev)                   | 8.57.1  | 8.57.1 | 9.20.0     |
| eslint-plugin-security (dev)   | 2.1.1   | 2.1.1  | 3.0.1      |
| eslint-plugin-sonarjs (dev)    | 0.23.0  | 0.23.0 | 3.0.1      |
```

For example, to check for outdated `@types/*` packages:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated '@types/*'
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package            | Current | Update | Latest |
| ------------------ | ------- | ------ | ------ |
| @types/bun (dev)   | 1.2.0   | 1.2.23 | 1.2.23 |
```

Or to exclude all `@types/*` packages:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated '!@types/*'
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package                        | Current | Update    | Latest     |
| ------------------------------ | ------- | --------- | ---------- |
| @sinclair/typebox              | 0.34.15 | 0.34.16   | 0.34.16    |
| eslint (dev)                   | 8.57.1  | 8.57.1    | 9.20.0     |
| eslint-plugin-security (dev)   | 2.1.1   | 2.1.1     | 3.0.1      |
| eslint-plugin-sonarjs (dev)    | 0.23.0  | 0.23.0    | 3.0.1      |
| expect-type (dev)              | 0.16.0  | 0.16.0    | 1.1.0      |
| prettier (dev)                 | 3.4.2   | 3.5.0     | 3.5.0      |
| tsup (dev)                     | 8.3.5   | 8.3.6     | 8.3.6      |
| typescript (dev)               | 5.7.2   | 5.7.3     | 5.7.3      |
```

### Workspace Filters

Use the `--filter` flag to check for outdated dependencies in a different workspace package:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated --filter='@monorepo/types'
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package            | Current | Update | Latest |
| ------------------ | ------- | ------ | ------ |
| tsup (dev)         | 8.3.5   | 8.3.6  | 8.3.6  |
| typescript (dev)   | 5.7.2   | 5.7.3  | 5.7.3  |
```

You can pass multiple `--filter` flags to check multiple workspaces:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated --filter @monorepo/types --filter @monorepo/cli
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package                        | Current | Update | Latest     |
| ------------------------------ | ------- | ------ | ---------- |
| eslint (dev)                 	 | 8.57.1  | 8.57.1 | 9.20.0     |
| eslint-plugin-security (dev)   | 2.1.1   | 2.1.1  | 3.0.1      |
| eslint-plugin-sonarjs (dev)    | 0.23.0  | 0.23.0 | 3.0.1      |
| expect-type (dev)              | 0.16.0  | 0.16.0 | 1.1.0      |
| tsup (dev)                     | 8.3.5   | 8.3.6  | 8.3.6      |
| typescript (dev)               | 5.7.2   | 5.7.3  | 5.7.3      |
```

You can also pass glob patterns to filter by workspace names:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated --filter='@monorepo/{types,cli}'
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
| Package                        | Current | Update | Latest     |
| ------------------------------ | ------- | ------ | ---------- |
| eslint (dev)                   | 8.57.1  | 8.57.1 | 9.20.0     |
| eslint-plugin-security (dev)   | 2.1.1   | 2.1.1  | 3.0.1      |
| eslint-plugin-sonarjs (dev)    | 0.23.0  | 0.23.0 | 3.0.1      |
| expect-type (dev)              | 0.16.0  | 0.16.0 | 1.1.0      |
| tsup (dev)                     | 8.3.5   | 8.3.6  | 8.3.6      |
| typescript (dev)               | 5.7.2   | 5.7.3  | 5.7.3      |
```

### Catalog Dependencies

`bun outdated` supports checking catalog dependencies defined in`package.json`:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated -r
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
┌────────────────────┬─────────┬─────────┬─────────┬────────────────────────────────┐
│ Package            │ Current │ Update  │ Latest  │ Workspace                      │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ body-parser        │ 1.19.0  │ 1.19.0  │ 2.2.0   │ @test/shared                   │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ cors               │ 2.8.0   │ 2.8.0   │ 2.8.5   │ @test/shared                   │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ chalk              │ 4.0.0   │ 4.0.0   │ 5.6.2   │ @test/utils                    │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ uuid               │ 8.0.0   │ 8.0.0   │ 13.0.0  │ @test/utils                    │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ axios              │ 0.21.0  │ 0.21.0  │ 1.12.2  │ catalog (@test/app)            │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ lodash             │ 4.17.15 │ 4.17.15 │ 4.17.21 │ catalog (@test/app, @test/app) │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ react              │ 17.0.0  │ 17.0.0  │ 19.1.1  │ catalog (@test/app)            │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ react-dom          │ 17.0.0  │ 17.0.0  │ 19.1.1  │ catalog (@test/app)            │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ express            │ 4.17.0  │ 4.17.0  │ 5.1.0   │ catalog (@test/shared)         │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ moment             │ 2.24.0  │ 2.24.0  │ 2.30.1  │ catalog (@test/utils)          │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ @types/node (dev)  │ 14.0.0  │ 14.0.0  │ 24.5.2  │ @test/shared                   │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ @types/react (dev) │ 17.0.0  │ 17.0.0  │ 19.1.15 │ catalog:testing (@test/app)    │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ eslint (dev)       │ 7.0.0   │ 7.0.0   │ 9.36.0  │ catalog:testing (@test/app)    │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ typescript (dev)   │ 4.9.5   │ 4.9.5   │ 5.9.2   │ catalog:build (@test/app)      │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ jest (dev)         │ 26.0.0  │ 26.0.0  │ 30.2.0  │ catalog:testing (@test/shared) │
├────────────────────┼─────────┼─────────┼─────────┼────────────────────────────────┤
│ prettier (dev)     │ 2.0.0   │ 2.0.0   │ 3.6.2   │ catalog:build (@test/utils)    │
└────────────────────┴─────────┴─────────┴─────────┴────────────────────────────────┘
```

***

## CLI Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun outdated <filter>
```

### General Options

<ParamField path="-c, --config" type="string">
  Specify path to config file (<code>bunfig.toml</code>)
</ParamField>

<ParamField path="--cwd" type="string">
  Set a specific cwd
</ParamField>

<ParamField path="-h, --help" type="boolean">
  Print this help menu
</ParamField>

<ParamField path="-F, --filter" type="string">
  Display outdated dependencies for each matching workspace
</ParamField>

### Output & Logging

<ParamField path="--silent" type="boolean">
  Don't log anything
</ParamField>

<ParamField path="--verbose" type="boolean">
  Excessively verbose logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Disable the progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print a summary
</ParamField>

### Dependency Scope & Target

<ParamField path="-p, --production" type="boolean">
  Don't install devDependencies
</ParamField>

<ParamField path="--omit" type="string">
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install
</ParamField>

<ParamField path="-g, --global" type="boolean">
  Install globally
</ParamField>

### Lockfile & Package.json

<ParamField path="-y, --yarn" type="boolean">
  Write a <code>yarn.lock</code> file (yarn v1)
</ParamField>

<ParamField path="--no-save" type="boolean">
  Don't update <code>package.json</code> or save a lockfile
</ParamField>

<ParamField path="--save" type="boolean" default="true">
  Save to <code>package.json</code> (true by default)
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--save-text-lockfile" type="boolean">
  Save a text-based lockfile
</ParamField>

<ParamField path="--lockfile-only" type="boolean">
  Generate a lockfile without installing dependencies
</ParamField>

<ParamField path="--trust" type="boolean">
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the
  package(s)
</ParamField>

### Network & Registry

<ParamField path="--ca" type="string">
  Provide a Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  Same as <code>--ca</code>, but as a file path to the certificate
</ParamField>

<ParamField path="--registry" type="string">
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code> and
  environment variables
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum number of concurrent network requests (default 48)
</ParamField>

### Caching

<ParamField path="--cache-dir" type="string">
  Store & load cached data from a specific directory path
</ParamField>

<ParamField path="--no-cache" type="boolean">
  Ignore manifest cache entirely
</ParamField>

### Execution Behavior

<ParamField path="--dry-run" type="boolean">
  Don't install anything
</ParamField>

<ParamField path="-f, --force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies
</ParamField>

<ParamField path="--no-verify" type="boolean">
  Skip verifying integrity of newly downloaded packages
</ParamField>

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts in the project's <code>package.json</code> (dependency scripts are never
  run)
</ParamField>

<ParamField path="--backend" type="string" default="clonefile">
  Platform-specific optimizations for installing dependencies. Possible values:{" "}
  <code>clonefile</code> (default), <code>hardlink</code>, <code>symlink</code>,{" "}
  <code>copyfile</code>
</ParamField>

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum number of concurrent jobs for lifecycle scripts (default 5)
</ParamField>

# bun why

> Explain why a package is installed

The `bun why` command explains why a package is installed in your project by showing the dependency chain that led to its installation.

## Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun why <package>
```

## Arguments

* `<package>`: The name of the package to explain. Supports glob patterns like `@org/*` or `*-lodash`.

## Options

* `--top`: Show only the top-level dependencies instead of the complete dependency tree.
* `--depth <number>`: Maximum depth of the dependency tree to display.

## Examples

Check why a specific package is installed:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun why react
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
react@18.2.0
  └─ my-app@1.0.0 (requires ^18.0.0)
```

Check why all packages with a specific pattern are installed:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun why "@types/*"
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
@types/react@18.2.15
  └─ dev my-app@1.0.0 (requires ^18.0.0)

@types/react-dom@18.2.7
  └─ dev my-app@1.0.0 (requires ^18.0.0)
```

Show only top-level dependencies:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun why express --top
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
express@4.18.2
  └─ my-app@1.0.0 (requires ^4.18.2)
```

Limit the dependency tree depth:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun why express --depth 2
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
express@4.18.2
  └─ express-pollyfill@1.20.1 (requires ^4.18.2)
     └─ body-parser@1.20.1 (requires ^1.20.1)
     └─ accepts@1.3.8 (requires ^1.3.8)
        └─ (deeper dependencies hidden)
```

## Understanding the Output

The output shows:

* The package name and version being queried
* The dependency chain that led to its installation
* The type of dependency (dev, peer, optional, or production)
* The version requirement specified in each package's dependencies

For nested dependencies, the command shows the complete dependency tree by default, with indentation indicating the relationship hierarchy.

# bun audit

> Check your installed packages for known security vulnerabilities

Run the command in a project with a `bun.lock` file:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun audit
```

Bun sends the list of installed packages and versions to NPM, and prints a report of any vulnerabilities that were found. Packages installed from registries other than the default registry are skipped.

If no vulnerabilities are found, the command prints:

```
No vulnerabilities found
```

When vulnerabilities are detected, each affected package is listed along with the severity, a short description and a link to the advisory. At the end of the report Bun prints a summary and hints for updating:

```
3 vulnerabilities (1 high, 2 moderate)
To update all dependencies to the latest compatible versions:
  bun update
To update all dependencies to the latest versions (including breaking changes):
  bun update --latest
```

### Filtering options

**`--audit-level=<low|moderate|high|critical>`** - Only show vulnerabilities at this severity level or higher:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun audit --audit-level=high
```

**`--prod`** - Audit only production dependencies (excludes devDependencies):

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun audit --prod
```

**`--ignore <CVE>`** - Ignore specific CVEs (can be used multiple times):

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun audit --ignore CVE-2022-25883 --ignore CVE-2023-26136
```

### `--json`

Use the `--json` flag to print the raw JSON response from the registry instead of the formatted report:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun audit --json
```

### Exit code

`bun audit` will exit with code `0` if no vulnerabilities are found and `1` if the report lists any vulnerabilities. This will still happen even if `--json` is passed.

# Workspaces

> Develop complex monorepos with multiple independent packages

Bun supports [`workspaces`](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true#description) in `package.json`. Workspaces make it easy to develop complex software as a *monorepo* consisting of several independent packages.

It's common for a monorepo to have the following structure:

```
tree
<root>
├── README.md
├── bun.lock
├── package.json
├── tsconfig.json
└── packages
    ├── pkg-a
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    ├── pkg-b
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    └── pkg-c
        ├── index.ts
        ├── package.json
        └── tsconfig.json
```

In the root `package.json`, the `"workspaces"` key is used to indicate which subdirectories should be considered packages/workspaces within the monorepo. It's conventional to place all the workspace in a directory called `packages`.

```json  theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-project",
	"version": "1.0.0",
	"workspaces": ["packages/*"],
	"devDependencies": {
		"example-package-in-monorepo": "workspace:*"
	}
}
```

<Note>
  **Glob support** — Bun supports full glob syntax in `"workspaces"` (see
  [here](/runtime/glob#supported-glob-patterns) for a comprehensive list of supported syntax),
  *except* for exclusions (e.g. `!**/excluded/**`), which are not implemented yet.
</Note>

Each workspace has it's own `package.json`. When referencing other packages in the monorepo, semver or workspace protocols (e.g. `workspace:*`) can be used as the version field in your `package.json`.

```json  theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "pkg-a",
	"version": "1.0.0",
	"dependencies": {
		"pkg-b": "workspace:*"
	}
}
```

`bun install` will install dependencies for all workspaces in the monorepo, de-duplicating packages if possible. If you only want to install dependencies for specific workspaces, you can use the `--filter` flag.

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
# Install dependencies for all workspaces starting with `pkg-` except for `pkg-c`
bun install --filter "pkg-*" --filter "!pkg-c"

# Paths can also be used. This is equivalent to the command above.
bun install --filter "./packages/pkg-*" --filter "!pkg-c" # or --filter "!./packages/pkg-c"
```

When publishing, `workspace:` versions are replaced by the package's `package.json` version,

```
"workspace:*" -> "1.0.1"
"workspace:^" -> "^1.0.1"
"workspace:~" -> "~1.0.1"
```

Setting a specific version takes precedence over the package's `package.json` version,

```
"workspace:1.0.2" -> "1.0.2" // Even if current version is 1.0.1
```

Workspaces have a couple major benefits.

* **Code can be split into logical parts.** If one package relies on another, you can simply add it as a dependency in `package.json`. If package `b` depends on `a`, `bun install` will install your local `packages/a` directory into `node_modules` instead of downloading it from the npm registry.
* **Dependencies can be de-duplicated.** If `a` and `b` share a common dependency, it will be *hoisted* to the root `node_modules` directory. This reduces redundant disk usage and minimizes "dependency hell" issues associated with having multiple versions of a package installed simultaneously.
* **Run scripts in multiple packages.** You can use the [`--filter` flag](/pm/filter) to easily run `package.json` scripts in multiple packages in your workspace, , or `--workspaces` to run scripts across all workspaces.

## Share versions with Catalogs

When many packages need the same dependency versions, catalogs let you define
those versions once in the root `package.json` and reference them from your
workspaces using the `catalog:` protocol. Updating the catalog automatically
updates every package that references it. See
[Catalogs](/pm/catalogs) for details.

<Note>
  ⚡️ **Speed** — Installs are fast, even for big monorepos. Bun installs the [Remix](https://github.com/remix-run/remix) monorepo in about `500ms` on Linux.

  * 28x faster than `npm install`
  * 12x faster than `yarn install` (v1)
  * 8x faster than `pnpm install`

  <Image src="https://user-images.githubusercontent.com/709451/212829600-77df9544-7c9f-4d8d-a984-b2cd0fd2aa52.png" />
</Note>

# Catalogs

> Share common dependency versions across multiple packages in a monorepo

Catalogs in Bun provide a straightforward way to share common dependency versions across multiple packages in a monorepo. Rather than specifying the same versions repeatedly in each workspace package, you define them once in the root package.json and reference them consistently throughout your project.

## Overview

Unlike traditional dependency management where each workspace package needs to independently specify versions, catalogs let you:

1. Define version catalogs in the root package.json
2. Reference these versions with a simple `catalog:` protocol
3. Update all packages simultaneously by changing the version in just one place

This is especially useful in large monorepos where dozens of packages need to use the same version of key dependencies.

## How to Use Catalogs

### Directory Structure Example

Consider a monorepo with the following structure:

```
my-monorepo/
├── package.json
├── bun.lock
└── packages/
    ├── app/
    │   └── package.json
    ├── ui/
    │   └── package.json
    └── utils/
        └── package.json
```

### 1. Define Catalogs in Root package.json

In your root-level `package.json`, add a `catalog` or `catalogs` field within the `workspaces` object:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-monorepo",
	"workspaces": {
		"packages": ["packages/*"],
		"catalog": {
			"react": "^19.0.0",
			"react-dom": "^19.0.0"
		},
		"catalogs": {
			"testing": {
				"jest": "30.0.0",
				"testing-library": "14.0.0"
			}
		}
	}
}
```

If you put `catalog` or `catalogs` at the top level of the `package.json` file, that will work too.

### 2. Reference Catalog Versions in Workspace Packages

In your workspace packages, use the `catalog:` protocol to reference versions:

```json packages/app/package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "app",
	"dependencies": {
		"react": "catalog:",
		"react-dom": "catalog:",
		"jest": "catalog:testing"
	}
}
```

```json packages/ui/package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "ui",
	"dependencies": {
		"react": "catalog:",
		"react-dom": "catalog:"
	},
	"devDependencies": {
		"jest": "catalog:testing",
		"testing-library": "catalog:testing"
	}
}
```

### 3. Run Bun Install

Run `bun install` to install all dependencies according to the catalog versions.

## Catalog vs Catalogs

Bun supports two ways to define catalogs:

1. **`catalog`** (singular): A single default catalog for commonly used dependencies

   ```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
   "catalog": {
     "react": "^19.0.0",
     "react-dom": "^19.0.0"
   }
   ```

   Reference with simply `catalog:`:

   ```json packages/app/package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
   "dependencies": {
     "react": "catalog:"
   }
   ```

2. **`catalogs`** (plural): Multiple named catalogs for grouping dependencies

   ```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
   "catalogs": {
     "testing": {
       "jest": "30.0.0"
     },
     "ui": {
       "tailwind": "4.0.0"
     }
   }
   ```

   Reference with `catalog:<name>`:

   ```json packages/app/package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
   "dependencies": {
     "jest": "catalog:testing",
     "tailwind": "catalog:ui"
   }
   ```

## Benefits of Using Catalogs

* **Consistency**: Ensures all packages use the same version of critical dependencies
* **Maintenance**: Update a dependency version in one place instead of across multiple package.json files
* **Clarity**: Makes it obvious which dependencies are standardized across your monorepo
* **Simplicity**: No need for complex version resolution strategies or external tools

## Real-World Example

Here's a more comprehensive example for a React application:

**Root package.json**

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "react-monorepo",
	"workspaces": {
		"packages": ["packages/*"],
		"catalog": {
			"react": "^19.0.0",
			"react-dom": "^19.0.0",
			"react-router-dom": "^6.15.0"
		},
		"catalogs": {
			"build": {
				"webpack": "5.88.2",
				"babel": "7.22.10"
			},
			"testing": {
				"jest": "29.6.2",
				"react-testing-library": "14.0.0"
			}
		}
	},
	"devDependencies": {
		"typescript": "5.1.6"
	}
}
```

```json packages/app/package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "app",
	"dependencies": {
		"react": "catalog:",
		"react-dom": "catalog:",
		"react-router-dom": "catalog:",
		"@monorepo/ui": "workspace:*",
		"@monorepo/utils": "workspace:*"
	},
	"devDependencies": {
		"webpack": "catalog:build",
		"babel": "catalog:build",
		"jest": "catalog:testing",
		"react-testing-library": "catalog:testing"
	}
}
```

```json packages/ui/package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "@monorepo/ui",
	"dependencies": {
		"react": "catalog:",
		"react-dom": "catalog:"
	},
	"devDependencies": {
		"jest": "catalog:testing",
		"react-testing-library": "catalog:testing"
	}
}
```

```json packages/utils/package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "@monorepo/utils",
	"dependencies": {
		"react": "catalog:"
	},
	"devDependencies": {
		"jest": "catalog:testing"
	}
}
```

## Updating Versions

To update versions across all packages, simply change the version in the root package.json:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
"catalog": {
  "react": "^19.1.0",  // Updated from ^19.0.0
  "react-dom": "^19.1.0"  // Updated from ^19.0.0
}
```

Then run `bun install` to update all packages.

## Lockfile Integration

Bun's lockfile tracks catalog versions, making it easy to ensure consistent installations across different environments. The lockfile includes:

* The catalog definitions from your package.json
* The resolution of each cataloged dependency

```json bun.lock(excerpt) icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
  "lockfileVersion": 1,
  "workspaces": {
    "": {
      "name": "react-monorepo",
    },
    "packages/app": {
      "name": "app",
      "dependencies": {
        "react": "catalog:",
        "react-dom": "catalog:",
        ...
      },
    },
    ...
  },
  "catalog": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    ...
  },
  "catalogs": {
    "build": {
      "webpack": "5.88.2",
      ...
    },
    ...
  },
  "packages": {
    ...
  }
}
```

## Limitations and Edge Cases

* Catalog references must match a dependency defined in either `catalog` or one of the named `catalogs`
* Empty strings and whitespace in catalog names are ignored (treated as default catalog)
* Invalid dependency versions in catalogs will fail to resolve during `bun install`
* Catalogs are only available within workspaces; they cannot be used outside the monorepo

Bun's catalog system provides a powerful yet simple way to maintain consistency across your monorepo without introducing additional complexity to your workflow.

## Publishing

When you run `bun publish` or `bun pm pack`, Bun automatically replaces
`catalog:` references in your `package.json` with the resolved version numbers.
The published package includes regular semver strings and no longer depends on
your catalog definitions.

# bun link

> Link local packages for development

Use `bun link` in a local directory to register the current package as a "linkable" package.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
cd /path/to/cool-pkg
cat package.json
bun link
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun link v1.x (7416672e)
Success! Registered "cool-pkg"

To use cool-pkg in a project, run:
  bun link cool-pkg

Or add it in dependencies in your package.json file:
  "cool-pkg": "link:cool-pkg"
```

This package can now be "linked" into other projects using `bun link cool-pkg`. This will create a symlink in the `node_modules` directory of the target project, pointing to the local directory.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
cd /path/to/my-app
bun link cool-pkg
```

In addition, the `--save` flag can be used to add `cool-pkg` to the `dependencies` field of your app's package.json with a special version specifier that tells Bun to load from the registered local directory instead of installing from `npm`:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"version": "1.0.0",
	"dependencies": {
		"cool-pkg": "link:cool-pkg" // [!code ++]
	}
}
```

***

# CLI Usage

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun link <packages>
```

### Installation Scope

<ParamField path="--global" type="boolean">
  Install globally. Alias: <code>-g</code>
</ParamField>

### Dependency Management

<ParamField path="--production" type="boolean">
  Don't install devDependencies. Alias: <code>-p</code>
</ParamField>

<ParamField path="--omit" type="string">
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install
</ParamField>

### Project Files & Lockfiles

<ParamField path="--yarn" type="boolean">
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--save-text-lockfile" type="boolean">
  Save a text-based lockfile
</ParamField>

<ParamField path="--lockfile-only" type="boolean">
  Generate a lockfile without installing dependencies
</ParamField>

<ParamField path="--no-save" type="boolean">
  Don't update <code>package.json</code> or save a lockfile
</ParamField>

<ParamField path="--save" type="boolean" default="true">
  Save to <code>package.json</code> (true by default)
</ParamField>

<ParamField path="--trust" type="boolean">
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the
  package(s)
</ParamField>

### Installation Control

<ParamField path="--force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies. Alias:{" "}
  <code>-f</code>
</ParamField>

<ParamField path="--no-verify" type="boolean">
  Skip verifying integrity of newly downloaded packages
</ParamField>

<ParamField path="--backend" type="string" default="clonefile">
  Platform-specific optimizations for installing dependencies. Possible values:{" "}
  <code>clonefile</code> (default), <code>hardlink</code>, <code>symlink</code>,{" "}
  <code>copyfile</code>
</ParamField>

<ParamField path="--linker" type="string">
  Linker strategy (one of <code>isolated</code> or <code>hoisted</code>)
</ParamField>

<ParamField path="--dry-run" type="boolean">
  Don't install anything
</ParamField>

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts in the project's <code>package.json</code> (dependency scripts are never
  run)
</ParamField>

### Network & Registry

<ParamField path="--ca" type="string">
  Provide a Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  Same as <code>--ca</code>, but as a file path to the certificate
</ParamField>

<ParamField path="--registry" type="string">
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code>, and
  environment variables
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum number of concurrent network requests (default 48)
</ParamField>

### Performance & Resource

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum number of concurrent jobs for lifecycle scripts (default 5)
</ParamField>

### Caching

<ParamField path="--cache-dir" type="string">
  Store & load cached data from a specific directory path
</ParamField>

<ParamField path="--no-cache" type="boolean">
  Ignore manifest cache entirely
</ParamField>

### Output & Logging

<ParamField path="--silent" type="boolean">
  Don't log anything
</ParamField>

<ParamField path="--quiet" type="boolean">
  Only show tarball name when packing
</ParamField>

<ParamField path="--verbose" type="boolean">
  Excessively verbose logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Disable the progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print a summary
</ParamField>

### Platform Targeting

<ParamField path="--cpu" type="string">
  Override CPU architecture for optional dependencies (e.g., <code>x64</code>, <code>arm64</code>,{" "}
  <code>\*</code> for all)
</ParamField>

<ParamField path="--os" type="string">
  Override operating system for optional dependencies (e.g., <code>linux</code>, <code>darwin</code>
  , <code>\*</code> for all)
</ParamField>

### Global Configuration & Context

<ParamField path="--config" type="string">
  Specify path to config file (<code>bunfig.toml</code>). Alias: <code>-c</code>
</ParamField>

<ParamField path="--cwd" type="string">
  Set a specific current working directory
</ParamField>

### Help

<ParamField path="--help" type="boolean">
  Print this help menu. Alias: <code>-h</code>
</ParamField>

# bun pm

> Package manager utilities

The `bun pm` command group provides a set of utilities for working with Bun's package manager.

## pack

To create a tarball of the current workspace:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm pack
```

This command creates a `.tgz` file containing all files that would be published to npm, following the same rules as `npm pack`.

## Examples

Basic usage:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm pack
# Creates my-package-1.0.0.tgz in current directory
```

Quiet mode for scripting:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
TARBALL=$(bun pm pack --quiet)
echo "Created: $TARBALL"
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
Created: my-package-1.0.0.tgz
```

Custom destination:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm pack --destination ./dist
# Saves tarball in ./dist/ directory
```

## Options

* `--dry-run`: Perform all tasks except writing the tarball to disk. Shows what would be included.
* `--destination <dir>`: Specify the directory where the tarball will be saved.
* `--filename <name>`: Specify an exact file name for the tarball to be saved at.
* `--ignore-scripts`: Skip running pre/postpack and prepare scripts.
* `--gzip-level <0-9>`: Set a custom compression level for gzip, ranging from 0 to 9 (default is 9).
* `--quiet`: Only output the tarball filename, suppressing verbose output. Ideal for scripts and automation.

> **Note:** `--filename` and `--destination` cannot be used at the same time.

## Output Modes

**Default output:**

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm pack
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pack v1.2.19

packed 131B package.json
packed 40B index.js

my-package-1.0.0.tgz

Total files: 2
Shasum: f2451d6eb1e818f500a791d9aace80b394258a90
Unpacked size: 171B
Packed size: 249B
```

**Quiet output:**

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm pack --quiet
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
my-package-1.0.0.tgz
```

The `--quiet` flag is particularly useful for automation workflows where you need to capture the generated tarball filename for further processing.

## bin

To print the path to the `bin` directory for the local project:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm bin
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
/path/to/current/project/node_modules/.bin
```

To print the path to the global `bin` directory:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm bin -g
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
<$HOME>/.bun/bin
```

## ls

To print a list of installed dependencies in the current project and their resolved versions, excluding their dependencies.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm ls
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
/path/to/project node_modules (135)
├── eslint@8.38.0
├── react@18.2.0
├── react-dom@18.2.0
├── typescript@5.0.4
└── zod@3.21.4
```

To print all installed dependencies, including nth-order dependencies.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm ls --all
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
/path/to/project node_modules (135)
├── @eslint-community/eslint-utils@4.4.0
├── @eslint-community/regexpp@4.5.0
├── @eslint/eslintrc@2.0.2
├── @eslint/js@8.38.0
├── @nodelib/fs.scandir@2.1.5
├── @nodelib/fs.stat@2.0.5
├── @nodelib/fs.walk@1.2.8
├── acorn@8.8.2
├── acorn-jsx@5.3.2
├── ajv@6.12.6
├── ansi-regex@5.0.1
├── ...
```

## whoami

Print your npm username. Requires you to be logged in (`bunx npm login`) with credentials in either `bunfig.toml` or `.npmrc`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm whoami
```

## hash

To generate and print the hash of the current lockfile:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm hash
```

To print the string used to hash the lockfile:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm hash-string
```

To print the hash stored in the current lockfile:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm hash-print
```

## cache

To print the path to Bun's global module cache:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm cache
```

To clear Bun's global module cache:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm cache rm
```

## migrate

To migrate another package manager's lockfile without installing anything:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm migrate
```

## untrusted

To print current untrusted dependencies with scripts:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm untrusted
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
./node_modules/@biomejs/biome @1.8.3
 » [postinstall]: node scripts/postinstall.js

These dependencies had their lifecycle scripts blocked during install.
```

## trust

To run scripts for untrusted dependencies and add to `trustedDependencies`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm trust <names>
```

Options for the `trust` command:

* `--all`: Trust all untrusted dependencies.

## default-trusted

To print the default trusted dependencies list:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm default-trusted
```

see the current list on GitHub [here](https://github.com/oven-sh/bun/blob/main/src/install/default-trusted-dependencies.txt)

## version

To display current package version and help:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm version
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm version v1.3.1 (ca7428e9)
Current package version: v1.0.0

Increment:
  patch      1.0.0 → 1.0.1
  minor      1.0.0 → 1.1.0
  major      1.0.0 → 2.0.0
  prerelease 1.0.0 → 1.0.1-0
  prepatch   1.0.0 → 1.0.1-0
  preminor   1.0.0 → 1.1.0-0
  premajor   1.0.0 → 2.0.0-0
  from-git   Use version from latest git tag
  1.2.3      Set specific version

Options:
  --no-git-tag-version Skip git operations
  --allow-same-version Prevents throwing error if version is the same
  --message=<val>, -m  Custom commit message, use %s for version substitution
  --preid=<val>        Prerelease identifier (i.e beta → 1.0.1-beta.0)
  --force, -f          Bypass dirty git history check

Examples:
  bun pm version patch
  bun pm version 1.2.3 --no-git-tag-version
  bun pm version prerelease --preid beta --message "Release beta: %s"
```

To bump the version in `package.json`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun pm version patch
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
v1.0.1
```

Supports `patch`, `minor`, `major`, `premajor`, `preminor`, `prepatch`, `prerelease`, `from-git`, or specific versions like `1.2.3`. By default creates git commit and tag unless `--no-git-tag-version` was used to skip.

## pkg

Manage `package.json` data with get, set, delete, and fix operations.

All commands support dot and bracket notation:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
scripts.build              # dot notation
contributors[0]            # array access
workspaces.0               # dot with numeric index
scripts[test:watch]        # bracket for special chars
```

Examples:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# set
bun pm pkg get name                               # single property
bun pm pkg get name version                       # multiple properties
bun pm pkg get                                    # entire package.json
bun pm pkg get scripts.build                      # nested property

# set
bun pm pkg set name="my-package"                  # simple property
bun pm pkg set scripts.test="jest" version=2.0.0  # multiple properties
bun pm pkg set {"private":"true"} --json          # JSON values with --json flag

# delete
bun pm pkg delete description                     # single property
bun pm pkg delete scripts.test contributors[0]    # multiple/nested

# fix
bun pm pkg fix                                    # auto-fix common issues
```
# bun patch

> Persistently patch node_modules packages in a git-friendly way

`bun patch` lets you persistently patch node\_modules in a maintainable, git-friendly way.

Sometimes, you need to make a small change to a package in `node_modules/` to fix a bug or add a feature. `bun patch` makes it easy to do this without vendoring the entire package and reuse the patch across multiple installs, multiple projects, and multiple machines.

Features:

* Generates `.patch` files applied to dependencies in `node_modules` on install
* `.patch` files can be committed to your repository, reused across multiple installs, projects, and machines
* `"patchedDependencies"` in `package.json` keeps track of patched packages
* `bun patch` lets you patch packages in `node_modules/` while preserving the integrity of Bun's [Global Cache](/pm/global-cache)
* Test your changes locally before committing them with `bun patch --commit <pkg>`
* To preserve disk space and keep `bun install` fast, patched packages are committed to the Global Cache and shared across projects where possible

#### Step 1. Prepare the package for patching

To get started, use `bun patch <pkg>` to prepare the package for patching:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# you can supply the package name
bun patch react

# ...and a precise version in case multiple versions are installed
bun patch react@17.0.2

# or the path to the package
bun patch node_modules/react
```

<Note>
  Don't forget to call `bun patch <pkg>`! This ensures the package folder in `node_modules/` contains a fresh copy of the package with no symlinks/hardlinks to Bun's cache.

  If you forget to do this, you might end up editing the package globally in the cache!
</Note>

#### Step 2. Test your changes locally

`bun patch <pkg>` makes it safe to edit the `<pkg>` in `node_modules/` directly, while preserving the integrity of Bun's [Global Cache](/pm/global-cache). This works by re-creating an unlinked clone of the package in `node_modules/` and diffing it against the original package in the Global Cache.

#### Step 3. Commit your changes

Once you're happy with your changes, run `bun patch --commit <path or pkg>`.

Bun will generate a patch file in `patches/`, update your `package.json` and lockfile, and Bun will start using the patched package:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# you can supply the path to the patched package
bun patch --commit node_modules/react

# ... or the package name and optionally the version
bun patch --commit react@17.0.2

# choose the directory to store the patch files
bun patch --commit react --patches-dir=mypatches

# `patch-commit` is available for compatibility with pnpm
bun patch-commit react
```

***

# CLI Usage

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
bun patch <package>@<version>
```

### Patch Generation

<ParamField path="--commit" type="boolean">
  Install a package containing modifications in <code>dir</code>
</ParamField>

<ParamField path="--patches-dir" type="string">
  The directory to put the patch file in (only if --commit is used)
</ParamField>

### Dependency Management

<ParamField path="--production" type="boolean">
  Don't install devDependencies. Alias: <code>-p</code>
</ParamField>

<ParamField path="--ignore-scripts" type="boolean">
  Skip lifecycle scripts in the project's <code>package.json</code> (dependency scripts are never
  run)
</ParamField>

<ParamField path="--trust" type="boolean">
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the
  package(s)
</ParamField>

<ParamField path="--global" type="boolean">
  Install globally. Alias: <code>-g</code>
</ParamField>

<ParamField path="--omit" type="string">
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install
</ParamField>

### Project Files & Lockfiles

<ParamField path="--yarn" type="boolean">
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>
</ParamField>

<ParamField path="--no-save" type="boolean">
  Don't update <code>package.json</code> or save a lockfile
</ParamField>

<ParamField path="--save" type="boolean" default="true">
  Save to <code>package.json</code> (true by default)
</ParamField>

<ParamField path="--frozen-lockfile" type="boolean">
  Disallow changes to lockfile
</ParamField>

<ParamField path="--save-text-lockfile" type="boolean">
  Save a text-based lockfile
</ParamField>

<ParamField path="--lockfile-only" type="boolean">
  Generate a lockfile without installing dependencies
</ParamField>

### Installation Control

<ParamField path="--backend" type="string" default="clonefile">
  Platform-specific optimizations for installing dependencies. Possible values:{" "}
  <code>clonefile</code> (default), <code>hardlink</code>, <code>symlink</code>,{" "}
  <code>copyfile</code>
</ParamField>

<ParamField path="--linker" type="string">
  Linker strategy (one of <code>isolated</code> or <code>hoisted</code>)
</ParamField>

<ParamField path="--dry-run" type="boolean">
  Don't install anything
</ParamField>

<ParamField path="--force" type="boolean">
  Always request the latest versions from the registry & reinstall all dependencies. Alias:{" "}
  <code>-f</code>
</ParamField>

<ParamField path="--no-verify" type="boolean">
  Skip verifying integrity of newly downloaded packages
</ParamField>

### Network & Registry

<ParamField path="--ca" type="string">
  Provide a Certificate Authority signing certificate
</ParamField>

<ParamField path="--cafile" type="string">
  Same as <code>--ca</code>, but as a file path to the certificate
</ParamField>

<ParamField path="--registry" type="string">
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code>, and
  environment variables
</ParamField>

<ParamField path="--network-concurrency" type="number" default="48">
  Maximum number of concurrent network requests (default 48)
</ParamField>

### Performance & Resource

<ParamField path="--concurrent-scripts" type="number" default="5">
  Maximum number of concurrent jobs for lifecycle scripts (default 5)
</ParamField>

### Caching

<ParamField path="--cache-dir" type="string">
  Store & load cached data from a specific directory path
</ParamField>

<ParamField path="--no-cache" type="boolean">
  Ignore manifest cache entirely
</ParamField>

### Output & Logging

<ParamField path="--silent" type="boolean">
  Don't log anything
</ParamField>

<ParamField path="--quiet" type="boolean">
  Only show tarball name when packing
</ParamField>

<ParamField path="--verbose" type="boolean">
  Excessively verbose logging
</ParamField>

<ParamField path="--no-progress" type="boolean">
  Disable the progress bar
</ParamField>

<ParamField path="--no-summary" type="boolean">
  Don't print a summary
</ParamField>

### Platform Targeting

<ParamField path="--cpu" type="string">
  Override CPU architecture for optional dependencies (e.g., <code>x64</code>, <code>arm64</code>,{" "}
  <code>\*</code> for all)
</ParamField>

<ParamField path="--os" type="string">
  Override operating system for optional dependencies (e.g., <code>linux</code>, <code>darwin</code>
  , <code>\*</code> for all)
</ParamField>

### Global Configuration & Context

<ParamField path="--config" type="string">
  Specify path to config file (<code>bunfig.toml</code>). Alias: <code>-c</code>
</ParamField>

<ParamField path="--cwd" type="string">
  Set a specific current working directory
</ParamField>

### Help

<ParamField path="--help" type="boolean">
  Print this help menu. Alias: <code>-h</code>
</ParamField>

# bun --filter

> Select packages by pattern in a monorepo using the --filter flag

The `--filter` (or `-F`) flag is used for selecting packages by pattern in a monorepo. Patterns can be used to match package names or package paths, with full glob syntax support.

Currently `--filter` is supported by `bun install` and `bun outdated`, and can also be used to run scripts for multiple packages at once.

***

## Matching

### Package Name `--filter <pattern>`

Name patterns select packages based on the package name, as specified in `package.json`. For example, if you have packages `pkg-a`, `pkg-b` and `other`, you can match all packages with `*`, only `pkg-a` and `pkg-b` with `pkg*`, and a specific package by providing the full name of the package.

### Package Path `--filter ./<glob>`

Path patterns are specified by starting the pattern with `./`, and will select all packages in directories that match the pattern. For example, to match all packages in subdirectories of `packages`, you can use `--filter './packages/**'`. To match a package located in `packages/foo`, use `--filter ./packages/foo`.

***

## `bun install` and `bun outdated`

Both `bun install` and `bun outdated` support the `--filter` flag.

`bun install` by default will install dependencies for all packages in the monorepo. To install dependencies for specific packages, use `--filter`.

Given a monorepo with workspaces `pkg-a`, `pkg-b`, and `pkg-c` under `./packages`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Install dependencies for all workspaces except `pkg-c`
bun install --filter '!pkg-c'

# Install dependencies for packages in `./packages` (`pkg-a`, `pkg-b`, `pkg-c`)
bun install --filter './packages/*'

# Save as above, but exclude the root package.json
bun install --filter '!./' --filter './packages/*'
```

Similarly, `bun outdated` will display outdated dependencies for all packages in the monorepo, and `--filter` can be used to restrict the command to a subset of the packages:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Display outdated dependencies for workspaces starting with `pkg-`
bun outdated --filter 'pkg-*'

# Display outdated dependencies for only the root package.json
bun outdated --filter './'
```

For more information on both these commands, see [`bun install`](/pm/cli/install) and [`bun outdated`](/pm/cli/outdated).

***

## Running scripts with `--filter`

Use the `--filter` flag to execute scripts in multiple packages at once:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --filter <pattern> <script>
```

Say you have a monorepo with two packages: `packages/api` and `packages/frontend`, both with a `dev` script that will start a local development server. Normally, you would have to open two separate terminal tabs, cd into each package directory, and run `bun dev`:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
cd packages/api
bun dev

# in another terminal
cd packages/frontend
bun dev
```

Using `--filter`, you can run the `dev` script in both packages at once:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --filter '*' dev
```

Both commands will be run in parallel, and you will see a nice terminal UI showing their respective outputs:

<Frame>
  ![Terminal
  Output](https://github.com/oven-sh/bun/assets/48869301/2a103e42-9921-4c33-948f-a1ad6e6bac71)
</Frame>

### Running scripts in workspaces

Filters respect your [workspace configuration](/pm/workspaces): If you have a `package.json` file that specifies which packages are part of the workspace,
`--filter` will be restricted to only these packages. Also, in a workspace you can use `--filter` to run scripts in packages that are located anywhere in the workspace:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Packages
# src/foo
# src/bar

# in src/bar: runs myscript in src/foo, no need to cd!
bun run --filter foo myscript
```

### Dependency Order

Bun will respect package dependency order when running scripts. Say you have a package `foo` that depends on another package `bar` in your workspace, and both packages have a `build` script. When you run `bun --filter '*' build`, you will notice that `foo` will only start running once `bar` is done.

# Global cache

> How Bun stores and manages packages in its global cache

All packages downloaded from the registry are stored in a global cache at `~/.bun/install/cache`, or the path defined by the environment variable `BUN_INSTALL_CACHE_DIR`. They are stored in subdirectories named like `${name}@${version}`, so multiple versions of a package can be cached.

<Accordion title="Configuring cache behavior">
  ```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
  [install.cache]
  # the directory to use for the cache
  dir = "~/.bun/install/cache"

  # when true, don't load from the global cache.
  # Bun may still write to node_modules/.cache
  disable = false

  # when true, always resolve the latest versions from the registry
  disableManifest = false
  ```
</Accordion>

***

## Minimizing re-downloads

Bun strives to avoid re-downloading packages multiple times. When installing a package, if the cache already contains a version in the range specified by `package.json`, Bun will use the cached package instead of downloading it again.

<Accordion title="Installation details">
  If the semver version has pre-release suffix (`1.0.0-beta.0`) or a build suffix (`1.0.0+20220101`), it is replaced with a hash of that value instead, to reduce the chances of errors associated with long file paths.

  When the `node_modules` folder exists, before installing, Bun checks that `node_modules` contains all expected packages with appropriate versions. If so `bun install` completes. Bun uses a custom JSON parser which stops parsing as soon as it finds `"name"` and `"version"`.

  If a package is missing or has a version incompatible with the `package.json`, Bun checks for a compatible module in the cache. If found, it is installed into `node_modules`. Otherwise, the package will be downloaded from the registry then installed.
</Accordion>

***

## Fast copying

Once a package is downloaded into the cache, Bun still needs to copy those files into `node_modules`. Bun uses the fastest syscalls available to perform this task. On Linux, it uses hardlinks; on macOS, it uses `clonefile`.

***

## Saving disk space

Since Bun uses hardlinks to "copy" a module into a project's `node_modules` directory on Linux and Windows, the contents of the package only exist in a single location on disk, greatly reducing the amount of disk space dedicated to `node_modules`.

This benefit also applies to macOS, but there are exceptions. It uses `clonefile` which is copy-on-write, meaning it will not occupy disk space, but it will count towards drive's limit. This behavior is useful if something attempts to patch `node_modules/*`, so it's impossible to affect other installations.

<Accordion title="Installation strategies">
  This behavior is configurable with the `--backend` flag, which is respected by all of Bun's package management commands.

  * **`hardlink`**: Default on Linux and Windows.
  * **`clonefile`** Default on macOS.
  * **`clonefile_each_dir`**: Similar to `clonefile`, except it clones each file individually per directory. It is only available on macOS and tends to perform slower than `clonefile`.
  * **`copyfile`**: The fallback used when any of the above fail. It is the slowest option. On macOS, it uses `fcopyfile()`; on Linux it uses `copy_file_range()`.
  * **`symlink`**: Currently used only `file:` (and eventually `link:`) dependencies. To prevent infinite loops, it skips symlinking the `node_modules` folder.

  If you install with `--backend=symlink`, Node.js won't resolve node\_modules of dependencies unless each dependency has its own `node_modules` folder or you pass `--preserve-symlinks` to `node`. See [Node.js documentation on `--preserve-symlinks`](https://nodejs.org/api/cli.html#--preserve-symlinks).

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun install --backend symlink
  node --preserve-symlinks ./foo.js
  ```

  Bun's runtime does not currently expose an equivalent of `--preserve-symlinks`.
</Accordion>

# Isolated installs

> Strict dependency isolation similar to pnpm's approach

Bun provides an alternative package installation strategy called **isolated installs** that creates strict dependency isolation similar to pnpm's approach. This mode prevents phantom dependencies and ensures reproducible, deterministic builds.

This is the default installation strategy for monorepo projects.

## What are isolated installs?

Isolated installs create a non-hoisted dependency structure where packages can only access their explicitly declared dependencies. This differs from the traditional "hoisted" installation strategy used by npm and Yarn, where dependencies are flattened into a shared `node_modules` directory.

### Key benefits

* **Prevents phantom dependencies** — Packages cannot accidentally import dependencies they haven't declared
* **Deterministic resolution** — Same dependency tree regardless of what else is installed
* **Better for monorepos** — Workspace isolation prevents cross-contamination between packages
* **Reproducible builds** — More predictable resolution behavior across environments

## Using isolated installs

### Command line

Use the `--linker` flag to specify the installation strategy:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Use isolated installs
bun install --linker isolated

# Use traditional hoisted installs
bun install --linker hoisted
```

### Configuration file

Set the default linker strategy in your `bunfig.toml` or globally in `$HOME/.bunfig.toml`:

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
linker = "isolated"
```

### Default behavior

* For monorepo projects, Bun uses the **isolated** installation strategy by default.
* For single-project projects, Bun uses the **hoisted** installation strategy by default.

You can override the default behavior by explicitly specifying the `--linker` flag or setting it in your configuration file.

## How isolated installs work

### Directory structure

Instead of hoisting dependencies, isolated installs create a two-tier structure:

```bash tree layout of node_modules icon="list-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
node_modules/
├── .bun/                          # Central package store
│   ├── package@1.0.0/             # Versioned package installations
│   │   └── node_modules/
│   │       └── package/           # Actual package files
│   ├── @scope+package@2.1.0/      # Scoped packages (+ replaces /)
│   │   └── node_modules/
│   │       └── @scope/
│   │           └── package/
│   └── ...
└── package-name -> .bun/package@1.0.0/node_modules/package  # Symlinks
```

### Resolution algorithm

1. **Central store** — All packages are installed in `node_modules/.bun/package@version/` directories
2. **Symlinks** — Top-level `node_modules` contains symlinks pointing to the central store
3. **Peer resolution** — Complex peer dependencies create specialized directory names
4. **Deduplication** — Packages with identical package IDs and peer dependency sets are shared

### Workspace handling

In monorepos, workspace dependencies are handled specially:

* **Workspace packages** — Symlinked directly to their source directories, not the store
* **Workspace dependencies** — Can access other workspace packages in the monorepo
* **External dependencies** — Installed in the isolated store with proper isolation

## Comparison with hoisted installs

| Aspect                    | Hoisted (npm/Yarn)                         | Isolated (pnpm-like)                    |
| ------------------------- | ------------------------------------------ | --------------------------------------- |
| **Dependency access**     | Packages can access any hoisted dependency | Packages only see declared dependencies |
| **Phantom dependencies**  | ❌ Possible                                 | ✅ Prevented                             |
| **Disk usage**            | ✅ Lower (shared installs)                  | ✅ Similar (uses symlinks)               |
| **Determinism**           | ❌ Less deterministic                       | ✅ More deterministic                    |
| **Node.js compatibility** | ✅ Standard behavior                        | ✅ Compatible via symlinks               |
| **Best for**              | Single projects, legacy code               | Monorepos, strict dependency management |

## Advanced features

### Peer dependency handling

Isolated installs handle peer dependencies through sophisticated resolution:

```bash tree layout of node_modules icon="list-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Package with peer dependencies creates specialized paths
node_modules/.bun/package@1.0.0_react@18.2.0/
```

The directory name encodes both the package version and its peer dependency versions, ensuring each unique combination gets its own installation.

### Backend strategies

Bun uses different file operation strategies for performance:

* **Clonefile** (macOS) — Copy-on-write filesystem clones for maximum efficiency
* **Hardlink** (Linux/Windows) — Hardlinks to save disk space
* **Copyfile** (fallback) — Full file copies when other methods aren't available

### Debugging isolated installs

Enable verbose logging to understand the installation process:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --linker isolated --verbose
```

This shows:

* Store entry creation
* Symlink operations
* Peer dependency resolution
* Deduplication decisions

## Troubleshooting

### Compatibility issues

Some packages may not work correctly with isolated installs due to:

* **Hardcoded paths** — Packages that assume a flat `node_modules` structure
* **Dynamic imports** — Runtime imports that don't follow Node.js resolution
* **Build tools** — Tools that scan `node_modules` directly

If you encounter issues, you can:

1. **Switch to hoisted mode** for specific projects:

   ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
   bun install --linker hoisted
   ```

2. **Report compatibility issues** to help improve isolated install support

### Performance considerations

* **Install time** — May be slightly slower due to symlink operations
* **Disk usage** — Similar to hoisted (uses symlinks, not file copies)
* **Memory usage** — Higher during install due to complex peer resolution

## Migration guide

### From npm/Yarn

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Remove existing node_modules and lockfiles
rm -rf node_modules package-lock.json yarn.lock

# Install with isolated linker
bun install --linker isolated
```

### From pnpm

Isolated installs are conceptually similar to pnpm, so migration should be straightforward:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Remove pnpm files
$ rm -rf node_modules pnpm-lock.yaml

# Install with Bun's isolated linker
bun install --linker isolated
```

The main difference is that Bun uses symlinks in `node_modules` while pnpm uses a global store with symlinks.

## When to use isolated installs

**Use isolated installs when:**

* Working in monorepos with multiple packages
* Strict dependency management is required
* Preventing phantom dependencies is important
* Building libraries that need deterministic dependencies

**Use hoisted installs when:**

* Working with legacy code that assumes flat `node_modules`
* Compatibility with existing build tools is required
* Working in environments where symlinks aren't well supported
* You prefer the simpler traditional npm behavior

## Related documentation

* [Package manager > Workspaces](/pm/workspaces) — Monorepo workspace management
* [Package manager > Lockfile](/pm/lockfile) — Understanding Bun's lockfile format
* [CLI > install](/pm/cli/install) — Complete `bun install` command reference

# Lockfile

> Bun's lockfile format and configuration

Running `bun install` will create a lockfile called `bun.lock`.

#### Should it be committed to git?

Yes

#### Generate a lockfile without installing?

To generate a lockfile without installing to `node_modules` you can use the `--lockfile-only` flag. The lockfile will always be saved to disk, even if it is up-to-date with the `package.json`(s) for your project.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --lockfile-only
```

<Note>
  Using `--lockfile-only` will still populate the global install cache with registry metadata and
  git/tarball dependencies.
</Note>

#### Can I opt out?

To install without creating a lockfile:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --no-save
```

To install a Yarn lockfile *in addition* to `bun.lock`.

<CodeGroup>
  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun install --yarn
  ```

  ```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
  [install.lockfile]
  # whether to save a non-Bun lockfile alongside bun.lock
  # only "yarn" is supported
  print = "yarn"
  ```
</CodeGroup>

#### Text-based lockfile

Bun v1.2 changed the default lockfile format to the text-based `bun.lock`. Existing binary `bun.lockb` lockfiles can be migrated to the new format by running `bun install --save-text-lockfile --frozen-lockfile --lockfile-only` and deleting `bun.lockb`.

More information about the new lockfile format can be found on [our blogpost](https://bun.com/blog/bun-lock-text-lockfile).

#### Automatic lockfile migration

When running `bun install` in a project without a `bun.lock`, Bun automatically migrates existing lockfiles:

* `yarn.lock` (v1)
* `package-lock.json` (npm)
* `pnpm-lock.yaml` (pnpm)

The original lockfile is preserved and can be removed manually after verification.

# Lifecycle scripts

> How Bun handles package lifecycle scripts securely

Packages on `npm` can define *lifecycle scripts* in their `package.json`. Some of the most common are below, but there are [many others](https://docs.npmjs.com/cli/v10/using-npm/scripts).

* `preinstall`: Runs before the package is installed
* `postinstall`: Runs after the package is installed
* `preuninstall`: Runs before the package is uninstalled
* `prepublishOnly`: Runs before the package is published

These scripts are arbitrary shell commands that the package manager is expected to read and execute at the appropriate time. But executing arbitrary scripts represents a potential security risk, so—unlike other `npm` clients—Bun does not execute arbitrary lifecycle scripts by default.

***

## `postinstall`

The `postinstall` script is particularly important. It's widely used to build or install platform-specific binaries for packages that are implemented as [native Node.js add-ons](https://nodejs.org/api/addons.html). For example, `node-sass` is a popular package that uses `postinstall` to build a native binary for Sass.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"version": "1.0.0",
	"dependencies": {
		"node-sass": "^6.0.1"
	}
}
```

***

## `trustedDependencies`

Instead of executing arbitrary scripts, Bun uses a "default-secure" approach. You can add certain packages to an allow list, and Bun will execute lifecycle scripts for those packages. To tell Bun to allow lifecycle scripts for a particular package, add the package name to `trustedDependencies` array in your `package.json`.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"version": "1.0.0",
	"trustedDependencies": ["node-sass"] // [!code ++]
}
```

Once added to `trustedDependencies`, install/re-install the package. Bun will read this field and run lifecycle scripts for `my-trusted-package`.

As of Bun v1.0.16, the top 500 npm packages with lifecycle scripts are allowed by default. You can see the full list [here](https://github.com/oven-sh/bun/blob/main/src/install/default-trusted-dependencies.txt).

***

## `--ignore-scripts`

To disable lifecycle scripts for all packages, use the `--ignore-scripts` flag.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun install --ignore-scripts
```

# Scopes and registries

> Configure private registries and scoped packages

The default registry is `registry.npmjs.org`. This can be globally configured in `bunfig.toml`:

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
# set default registry as a string
registry = "https://registry.npmjs.org"
# set a token
registry = { url = "https://registry.npmjs.org", token = "123456" }
# set a username/password
registry = "https://username:password@registry.npmjs.org"
```

To configure a private registry scoped to a particular organization:

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install.scopes]
# registry as string
"@myorg1" = "https://username:password@registry.myorg.com/"

# registry with username/password
# you can reference environment variables
"@myorg2" = { username = "myusername", password = "$NPM_PASS", url = "https://registry.myorg.com/" }

# registry with token
"@myorg3" = { token = "$npm_token", url = "https://registry.myorg.com/" }
```

### `.npmrc`

Bun also reads `.npmrc` files, [learn more](/pm/npmrc).

# Overrides and resolutions

> Control metadependency versions with npm overrides and Yarn resolutions

Bun supports npm's `"overrides"` and Yarn's `"resolutions"` in `package.json`. These are mechanisms for specifying a version range for *metadependencies*—the dependencies of your dependencies.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	},
	"overrides": {
		// [!code ++]
		"bar": "~4.4.0" // [!code ++]
	} // [!code ++]
}
```

By default, Bun will install the latest version of all dependencies and metadependencies, according to the ranges specified in each package's `package.json`. Let's say you have a project with one dependency, `foo`, which in turn has a dependency on `bar`. This means `bar` is a *metadependency* of our project.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	}
}
```

When you run `bun install`, Bun will install the latest versions of each package.

```txt tree layout of node_modules icon="list-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
node_modules
├── foo@1.2.3
└── bar@4.5.6
```

But what if a security vulnerability was introduced in `bar@4.5.6`? We may want a way to pin `bar` to an older version that doesn't have the vulnerability. This is where `"overrides"`/`"resolutions"` come in.

***

## `"overrides"`

Add `bar` to the `"overrides"` field in `package.json`. Bun will defer to the specified version range when determining which version of `bar` to install, whether it's a dependency or a metadependency.

<Note>
  Bun currently only supports top-level `"overrides"`. [Nested
  overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) are not
  supported.
</Note>

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	},
	"overrides": {
		// [!code ++]
		"bar": "~4.4.0" // [!code ++]
	} // [!code ++]
}
```

## `"resolutions"`

The syntax is similar for `"resolutions"`, which is Yarn's alternative to `"overrides"`. Bun supports this feature to make migration from Yarn easier.

As with `"overrides"`, *nested resolutions* are not currently supported.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	},
	"resolutions": {
		// [!code ++]
		"bar": "~4.4.0" // [!code ++]
	} // [!code ++]
}
```

# Overrides and resolutions

> Control metadependency versions with npm overrides and Yarn resolutions

Bun supports npm's `"overrides"` and Yarn's `"resolutions"` in `package.json`. These are mechanisms for specifying a version range for *metadependencies*—the dependencies of your dependencies.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	},
	"overrides": {
		// [!code ++]
		"bar": "~4.4.0" // [!code ++]
	} // [!code ++]
}
```

By default, Bun will install the latest version of all dependencies and metadependencies, according to the ranges specified in each package's `package.json`. Let's say you have a project with one dependency, `foo`, which in turn has a dependency on `bar`. This means `bar` is a *metadependency* of our project.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	}
}
```

When you run `bun install`, Bun will install the latest versions of each package.

```txt tree layout of node_modules icon="list-tree" theme={"theme":{"light":"github-light","dark":"dracula"}}
node_modules
├── foo@1.2.3
└── bar@4.5.6
```

But what if a security vulnerability was introduced in `bar@4.5.6`? We may want a way to pin `bar` to an older version that doesn't have the vulnerability. This is where `"overrides"`/`"resolutions"` come in.

***

## `"overrides"`

Add `bar` to the `"overrides"` field in `package.json`. Bun will defer to the specified version range when determining which version of `bar` to install, whether it's a dependency or a metadependency.

<Note>
  Bun currently only supports top-level `"overrides"`. [Nested
  overrides](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) are not
  supported.
</Note>

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	},
	"overrides": {
		// [!code ++]
		"bar": "~4.4.0" // [!code ++]
	} // [!code ++]
}
```

## `"resolutions"`

The syntax is similar for `"resolutions"`, which is Yarn's alternative to `"overrides"`. Bun supports this feature to make migration from Yarn easier.

As with `"overrides"`, *nested resolutions* are not currently supported.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "my-app",
	"dependencies": {
		"foo": "^2.0.0"
	},
	"resolutions": {
		// [!code ++]
		"bar": "~4.4.0" // [!code ++]
	} // [!code ++]
}
```

# .npmrc support

Bun supports loading configuration options from [`.npmrc`](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc) files, allowing you to reuse existing registry/scope configurations.

<Note>
  We recommend migrating your `.npmrc` file to Bun's [`bunfig.toml`](/runtime/bunfig) format, as it
  provides more flexible options and can let you configure Bun-specific options.
</Note>

***

## Supported options

### Set the default registry

The default registry is used to resolve packages, its default value is `npm`'s official registry (`https://registry.npmjs.org/`).

To change it, you can set the `registry` option in `.npmrc`:

```ini .npmrc icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
registry=http://localhost:4873/
```

The equivalent `bunfig.toml` option is [`install.registry`](/runtime/bunfig#install-registry):

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
install.registry = "http://localhost:4873/"
```

### Set the registry for a specific scope

`@<scope>:registry` allows you to set the registry for a specific scope:

```ini .npmrc icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
@myorg:registry=http://localhost:4873/
```

The equivalent `bunfig.toml` option is to add a key in [`install.scopes`](/runtime/bunfig#install-registry):

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install.scopes]
myorg = "http://localhost:4873/"
```

### Configure options for a specific registry

`//<registry_url>/:<key>=<value>` allows you to set options for a specific registry:

```ini .npmrc icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
# set an auth token for the registry
# ${...} is a placeholder for environment variables
//http://localhost:4873/:_authToken=${NPM_TOKEN}


# or you could set a username and password
# note that the password is base64 encoded
//http://localhost:4873/:username=myusername

//http://localhost:4873/:_password=${NPM_PASSWORD}

# or use _auth, which is your username and password
# combined into a single string, which is then base 64 encoded
//http://localhost:4873/:_auth=${NPM_AUTH}
```

The following options are supported:

* `_authToken`
* `username`
* `_password` (base64 encoded password)
* `_auth` (base64 encoded username:password, e.g. `btoa(username + ":" + password)`)

The equivalent `bunfig.toml` option is to add a key in [`install.scopes`](/runtime/bunfig#install-registry):

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install.scopes]
myorg = { url = "http://localhost:4873/", username = "myusername", password = "$NPM_PASSWORD" }
```

### `link-workspace-packages`: Control workspace package installation

Controls how workspace packages are installed when available locally:

```ini .npmrc icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
link-workspace-packages=true
```

The equivalent `bunfig.toml` option is [`install.linkWorkspacePackages`](/runtime/bunfig#install-linkworkspacepackages):

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
linkWorkspacePackages = true
```

### `save-exact`: Save exact versions

Always saves exact versions without the `^` prefix:

```ini .npmrc icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
save-exact=true
```

The equivalent `bunfig.toml` option is [`install.exact`](/runtime/bunfig#install-exact):

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[install]
exact = true
```
