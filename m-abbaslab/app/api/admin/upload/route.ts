import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure the public/uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        try {
            await fs.access(uploadDir)
        } catch {
            await fs.mkdir(uploadDir, { recursive: true })
        }

        // Clean filename and write to disk
        const cleanFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const filePath = path.join(uploadDir, cleanFilename)
        await fs.writeFile(filePath, buffer)

        // Return the public URL
        const publicUrl = `/uploads/${cleanFilename}`

        return NextResponse.json({ success: true, url: publicUrl, filename: cleanFilename })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
