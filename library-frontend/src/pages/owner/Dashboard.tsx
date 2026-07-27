import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import { memberService } from '../../services/memberService'
import { subscriptionService } from '../../services/subscriptionService'
import type { OwnerDashboardStats, Member, Subscription } from '../../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { SkeletonCard, SkeletonChart } from '../../components/Skeleton'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b']

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getOwnerStats(),
      memberService.getAll(),
      subscriptionService.getMySubscription(),
    ]).then(([s, m, sub]) => {
      setStats(s)
      setMembers(m)
      setSubscription(sub)
    }).catch(() => toast.error('Failed to load dashboard'))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonChart key={i} />)}
      </div>
    </div>
  )
  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load data</div>

  const feeData = [
    { name: 'Paid', value: members.filter(m => m.feeStatus === 'PAID').length },
    { name: 'Unpaid', value: members.filter(m => m.feeStatus === 'UNPAID').length },
    { name: 'Partial', value: members.filter(m => m.feeStatus === 'PARTIAL').length },
  ].filter(d => d.value > 0)

  const seatData = [
    { name: 'Available', seats: stats.availableSeats },
    { name: 'Occupied', seats: stats.occupiedSeats },
  ]

  const isPro = subscription?.packageType === 'PRO' && subscription?.status === 'ACTIVE'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Seats" value={stats.totalSeats} color="bg-blue-500" />
        <StatCard label="Occupied" value={stats.occupiedSeats} color="bg-red-500" />
        <StatCard label="Free" value={stats.availableSeats} color="bg-green-500" />
        <StatCard label="Active Members" value={stats.activeMembers} color="bg-purple-500" />
        <StatCard label="Pending Dues" value={stats.pendingDues} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Seat Utilization</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={seatData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip />
              <Bar dataKey="seats" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Fee Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={feeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                {feeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">Rs.{stats.monthlyRevenue}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total collected fees</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Allocations</h2>
          {stats.recentAllocations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No active allocations</p>
          ) : (
            <div className="space-y-2">
              {stats.recentAllocations.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.memberName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seat {a.seatNumber}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.startDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/owner/members')} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-100 transition-colors text-left">
              <p className="font-semibold">+ Add Member</p>
              <p className="text-xs mt-1 opacity-80">Register a new member</p>
            </button>
            <button onClick={() => navigate('/owner/allocations')} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium hover:bg-green-100 transition-colors text-left">
              <p className="font-semibold">Allocate Seat</p>
              <p className="text-xs mt-1 opacity-80">Assign seat to member</p>
            </button>
            <button onClick={() => navigate('/owner/floors')} className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium hover:bg-purple-100 transition-colors text-left">
              <p className="font-semibold">Manage Floors</p>
              <p className="text-xs mt-1 opacity-80">Add or edit floors</p>
            </button>
            <button onClick={() => navigate('/owner/reports')} className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${isPro ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
              <p className="font-semibold">{isPro ? 'View Reports' : 'Reports (Pro)'}</p>
              <p className="text-xs mt-1 opacity-80">{isPro ? 'Download PDF reports' : 'Upgrade to Pro'}</p>
            </button>
          </div>
        </div>
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
