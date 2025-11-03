'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      const [cities, jobs, pages, keywords] = await Promise.all([
        supabase.from('geo_locations').select('id, city, state_abbr, population'),
        supabase.from('research_jobs').select('id, status, word_count, created_at'),
        supabase.from('wordpress_pages').select('id, status, published_at'),
        supabase.from('keywords').select('id, search_volume, current_rank'),
      ])

      setStats({
        cities: cities.data || [],
        jobs: jobs.data || [],
        pages: pages.data || [],
        keywords: keywords.data || [],
      })
      setLoading(false)
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  const totalPages = stats.pages.length
  const publishedPages = stats.pages.filter((p: any) => p.status === 'publish').length
  const totalWords = stats.jobs.reduce((sum: number, j: any) => sum + (j.word_count || 0), 0)
  const completedJobs = stats.jobs.filter((j: any) => j.status === 'completed').length
  const topRankings = stats.keywords.filter((k: any) => k.current_rank && k.current_rank <= 10).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Performance metrics and insights for your SEO automation
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Pages
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalPages}
              </p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                {publishedPages} published
              </p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Words
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {(totalWords / 1000000).toFixed(1)}M
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {totalWords.toLocaleString()} words
              </p>
            </div>
            <div className="text-4xl">✍️</div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Research Jobs
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.jobs.length}
              </p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                {completedJobs} completed
              </p>
            </div>
            <div className="text-4xl">🔬</div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Top 10 Rankings
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {topRankings}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                keywords
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
      </div>

      {/* Top Cities by Coverage */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Cities by Coverage
        </h2>
        <div className="space-y-3">
          {stats.cities.slice(0, 5).map((city: any) => {
            const cityPages = stats.pages.filter((p: any) => p.city_id === city.id).length
            return (
              <div key={city.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {city.city}, {city.state_abbr}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {city.population?.toLocaleString()} population
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {cityPages} pages
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {stats.jobs.slice(0, 10).map((job: any) => (
            <div key={job.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔬</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Research Job
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {job.word_count?.toLocaleString() || 0} words
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
