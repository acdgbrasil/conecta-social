# Node-API

> Use Bun's Node-API module to build native add-ons to Node.js

Node-API is an interface for building native add-ons to Node.js. Bun implements 95% of this interface from scratch, so most existing Node-API extensions will work with Bun out of the box. Track the completion status of it in [this issue](https://github.com/oven-sh/bun/issues/158).

As in Node.js, `.node` files (Node-API modules) can be required directly in Bun.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
const napi = require("./my-node-module.node");
```

Alternatively, use `process.dlopen`:

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
let mod = { exports: {} };
process.dlopen(mod, "./my-node-module.node");
```

# FFI

> Use Bun's FFI module to efficiently call native libraries from JavaScript

<Warning>
  `bun:ffi` is **experimental**, with known bugs and limitations, and should not be relied on in
  production. The most stable way to interact with native code from Bun is to write a [Node-API
  module](/runtime/node-api).
</Warning>

Use the built-in `bun:ffi` module to efficiently call native libraries from JavaScript. It works with languages that support the C ABI (Zig, Rust, C/C++, C#, Nim, Kotlin, etc).

***

## dlopen usage (`bun:ffi`)

To print the version number of `sqlite3`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dlopen, FFIType, suffix } from "bun:ffi";

// `suffix` is either "dylib", "so", or "dll" depending on the platform
// you don't have to use "suffix", it's just there for convenience
const path = `libsqlite3.${suffix}`;

const {
	symbols: {
		sqlite3_libversion, // the function to call
	},
} = dlopen(
	path, // a library name or file path
	{
		sqlite3_libversion: {
			// no arguments, returns a string
			args: [],
			returns: FFIType.cstring,
		},
	},
);

console.log(`SQLite 3 version: ${sqlite3_libversion()}`);
```

***

## Performance

According to [our benchmark](https://github.com/oven-sh/bun/tree/main/bench/ffi), `bun:ffi` is roughly 2-6x faster than Node.js FFI via `Node-API`.

<Image src="/images/ffi.png" height="400" />

Bun generates & just-in-time compiles C bindings that efficiently convert values between JavaScript types and native types. To compile C, Bun embeds [TinyCC](https://github.com/TinyCC/tinycc), a small and fast C compiler.

***

## Usage

### Zig

```zig add.zig icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
pub export fn add(a: i32, b: i32) i32 {
  return a + b;
}
```

To compile:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
zig build-lib add.zig -dynamic -OReleaseFast
```

Pass a path to the shared library and a map of symbols to import into `dlopen`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dlopen, FFIType, suffix } from "bun:ffi";
const { i32 } = FFIType;

const path = `libadd.${suffix}`;

const lib = dlopen(path, {
	add: {
		args: [i32, i32],
		returns: i32,
	},
});

console.log(lib.symbols.add(1, 2));
```

### Rust

```rust  theme={"theme":{"light":"github-light","dark":"dracula"}}
// add.rs
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

To compile:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
rustc --crate-type cdylib add.rs
```

### C++

```c  theme={"theme":{"light":"github-light","dark":"dracula"}}
#include <cstdint>

