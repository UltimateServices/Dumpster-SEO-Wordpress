'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Table from '@/components/ui/Table'

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPages() {
      const { data, error } = await supabase
        .from('wordpress_pages')
        .select('*, geo_locations(city, state, state_abbr)')
        .order('published_at', { ascending: false })

      if (!error && data) {
        setPages(data)
      }
      setLoading(false)
    }

    fetchPages()
  }, [])

  const columns = [
    {
      header: 'Title',
      accessor: (row: any) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.geo_locations?.city}, {row.geo_locations?.state_abbr}
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
      header: 'Topic',
      accessor: (row: any) => row.topic || row.neighborhood || '-',
    },
    {
      header: 'Status',
      accessor: (row: any) => {
        const statusColors = {
          publish: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.status as keyof typeof statusColors]}`}>
            {row.status}
          </span>
        )
      },
    },
    {
      header: 'WP Post ID',
      accessor: 'wp_post_id',
    },
    {
      header: 'Published',
      accessor: (row: any) => row.published_at ? new Date(row.published_at).toLocaleDateString() : '-',
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            View
          </a>
          <button
            className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 font-medium"
            onClick={() => alert('Edit functionality coming soon!')}
          >
            Edit
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading published pages...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Published Pages
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your WordPress published content
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Table
          data={pages}
          columns={columns}
          emptyMessage="No published pages found. Publish your first research job to get started."
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {pages.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Pages
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {pages.filter((p: any) => p.status === 'publish').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Published
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {pages.filter((p: any) => p.page_type === 'main_city').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Main City Pages
          </div>
        </div>
      </div>
    </div>
  )
}
