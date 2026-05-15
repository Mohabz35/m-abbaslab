'use client'

import React from 'react'

interface MarkdownRendererProps {
    content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    // Simple regex-based markdown component
    const lines = content.split('\n')

    return (
        <div className="prose prose-invert prose-cyan max-w-none space-y-4">
            {lines.map((line, index) => {
                // Headers
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-4xl font-bold text-white mt-12 mb-6 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">{line.replace('# ', '')}</h1>
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-[#00f0ff] mt-10 mb-4">{line.replace('## ', '')}</h2>
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-bold text-[#7000ff] mt-8 mb-3">{line.replace('### ', '')}</h3>
                }

                // Horizontal Rule
                if (line.trim() === '---' || line.trim() === '________________________________________') {
                    return <hr key={index} className="border-white/10 my-10" />
                }

                // Lists
                if (line.startsWith('- ') || line.startsWith('•\t') || line.startsWith('• ')) {
                    const text = line.replace(/^(- |•\t|• )/, '')
                    return (
                        <li key={index} className="ml-6 text-gray-300 list-disc">
                            {parseInlineMarkdown(text)}
                        </li>
                    )
                }

                // Ordered Lists
                if (/^\d+\.\s/.test(line)) {
                    const text = line.replace(/^\d+\.\s/, '')
                    return (
                        <li key={index} className="ml-6 text-gray-300 list-decimal">
                            {parseInlineMarkdown(text)}
                        </li>
                    )
                }

                // Empty lines
                if (line.trim() === '') {
                    return <div key={index} className="h-2" />
                }

                // Tables (very basic support)
                if (line.includes('|')) {
                    // Check if it's the divider line | :--- | :--- |
                    if (line.includes('---')) return null;

                    const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
                    return (
                        <div key={index} className="flex border-b border-white/5 py-2">
                            {cells.map((cell, i) => (
                                <div key={i} className={`flex-1 text-sm ${i === 0 ? 'font-bold text-white' : 'text-gray-400'}`}>
                                    {parseInlineMarkdown(cell)}
                                </div>
                            ))}
                        </div>
                    )
                }

                // Default paragraph
                return (
                    <p key={index} className="text-gray-400 leading-relaxed">
                        {parseInlineMarkdown(line)}
                    </p>
                )
            })}
        </div>
    )
}

function parseInlineMarkdown(text: string) {
    // Simple inline replacements for bold, italic, code
    let parts: (string | React.ReactNode)[] = [text]

    // Bold
    parts = parts.flatMap((part, i) => {
        if (typeof part !== 'string') return part
        const subParts = part.split(/(\*\*.*?\*\*)/)
        return subParts.map((sp, j) => {
            if (sp.startsWith('**') && sp.endsWith('**')) {
                return <strong key={`bold-${i}-${j}`} className="text-white font-bold">{sp.slice(2, -2)}</strong>
            }
            return sp
        })
    })

    // Code
    parts = parts.flatMap((part, i) => {
        if (typeof part !== 'string') return part
        const subParts = part.split(/(`.*?`)/)
        return subParts.map((sp, j) => {
            if (sp.startsWith('`') && sp.endsWith('`')) {
                return <code key={`code-${i}-${j}`} className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-[#00f0ff]">{sp.slice(1, -1)}</code>
            }
            return sp
        })
    })

    return parts
}
