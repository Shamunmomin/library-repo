import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { subscriptionService } from '../../services/subscriptionService'
import type { AdminDashboardStats, Subscription } from '../../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6']

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      subscriptionService.getMySubscription(),
      adminService.getSubscriptions(),
    ]).then(([s, , subs]) => {
      setStats(s)
      setSubscriptions(subs)
    }).catch(() => toast.error('Failed to load dashboard'))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load data</div>

  const subData = [
    { name: 'Active', value: stats.activeSubscriptions },
    { name: 'Expired', value: stats.expiredSubscriptions },
    { name: 'Pending', value: stats.pendingRequests },
  ].filter(d => d.value > 0)

  const libData = [
    { name: 'Libraries', value: stats.totalLibraries },
    { name: 'Owners', value: stats.totalOwners },
  ]

  const pendingSubs = subscriptions.filter(s => s.status === 'PENDING').slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Libraries" value={stats.totalLibraries} color="bg-blue-500" />
        <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} color="bg-green-500" />
        <StatCard label="Expired" value={stats.expiredSubscriptions} color="bg-red-500" />
        <StatCard label="Total Owners" value={stats.totalOwners} color="bg-purple-500" />
        <StatCard label="Pending Requests" value={stats.pendingRequests} color="bg-orange-500" />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-white text-lg font-bold">
              Rs.
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Rs.{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={libData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Subscription Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={subData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {subData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Pending Subscription Requests</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Latest 5</span>
        </div>
        {pendingSubs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No pending requests</p>
        ) : (
          <div className="space-y-2">
            {pendingSubs.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.packageType} Plan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white text-lg font-bold`}>
          {value}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}