extern "C" int32_t add(int32_t a, int32_t b) {
    return a + b;
}
```

To compile:

```bash  theme={"theme":{"light":"github-light","dark":"dracula"}}
zig build-lib add.cpp -dynamic -lc -lc++
```

***

## FFI types

The following `FFIType` values are supported.

| `FFIType`   | C Type         | Aliases                     |
| ----------- | -------------- | --------------------------- |
| buffer      | `char*`        |                             |
| cstring     | `char*`        |                             |
| function    | `(void*)(*)()` | `fn`, `callback`            |
| ptr         | `void*`        | `pointer`, `void*`, `char*` |
| i8          | `int8_t`       | `int8_t`                    |
| i16         | `int16_t`      | `int16_t`                   |
| i32         | `int32_t`      | `int32_t`, `int`            |
| i64         | `int64_t`      | `int64_t`                   |
| i64\_fast   | `int64_t`      |                             |
| u8          | `uint8_t`      | `uint8_t`                   |
| u16         | `uint16_t`     | `uint16_t`                  |
| u32         | `uint32_t`     | `uint32_t`                  |
| u64         | `uint64_t`     | `uint64_t`                  |
| u64\_fast   | `uint64_t`     |                             |
| f32         | `float`        | `float`                     |
| f64         | `double`       | `double`                    |
| bool        | `bool`         |                             |
| char        | `char`         |                             |
| napi\_env   | `napi_env`     |                             |
| napi\_value | `napi_value`   |                             |

Note: `buffer` arguments must be a `TypedArray` or `DataView`.

***

## Strings

JavaScript strings and C-like strings are different, and that complicates using strings with native libraries.

<Accordion title="How are JavaScript strings and C strings different?">
  JavaScript strings:

  * UTF16 (2 bytes per letter) or potentially latin1, depending on the JavaScript engine & what characters are used
  * `length` stored separately
  * Immutable

  C strings:

  * UTF8 (1 byte per letter), usually
  * The length is not stored. Instead, the string is null-terminated which means the length is the index of the first `\0` it finds
  * Mutable
</Accordion>

To solve this, `bun:ffi` exports `CString` which extends JavaScript's built-in `String` to support null-terminated strings and add a few extras:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
class CString extends String {
	/**
	 * Given a `ptr`, this will automatically search for the closing `\0` character and transcode from UTF-8 to UTF-16 if necessary.
	 */
	constructor(ptr: number, byteOffset?: number, byteLength?: number): string;

	/**
	 * The ptr to the C string
	 *
	 * This `CString` instance is a clone of the string, so it
	 * is safe to continue using this instance after the `ptr` has been
	 * freed.
	 */
	ptr: number;
	byteOffset?: number;
	byteLength?: number;
}
```

To convert from a null-terminated string pointer to a JavaScript string:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const myString = new CString(ptr);
```

To convert from a pointer with a known length to a JavaScript string:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const myString = new CString(ptr, 0, byteLength);
```

The `new CString()` constructor clones the C string, so it is safe to continue using `myString` after `ptr` has been freed.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
my_library_free(myString.ptr);

// this is safe because myString is a clone
console.log(myString);
```

When used in `returns`, `FFIType.cstring` coerces the pointer to a JavaScript `string`. When used in `args`, `FFIType.cstring` is identical to `ptr`.

***

## Function pointers

<Note>Async functions are not yet supported</Note>

To call a function pointer from JavaScript, use `CFunction`. This is useful if using Node-API (napi) with Bun, and you've already loaded some symbols.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { CFunction } from "bun:ffi";

let myNativeLibraryGetVersion = /* somehow, you got this pointer */

const getVersion = new CFunction({
  returns: "cstring",
  args: [],
  ptr: myNativeLibraryGetVersion,
});
getVersion();
```

If you have multiple function pointers, you can define them all at once with `linkSymbols`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { linkSymbols } from "bun:ffi";

// getVersionPtrs defined elsewhere
const [majorPtr, minorPtr, patchPtr] = getVersionPtrs();

const lib = linkSymbols({
	// Unlike with dlopen(), the names here can be whatever you want
	getMajor: {
		returns: "cstring",
		args: [],

		// Since this doesn't use dlsym(), you have to provide a valid ptr
		// That ptr could be a number or a bigint
		// An invalid pointer will crash your program.
		ptr: majorPtr,
	},
	getMinor: {
		returns: "cstring",
		args: [],
		ptr: minorPtr,
	},
	getPatch: {
		returns: "cstring",
		args: [],
		ptr: patchPtr,
	},
});

const [major, minor, patch] = [
	lib.symbols.getMajor(),
	lib.symbols.getMinor(),
	lib.symbols.getPatch(),
];
```

***

## Callbacks

Use `JSCallback` to create JavaScript callback functions that can be passed to C/FFI functions. The C/FFI function can call into the JavaScript/TypeScript code. This is useful for asynchronous code or whenever you want to call into JavaScript code from C.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dlopen, JSCallback, ptr, CString } from "bun:ffi";

const {
	symbols: { search },
	close,
} = dlopen("libmylib", {
	search: {
		returns: "usize",
		args: ["cstring", "callback"],
	},
});

const searchIterator = new JSCallback((ptr, length) => /hello/.test(new CString(ptr, length)), {
	returns: "bool",
	args: ["ptr", "usize"],
});

const str = Buffer.from("wwutwutwutwutwutwutwutwutwutwutut\0", "utf8");
if (search(ptr(str), searchIterator)) {
	// found a match!
}

// Sometime later:
setTimeout(() => {
	searchIterator.close();
	close();
}, 5000);
```

