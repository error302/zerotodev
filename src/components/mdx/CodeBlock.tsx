'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border/30 bg-[#1a1a24]">
      {(filename || language) && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d14] border-b border-border/30">
          <div className="flex items-center gap-2">
            {filename && <span className="text-xs text-muted-foreground font-mono">{filename}</span>}
            {language && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {language}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language || 'text'} text-sm font-mono`}>{code}</code>
      </pre>
    </div>
  )
}
