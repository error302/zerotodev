'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useEffect, useState } from 'react'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.min.css'

interface LessonRendererProps {
  content: string
}

export default function LessonRenderer({ content }: LessonRendererProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)

  useEffect(() => {
    serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      },
    }).then(setMdxSource)
  }, [content])

  if (!mdxSource) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none prose-code:bg-[#1a1a24] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-emerald-400 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#1a1a24] prose-pre:border prose-pre:border-border/30 prose-headings:text-white prose-strong:text-white prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-li:text-muted-foreground">
      <MDXRemote {...mdxSource} />
    </div>
  )
}
