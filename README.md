# MCP Starter

A minimal starter template for building MCP (Model Context Protocol) servers in TypeScript.

## Overview

This template provides a basic structure for creating MCP servers with:
- TypeScript support with modern ES modules
- Basic MCP server setup with example tool, resource, and prompt
- Development workflow with hot reloading
- ESLint and Prettier configuration
- Proper error handling and graceful shutdown

## Quick Start

1. Clone this repository:
```bash
git clone https://github.com/drunknbass/mcp-starter.git my-mcp-server
cd my-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Start development:
```bash
npm run dev
```

## Project Structure

```
mcp-starter/
├── src/
│   └── server.ts      # Main server implementation
├── package.json       # Project configuration
├── tsconfig.json      # TypeScript configuration
├── eslint.config.js   # ESLint configuration
└── README.md          # This file
```

## Development

### Available Scripts

- `npm run dev` - Start the server in development mode with hot reloading
- `npm run build` - Build the TypeScript code
- `npm start` - Run the built server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Customizing the Server

The template includes example implementations of:

1. **Tool**: An `echo` tool that demonstrates basic tool creation
2. **Resource**: A `/config` resource that returns server configuration
3. **Prompt**: A `greeting` prompt that generates personalized messages

Replace these examples with your own implementations in `src/server.ts`.

## MCP Client Configuration

To use your server with an MCP client, add it to your client's configuration:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/your/server/dist/server.js"]
    }
  }
}
```

For development, you can use:

```json
{
  "mcpServers": {
    "my-server-dev": {
      "command": "npx",
      "args": ["tsx", "/path/to/your/server/src/server.ts"]
    }
  }
}
```

## Building Your MCP Server

1. Define your tools, resources, and prompts in `src/server.ts`
2. Use the `z` (Zod) library for input validation
3. Handle errors appropriately using MCP error types
4. Test your server with an MCP client

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)

## License

MIT