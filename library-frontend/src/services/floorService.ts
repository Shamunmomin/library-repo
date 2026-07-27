import api from './axios'
import type { Floor } from '../types'

export const floorService = {
  async getMyFloors() {
    const response = await api.get<Floor[]>('/floors')
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<Floor>(`/floors/${id}`)
    return response.data
  },

  async create(name: string, description?: string) {
    const response = await api.post<Floor>('/floors', { name, description })
    return response.data
  },

  async update(id: string, name: string, description?: string) {
    const response = await api.put<Floor>(`/floors/${id}`, { name, description })
    return response.data
  },

  async delete(id: string) {
    await api.delete(`/floors/${id}`)
  },
}
