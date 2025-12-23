// This simulates Peer B, a machine hosting a secure resource (like a private log).
// It listens for an incoming IPv6 P2P connection and exposes a limited capability.

// Patch for Node.js 22 compatibility via shared package
import 'shared/patch-endo.js';

import { makeCapTP } from '@endo/captp';
import { Far } from '@endo/far';
import net from 'net';

// --- 1. Define the Secure Resource (The Object) ---
// This resource will be protected by the capability system.
const privateResource = Far('PrivateResource', {
  // This is the privileged method that requires the capability
  readSecret: () => {
    return 'The secret tuple key is: 2001:DB8::B0B';
  },
  
  // This method is available to anyone who has the capability
  readPublic: () => {
    return 'Public info: Host is active.';
  },
});

// --- 2. Define the Server Bootstrapping Object ---
// This is the object the client first receives a reference to.
const netHost = Far('NetHost', {
  getPrivateResource: () => {
    console.log('--- Capability Granted: Client successfully requested the secure resource. ---');
    // The capability (the unforgeable reference) is passed here.
    return privateResource;
  },
});

// --- 3. Start the CapTP Server ---
async function main() {
  const host = '::'; // Listen on all IPv6 interfaces
  const port = 8000;

  // Create a server that listens for CapTP connections over TCP/IPv6
  const server = net.createServer((socket) => {
    console.log(`[P2P] Client connected from ${socket.remoteAddress}`);
    
    // Create the CapTP connection over the raw TCP socket
    // The third argument is the bootstrap object that the client will receive
    const { dispatch } = makeCapTP(
      'server',
      (data) => socket.write(JSON.stringify(data)),
      netHost  // Bootstrap object
    );
    
    // Handle incoming data from the socket
    socket.on('data', (data) => {
      dispatch(JSON.parse(data.toString()));
    });

    socket.on('end', () => {
      console.log('[P2P] Client disconnected.');
    });
    
    socket.on('error', (err) => {
      console.error(`[P2P] Socket error: ${err.message}`);
    });
  });

  server.listen(port, host, () => {
    console.log('----------------------------------------------------');
    console.log(`Syndicate PoC Host (Peer B) listening on IPv6: [${host}]:${port}`);
    console.log(`A client (Peer A) should connect to: ::1:${port} (use localhost for testing)`);
    console.log('----------------------------------------------------');
  });
}

main().catch(err => console.error(err));
