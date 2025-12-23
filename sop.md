SOP: Bootstrapping the Syndicate Wasm-Agent Environment

Monorepo Setup (npm workspaces)

- Structure: 
	- apps/server: CapTP host (Peer B)
	- apps/client: CapTP client (Peer A)
	- packages/shared: Shared utilities (Endo init patch)

- Root scripts:
	- dev: runs server and client together
	- server:dev: runs only the server
	- client:dev: runs only the client

- Quick start:

```bash
npm install
npm run dev
```

- Notes:
	- Shared patch is imported via `import 'shared/patch-endo.js'` in both apps.
	- Workspaces are defined in the root package.json; dependencies live in each app.
	- The client uses IPv6 loopback (::1) and connects to the server on port 8000.
	- Rust/Wasm lives in rust/syndicate_core (build with `wasm-pack build --target web`).


Objective: Initialize a hybrid Rust/Wasm and JavaScript project to implement a secure, high-performance Syndicate Mobile Agent.

1. Prerequisites & Environment Setup

Ensure the following are installed on your local machine:

Rust & Cargo: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

wasm-pack: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

Node.js & npm: For managing the P2P networking glue.

2. Project Initialization

Run these commands in your terminal to create the scaffold:

# 1. Create the project directory
mkdir syndicate-agent && cd syndicate-agent

# 2. Initialize the Rust Library
cargo init --lib

# 3. Initialize Node.js
npm init -y
npm install --save-dev webpack webpack-cli webpack-dev-server copy-webpack-plugin


3. Core Configuration (The "Brain" Setup)

A. Cargo.toml

Update your Cargo.toml to include the Wasm-bindgen dependencies for the OCap bridge.

[package]
name = "syndicate_core"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"


B. Rust Logic (src/lib.rs)

Implement the $BURN logic and the capability handlers in Rust.

4. The JavaScript/Endo Glue (The "Body" Setup)

A. OCap Bridge (index.js)

This script loads the Wasm module and endows it with network capabilities (OCaps).

Initialize the Wasm module.

Create "Power Objects" (Networking, Storage).

Pass references into the Wasm sandbox.

B. UI Layer (index.html)

A Tailwind-based interface to monitor Agent status, $BURN balance, and Tuple Space entries.

5. Build and Execution Workflow

Step 1: Compile the Rust Core

wasm-pack build --target web


Step 2: Serve the Application

# Use a simple dev server or your Webpack setup
npx webpack serve


6. Validation Checklist

[ ] Wasm Lockdown: Verify that the Rust module cannot access window or document directly.

[ ] Economic Heartbeat: Confirm $BURN balance resets at the simulated Epoch boundary.

[ ] Latency Check: Measure time for Tuple Space matching inside Wasm vs JS.

7. Next Steps: Multi-Agent Local Simulation

Open two browser tabs (two distinct Agents).

Assign different UBI grants.

Test $BURN-based priority bidding for a single "Content Slot" in the local Tuple Space.