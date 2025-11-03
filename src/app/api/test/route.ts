import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { wordpressService } from '@/lib/services/wordpress'

/**
 * GET /api/test
 * Test connections to all services
 */
export async function GET() {
  const results = {
    supabase: false,
    wordpress: false,
    anthropic: false,
  }

  const errors: string[] = []

  // Test Supabase
  try {
    const { error } = await supabase.from('geo_locations').select('id').limit(1)
    results.supabase = !error
    if (error) errors.push(`Supabase: ${error.message}`)
  } catch (error: any) {
    errors.push(`Supabase: ${error.message}`)
  }

  // Test WordPress
  try {
    results.wordpress = await wordpressService.testConnection()
    if (!results.wordpress) errors.push('WordPress: Connection failed')
  } catch (error: any) {
    errors.push(`WordPress: ${error.message}`)
  }

  // Test Anthropic
  try {
    results.anthropic = !!process.env.ANTHROPIC_API_KEY
    if (!results.anthropic) errors.push('Anthropic: API key not configured')
  } catch (error: any) {
    errors.push(`Anthropic: ${error.message}`)
  }

  const allOk = results.supabase && results.wordpress && results.anthropic

  return NextResponse.json({
    success: allOk,
    services: results,
    errors: errors.length > 0 ? errors : undefined,
  }, {
    status: allOk ? 200 : 500,
  })
}
