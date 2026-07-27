import api from './axios'
import type { OwnerDashboardStats } from '../types'

export const dashboardService = {
  async getOwnerStats() {
    const response = await api.get<OwnerDashboardStats>('/dashboard/owner/stats')
    return response.data
  },
}
