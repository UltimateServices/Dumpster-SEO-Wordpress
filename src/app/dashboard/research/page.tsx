'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Table from '@/components/ui/Table'

export default function ResearchPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('research_jobs')
        .select('*, geo_locations(city, state, state_abbr)')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setJobs(data)
      }
      setLoading(false)
    }

    fetchJobs()
  }, [])

  const columns = [
    {
      header: 'City',
      accessor: (row: any) => (
        <div>
          <div className="font-medium">{row.geo_locations?.city}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.geo_locations?.state_abbr}
          </div>
        </div>
      ),
    },
    {
      header: 'Page Type',
      accessor: (row: any) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {row.page_type}
        </span>
      ),
    },
    {
      header: 'Topic/Neighborhood',
      accessor: (row: any) => row.topic || row.neighborhood || '-',
    },
    {
      header: 'Status',
      accessor: (row: any) => {
        const statusColors = {
          pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.status as keyof typeof statusColors]}`}>
            {row.status}
          </span>
        )
      },
    },
    {
      header: 'Word Count',
      accessor: (row: any) => row.word_count?.toLocaleString() || '-',
    },
    {
      header: 'Questions',
      accessor: 'questions_count',
    },
    {
      header: 'Created',
      accessor: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          {row.status === 'completed' && (
            <button
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              onClick={() => alert('Publish functionality coming soon!')}
            >
              Publish
            </button>
          )}
          <button
            className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 font-medium"
            onClick={() => alert('View functionality coming soon!')}
          >
            View
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading research jobs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Research Jobs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate and manage AI-powered content research
          </p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          New Research Job
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Table
          data={jobs}
          columns={columns}
          emptyMessage="No research jobs found. Create your first research job to get started."
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobs.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Jobs
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobs.filter((j: any) => j.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Completed
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobs.filter((j: any) => j.status === 'processing').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Processing
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobs.reduce((sum, j) => sum + (j.word_count || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Words Generated
          </div>
        </div>
      </div>
    </div>
  )
}
