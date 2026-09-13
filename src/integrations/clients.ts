/**
 * AI assistants that connect to the Indicate MCP server. Marks are the vendors' official
 * logomarks (see public/clients/README.md for sources and usage terms); a client without a
 * mark renders as a text chip.
 */
export type McpClient = { slug: string; name: string; logo?: string; aliases?: string[] }

export const mcpClients: McpClient[] = [
  { slug: 'claude', name: 'Claude', logo: '/clients/claude.svg', aliases: ['claude desktop', 'claude ai'] },
  { slug: 'chatgpt', name: 'ChatGPT', logo: '/clients/openai.svg', aliases: ['openai'] },
  { slug: 'claude-code', name: 'Claude Code', logo: '/clients/claude-code.svg' },
  { slug: 'langdock', name: 'Langdock', logo: '/clients/langdock.svg' },
  { slug: 'github-copilot', name: 'GitHub Copilot', logo: '/clients/github-copilot.svg', aliases: ['copilot'] },
]

/** Looks a client up by the name entered in the CMS (case-insensitive, aliases included). */
export const findMcpClient = (name: string): McpClient | undefined => {
  const key = name.trim().toLowerCase()
  return mcpClients.find((c) => c.name.toLowerCase() === key || (c.aliases || []).includes(key))
}
