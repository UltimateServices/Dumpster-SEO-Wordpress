import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { anthropicService } from '@/lib/services/anthropic'
import { wordpressService } from '@/lib/services/wordpress'
import {
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateMetaDescription,
  generateSlug,
  generateOpenGraphTags,
} from '@/lib/utils/seo'

/**
 * POST /api/research
 * Create a new research job and generate content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cityId, pageType, topic, neighborhood } = body

    // Validate input
    if (!cityId || !pageType) {
      return NextResponse.json(
        { error: 'Missing required fields: cityId, pageType' },
        { status: 400 }
      )
    }

    // Get city information
    const { data: cityData, error: cityError } = await supabaseAdmin()
      .from('geo_locations')
      .select('*')
      .eq('id', cityId)
      .single()

    if (cityError || !cityData) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    const city = cityData as any

    // Create research job
    const { data: job, error: jobError } = await (supabaseAdmin() as any)
      .from('research_jobs')
      .insert({
        city_id: cityId,
        page_type: pageType,
        topic,
        neighborhood,
        status: 'processing',
      })
      .select()
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Failed to create research job' },
        { status: 500 }
      )
    }

    // Determine target word count and question count based on page type
    const targets = {
      main_city: { words: 8500, questions: 45 },
      topic: { words: 5000, questions: 25 },
      neighborhood: { words: 3500, questions: 18 },
    }

    const target = targets[pageType as keyof typeof targets] || targets.main_city

    // Generate content using Anthropic
    let content
    try {
      content = await anthropicService.generateContent({
        city: city.city,
        state: city.state,
        pageType,
        topic,
        neighborhood,
        targetWordCount: target.words,
        targetQuestionCount: target.questions,
      })

      // Generate SEO enhancements
      const faqSchema = generateFAQSchema(
        content.questions.map((q) => ({
          question: q.question,
          answer: q.answer,
        }))
      )

      const localBusinessSchema = generateLocalBusinessSchema({
        name: `Dumpster Rental ${city.city}`,
        description: content.metaDescription,
        address: {
          streetAddress: '123 Main St', // Replace with actual address
          addressLocality: city.city,
          addressRegion: city.state_abbr,
          postalCode: '00000',
          addressCountry: 'US',
        },
        geo: city.latitude && city.longitude ? {
          latitude: city.latitude,
          longitude: city.longitude,
        } : undefined,
        url: `https://example.com/${generateSlug(city.city, city.state_abbr)}`,
      })

      // Combine content with schema markup
      const enhancedContent = `
        ${content.content}
        ${faqSchema}
        ${localBusinessSchema}
      `

      // Update research job with results
      await (supabaseAdmin() as any)
        .from('research_jobs')
        .update({
          status: 'completed',
          results_json: {
            title: content.title,
            metaDescription: content.metaDescription,
            content: enhancedContent,
            questions: content.questions,
            keywords: content.keywords,
          },
          word_count: content.wordCount,
          questions_count: content.questionsCount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', (job as any).id)

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          status: 'completed',
          wordCount: content.wordCount,
          questionsCount: content.questionsCount,
        },
        content,
      })
    } catch (error: any) {
      // Update job with error
      await (supabaseAdmin() as any)
        .from('research_jobs')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', (job as any).id)

      throw error
    }
  } catch (error: any) {
    console.error('Research job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create research job' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/research
 * List all research jobs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const status = searchParams.get('status')

    let query = supabaseAdmin()
      .from('research_jobs')
      .select('*, geo_locations(city, state, state_abbr)')
      .order('created_at', { ascending: false })

    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ jobs: data })
  } catch (error: any) {
    console.error('Error fetching research jobs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch research jobs' },
      { status: 500 }
    )
  }
}
