// This simulates Peer A, the Mobile Agent initiating a connection
// and attempting to access a remote, secure resource using CapTP.

// Patch for Node.js 22 compatibility
import './patch-endo.js';

import { makeCapTP } from '@endo/captp';
import { E } from '@endo/far';
import net from 'net';

// --- CONFIGURATION ---
const REMOTE_HOST = '::1'; // Use ::1 for localhost testing on an IPv6 setup
const REMOTE_PORT = 8000;

// --- 1. Set up the Connection ---
async function runClient() {
  console.log(`[P2P] Attempting to connect to CapTP host at [${REMOTE_HOST}]:${REMOTE_PORT}...`);

  const socket = net.connect(REMOTE_PORT, REMOTE_HOST);

  socket.on('error', (err) => {
    console.error(`[P2P ERROR] Connection failed: ${err.message}`);
    process.exit(1);
  });

  socket.on('connect', () => {
    console.log('[P2P] Successfully connected. Starting CapTP handshake...');
    
    // --- 2. Initialize CapTP over the Socket ---
    const { dispatch, getBootstrap } = makeCapTP(
      'client',
      (data) => socket.write(JSON.stringify(data))
    );
    
    // Handle incoming data from the socket
    socket.on('data', (data) => {
      dispatch(JSON.parse(data.toString()));
    });
    
    // Wait a bit for the handshake to complete before accessing bootstrap
    setTimeout(async () => {
      try {
        // Get the bootstrap object (NetHost) from the remote server
        const netHost = getBootstrap();

        // --- 3. Capability Acquisition ---
        console.log('[AGENT] Requesting the private resource capability...');
        const privateResourceCap = await E(netHost).getPrivateResource();

        // --- 4. Capability Invocation ---
        // Now the agent uses the received capability to invoke the secure method.
        
        console.log('[AGENT] Invoking secured method (readSecret)...');
        const secretResult = await E(privateResourceCap).readSecret();
        console.log(`\n✅ CAPABILITY SUCCESS: Received secret: ${secretResult}`);

        // Test public access on the same object
        const publicResult = await E(privateResourceCap).readPublic();
        console.log(`✅ CAPABILITY SUCCESS: Received public: ${publicResult}`);

      } catch (e) {
        console.log(`\n❌ CAPABILITY FAILED: An error occurred during invocation: ${e.message}`);
        console.error(e);
      } finally {
        socket.end();
        process.exit(0);
      }
    }, 500);
  });
}

runClient();