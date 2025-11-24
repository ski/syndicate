// Helper script to run both server and client
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting server...');
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Wait for server to start
setTimeout(() => {
  console.log('\nStarting client...');
  const client = spawn('node', ['client.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  client.on('close', (code) => {
    console.log(`\nClient exited with code ${code}`);
    server.kill();
    process.exit(code);
  });
}, 2000);

process.on('SIGINT', () => {
  server.kill();
  process.exit();
});
