import api from './axios'
import type { FeeStatus, Member, MemberPayment, PageResponse, PaymentMethod } from '../types'

export const memberService = {
  async getAll(params?: { page?: number; size?: number; search?: string; feeStatus?: FeeStatus }) {
    const response = await api.get<PageResponse<Member>>('/members', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<Member>(`/members/${id}`)
    return response.data
  },

  async create(data: { name: string; email?: string; phone: string; address?: string; feeAmount?: number; feeCycle?: string; photo?: File; joinDate?: string }) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('phone', data.phone)
    if (data.email) formData.append('email', data.email)
    if (data.address) formData.append('address', data.address)
    if (data.feeAmount) formData.append('feeAmount', String(data.feeAmount))
    if (data.feeCycle) formData.append('feeCycle', data.feeCycle)
    if (data.photo) formData.append('photo', data.photo)
    if (data.joinDate) formData.append('joinDate', data.joinDate)
    const response = await api.post<Member>('/members', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async update(id: string, data: { name?: string; email?: string; phone?: string; address?: string; feeAmount?: number; feeCycle?: string }) {
    const response = await api.put<Member>(`/members/${id}`, data)
    return response.data
  },

  async delete(id: string) {
    await api.delete(`/members/${id}`)
  },

  async getAllByLibrary() {
    const response = await api.get<Member[]>('/members/all')
    return response.data
  },

  async getFeeExpired() {
    const response = await api.get<Member[]>('/members/fee-expired')
    return response.data
  },

  async getAvailableForAllocation() {
    const response = await api.get<Member[]>('/members/available')
    return response.data
  },

  async getMemberPayments(id: string) {
    const response = await api.get<MemberPayment[]>(`/members/${id}/payments`)
    return response.data
  },

  async recordPayment(id: string, data?: { payDate?: string; method?: PaymentMethod; amount?: number; remarks?: string; paidUpTo?: string }) {
    const response = await api.post<Member>(`/members/${id}/payments`, data ?? {})
    return response.data
  },

  async voidPayment(memberId: string, paymentId: string, reason: string) {
    const response = await api.post<MemberPayment>(`/members/${memberId}/payments/${paymentId}/void`, { reason })
    return response.data
  },
}
