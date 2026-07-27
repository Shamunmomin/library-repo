import api from './axios'
import type { Subscription } from '../types'

export const subscriptionService = {
  async create(packageType: 'BASE' | 'PRO', screenshot: File) {
    const formData = new FormData()
    formData.append('packageType', packageType)
    formData.append('screenshot', screenshot)
    const response = await api.post<Subscription>('/subscriptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async getMySubscription() {
    const response = await api.get<Subscription>('/subscriptions/my')
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<Subscription>(`/subscriptions/${id}`)
    return response.data
  },
}
