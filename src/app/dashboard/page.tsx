import MetricsCard from '@/components/dashboard/MetricsCard'
import Link from 'next/link'

// This would come from your database in production
async function getDashboardMetrics() {
  // Simulated data - replace with actual Supabase queries
  return {
    totalPages: 847,
    totalWords: 4235000,
    citiesCovered: 42,
    pendingJobs: 15,
    recentPublications: [
      {
        id: '1',
        title: 'Dumpster Rental Houston TX - Complete Guide',
        city: 'Houston, TX',
        publishedAt: '2024-01-15',
        wordCount: 8500,
      },
      {
        id: '2',
        title: 'Commercial Dumpster Services Dallas',
        city: 'Dallas, TX',
        publishedAt: '2024-01-14',
        wordCount: 5200,
      },
      {
        id: '3',
        title: 'Residential Dumpster Rental Austin',
        city: 'Austin, TX',
        publishedAt: '2024-01-14',
        wordCount: 4800,
      },
    ],
  }
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor your SEO automation performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Pages Published"
          value={metrics.totalPages.toLocaleString()}
          change="+12% from last month"
          changeType="positive"
          icon="📄"
        />
        <MetricsCard
          title="Total Words Generated"
          value={`${(metrics.totalWords / 1000000).toFixed(1)}M`}
          change="+18% from last month"
          changeType="positive"
          icon="✍️"
          subtitle={`${metrics.totalWords.toLocaleString()} words`}
        />
        <MetricsCard
          title="Cities Covered"
          value={metrics.citiesCovered}
          icon="🏙️"
          subtitle="Across multiple states"
        />
        <MetricsCard
          title="Pending Research Jobs"
          value={metrics.pendingJobs}
          icon="🔬"
          subtitle="Ready to publish"
        />
      </div>

      {/* Recent Publications */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Publications
          </h2>
          <Link
            href="/dashboard/pages"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            View all →
          </Link>
        </div>

        <div className="space-y-4">
          {metrics.recentPublications.map((pub) => (
            <div
              key={pub.id}
              className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 dark:border-gray-700"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {pub.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pub.city} • {pub.wordCount.toLocaleString()} words
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(pub.publishedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/dashboard/research"
          className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary-500 dark:border-gray-600 dark:hover:border-primary-500"
        >
          <div className="text-3xl mb-2">🔬</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            New Research Job
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate content for a new city
          </p>
        </Link>

        <Link
          href="/dashboard/cities"
          className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary-500 dark:border-gray-600 dark:hover:border-primary-500"
        >
          <div className="text-3xl mb-2">🏙️</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Manage Cities
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and prioritize target cities
          </p>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary-500 dark:border-gray-600 dark:hover:border-primary-500"
        >
          <div className="text-3xl mb-2">📈</div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            View Analytics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track performance and rankings
          </p>
        </Link>
      </div>
    </div>
  )
}