When you're done with a JSCallback, you should call `close()` to free the memory.

### Experimental thread-safe callbacks

`JSCallback` has experimental support for thread-safe callbacks. This will be needed if you pass a callback function into a different thread from its instantiation context. You can enable it with the optional `threadsafe` parameter.

Currently, thread-safe callbacks work best when run from another thread that is running JavaScript code, i.e. a [`Worker`](/runtime/workers). A future version of Bun will enable them to be called from any thread (such as new threads spawned by your native library that Bun is not aware of).

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const searchIterator = new JSCallback((ptr, length) => /hello/.test(new CString(ptr, length)), {
	returns: "bool",
	args: ["ptr", "usize"],
	threadsafe: true, // Optional. Defaults to `false`
});
```

<Note>
  **⚡️ Performance tip** — For a slight performance boost, directly pass `JSCallback.prototype.ptr` instead of the `JSCallback` object:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  const onResolve = new JSCallback(arg => arg === 42, {
  	returns: "bool",
  	args: ["i32"],
  });
  const setOnResolve = new CFunction({
  	returns: "bool",
  	args: ["function"],
  	ptr: myNativeLibrarySetOnResolve,
  });

  // This code runs slightly faster:
  setOnResolve(onResolve.ptr);

  // Compared to this:
  setOnResolve(onResolve);
  ```
</Note>

***

## Pointers

