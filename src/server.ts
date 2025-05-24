#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as sdkTypes from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load package.json
const __filename = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(__filename), '..');
const packageJsonPath = path.join(packageRoot, 'package.json');
let pkg: { name: string; version: string };
try {
  pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
} catch (error) {
  console.error("Failed to load package.json:", error);
  pkg = { name: "mcp-starter", version: "0.0.0" };
}

// Example tool input schema
const ExampleToolInputSchema = z.object({
  message: z.string().describe('A message to echo back'),
});

async function main() {
  console.log(`Starting ${pkg.name} MCP Server v${pkg.version}...`);

  const server = new Server({
    name: pkg.name,
    version: pkg.version,
  }, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  });

  // Set up request handlers
  server.setRequestHandler(sdkTypes.ListToolsRequestSchema, async () => {
    return {
      tools: [{
        name: 'echo',
        description: 'A simple example tool that echoes back the provided message',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'A message to echo back'
            }
          },
          required: ['message']
        }
      }]
    };
  });

  server.setRequestHandler(sdkTypes.CallToolRequestSchema, async (request) => {
    if (request.params.name === 'echo') {
      const input = ExampleToolInputSchema.parse(request.params.arguments);
      return {
        content: [{
          type: 'text',
          text: `Echo: ${input.message}`
        }]
      };
    }
    throw new sdkTypes.McpError(sdkTypes.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  });

  server.setRequestHandler(sdkTypes.ListResourcesRequestSchema, async () => {
    return {
      resources: [{
        uri: 'config://server',
        name: 'Server Configuration',
        description: 'Get server configuration',
        mimeType: 'application/json'
      }]
    };
  });

  server.setRequestHandler(sdkTypes.ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'config://server') {
      return {
        contents: [{
          uri: 'config://server',
          mimeType: 'application/json',
          text: JSON.stringify({
            name: pkg.name,
            version: pkg.version,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    }
    throw new sdkTypes.McpError(sdkTypes.ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
  });

  server.setRequestHandler(sdkTypes.ListPromptsRequestSchema, async () => {
    return {
      prompts: [{
        name: 'greeting',
        description: 'Generate a greeting message',
        arguments: [{
          name: 'name',
          description: 'Name to greet',
          required: false
        }]
      }]
    };
  });

  server.setRequestHandler(sdkTypes.GetPromptRequestSchema, async (request) => {
    if (request.params.name === 'greeting') {
      const name = request.params.arguments?.name || 'there';
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Hello ${name}! This is an example prompt from ${pkg.name}.`
          }
        }]
      };
    }
    throw new sdkTypes.McpError(sdkTypes.ErrorCode.InvalidRequest, `Unknown prompt: ${request.params.name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log(`Shutting down ${pkg.name} MCP Server...`);
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error in server:', error);
  process.exit(1);
});