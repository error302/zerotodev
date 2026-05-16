export function extractFrontmatter(source: string): Record<string, string> {
  const match = source.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const lines = match[1].split('\n')
  const fm: Record<string, string> = {}
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim()
      fm[key] = value
    }
  }
  return fm
}