Bun represents [pointers](https://en.wikipedia.org/wiki/Pointer_\(computer_programming\)) as a `number` in JavaScript.

<Accordion title="How does a 64 bit pointer fit in a JavaScript number?">
  64-bit processors support up to [52 bits of addressable space](https://en.wikipedia.org/wiki/64-bit_computing#Limits_of_processors). [JavaScript numbers](https://en.wikipedia.org/wiki/Double-precision_floating-point_format#IEEE_754_double-precision_binary_floating-point_format:_binary64) support 53 bits of usable space, so that leaves us with about 11 bits of extra space.

  **Why not `BigInt`?** `BigInt` is slower. JavaScript engines allocate a separate `BigInt` which means they can't fit into a regular JavaScript value. If you pass a `BigInt` to a function, it will be converted to a `number`
</Accordion>

To convert from a `TypedArray` to a pointer:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { ptr } from "bun:ffi";
let myTypedArray = new Uint8Array(32);
const myPtr = ptr(myTypedArray);
```

To convert from a pointer to an `ArrayBuffer`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { ptr, toArrayBuffer } from "bun:ffi";
let myTypedArray = new Uint8Array(32);
const myPtr = ptr(myTypedArray);

// toArrayBuffer accepts a `byteOffset` and `byteLength`
// if `byteLength` is not provided, it is assumed to be a null-terminated pointer
myTypedArray = new Uint8Array(toArrayBuffer(myPtr, 0, 32), 0, 32);
```

To read data from a pointer, you have two options. For long-lived pointers, use a `DataView`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { toArrayBuffer } from "bun:ffi";
let myDataView = new DataView(toArrayBuffer(myPtr, 0, 32));

console.log(
	myDataView.getUint8(0, true),
	myDataView.getUint8(1, true),
	myDataView.getUint8(2, true),
	myDataView.getUint8(3, true),
);
```

For short-lived pointers, use `read`:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { read } from "bun:ffi";

console.log(
	// ptr, byteOffset
	read.u8(myPtr, 0),
	read.u8(myPtr, 1),
	read.u8(myPtr, 2),
	read.u8(myPtr, 3),
);
```

The `read` function behaves similarly to `DataView`, but it's usually faster because it doesn't need to create a `DataView` or `ArrayBuffer`.

| `FFIType` | `read` function |
| --------- | --------------- |
| ptr       | `read.ptr`      |
| i8        | `read.i8`       |
| i16       | `read.i16`      |
| i32       | `read.i32`      |
| i64       | `read.i64`      |
| u8        | `read.u8`       |
| u16       | `read.u16`      |
| u32       | `read.u32`      |
| u64       | `read.u64`      |
| f32       | `read.f32`      |
| f64       | `read.f64`      |

### Memory management

`bun:ffi` does not manage memory for you. You must free the memory when you're done with it.

#### From JavaScript

If you want to track when a `TypedArray` is no longer in use from JavaScript, you can use a [FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry).

#### From C, Rust, Zig, etc

If you want to track when a `TypedArray` is no longer in use from C or FFI, you can pass a callback and an optional context pointer to `toArrayBuffer` or `toBuffer`. This function is called at some point later, once the garbage collector frees the underlying `ArrayBuffer` JavaScript object.

The expected signature is the same as in [JavaScriptCore's C API](https://developer.apple.com/documentation/javascriptcore/jstypedarraybytesdeallocator?language=objc):

```c  theme={"theme":{"light":"github-light","dark":"dracula"}}
typedef void (*JSTypedArrayBytesDeallocator)(void *bytes, void *deallocatorContext);
```

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { toArrayBuffer } from "bun:ffi";

// with a deallocatorContext:
toArrayBuffer(
	bytes,
	byteOffset,

	byteLength,

	// this is an optional pointer to a callback
	deallocatorContext,

	// this is a pointer to a function
	jsTypedArrayBytesDeallocator,
);

// without a deallocatorContext:
toArrayBuffer(
	bytes,
	byteOffset,

	byteLength,

	// this is a pointer to a function
	jsTypedArrayBytesDeallocator,
);
```

### Memory safety

Using raw pointers outside of FFI is extremely not recommended. A future version of Bun may add a CLI flag to disable `bun:ffi`.

### Pointer alignment

If an API expects a pointer sized to something other than `char` or `u8`, make sure the `TypedArray` is also that size. A `u64*` is not exactly the same as `[8]u8*` due to alignment.

### Passing a pointer

Where FFI functions expect a pointer, pass a `TypedArray` of equivalent size:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
import { dlopen, FFIType } from "bun:ffi";

const {
	symbols: { encode_png },
} = dlopen(myLibraryPath, {
	encode_png: {
		// FFIType's can be specified as strings too
		args: ["ptr", "u32", "u32"],
		returns: FFIType.ptr,
	},
});

const pixels = new Uint8ClampedArray(128 * 128 * 4);
pixels.fill(254);
pixels.subarray(0, 32 * 32 * 2).fill(0);

const out = encode_png(
	// pixels will be passed as a pointer
	pixels,

	128,
	128,
);
```

The [auto-generated wrapper](https://github.com/oven-sh/bun/blob/6a65631cbdcae75bfa1e64323a6ad613a922cd1a/src/bun.js/ffi.exports.js#L180-L182) converts the pointer to a `TypedArray`.

<Accordion title="Hardmode">
  If you don't want the automatic conversion or you want a pointer to a specific byte offset within the `TypedArray`, you can also directly get the pointer to the `TypedArray`:

  ```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { dlopen, FFIType, ptr } from "bun:ffi";

  const {
  	symbols: { encode_png },
  } = dlopen(myLibraryPath, {
  	encode_png: {
  		// FFIType's can be specified as strings too
  		args: ["ptr", "u32", "u32"],
  		returns: FFIType.ptr,
  	},
  });

  const pixels = new Uint8ClampedArray(128 * 128 * 4);
  pixels.fill(254);

  // this returns a number! not a BigInt!
  const myPtr = ptr(pixels);

  const out = encode_png(
  	myPtr,

  	// dimensions:
  	128,
  	128,
  );
  ```
</Accordion>

### Reading pointers

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const out = encode_png(
	// pixels will be passed as a pointer
	pixels,

	// dimensions:
	128,
	128,
);

// assuming it is 0-terminated, it can be read like this:
let png = new Uint8Array(toArrayBuffer(out));

// save it to disk:
await Bun.write("out.png", png);
```

# C Compiler

> Compile and run C from JavaScript with low overhead

`bun:ffi` has experimental support for compiling and running C from JavaScript with low overhead.

***

## Usage (cc in `bun:ffi`)

See the [introduction blog post](https://bun.com/blog/compile-and-run-c-in-js) for more information.

JavaScript:

```ts hello.js icon="file-code" theme={"theme":{"light":"github-light","dark":"dracula"}}
import { cc } from "bun:ffi";
import source from "./hello.c" with { type: "file" };

const {
	symbols: { hello },
} = cc({
	source,
	symbols: {
		hello: {
			args: [],
			returns: "int",
		},
	},
});

console.log("What is the answer to the universe?", hello());
```

C source:

```c hello.c theme={"theme":{"light":"github-light","dark":"dracula"}}
int hello() {
  return 42;
}
```

When you run `hello.js`, it will print:

```sh terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun hello.js
What is the answer to the universe? 42
```

Under the hood, `cc` uses [TinyCC](https://bellard.org/tcc/) to compile the C code and then link it with the JavaScript runtime, efficiently converting types in-place.

### Primitive types

The same `FFIType` values in [`dlopen`](/runtime/ffi) are supported in `cc`.

| `FFIType`   | C Type         | Aliases                     |
| ----------- | -------------- | --------------------------- |
| cstring     | `char*`        |                             |
| function    | `(void*)(*)()` | `fn`, `callback`            |
| ptr         | `void*`        | `pointer`, `void*`, `char*` |
| i8          | `int8_t`       | `int8_t`                    |
| i16         | `int16_t`      | `int16_t`                   |
| i32         | `int32_t`      | `int32_t`, `int`            |
| i64         | `int64_t`      | `int64_t`                   |
| i64\_fast   | `int64_t`      |                             |
| u8          | `uint8_t`      | `uint8_t`                   |
| u16         | `uint16_t`     | `uint16_t`                  |
| u32         | `uint32_t`     | `uint32_t`                  |
| u64         | `uint64_t`     | `uint64_t`                  |
| u64\_fast   | `uint64_t`     |                             |
| f32         | `float`        | `float`                     |
| f64         | `double`       | `double`                    |
| bool        | `bool`         |                             |
| char        | `char`         |                             |
| napi\_env   | `napi_env`     |                             |
| napi\_value | `napi_value`   |                             |

### Strings, objects, and non-primitive types

To make it easier to work with strings, objects, and other non-primitive types that don't map 1:1 to C types, `cc` supports N-API.

To pass or receive a JavaScript values without any type conversions from a C function, you can use `napi_value`.

You can also pass a `napi_env` to receive the N-API environment used to call the JavaScript function.

#### Returning a C string to JavaScript

For example, if you have a string in C, you can return it to JavaScript like this:

```ts hello.js theme={"theme":{"light":"github-light","dark":"dracula"}}
import { cc } from "bun:ffi";
import source from "./hello.c" with { type: "file" };

const {
	symbols: { hello },
} = cc({
	source,
	symbols: {
		hello: {
			args: ["napi_env"],
			returns: "napi_value",
		},
	},
});

const result = hello();
```

And in C:

```c hello.c theme={"theme":{"light":"github-light","dark":"dracula"}}
#include <node/node_api.h>

napi_value hello(napi_env env) {
  napi_value result;
  napi_create_string_utf8(env, "Hello, Napi!", NAPI_AUTO_LENGTH, &result);
  return result;
}
```

You can also use this to return other types like objects and arrays:

```c hello.c theme={"theme":{"light":"github-light","dark":"dracula"}}
#include <node/node_api.h>

napi_value hello(napi_env env) {
  napi_value result;
  napi_create_object(env, &result);
  return result;
}
```

### `cc` Reference

#### `library: string[]`

The `library` array is used to specify the libraries that should be linked with the C code.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
type Library = string[];

cc({
	source: "hello.c",
	library: ["sqlite3"],
});
```

#### `symbols`

The `symbols` object is used to specify the functions and variables that should be exposed to JavaScript.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
type Symbols = {
	[key: string]: {
		args: FFIType[];
		returns: FFIType;
	};
};
```

#### `source`

The `source` is a file path to the C code that should be compiled and linked with the JavaScript runtime.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
type Source = string | URL | BunFile;

cc({
	source: "hello.c",
	symbols: {
		hello: {
			args: [],
			returns: "int",
		},
	},
});
```

#### `flags: string | string[]`

The `flags` is an optional array of strings that should be passed to the TinyCC compiler.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
type Flags = string | string[];
```

These are flags like `-I` for include directories and `-D` for preprocessor definitions.

#### `define: Record<string, string>`

The `define` is an optional object that should be passed to the TinyCC compiler.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
type Defines = Record<string, string>;

cc({
	source: "hello.c",
	define: {
		NDEBUG: "1",
	},
});
```

These are preprocessor definitions passed to the TinyCC compiler.

# Transpiler

> Use Bun's transpiler to transpile JavaScript and TypeScript code

Bun exposes its internal transpiler via the `Bun.Transpiler` class. To create an instance of Bun's transpiler:

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
const transpiler = new Bun.Transpiler({
	loader: "tsx", // "js | "jsx" | "ts" | "tsx"
});
```

***

## `.transformSync()`

Transpile code synchronously with the `.transformSync()` method. Modules are not resolved and the code is not executed. The result is a string of vanilla JavaScript code.

<CodeGroup>
  ```ts transpile.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240"  theme={"theme":{"light":"github-light","dark":"dracula"}}
  const transpiler = new Bun.Transpiler({
    loader: 'tsx',
  });

  const code = `
  import * as whatever from "./whatever.ts"
  export function Home(props: {title: string}){
    return <p>{props.title}</p>;
  }`;

  const result = transpiler.transformSync(code);

  ```

  ```ts output theme={"theme":{"light":"github-light","dark":"dracula"}}
  import { __require as require } from "bun:wrap";
  import * as JSX from "react/jsx-dev-runtime";
  var jsx = require(JSX).jsxDEV;

  export default jsx(
    "div",
    {
      children: "hi!",
    },
    undefined,
    false,
    undefined,
    this,
  );
  ```
</CodeGroup>

To override the default loader specified in the `new Bun.Transpiler()` constructor, pass a second argument to `.transformSync()`.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
transpiler.transformSync("<div>hi!</div>", "tsx");
```

<Accordion title="Nitty gritty">
  When `.transformSync` is called, the transpiler is run in the same thread as the currently executed code.

  If a macro is used, it will be run in the same thread as the transpiler, but in a separate event loop from the rest of your application. Currently, globals between macros and regular code are shared, which means it is possible (but not recommended) to share states between macros and regular code. Attempting to use AST nodes outside of a macro is undefined behavior.
</Accordion>

***

## `.transform()`

The `transform()` method is an async version of `.transformSync()` that returns a `Promise<string>`.

```js  theme={"theme":{"light":"github-light","dark":"dracula"}}
const transpiler = new Bun.Transpiler({ loader: "jsx" });
const result = await transpiler.transform("<div>hi!</div>");
console.log(result);
```

Unless you're transpiling *many* large files, you should probably use `Bun.Transpiler.transformSync`. The cost of the threadpool will often take longer than actually transpiling code.

```ts  theme={"theme":{"light":"github-light","dark":"dracula"}}
await transpiler.transform("<div>hi!</div>", "tsx");
```

<Accordion title="Nitty gritty">
  The `.transform()` method runs the transpiler in Bun's worker threadpool, so if you run it 100 times, it will run it across `Math.floor($cpu_count * 0.8)` threads, without blocking the main JavaScript thread.

  If your code uses a macro, it will potentially spawn a new copy of Bun's JavaScript runtime environment in that new thread.
</Accordion>

## `.scan()`

The `Transpiler` instance can also scan some source code and return a list of its imports and exports, plus additional metadata about each one. [Type-only](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) imports and exports are ignored.

<CodeGroup>
  ```ts example.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  const transpiler = new Bun.Transpiler({
  	loader: "tsx",
  });

  const code = `
  import React from 'react';
  import type {ReactNode} from 'react';
  const val = require('./cjs.js')
  import('./loader');

  export const name = "hello";
  `;

  const result = transpiler.scan(code);
  ```

  ```json output theme={"theme":{"light":"github-light","dark":"dracula"}}
  {
  	"exports": ["name"],
  	"imports": [
  		{
  			"kind": "import-statement",
  			"path": "react"
  		},
  		{
  			"kind": "import-statement",
  			"path": "remix"
  		},
  		{
  			"kind": "dynamic-import",
  			"path": "./loader"
  		}
  	]
  }
  ```
</CodeGroup>

Each import in the `imports` array has a `path` and `kind`. Bun categories imports into the following kinds:

* `import-statement`: `import React from 'react'`
* `require-call`: `const val = require('./cjs.js')`
* `require-resolve`: `require.resolve('./cjs.js')`
* `dynamic-import`: `import('./loader')`
* `import-rule`: `@import 'foo.css'`
* `url-token`: `url('./foo.png')`

***

## `.scanImports()`

For performance-sensitive code, you can use the `.scanImports()` method to get a list of imports. It's faster than `.scan()` (especially for large files) but marginally less accurate due to some performance optimizations.

<CodeGroup>
  ```ts example.ts icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/typescript.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c6cceedec8f82d2cc803d7c6ec82b240" theme={"theme":{"light":"github-light","dark":"dracula"}}
  const transpiler = new Bun.Transpiler({
  	loader: "tsx",
  });

  const code = `
  import React from 'react';
  import type {ReactNode} from 'react';
  const val = require('./cjs.js')
  import('./loader');

  export const name = "hello";
  `;

  const result = transpiler.scanImports(code);
  ```

  ```json results icon="file-json" theme={"theme":{"light":"github-light","dark":"dracula"}}
  [
  	{
  		"kind": "import-statement",
  		"path": "react"
  	},
  	{
  		"kind": "require-call",
  		"path": "./cjs.js"
  	},
  	{
  		"kind": "dynamic-import",
  		"path": "./loader"
  	}
  ]
  ```
</CodeGroup>

***

## Reference

```ts See Typescript Definitions expandable theme={"theme":{"light":"github-light","dark":"dracula"}}
type Loader = "jsx" | "js" | "ts" | "tsx";

interface TranspilerOptions {
  // Replace key with value. Value must be a JSON string.
  // { "process.env.NODE_ENV": "\"production\"" }
  define?: Record<string, string>,

  // Default loader for this transpiler
  loader?: Loader,

  // Default platform to target
  // This affects how import and/or require is used
  target?: "browser" | "bun" | "node",

  // Specify a tsconfig.json file as stringified JSON or an object
  // Use this to set a custom JSX factory, fragment, or import source
  // For example, if you want to use Preact instead of React. Or if you want to use Emotion.
  tsconfig?: string | TSConfig,

  // Replace imports with macros
  macro?: MacroMap,

  // Specify a set of exports to eliminate
  // Or rename certain exports
  exports?: {
      eliminate?: string[];
      replace?: Record<string, string>;
  },

  // Whether to remove unused imports from transpiled file
  // Default: false
  trimUnusedImports?: boolean,

  // Whether to enable a set of JSX optimizations
  // jsxOptimizationInline ...,

  // Experimental whitespace minification
  minifyWhitespace?: boolean,

  // Whether to inline constant values
  // Typically improves performance and decreases bundle size
  // Default: true
  inline?: boolean,
}

// Map import paths to macros
interface MacroMap {
  // {
  //   "react-relay": {
  //     "graphql": "bun-macro-relay/bun-macro-relay.tsx"
  //   }
  // }
  [packagePath: string]: {
    [importItemName: string]: string,
  },
}

class Bun.Transpiler {
  constructor(options: TranspilerOptions)

  transform(code: string, loader?: Loader): Promise<string>
  transformSync(code: string, loader?: Loader): string

  scan(code: string): {exports: string[], imports: Import}
  scanImports(code: string): Import[]
}

type Import = {
  path: string,
  kind:
  // import foo from 'bar'; in JavaScript
  | "import-statement"
  // require("foo") in JavaScript
  | "require-call"
  // require.resolve("foo") in JavaScript
  | "require-resolve"
  // Dynamic import() in JavaScript
  | "dynamic-import"
  // @import() in CSS
  | "import-rule"
  // url() in CSS
  | "url-token"
  // The import was injected by Bun
  | "internal" 
  // Entry point (not common)
  | "entry-point-build"
  | "entry-point-run"
}

const transpiler = new Bun.Transpiler({ loader: "jsx" });
```

