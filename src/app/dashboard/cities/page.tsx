'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Table from '@/components/ui/Table'
import Link from 'next/link'

export default function CitiesPage() {
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('geo_locations')
        .select('*')
        .order('priority_rank', { ascending: true })

      if (!error && data) {
        // Fetch stats for each city
        const citiesWithStats = await Promise.all(
          data.map(async (city: any) => {
            const [researchJobs, publishedPages] = await Promise.all([
              supabase
                .from('research_jobs')
                .select('id, status')
                .eq('city_id', city.id),
              supabase
                .from('wordpress_pages')
                .select('id')
                .eq('city_id', city.id),
            ])

            return {
              ...city,
              totalJobs: researchJobs.data?.length || 0,
              completedJobs: researchJobs.data?.filter((j: any) => j.status === 'completed').length || 0,
              publishedPages: publishedPages.data?.length || 0,
            }
          })
        )
        setCities(citiesWithStats)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const columns = [
    {
      header: 'Rank',
      accessor: 'priority_rank' as const,
      className: 'font-medium',
    },
    {
      header: 'City',
      accessor: (row: any) => (
        <div>
          <div className="font-medium">{row.city}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.county ? `${row.county} County, ` : ''}{row.state_abbr}
          </div>
        </div>
      ),
    },
    {
      header: 'Population',
      accessor: (row: any) => row.population?.toLocaleString() || 'N/A',
    },
    {
      header: 'Research Jobs',
      accessor: (row: any) => (
        <div>
          <div>{row.completedJobs} / {row.totalJobs}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            completed
          </div>
        </div>
      ),
    },
    {
      header: 'Published Pages',
      accessor: 'publishedPages' as const,
    },
    {
      header: 'Coverage',
      accessor: (row: any) => {
        const percentage = row.totalJobs > 0
          ? Math.round((row.completedJobs / row.totalJobs) * 100)
          : 0
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium">{percentage}%</span>
          </div>
        )
      },
      className: 'min-w-[150px]',
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Link
            href={`/dashboard/research?city=${row.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Research
          </Link>
          <Link
            href={`/dashboard/cities/${row.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            View
          </Link>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading cities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cities
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage target cities and track content coverage
          </p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Add City
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Table
          data={cities}
          columns={columns}
          emptyMessage="No cities found. Add your first city to get started."
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {cities.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Cities
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {cities.reduce((sum, city) => sum + (city.publishedPages || 0), 0)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Published Pages
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {cities.reduce((sum, city) => sum + (city.population || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Population Covered
          </div>
        </div>
      </div>
    </div>
  )
}
