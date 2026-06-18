import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CRON_SECRET = process.env.CRON_SECRET || 'm-abbas-lab-cron-secret-2024'

const WISDOM_QUOTES = [
  { author: 'Marcus Aurelius', book: 'Meditations', quote: 'The happiness of your life depends upon the quality of your thoughts.', category: 'philosophy' },
  { author: 'James Clear', book: 'Atomic Habits', quote: 'Every action you take is a vote for the type of person you wish to become.', category: 'habits' },
  { author: 'Napoleon Hill', book: 'Think and Grow Rich', quote: 'Whatever the mind can conceive and believe, it can achieve.', category: 'mindset' },
  { author: 'Seneca', book: 'Letters from a Stoic', quote: 'It is not that we have a short time to live, but that we waste a great deal of it.', category: 'philosophy' },
  { author: 'Peter Drucker', book: 'The Effective Executive', quote: 'Efficiency is doing things right; effectiveness is doing the right things.', category: 'productivity' },
  { author: 'Robert Greene', book: 'The 48 Laws of Power', quote: 'Never waste valuable time or mental peace on the affairs of others.', category: 'strategy' },
  { author: 'Jordan Peterson', book: '12 Rules for Life', quote: 'Compare yourself to who you were yesterday, not to who someone else is today.', category: 'growth' },
  { author: 'Ray Dalio', book: 'Principles', quote: 'Pain + Reflection = Progress.', category: 'finance' },
  { author: 'Charlie Munger', book: 'Poor Charlie\'s Almanack', quote: 'Invert, always invert. Turn a situation or problem upside down.', category: 'finance' },
  { author: 'Epictetus', book: 'Discourses', quote: 'It\'s not what happens to you, but how you react to it that matters.', category: 'philosophy' },
  { author: 'Warren Buffett', book: 'The Essays of Warren Buffett', quote: 'The stock market is a device for transferring money from the impatient to the patient.', category: 'finance' },
  { author: 'Viktor Frankl', book: 'Man\'s Search for Meaning', quote: 'When we are no longer able to change a situation, we are challenged to change ourselves.', category: 'philosophy' },
  { author: 'Bruce Lee', book: 'Tao of Jeet Kune Do', quote: 'Absorb what is useful, discard what is useless, and add what is specifically your own.', category: 'growth' },
  { author: 'Steve Jobs', book: 'Stanford Speech', quote: 'Your time is limited, don\'t waste it living someone else\'s life.', category: 'mindset' },
  { author: 'Albert Einstein', book: 'Ideas and Opinions', quote: 'Life is like riding a bicycle. To keep your balance, you must keep moving.', category: 'growth' },
]

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Select a quote for today based on the day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const quoteIndex = dayOfYear % WISDOM_QUOTES.length
    const dailyQuote = WISDOM_QUOTES[quoteIndex]

    // Store in Supabase
    await supabase.from('site_config').upsert({
      id: 'daily_wisdom',
      config_data: {
        quote: dailyQuote.quote,
        author: dailyQuote.author,
        book: dailyQuote.book,
        category: dailyQuote.category,
        date: new Date().toISOString().split('T')[0]
      }
    }, { onConflict: 'id' })

    console.log(`[CRON] Daily wisdom set: "${dailyQuote.quote}" — ${dailyQuote.author}`)

    return NextResponse.json({
      success: true,
      quote: dailyQuote
    })
  } catch (error: any) {
    console.error('[CRON] Daily wisdom error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
