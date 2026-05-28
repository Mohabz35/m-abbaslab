import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const data = await pdfParse(buffer)

    return NextResponse.json({ success: true, text: data.text })
  } catch (error: any) {
    console.error('PDF Parse Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to parse PDF file. Ensure it is a valid PDF document.' }, { status: 500 })
  }
}
