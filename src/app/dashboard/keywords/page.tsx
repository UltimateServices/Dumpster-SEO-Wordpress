'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Table from '@/components/ui/Table'

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKeywords() {
      const { data, error } = await supabase
        .from('keywords')
        .select('*, geo_locations(city, state, state_abbr)')
        .order('search_volume', { ascending: false })

      if (!error && data) {
        setKeywords(data)
      }
      setLoading(false)
    }

    fetchKeywords()
  }, [])

  const columns = [
    {
      header: 'Keyword',
      accessor: (row: any) => (
        <div>
          <div className="font-medium">{row.keyword}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.geo_locations?.city}, {row.geo_locations?.state_abbr}
          </div>
        </div>
      ),
    },
    {
      header: 'Search Volume',
      accessor: (row: any) => row.search_volume?.toLocaleString() || '-',
    },
    {
      header: 'Difficulty',
      accessor: (row: any) => {
        const difficulty = row.difficulty || 0
        const color = difficulty < 30 ? 'text-green-600' : difficulty < 60 ? 'text-yellow-600' : 'text-red-600'
        return <span className={`font-medium ${color}`}>{difficulty}</span>
      },
    },
    {
      header: 'Current Rank',
      accessor: (row: any) => {
        const rank = row.current_rank
        if (!rank) return <span className="text-gray-400">-</span>
        const color = rank <= 3 ? 'text-green-600' : rank <= 10 ? 'text-blue-600' : rank <= 20 ? 'text-yellow-600' : 'text-gray-600'
        return <span className={`font-medium ${color}`}>#{rank}</span>
      },
    },
    {
      header: 'Target Rank',
      accessor: (row: any) => `#${row.target_rank || 1}`,
    },
    {
      header: 'Last Checked',
      accessor: (row: any) => row.last_checked ? new Date(row.last_checked).toLocaleDateString() : 'Never',
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <button
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            onClick={() => alert('Check rank functionality coming soon!')}
          >
            Check Rank
          </button>
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
        <div className="text-gray-500">Loading keywords...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Keywords
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage target keywords for SEO optimization
          </p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Add Keyword
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Table
          data={keywords}
          columns={columns}
          emptyMessage="No keywords found. Add keywords to start tracking your SEO performance."
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {keywords.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Keywords
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {keywords.filter((k: any) => k.current_rank && k.current_rank <= 10).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Top 10 Rankings
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {keywords.reduce((sum, k) => sum + (k.search_volume || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Search Volume
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {keywords.filter((k: any) => k.current_rank && k.current_rank <= 3).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Top 3 Rankings
          </div>
        </div>
      </div>
    </div>
  )
}
