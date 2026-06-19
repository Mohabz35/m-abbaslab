import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

async function isAuthorized(request: any): Promise<boolean> {
  const header = request.headers?.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies?.get('admin_session')
  if (!session?.value) return false
  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const formData = await request.formData()
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
