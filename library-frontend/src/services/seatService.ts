import api from './axios'
import type { Seat } from '../types'

export const seatService = {
  async getByFloor(floorId: string) {
    const response = await api.get<Seat[]>(`/seats/floor/${floorId}`)
    return response.data
  },

  async create(floorId: string, seatNumber: string) {
    const response = await api.post<Seat>('/seats', { floorId, seatNumber })
    return response.data
  },

  async createBulk(floorId: string, seatNumbers: string[]) {
    const response = await api.post<Seat[]>('/seats/bulk', { floorId, seatNumbers })
    return response.data
  },

  async update(id: string, data: { seatNumber?: string; status?: string }) {
    const response = await api.put<Seat>(`/seats/${id}`, data)
    return response.data
  },

  async delete(id: string) {
    await api.delete(`/seats/${id}`)
  },
}
