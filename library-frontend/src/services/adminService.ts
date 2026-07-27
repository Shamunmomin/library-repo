import api from './axios'
import type { Subscription, Library, AdminDashboardStats, LibraryDetail, Payment } from '../types'

export const adminService = {
  async getDashboardStats() {
    const response = await api.get<AdminDashboardStats>('/admin/dashboard/stats')
    return response.data
  },

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

  async getLibraries(filter?: string) {
    const params = filter ? { filter } : {}
    const response = await api.get<LibraryDetail[]>('/admin/libraries', { params })
    return response.data
  },

  async getLibraryDetail(id: string) {
    const response = await api.get<LibraryDetail>(`/admin/libraries/${id}`)
    return response.data
  },

  async deleteLibrary(id: string) {
    await api.delete(`/admin/libraries/${id}`)
  },

  async getUsers() {
    const response = await api.get('/admin/users')
    return response.data
  },

  async getPayments(status?: string, startDate?: string, endDate?: string) {
    const params: Record<string, string> = {}
    if (status) params.status = status
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const response = await api.get<Payment[]>('/admin/payments', { params })
    return response.data
  },

  async downloadPaymentReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const response = await api.get(`/admin/reports/payments?${params.toString()}`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'admin-payment-report.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
