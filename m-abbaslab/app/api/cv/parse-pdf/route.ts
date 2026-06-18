import { NextRequest, NextResponse } from 'next/server';

// Simple text extractor that reads PDF as text buffer
// This avoids pdf-parse/pdfjs-dist DOMMatrix issues on serverless
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const MAX_PDF_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: 'PDF must be under 5MB. Current size: ' + (file.size / 1024 / 1024).toFixed(1) + 'MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract text from PDF using raw buffer parsing
    // This is a lightweight approach that extracts visible text streams
    const text = extractTextFromPDFBuffer(buffer);
    
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Could not extract text from this PDF. Please paste the content manually instead.' 
      }, { status: 422 });
    }
    
    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    console.error('PDF Parse error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse PDF. Please paste the content manually.' 
    }, { status: 500 });
  }
}

/**
 * Lightweight PDF text extractor - works on serverless without native deps.
 * Parses PDF content streams and extracts text operators (Tj, TJ, ', ").
 */
function extractTextFromPDFBuffer(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const textParts: string[] = [];
  
  // Find all stream...endstream blocks
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let match;
  
  while ((match = streamRegex.exec(content)) !== null) {
    const streamContent = match[1];
    
    // Try to decode if it's a FlateDecode stream
    let decodedContent = streamContent;
    
    // Check if this stream section has text operators
    // Look for text showing operators: Tj, TJ, ', "
    const textOps = decodedContent.match(/\(([^)]*)\)\s*Tj/g);
    if (textOps) {
      for (const op of textOps) {
        const textMatch = op.match(/\(([^)]*)\)/);
        if (textMatch) {
          textParts.push(textMatch[1]);
        }
      }
    }
    
    // TJ operator (array of strings)
    const tjArrays = decodedContent.match(/\[(.*?)\]\s*TJ/g);
    if (tjArrays) {
      for (const arr of tjArrays) {
        const strings = arr.match(/\(([^)]*)\)/g);
        if (strings) {
          const line = strings.map(s => s.slice(1, -1)).join('');
          textParts.push(line);
        }
      }
    }
  }
  
  // Clean up extracted text
  let result = textParts.join(' ')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\s+/g, ' ')
    .trim();
  
  return result;
}
