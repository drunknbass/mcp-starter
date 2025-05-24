#!/usr/bin/env node

// Simple test client for the MCP server
import { spawn } from 'child_process';

// Start the server
const server = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

console.log('Sending initialize request...');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Listen for responses
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('Received:', JSON.stringify(response, null, 2));
      
      // If we got the initialize response, send initialized notification
      if (response.id === 1 && response.result) {
        const initializedNotification = {
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        };
        console.log('\nSending initialized notification...');
        server.stdin.write(JSON.stringify(initializedNotification) + '\n');
        
        // Then list available tools
        setTimeout(() => {
          const listToolsRequest = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list'
          };
          console.log('\nSending tools/list request...');
          server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
        }, 100);
        
        // Call the echo tool
        setTimeout(() => {
          const callToolRequest = {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'echo',
              arguments: {
                message: 'Hello from test client!'
              }
            }
          };
          console.log('\nSending tools/call request...');
          server.stdin.write(JSON.stringify(callToolRequest) + '\n');
        }, 200);
        
        // Exit after testing
        setTimeout(() => {
          console.log('\nTest completed. Closing server...');
          server.kill();
          process.exit(0);
        }, 1000);
      }
    } catch (e) {
      // Not JSON, might be startup message
      console.log('Server output:', line);
    }
  });
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});