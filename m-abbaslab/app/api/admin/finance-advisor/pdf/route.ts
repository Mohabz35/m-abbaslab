import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    const MAX_PDF_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ success: false, error: 'PDF must be under 5MB. Current size: ' + (file.size / 1024 / 1024).toFixed(1) + 'MB' }, { status: 400 })
    }

    // @ts-ignore
    const pdfParse = require('pdf-parse')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const data = await pdfParse(buffer)

    return NextResponse.json({ success: true, text: data.text })
  } catch (error: any) {
    console.error('PDF Parse Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to parse PDF file. Ensure it is a valid PDF document.' }, { status: 500 })
  }
}
