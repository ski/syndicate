# Syndicate Rust Core

A minimal Rust/Wasm crate for the $BURN logic and capability-friendly helpers.

## Layout
- `syndicate_core/` — Rust crate producing a Wasm bundle via `wasm-pack`.
- Output from `wasm-pack build --target web` lands in `syndicate_core/pkg/`.

## Prerequisites
- Rust toolchain (`rustup`)
- `wasm-pack` (install via `cargo install wasm-pack` or the official installer)

## Build
```bash
cd rust/syndicate_core
wasm-pack build --target web
```

This generates `pkg/` with JS bindings and the `.wasm` artifact.

## Using from JS
- Point your web or bundler entry to the generated `pkg/` output.
- Example (ESM):
  ```js
  import init, { BurnState, can_bid } from './pkg/syndicate_core.js';
  await init();
  const state = new BurnState(10, 0);
  state.spend(3);
  console.log(state.to_json());
  console.log(can_bid(2, state.balance()));
  ```

## Notes
- The crate is exported as a `cdylib` for Wasm.
- `serde_json` is used only to serialize state for JS interop; keep payloads small.
