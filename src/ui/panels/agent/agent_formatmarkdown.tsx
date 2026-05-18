/**
 * Simple markdown formatter for agent messages
 * Supports: **bold**, *italic*, `code`, line breaks
 */
export function formatMarkdown(text: string): React.JSX.Element {
  const parts: React.JSX.Element[] = []
  let keyCounter = 0
  
  // Split by line breaks first
  const lines = text.split("\n")
  
  lines.forEach((line, lineIdx) => {
    // Check for headings at the start of a line
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = headingMatch[2]
      
      // Create heading element based on level
      if (level === 1) {
        parts.push(<h1 key={`h1-${keyCounter++}`}>{content}</h1>)
      } else if (level === 2) {
        parts.push(<h2 key={`h2-${keyCounter++}`}>{content}</h2>)
      } else if (level === 3) {
        parts.push(<h3 key={`h3-${keyCounter++}`}>{content}</h3>)
      } else if (level === 4) {
        parts.push(<h4 key={`h4-${keyCounter++}`}>{content}</h4>)
      } else if (level === 5) {
        parts.push(<h5 key={`h5-${keyCounter++}`}>{content}</h5>)
      } else {
        parts.push(<h6 key={`h6-${keyCounter++}`}>{content}</h6>)
      }
      
      // Add line break after heading unless it's the last line
      if (lineIdx < lines.length - 1) {
        parts.push(<br key={`br-${keyCounter++}`} />)
      }
      return
    }
    
    let remaining = line
    let lineKey = 0
    
    while (remaining.length > 0) {
      // Match [text](url) links
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        parts.push(
          <a 
            key={`${keyCounter++}-${lineKey++}`} 
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        )
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }
      
      // Match plain URLs (http:// or https://)
      const urlMatch = remaining.match(/^(https?:\/\/[^\s<>"{}|\\^`[\]]+)/)
      if (urlMatch) {
        parts.push(
          <a 
            key={`${keyCounter++}-${lineKey++}`} 
            href={urlMatch[1]} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {urlMatch[1]}
          </a>
        )
        remaining = remaining.slice(urlMatch[0].length)
        continue
      }
      
      // Match **bold**
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
      if (boldMatch) {
        parts.push(<strong key={`${keyCounter++}-${lineKey++}`}>{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }
      
      // Match *italic*
      const italicMatch = remaining.match(/^\*(.+?)\*/)
      if (italicMatch) {
        parts.push(<em key={`${keyCounter++}-${lineKey++}`}>{italicMatch[1]}</em>)
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }
      
      // Match `code`
      const codeMatch = remaining.match(/^`(.+?)`/)
      if (codeMatch) {
        parts.push(<code key={`${keyCounter++}-${lineKey++}`}>{codeMatch[1]}</code>)
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }
      
      // Match plain text until next special character
      const plainMatch = remaining.match(/^([^*`[h]+)/)
      if (plainMatch) {
        parts.push(<span key={`${keyCounter++}-${lineKey++}`}>{plainMatch[1]}</span>)
        remaining = remaining.slice(plainMatch[0].length)
        continue
      }
      
      // Single character (unmatched special char)
      parts.push(<span key={`${keyCounter++}-${lineKey++}`}>{remaining[0]}</span>)
      remaining = remaining.slice(1)
    }
    
    // Add line break after each line except the last
    if (lineIdx < lines.length - 1) {
      parts.push(<br key={`br-${keyCounter++}`} />)
    }
  })
  
  return <>{parts}</>
}

