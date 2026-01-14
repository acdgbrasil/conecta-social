# Welcome to Bun

> Bun is an all-in-one toolkit for developing modern JavaScript/TypeScript applications.

<CardGroup>
  <Card
    icon="cog"
    title="Bun Runtime"
    href="/runtime"
    cta={
  		<span>
  			Get started with <code>bun run</code>
  		</span>
  	}
  >
    A fast JavaScript runtime designed as a drop-in replacement for Node.js
  </Card>

  <Card
    icon="box"
    title="Bun Package Manager"
    href="/pm/cli/install"
    cta={
  		<span>
  			Get started with <code>bun install</code>
  		</span>
  	}
  >
    Install packages up to 30x faster than npm with a global cache and workspaces
  </Card>

  <Card
    icon="flask-conical"
    title="Bun Test Runner"
    href="/test"
    cta={
  		<span>
  			Get started with <code>bun test</code>
  		</span>
  	}
  >
    Jest-compatible, TypeScript-first tests with snapshots, DOM, and watch mode
  </Card>

  <Card
    icon="combine"
    title="Bun Bundler"
    href="/bundler"
    cta={
  		<span>
  			Get started with <code>bun build</code>
  		</span>
  	}
  >
    Bundle TypeScript, JSX, React & CSS for both browsers and servers
  </Card>
</CardGroup>

***

## Get Started

Bun ships as a single, dependency-free binary and includes a runtime, package manager, test runner, and bundler. New to Bun?

<CardGroup>
  <Card icon="download" title="Install Bun" href="/installation">
    Supported platforms and all install methods.
  </Card>

  <Card icon="zap" title="Quickstart" href="/quickstart">
    Hello world in minutes with Bun.serve.
  </Card>
</CardGroup>

***

## What's Inside

* Runtime: Execute JavaScript/TypeScript files and package scripts with near-zero overhead.
* Package Manager: Fast installs, workspaces, overrides, and audits with `bun install`.
* Test Runner: Jest-compatible, TypeScript-first tests with snapshots, DOM, and watch mode.
* Bundler: Native bundling for JS/TS/JSX with splitting, plugins, and HTML imports.

Explore each area using the cards above. Each section is structured with an overview, quick examples, reference, and best practices for fast scanning and deep dives.

***

## What is Bun?

Bun is an all-in-one toolkit for JavaScript and TypeScript apps. It ships as a single executable called `bun`.

At its core is the *Bun runtime*, a fast JavaScript runtime designed as **a drop-in replacement for Node.js**. It's written in Zig and powered by JavaScriptCore under the hood, dramatically reducing startup times and memory usage.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run index.tsx  # TS and JSX supported out of the box
```

The `bun` command-line tool also implements a test runner, script runner, and Node.js-compatible package manager, all significantly faster than existing tools and usable in existing Node.js projects with little to no changes necessary.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run start                 # run the `start` script
bun install <pkg>             # install a package
bun build ./index.tsx         # bundle a project for browsers
bun test                      # run tests
bunx cowsay 'Hello, world!'   # execute a package
```

## What is a runtime?

JavaScript (or, more formally, ECMAScript) is just a *specification* for a programming language. Anyone can write a JavaScript *engine* that ingests a valid JavaScript program and executes it. The two most popular engines in use today are V8 (developed by Google)
and JavaScriptCore (developed by Apple). Both are open source.

But most JavaScript programs don't run in a vacuum. They need a way to access the outside world to perform useful tasks. This is where *runtimes* come in. They implement additional APIs that are then made available to the JavaScript programs they execute.

### Browsers

Notably, browsers ship with JavaScript runtimes that implement a set of Web-specific APIs that are exposed via the global `window` object. Any JavaScript code executed by the browser can use these APIs to implement interactive or dynamic behavior in the context of the current webpage.

### Node.js

