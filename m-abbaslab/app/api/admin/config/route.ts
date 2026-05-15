import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

const DATA_PATH = path.join(process.cwd(), 'data', 'personal.json')
const CONFIG_PATH = path.join(process.cwd(), 'config', 'personal.ts')

export async function GET() {
    try {
        const fileContent = await fs.readFile(DATA_PATH, 'utf8')
        return NextResponse.json(JSON.parse(fileContent))
    } catch (error) {
        // If JSON doesn't exist yet, try to read from TS (fallback for first run)
        try {
            // This is complex because we can't easily parse TS here without a loader
            // For now, assume the JSON was created or return a default
            return NextResponse.json({ error: 'Config file not found' }, { status: 404 })
        } catch (e) {
            return NextResponse.json({ error: 'Failed to read configuration' }, { status: 500 })
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        // 1. Save to JSON (Source of truth for Admin)
        await fs.writeFile(DATA_PATH, JSON.stringify(body, null, 2), 'utf8')

        // 2. Save to TS (Source of truth for App/Build)
        const tsContent = `// config/personal.ts - AUTOMATICALLY UPDATED BY ADMIN PANEL\nexport const personalConfig = ${JSON.stringify(body, null, 2)}\n\nexport type PersonalConfig = typeof personalConfig\n`
        await fs.writeFile(CONFIG_PATH, tsContent, 'utf8')

        return NextResponse.json({ success: true, message: 'Configuration saved to project files successfully' })
    } catch (error) {
        console.error('Error writing config:', error)
        return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
    }
}
