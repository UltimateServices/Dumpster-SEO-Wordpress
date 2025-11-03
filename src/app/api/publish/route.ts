import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { wordpressService } from '@/lib/services/wordpress'
import { generateSlug } from '@/lib/utils/seo'

/**
 * POST /api/publish
 * Publish a research job to WordPress
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { researchJobId } = body

    if (!researchJobId) {
      return NextResponse.json(
        { error: 'Missing required field: researchJobId' },
        { status: 400 }
      )
    }

    // Get research job with city information
    const { data: job, error: jobError } = await supabaseAdmin()
      .from('research_jobs')
      .select('*, geo_locations(*)')
      .eq('id', researchJobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Research job not found' },
        { status: 404 }
      )
    }

    if ((job as any).status !== 'completed') {
      return NextResponse.json(
        { error: 'Research job is not completed' },
        { status: 400 }
      )
    }

    if (!(job as any).results_json) {
      return NextResponse.json(
        { error: 'Research job has no content' },
        { status: 400 }
      )
    }

    const results = (job as any).results_json
    const city = (job as any).geo_locations

    // Generate slug
    const slugParts = [city.city, city.state_abbr]
    if ((job as any).topic) slugParts.push((job as any).topic)
    if ((job as any).neighborhood) slugParts.push((job as any).neighborhood)
    const slug = generateSlug(...slugParts)

    // Check if parent page exists (for topic and neighborhood pages)
    let parentId: number | undefined
    if ((job as any).page_type !== 'main_city') {
      const parentSlug = generateSlug(city.city, city.state_abbr)
      const parentPage = await wordpressService.getPageBySlug(parentSlug)
      parentId = parentPage?.id
    }

    // Publish to WordPress
    const wpPage = await wordpressService.createPage({
      title: results.title,
      content: results.content,
      slug,
      status: 'publish',
      metaDescription: results.metaDescription,
      focusKeyword: results.keywords?.[0],
      excerpt: results.metaDescription,
      parentId,
    })

    // Save WordPress page record
    const jobData = job as any
    const { data: pageRecord, error: pageError } = await (supabaseAdmin() as any)
      .from('wordpress_pages')
      .insert({
        city_id: jobData.city_id,
        research_job_id: jobData.id,
        wp_post_id: wpPage.id,
        url: wpPage.link,
        page_type: jobData.page_type,
        topic: jobData.topic,
        neighborhood: jobData.neighborhood,
        title: results.title,
        slug: wpPage.slug,
        parent_post_id: parentId || null,
        status: 'publish',
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (pageError) {
      console.error('Error saving page record:', pageError)
      // Page was published, but we couldn't save the record
      return NextResponse.json({
        success: true,
        warning: 'Page published but record not saved',
        wpPage,
      })
    }

    return NextResponse.json({
      success: true,
      wpPage,
      pageRecord,
    })
  } catch (error: any) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish page' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/publish/bulk
 * Bulk publish multiple research jobs
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { researchJobIds } = body

    if (!Array.isArray(researchJobIds) || researchJobIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty researchJobIds array' },
        { status: 400 }
      )
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    }

    // Process each job sequentially to avoid rate limits
    for (const jobId of researchJobIds) {
      try {
        const response = await fetch(
          `${request.nextUrl.origin}/api/publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ researchJobId: jobId }),
          }
        )

        if (response.ok) {
          results.success.push(jobId)
        } else {
          const error = await response.json()
          results.failed.push({ id: jobId, error: error.error })
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error: any) {
        results.failed.push({ id: jobId, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: researchJobIds.length,
        succeeded: results.success.length,
        failed: results.failed.length,
      },
    })
  } catch (error: any) {
    console.error('Bulk publish error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bulk publish' },
      { status: 500 }
    )
  }
}
