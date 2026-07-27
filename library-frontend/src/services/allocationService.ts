import api from './axios'
import type { SeatAllocation } from '../types'

export const allocationService = {
  async allocate(seatId: string, memberId: string, startDate?: string, endDate?: string) {
    const response = await api.post<SeatAllocation>('/allocations', { seatId, memberId, startDate, endDate })
    return response.data
  },

  async endAllocation(id: string) {
    const response = await api.put<SeatAllocation>(`/allocations/${id}/end`)
    return response.data
  },

  async getActive() {
    const response = await api.get<SeatAllocation[]>('/allocations/active')
    return response.data
  },

  async getMemberHistory(memberId: string) {
    const response = await api.get<SeatAllocation[]>(`/allocations/member/${memberId}`)
    return response.data
  },
}
