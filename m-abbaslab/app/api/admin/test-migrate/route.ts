import { NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function POST() {
  try {
    if (!hasSupabaseKeys) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    
    // Test 1: Simple query
    const { data: test1, error: err1 } = await supabase.from('fashion_items').select('id').limit(1)
    console.log('Test 1:', test1, err1)
    
    // Test 2: Insert
    const { data: test2, error: err2 } = await supabase.from('fashion_items').insert([{
      title: 'Test Item',
      category: 'test',
      status: 'design',
    }]).select()
    console.log('Test 2:', test2, err2)
    
    // Test 3: site_config
    const { data: test3, error: err3 } = await supabase.from('site_config').upsert({
      key: 'test_key',
      value: { test: 'value' }
    }, { onConflict: 'key' }).select()
    console.log('Test 3:', test3, err3)
    
    return NextResponse.json({ 
      success: true, 
      test1: !!test1,
      test2: !!test2,
      test3: !!test3,
      err1: err1?.message,
      err2: err2?.message,
      err3: err3?.message
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack }, { status: 500 })
  }
}