import api from '../lib/axios';
import type { PaymentRequest, PaymentApprovalRequest } from '../types/subscription';
import type { ApiResponse } from '../types/api';

export const paymentsApi = {
  getPendingPayments: async (): Promise<ApiResponse<PaymentRequest[]>> => {
    const response = await api.get<ApiResponse<PaymentRequest[]>>('/admin/payments/pending');
    return response.data;
  },

  getAllPayments: async (): Promise<ApiResponse<PaymentRequest[]>> => {
    const response = await api.get<ApiResponse<PaymentRequest[]>>('/admin/payments/all');
    return response.data;
  },

  getPaymentById: async (id: string): Promise<ApiResponse<PaymentRequest>> => {
    const response = await api.get<ApiResponse<PaymentRequest>>(`/admin/payments/${id}`);
    return response.data;
  },

  approvePayment: async (id: string, data?: PaymentApprovalRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/admin/payments/${id}/approve`, data || {});
    return response.data;
  },

  rejectPayment: async (id: string, data: PaymentApprovalRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/admin/payments/${id}/reject`, data);
    return response.data;
  },
};
