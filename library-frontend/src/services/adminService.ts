import api from './axios'
import type { Subscription, Library } from '../types'

export const adminService = {
  async getSubscriptions(status?: string) {
    const params = status ? { status } : {}
    const response = await api.get<Subscription[]>('/admin/subscriptions', { params })
    return response.data
  },

  async verifySubscription(id: string, status: 'ACTIVE' | 'REJECTED', rejectionReason?: string) {
    const response = await api.put<Subscription>(`/admin/subscriptions/${id}/verify`, {
      status,
      rejectionReason,
    })
    return response.data
  },

  async getLibraries() {
    const response = await api.get<Library[]>('/admin/libraries')
    return response.data
  },

  async deleteLibrary(id: string) {
    await api.delete(`/admin/libraries/${id}`)
  },
}
