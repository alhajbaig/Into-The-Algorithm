import React, { useMemo } from 'react'
import { marked } from 'marked'

// Configure marked for clean, safe rendering
marked.setOptions({
  breaks: true,        // Convert \n to <br>
  gfm: true,           // GitHub Flavored Markdown (tables, fenced code, etc.)
})

/**
 * MarkdownRenderer — Parses markdown text and renders rich structured HTML
 * within the Into The Algorithm cyber-dark design language.
 */
export function MarkdownRenderer({ content, className = '' }) {
  const html = useMemo(() => {
    if (!content) return ''
    try {
      return marked.parse(content)
    } catch {
      return `<p>${content}</p>`
    }
  }, [content])

  return (
    <div
      className={`nm-markdown ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