Similarly, Node.js is a JavaScript runtime that can be used in non-browser environments, like servers. JavaScript programs executed by Node.js have access to a set of Node.js-specific [globals](https://nodejs.org/api/globals.html) like `Buffer`, `process`, and `__dirname` in addition to built-in modules for performing OS-level tasks like reading/writing files (`node:fs`) and networking (`node:net`, `node:http`). Node.js also implements a CommonJS-based module system and resolution algorithm that pre-dates JavaScript's native module system.

Bun is designed as a faster, leaner, more modern replacement for Node.js.

## Design goals

Bun is designed from the ground-up with today's JavaScript ecosystem in mind.

* **Speed**. Bun processes start [4x faster than Node.js](https://twitter.com/jarredsumner/status/1499225725492076544) currently (try it yourself!)
* **TypeScript & JSX support**. You can directly execute `.jsx`, `.ts`, and `.tsx` files; Bun's transpiler converts these to vanilla JavaScript before execution.
* **ESM & CommonJS compatibility**. The world is moving towards ES modules (ESM), but millions of packages on npm still require CommonJS. Bun recommends ES modules, but supports CommonJS.
* **Web-standard APIs**. Bun implements standard Web APIs like `fetch`, `WebSocket`, and `ReadableStream`. Bun is powered by the JavaScriptCore engine, which is developed by Apple for Safari, so some APIs like [`Headers`](https://developer.mozilla.org/en-US/Web/API/Headers) and [`URL`](https://developer.mozilla.org/en-US/Web/API/URL) directly use [Safari's implementation](https://github.com/oven-sh/bun/blob/HEAD/src/bun.js/bindings/webcore/JSFetchHeaders.cpp).
* **Node.js compatibility**. In addition to supporting Node-style module resolution, Bun aims for full compatibility with built-in Node.js globals (`process`, `Buffer`) and modules (`path`, `fs`, `http`, etc.) *This is an ongoing effort that is not complete.* Refer to the [compatibility page](/runtime/nodejs-compat) for the current status.

Bun is more than a runtime. The long-term goal is to be a cohesive, infrastructural toolkit for building apps with JavaScript/TypeScript, including a package manager, transpiler, bundler, script runner, test runner, and more.

# Installation

> Install Bun

## Overview

Bun ships as a single, dependency-free executable. You can install it via script, package manager, or Docker across macOS, Linux, and Windows.

<Tip>After installation, verify with `bun --version` and `bun --revision`.</Tip>

## Installation

<Tabs>
  <Tab title="macOS & Linux">
    <CodeGroup>
      ```bash curl icon="globe" theme={"theme":{"light":"github-light","dark":"dracula"}}
      curl -fsSL https://bun.com/install | bash
      ```
    </CodeGroup>

    <Note>
      **Linux users**  The `unzip` package is required to install Bun. Use `sudo apt install unzip` to install the unzip package. Kernel version 5.6 or higher is strongly recommended, but the minimum is 5.1. Use `uname -r` to check Kernel version.
    </Note>
  </Tab>

  <Tab title="Windows">
    <CodeGroup>
      ```powershell PowerShell icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
      powershell -c "irm bun.sh/install.ps1|iex"
      ```
    </CodeGroup>

    <Warning>
      Bun requires Windows 10 version 1809 or later.
    </Warning>

    For support and discussion, please join the **#windows** channel on our [Discord](https://discord.gg/bun).
  </Tab>

  <Tab title="Package Managers">
    <CodeGroup>
      ```bash npm icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
      npm install -g bun # the last `npm` command you'll ever need
      ```

      ```bash Homebrew icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/homebrew.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=614be850c39990ccb245ec8f1fe1b1a1" theme={"theme":{"light":"github-light","dark":"dracula"}}
      brew install oven-sh/bun/bun
      ```

      ```bash Scoop icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
      scoop install bun
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Docker">
    Bun provides a Docker image that supports both Linux x64 and arm64.

    ```bash Docker icon="docker" theme={"theme":{"light":"github-light","dark":"dracula"}}
    docker pull oven/bun
    docker run --rm --init --ulimit memlock=-1:-1 oven/bun
    ```

    ### Image Variants

    There are also image variants for different operating systems:

    ```bash Docker icon="docker" theme={"theme":{"light":"github-light","dark":"dracula"}}
    docker pull oven/bun:debian
    docker pull oven/bun:slim
    docker pull oven/bun:distroless
    docker pull oven/bun:alpine
    ```
  </Tab>
</Tabs>

To check that Bun was installed successfully, open a new terminal window and run:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --version
# Output: 1.x.y

# See the precise commit of `oven-sh/bun` that you're using
bun --revision
# Output: 1.x.y+b7982ac13189
```

<Warning>
  If you've installed Bun but are seeing a `command not found` error, you may have to manually add
  the installation directory (`~/.bun/bin`) to your `PATH`.
</Warning>

<Accordion title="Add Bun to your PATH">
  <Tabs>
    <Tab title="macOS & Linux">
      <Steps>
        <Step title="Determine which shell you're using">
          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          echo $SHELL
          # /bin/zsh  or /bin/bash or /bin/fish
          ```
        </Step>

        <Step title="Open your shell configuration file">
          * For bash: `~/.bashrc`
          * For zsh: `~/.zshrc`
          * For fish: `~/.config/fish/config.fish`
        </Step>

        <Step title="Add the Bun directory to PATH">
          Add this line to your configuration file:

          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          export BUN_INSTALL="$HOME/.bun"
          export PATH="$BUN_INSTALL/bin:$PATH"
          ```
        </Step>

        <Step title="Reload your shell configuration">
          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          source ~/.bashrc  # or ~/.zshrc
          ```
        </Step>
      </Steps>
    </Tab>

    <Tab title="Windows">
      <Steps>
        <Step title="Determine if the bun binary is properly installed">
          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          & "$env:USERPROFILE\.bun\bin\bun" --version
          ```

          If the command runs successfully but `bun --version` is not recognized, it means that bun is not in your system's PATH. To fix this, open a Powershell terminal and run the following command:

          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          [System.Environment]::SetEnvironmentVariable(
            "Path",
            [System.Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\.bun\bin",
            [System.EnvironmentVariableTarget]::User
          )
          ```
        </Step>

        <Step title="Restart your terminal">
          After running the command, restart your terminal and test with `bun --version`

          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          bun --version
          ```
        </Step>
      </Steps>
    </Tab>
  </Tabs>
</Accordion>

***

## Upgrading

Once installed, the binary can upgrade itself:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun upgrade
```

<Tip>
  **Homebrew users** <br />
  To avoid conflicts with Homebrew, use `brew upgrade bun` instead.

  **Scoop users** <br />
  To avoid conflicts with Scoop, use `scoop update bun` instead.
</Tip>

***

## Canary Builds

[-> View canary build](https://github.com/oven-sh/bun/releases/tag/canary)

Bun automatically releases an (untested) canary build on every commit to main. To upgrade to the latest canary build:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Upgrade to latest canary
bun upgrade --canary

# Switch back to stable
bun upgrade --stable
```

The canary build is useful for testing new features and bug fixes before they're released in a stable build. To help the Bun team fix bugs faster, canary builds automatically upload crash reports to Bun's team.

***

## Installing Older Versions

Since Bun is a single binary, you can install older versions by re-running the installer script with a specific version.

<Tabs>
  <Tab title="Linux & macOS">
    To install a specific version, pass the git tag to the install script:

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    curl -fsSL https://bun.com/install | bash -s "bun-v1.3.1"
    ```
  </Tab>

  <Tab title="Windows">
    On Windows, pass the version number to the PowerShell install script:

    ```powershell PowerShell icon="windows" theme={"theme":{"light":"github-light","dark":"dracula"}}
    iex "& {$(irm https://bun.com/install.ps1)} -Version 1.3.1"
    ```
  </Tab>
</Tabs>

***

## Direct Downloads

To download Bun binaries directly, visit the [releases page on GitHub](https://github.com/oven-sh/bun/releases).

### Latest Version Downloads

<CardGroup cols={2}>
  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=300e7a130d2220736a473333f9679855" title="Linux x64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip" data-og-width="216" width="216" data-og-height="256" height="256" data-path="icons/linux.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a1021a1beb4958e46480099f004d26fe 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=69ac5104fde576781616421ac7b3612f 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=28ed8a8da79749aa69ffe58603a9b3fb 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=edb9183e067c05653f419e105eead50e 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e335840244e027300b2607eeec7a665a 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=35ebcef0ab95791178aa983028bd6622 2500w">
    Standard Linux x64 binary
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=300e7a130d2220736a473333f9679855" title="Linux x64 Baseline" href="https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-baseline.zip" data-og-width="216" width="216" data-og-height="256" height="256" data-path="icons/linux.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a1021a1beb4958e46480099f004d26fe 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=69ac5104fde576781616421ac7b3612f 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=28ed8a8da79749aa69ffe58603a9b3fb 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=edb9183e067c05653f419e105eead50e 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e335840244e027300b2607eeec7a665a 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=35ebcef0ab95791178aa983028bd6622 2500w">
    For older CPUs without AVX2
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=4588088d53614404d5bbf7ff09e683ed" title="Windows x64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64.zip" data-og-width="88" width="88" data-og-height="88" height="88" data-path="icons/windows.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=5d97f6a67886cf0b717207ba92259a46 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=ff8a13db3c0667f8029b30933dad367c 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=25b6bc6bef5ed05b83abaa79122d0af8 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=bb8cdeb3ea1e93c9d16de8027c39704c 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=d06733f6f1ca3f67d30d0f84bfafc13b 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=261ee703aada9c4b60d6525e54193664 2500w">
    Standard Windows binary
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=4588088d53614404d5bbf7ff09e683ed" title="Windows x64 Baseline" href="https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64-baseline.zip" data-og-width="88" width="88" data-og-height="88" height="88" data-path="icons/windows.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=5d97f6a67886cf0b717207ba92259a46 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=ff8a13db3c0667f8029b30933dad367c 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=25b6bc6bef5ed05b83abaa79122d0af8 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=bb8cdeb3ea1e93c9d16de8027c39704c 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=d06733f6f1ca3f67d30d0f84bfafc13b 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=261ee703aada9c4b60d6525e54193664 2500w">
    For older CPUs without AVX2
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=0ac996da7680574a1630b68716af5714" title="macOS ARM64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-aarch64.zip" data-og-width="842" width="842" data-og-height="1000" height="1000" data-path="icons/apple.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=55e8d5c21de2f491eaf39ab693083006 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c5a544fe09d36db1f9d9919e9a825fa6 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e10081f77d9ede8d29b78e13e5b502dc 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=b5f25aa4033416aadc22b0b6f0921027 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=eff94566f2f1854abffe67d4aaac270e 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a6f601367f7ea4198eafcc7f598b00ac 2500w">
    Apple Silicon (M1/M2/M3)
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=0ac996da7680574a1630b68716af5714" title="macOS x64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-x64.zip" data-og-width="842" width="842" data-og-height="1000" height="1000" data-path="icons/apple.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=55e8d5c21de2f491eaf39ab693083006 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c5a544fe09d36db1f9d9919e9a825fa6 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e10081f77d9ede8d29b78e13e5b502dc 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=b5f25aa4033416aadc22b0b6f0921027 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=eff94566f2f1854abffe67d4aaac270e 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a6f601367f7ea4198eafcc7f598b00ac 2500w">
    Intel Macs
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=300e7a130d2220736a473333f9679855" title="Linux ARM64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-linux-aarch64.zip" data-og-width="216" width="216" data-og-height="256" height="256" data-path="icons/linux.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a1021a1beb4958e46480099f004d26fe 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=69ac5104fde576781616421ac7b3612f 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=28ed8a8da79749aa69ffe58603a9b3fb 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=edb9183e067c05653f419e105eead50e 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e335840244e027300b2607eeec7a665a 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=35ebcef0ab95791178aa983028bd6622 2500w">
    ARM64 Linux systems
  </Card>
</CardGroup>

### Musl Binaries

For distributions without `glibc` (Alpine Linux, Void Linux):

* [Linux x64 musl](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-musl.zip)
* [Linux x64 musl baseline](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-musl-baseline.zip)
* [Linux ARM64 musl](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-aarch64-musl.zip)

<Note>
  If you encounter an error like `bun: /lib/x86_64-linux-gnu/libm.so.6: version GLIBC_2.29 not
  	found`, try using the musl binary. Bun's install script automatically chooses the correct binary
  for your system.
</Note>

***

## CPU Requirements

Bun has specific CPU requirements based on the binary you're using:

<Tabs>
  <Tab title="Standard Builds">
    **x64 binaries** target the Haswell CPU architecture (AVX and AVX2 instructions required)

    | Platform | Intel Requirement               | AMD Requirement    |
    | -------- | ------------------------------- | ------------------ |
    | x64      | Haswell (4th gen Core) or newer | Excavator or newer |
  </Tab>

  <Tab title="Baseline Builds">
    **x64-baseline binaries** target the Nehalem architecture for older CPUs

    | Platform     | Intel Requirement               | AMD Requirement    |
    | ------------ | ------------------------------- | ------------------ |
    | x64-baseline | Nehalem (1st gen Core) or newer | Bulldozer or newer |

    <Warning>
      Baseline builds are slower than regular builds. Use them only if you encounter an "Illegal
      Instruction" error.
    </Warning>
  </Tab>
</Tabs>

<Note>
  Bun does not support CPUs older than the baseline target, which mandates the SSE4.2 extension.
  macOS requires version 13.0 or later.
</Note>

***

## Uninstall

To remove Bun from your system:

<Tabs>
  <Tab title="macOS & Linux">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    rm -rf ~/.bun
    ```
  </Tab>

  <Tab title="Windows">
    ```powershell PowerShell icon="windows" theme={"theme":{"light":"github-light","dark":"dracula"}}
    powershell -c ~\.bun\uninstall.ps1
    ```
  </Tab>

  <Tab title="Package Managers">
    <CodeGroup>
      ```bash npm icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
      npm uninstall -g bun
      ```

      ```bash Homebrew icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/homebrew.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=614be850c39990ccb245ec8f1fe1b1a1" theme={"theme":{"light":"github-light","dark":"dracula"}}
      brew uninstall bun
      ```

      ```bash Scoop icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
      scoop uninstall bun
      ```
    </CodeGroup>
  </Tab>
</Tabs>

# Quickstart

> Build your first app with Bun

## Overview

Build a minimal HTTP server with `Bun.serve`, run it locally, then evolve it by installing a package.

<Info>
  Prerequisites: Bun installed and available on your `PATH`. See [installation](/installation) for
  setup.
</Info>

***

<Steps>
  <Step title="Step 1">
    Initialize a new project with `bun init`.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun init my-app
    ```

    It'll prompt you to pick a template, either `Blank`, `React`, or `Library`. For this guide, we'll pick `Blank`.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun init my-app
    ```

    ```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
    ✓ Select a project template: Blank

    - .gitignore
    - CLAUDE.md
    - .cursor/rules/use-bun-instead-of-node-vite-npm-pnpm.mdc -> CLAUDE.md
    - index.ts
    - tsconfig.json (for editor autocomplete)
    - README.md
    ```

    This automatically creates a `my-app` directory with a basic Bun app.
  </Step>

  <Step title="Step 2">
    Run the `index.ts` file using `bun run index.ts`.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    cd my-app
    bun run index.ts
    ```

    ```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
    Hello via Bun!
    ```

    You should see a console output saying `"Hello via Bun!"`.
  </Step>

  <Step title="Step 3">
    Replace the contents of `index.ts` with the following code:

    ```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    const server = Bun.serve({
    	port: 3000,
    	routes: {
    		"/": () => new Response('Bun!'),
    	}
    });

    console.log(`Listening on ${server.url}`);
    ```

    Run the `index.ts` file again using `bun run index.ts`.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun run index.ts
    ```

    ```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
    Listening on http://localhost:3000
    ```

    Visit [`http://localhost:3000`](http://localhost:3000) to test the server. You should see a simple page that says `"Bun!"`.

    <Accordion title="Seeing TypeScript errors on Bun?">
      If you used `bun init`, Bun will have automatically installed Bun's TypeScript declarations and configured your `tsconfig.json`. If you're trying out Bun in an existing project, you may see a type error on the `Bun` global.

      To fix this, first install `@types/bun` as a dev dependency.

      ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
      bun add -d @types/bun
      ```

      Then add the following to your `compilerOptions` in `tsconfig.json`:

      ```json tsconfig.json icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
      {
      	"compilerOptions": {
      		"lib": ["ESNext"],
      		"target": "ESNext",
      		"module": "Preserve",
      		"moduleDetection": "force",
      		"moduleResolution": "bundler",
      		"allowImportingTsExtensions": true,
      		"verbatimModuleSyntax": true,
      		"noEmit": true
      	}
      }
      ```
    </Accordion>
  </Step>

  <Step title="Step 4">
    Install the `figlet` package and its type declarations. Figlet is a utility for converting strings into ASCII art.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun add figlet
    bun add -d @types/figlet # TypeScript users only
    ```

    Update `index.ts` to use `figlet` in `routes`.

    ```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    import figlet from 'figlet'; // [!code ++]

    const server = Bun.serve({
    	port: 3000,
    	routes: {
    		"/": () => new Response('Bun!'),
    		"/figlet": () => { // [!code ++]
    			const body = figlet.textSync('Bun!'); // [!code ++]
    			return new Response(body); // [!code ++]
    		} // [!code ++]
    	}
    });

    console.log(`Listening on ${server.url}`);
    ```

    Run the `index.ts` file again using `bun run index.ts`.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun run index.ts
    ```

    ```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
    Listening on http://localhost:3000
    ```

    Visit [`http://localhost:3000/figlet`](http://localhost:3000/figlet) to test the server. You should see a simple page that says `"Bun!"` in ASCII art.

    ```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
     ____              _
    | __ ) _   _ _ __ | |
    |  _ \| | | | '_ \| |
    | |_) | |_| | | | |_|
    |____/ \__,_|_| |_(_)
    ```
  </Step>

  <Step title="Step 5">
    Let's add some HTML. Create a new file called `index.html` and add the following code:

    ```html index.html icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
    <!DOCTYPE html>
    <html lang="en">
    	<head>
    		<meta charset="UTF-8">
    		<meta name="viewport" content="width=device-width, initial-scale=1.0">
    		<title>Bun</title>
    	</head>
    	<body>
    		<h1>Bun!</h1>
    	</body>
    </html>
    ```

    Then, import this file in `index.ts` and serve it from the root `/` route.

    ```ts index.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
    import figlet from 'figlet';
    import index from './index.html'; // [!code ++]

    const server = Bun.serve({
    	port: 3000,
    	routes: {
    		"/": index, // [!code ++]
    		"/figlet": () => {
    			const body = figlet.textSync('Bun!');
    			return new Response(body);
    		}
    	}
    });

    console.log(`Listening on ${server.url}`);
    ```

    Run the `index.ts` file again using `bun run index.ts`.

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    bun run index.ts
    ```

    ```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
    Listening on http://localhost:3000
    ```

    Visit [`http://localhost:3000`](http://localhost:3000) to test the server. You should see the static HTML page.
  </Step>
</Steps>

🎉 Congratulations! You've built a simple HTTP server with Bun and installed a package.

***

## Run a script

Bun can also execute `"scripts"` from your `package.json`. Add the following script:

```json package.json icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "quickstart",
	"module": "index.ts",
	"type": "module",
	"scripts": {
		"start": "bun run index.ts"
	},
	"devDependencies": {
		"@types/bun": "latest"
	}
}
```

Then run it with `bun run start`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun run start
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
 Listening on http://localhost:3000
```

<Note>
  ⚡️ **Performance** — `bun run` is roughly 28x faster than `npm run` (6ms vs 170ms of overhead).
</Note>

# TypeScript

> Using TypeScript with Bun, including type definitions and compiler options

To install the TypeScript definitions for Bun's built-in APIs, install `@types/bun`.

```zsh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun add -d @types/bun # dev dependency
```

At this point, you should be able to reference the `Bun` global in your TypeScript files without seeing errors in your editor.

## Suggested `compilerOptions`

Bun supports things like top-level await, JSX, and extensioned `.ts` imports, which TypeScript doesn't allow by default. Below is a set of recommended `compilerOptions` for a Bun project, so you can use these features without seeing compiler warnings from TypeScript.

```jsonc tsconfig.json icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"compilerOptions": {
		// Environment setup & latest features
		"lib": ["ESNext"],
		"target": "ESNext",
		"module": "Preserve",
		"moduleDetection": "force",
		"jsx": "react-jsx",
		"allowJs": true,

		// Bundler mode
		"moduleResolution": "bundler",
		"allowImportingTsExtensions": true,
		"verbatimModuleSyntax": true,
		"noEmit": true,

		// Best practices
		"strict": true,
		"skipLibCheck": true,
		"noFallthroughCasesInSwitch": true,
		"noUncheckedIndexedAccess": true,
		"noImplicitOverride": true,

		// Some stricter flags (disabled by default)
		"noUnusedLocals": false,
		"noUnusedParameters": false,
		"noPropertyAccessFromIndexSignature": false,
	},
}
```

If you run `bun init` in a new directory, this `tsconfig.json` will be generated for you. (The stricter flags are disabled by default.)

```sh terminal 	icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun init
```

# bun init

> Scaffold an empty Bun project with the interactive `bun init` command

Get started with Bun by scaffolding a new project with `bun init`.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun init my-app
```

```txt  theme={"theme":{"light":"github-light","dark":"dracula"}}
? Select a project template - Press return to submit.
❯ Blank
  React
  Library

✓ Select a project template: Blank

 + .gitignore
 + CLAUDE.md
 + .cursor/rules/use-bun-instead-of-node-vite-npm-pnpm.mdc -> CLAUDE.md
 + index.ts
 + tsconfig.json (for editor autocomplete)
 + README.md
```

Press `enter` to accept the default answer for each prompt, or pass the `-y` flag to auto-accept the defaults.

***

`bun init` is a quick way to start a blank project with Bun. It guesses with sane defaults and is non-destructive when run multiple times.

<Frame>
  ![Demo](https://user-images.githubusercontent.com/709451/183006613-271960a3-ff22-4f7c-83f5-5e18f684c836.gif)
</Frame>

It creates:

* a `package.json` file with a name that defaults to the current directory name
* a `tsconfig.json` file or a `jsconfig.json` file, depending if the entry point is a TypeScript file or not
* an entry point which defaults to `index.ts` unless any of `index.{tsx, jsx, js, mts, mjs}` exist or the `package.json` specifies a `module` or `main` field
* a `README.md` file

AI Agent rules (disable with `$BUN_AGENT_RULE_DISABLED=1`):

* a `CLAUDE.md` file when Claude CLI is detected (disable with `CLAUDE_CODE_AGENT_RULE_DISABLED` env var)
* a `.cursor/rules/*.mdc` file to guide [Cursor AI](https://cursor.sh) to use Bun instead of Node.js and npm when Cursor is detected

If you pass `-y` or `--yes`, it will assume you want to continue without asking questions.

At the end, it runs `bun install` to install `@types/bun`.

***

## CLI Usage

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun init <folder?>
```

### Initialization Options

<ParamField path="--yes" type="boolean">
  {" "}

  Accept all default prompts without asking questions. Alias: <code>-y</code>{" "}
</ParamField>

<ParamField path="--minimal" type="boolean">
  {" "}

  Only initialize type definitions (skip app scaffolding). Alias: <code>-m</code>{" "}
</ParamField>

### Project Templates

<ParamField path="--react" type="string|boolean">
  {" "}

  Scaffold a React project. When used without a value, creates a baseline React app.
  <br /> Accepts values for presets:{" "}

  <ul>
    {" "}

    <li>
      <code>tailwind</code> – React app preconfigured with Tailwind CSS
    </li>

    {" "}

    <li>
      <code>shadcn</code> – React app with <code>@shadcn/ui</code> and Tailwind CSS
    </li>

    {" "}
  </ul>

  {" "}

  Examples:{" "}

  <pre>
    <code>bun init --react bun init --react=tailwind bun init --react=shadcn</code>
  </pre>

  {" "}
</ParamField>

### Output & Files

<ParamField path="(result)" type="info">
  {" "}

  Initializes project files and configuration for the chosen options (e.g., creating essential
  config files and a starter directory structure). Exact files vary by template.{" "}
</ParamField>

### Global Configuration & Context

<ParamField path="--cwd" type="string">
  {" "}

  Run <code>bun init</code> as if started in a different working directory (useful in scripts).{" "}
</ParamField>

### Help

<ParamField path="--help" type="boolean">
  {" "}

  Print this help menu. Alias: <code>-h</code>{" "}
</ParamField>

### Examples

* Accept all defaults

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun init -y
  ```

* React

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun init --react
  ```

* React + Tailwind CSS

  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun init --react=tailwind
  ```

* React + @shadcn/ui
  ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
  bun init --react=shadcn
  ```

# bun create

> Create a new Bun project from a React component, a `create-<template>` npm package, a GitHub repo, or a local template

<Note>
  You don't need `bun create` to use Bun. You don't need any configuration at all. This command
  exists to make getting started a bit quicker and easier.
</Note>

***

Template a new Bun project with `bun create`. This is a flexible command that can be used to create a new project from a React component, a `create-<template>` npm package, a GitHub repo, or a local template.

If you're looking to create a brand new empty project, use [`bun init`](https://bun.com/docs/cli/init).

## From a React component

`bun create ./MyComponent.tsx` turns an existing React component into a complete dev environment with hot reload and production builds in one command.

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
$ bun create ./MyComponent.jsx # .tsx also supported
```

<Frame>
  <video style={{ aspectRatio: "2062 / 1344", width: "100%", height: "100%", objectFit: "contain" }} loop autoPlay muted playsInline>
    <source src="https://mintcdn.com/bun-1dd33a4e/q61zoUYDXrVRu-tH/images/bun-create-shadcn.mp4?fit=max&auto=format&n=q61zoUYDXrVRu-tH&q=85&s=92fcea5a9d403b155e943508fbb40a21" style={{ width: "100%", height: "100%", objectFit: "contain" }} type="video/mp4" data-path="images/bun-create-shadcn.mp4" />
  </video>
</Frame>

<Note>
  🚀 **Create React App Successor** — `bun create <component>` provides everything developers loved about Create React App, but with modern tooling, faster builds, and backend support.
</Note>

#### How this works

When you run `bun create <component>`, Bun:

1. Uses [Bun's JavaScript bundler](https://bun.com/docs/bundler) to analyze your module graph.
2. Collects all the dependencies needed to run the component.
3. Scans the exports of the entry point for a React component.
4. Generates a `package.json` file with the dependencies and scripts needed to run the component.
5. Installs any missing dependencies using [`bun install --only-missing`](https://bun.com/docs/cli/install).
6. Generates the following files:
   * `${component}.html`
   * `${component}.client.tsx` (entry point for the frontend)
   * `${component}.css` (css file)
7. Starts a frontend dev server automatically.

### Using TailwindCSS with Bun

[TailwindCSS](https://tailwindcss.com/) is an extremely popular utility-first CSS framework used to style web applications.

When you run `bun create <component>`, Bun scans your JSX/TSX file for TailwindCSS class names (and any files it imports). If it detects TailwindCSS class names, it will add the following dependencies to your `package.json`:

```json package.json icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"dependencies": {
		"tailwindcss": "^4",
		"bun-plugin-tailwind": "latest"
	}
}
```

We also configure `bunfig.toml` to use Bun's TailwindCSS plugin with `Bun.serve()`

```toml bunfig.toml icon="settings" theme={"theme":{"light":"github-light","dark":"dracula"}}
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

And a `${component}.css` file with `@import "tailwindcss";` at the top:

```css MyComponent.css icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
@import "tailwindcss";
```

### Using `shadcn/ui` with Bun

[`shadcn/ui`](https://ui.shadcn.com/) is an extremely popular component library tool for building web applications.

`bun create <component>` scans for any shadcn/ui components imported from `@/components/ui`.

If it finds any, it runs:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Assuming bun detected imports to @/components/ui/accordion and @/components/ui/button
bunx shadcn@canary add accordion button # and any other components
```

Since `shadcn/ui` itself uses TailwindCSS, `bun create` also adds the necessary TailwindCSS dependencies to your `package.json` and configures `bunfig.toml` to use Bun's TailwindCSS plugin with `Bun.serve()` as described above.

Additionally, we setup the following:

* `tsconfig.json` to alias `"@/*"` to `"src/*"` or `.` (depending on if there is a `src/` directory)
* `components.json` so that shadcn/ui knows its a shadcn/ui project
* `styles/globals.css` file that configures Tailwind v4 in the way that shadcn/ui expects
* `${component}.build.ts` file that builds the component for production with `bun-plugin-tailwind` configured

`bun create ./MyComponent.jsx` is one of the easiest ways to run code generated from LLMs like [Claude](https://claude.ai) or ChatGPT locally.

## From `npm`

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun create <template> [<destination>]
```

Assuming you don't have a [local template](#from-a-local-template) with the same name, this command will download and execute the `create-<template>` package from npm. The following two commands will behave identically:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun create remix
bunx create-remix
```

Refer to the documentation of the associated `create-<template>` package for complete documentation and usage instructions.

## From GitHub

This will download the contents of the GitHub repo to disk.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun create <user>/<repo>
bun create github.com/<user>/<repo>
```

Optionally specify a name for the destination folder. If no destination is specified, the repo name will be used.

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun create <user>/<repo> mydir
bun create github.com/<user>/<repo> mydir
```

Bun will perform the following steps:

* Download the template
* Copy all template files into the destination folder
* Install dependencies with `bun install`.
* Initialize a fresh Git repo. Opt out with the `--no-git` flag.
* Run the template's configured `start` script, if defined.

<Note>
  By default Bun will *not overwrite* any existing files. Use the `--force` flag to overwrite
  existing files.
</Note>

## From a local template

<Warning>
  Unlike remote templates, running `bun create` with a local template will delete the entire
  destination folder if it already exists! Be careful.
</Warning>

Bun's templater can be extended to support custom templates defined on your local file system. These templates should live in one of the following directories:

* `$HOME/.bun-create/<name>`: global templates
* `<project root>/.bun-create/<name>`: project-specific templates

<Note>
  You can customize the global template path by setting the `BUN_CREATE_DIR` environment variable.
</Note>

To create a local template, navigate to `$HOME/.bun-create` and create a new directory with the desired name of your template.

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
cd $HOME/.bun-create
mkdir foo
cd foo
```

Then, create a `package.json` file in that directory with the following contents:

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "foo"
}
```

You can run `bun create foo` elsewhere on your file system to verify that Bun is correctly finding your local template.

#### Setup logic

You can specify pre- and post-install setup scripts in the `"bun-create"` section of your local template's `package.json`.

```json package.json icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
{
	"name": "@bun-examples/simplereact",
	"version": "0.0.1",
	"main": "index.js",
	"dependencies": {
		"react": "^17.0.2",
		"react-dom": "^17.0.2"
	},
	"bun-create": {
		"preinstall": "echo 'Installing...'", // a single command
		"postinstall": ["echo 'Done!'"], // an array of commands
		"start": "bun run echo 'Hello world!'"
	}
}
```

The following fields are supported. Each of these can correspond to a string or array of strings. An array of commands will be executed in order.

| Field         | Description                         |
| ------------- | ----------------------------------- |
| `postinstall` | runs after installing dependencies  |
| `preinstall`  | runs before installing dependencies |

After cloning a template, `bun create` will automatically remove the `"bun-create"` section from `package.json` before writing it to the destination folder.

## Reference

### CLI flags

| Flag           | Description                            |
| -------------- | -------------------------------------- |
| `--force`      | Overwrite existing files               |
| `--no-install` | Skip installing `node_modules` & tasks |
| `--no-git`     | Don't initialize a git repository      |
| `--open`       | Start & open in-browser after finish   |

### Environment variables

| Name                                      | Description                                                                                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_API_DOMAIN`                       | If you're using a GitHub enterprise or a proxy, you can customize the GitHub domain Bun pings for downloads                                          |
| `GITHUB_TOKEN` (or `GITHUB_ACCESS_TOKEN`) | This lets `bun create` work with private repositories or if you get rate-limited. `GITHUB_TOKEN` is chosen over `GITHUB_ACCESS_TOKEN` if both exist. |

<Accordion title={<span>How <code>bun create</code> works</span>}>
  When you run `bun create ${template} ${destination}`, here’s what happens:

  IF remote template

  1. GET `registry.npmjs.org/@bun-examples/${template}/latest` and parse it
  2. GET `registry.npmjs.org/@bun-examples/${template}/-/${template}-${latestVersion}.tgz`
  3. Decompress & extract `${template}-${latestVersion}.tgz` into `${destination}`
     * If there are files that would overwrite, warn and exit unless `--force` is passed

  IF GitHub repo

  1. Download the tarball from GitHub’s API
  2. Decompress & extract into `${destination}`
     * If there are files that would overwrite, warn and exit unless `--force` is passed

  ELSE IF local template

  1. Open local template folder

  2. Delete destination directory recursively

  3. Copy files recursively using the fastest system calls available (on macOS `fcopyfile` and Linux, `copy_file_range`). Do not copy or traverse into `node_modules` folder if exists (this alone makes it faster than `cp`)

  4. Parse the `package.json` (again!), update `name` to be `${basename(destination)}`, remove the `bun-create` section from the `package.json` and save the updated `package.json` to disk.
     * IF Next.js is detected, add `bun-framework-next` to the list of dependencies
     * IF Create React App is detected, add the entry point in `/src/index.{js,jsx,ts,tsx}` to `public/index.html`
     * IF Relay is detected, add `bun-macro-relay` so that Relay works

  5. Auto-detect the npm client, preferring `pnpm`, `yarn` (v1), and lastly `npm`

  6. Run any tasks defined in `"bun-create": { "preinstall" }` with the npm client

  7. Run `${npmClient} install` unless `--no-install` is passed OR no dependencies are in package.json

  8. Run any tasks defined in `"bun-create": { "postinstall" }` with the npm client

  9. Run `git init; git add -A .; git commit -am "Initial Commit";`
     * Rename `gitignore` to `.gitignore`. NPM automatically removes `.gitignore` files from appearing in packages.
     * If there are dependencies, this runs in a separate thread concurrently while node\_modules are being installed
     * Using libgit2 if available was tested and performed 3x slower in microbenchmarks
</Accordion>
