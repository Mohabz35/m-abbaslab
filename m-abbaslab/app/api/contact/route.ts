// app/api/contact/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, subject, message } = body

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Email validation
        if (!email.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        // Check if API key is configured
        console.log('Environment check:', {
            hasKey: !!process.env.WEB3FORMS_ACCESS_KEY,
            keyPrefix: process.env.WEB3FORMS_ACCESS_KEY ? `${process.env.WEB3FORMS_ACCESS_KEY.substring(0, 4)}...` : 'none'
        })

        if (!process.env.WEB3FORMS_ACCESS_KEY) {
            console.error('WEB3FORMS_ACCESS_KEY is not configured in process.env')
            return NextResponse.json(
                { error: 'Email service not configured. Please ensure .env.local contains WEB3FORMS_ACCESS_KEY and restart the server.' },
                { status: 500 }
            )
        }

        console.log('Sending email via Web3Forms...')

        // Send via Web3Forms
        const web3FormsResponse = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: process.env.WEB3FORMS_ACCESS_KEY,
                name: name,
                email: email,
                subject: subject || 'New Contact Form Submission from M-AbbasLab',
                message: message,
            }),
        })

        const contentType = web3FormsResponse.headers.get('content-type')
        const rawBody = await web3FormsResponse.text()

        console.log('Web3Forms Status:', web3FormsResponse.status)
        console.log('Web3Forms Content-Type:', contentType)

        let result
        try {
            result = JSON.parse(rawBody)
        } catch (e) {
            console.error('Failed to parse Web3Forms response as JSON. Raw body:', rawBody.substring(0, 500))
            return NextResponse.json(
                { error: 'Email service returned an invalid response format. Check server logs for details.' },
                { status: 502 }
            )
        }

        if (result.success) {
            return NextResponse.json(
                { success: true, message: 'Email sent successfully!' },
                { status: 200 }
            )
        } else {
            console.error('Web3Forms reported failure:', result)
            return NextResponse.json(
                { error: result.message || 'Failed to send email' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send message. Please try again.' },
            { status: 500 }
        )
    }
}
