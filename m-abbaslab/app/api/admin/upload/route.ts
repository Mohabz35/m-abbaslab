import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert buffer to base64 Data URI for Cloudinary
    const mimeType = file.type || 'image/jpeg'
    const base64File = `data:${mimeType};base64,${buffer.toString('base64')}`

    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(base64File, {
      folder: 'm_abbaslab_media',
      resource_type: 'auto', // Auto-detect image vs video
    })

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url, 
      filename: result.original_filename || file.name 
    })
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error)
    return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 })
  }
}
