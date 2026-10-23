import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'Aruct MCP Server',
    version: '1.0.0',
    description: 'Model Context Protocol server for Aruct Editor scene management',
    endpoints: {
      track: '/api/mcp/track',
    },
  })
}
