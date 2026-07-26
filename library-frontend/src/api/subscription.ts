import api from '../lib/axios';
import type { SubscriptionPlan, SubscriptionStatus, PaymentRequest, ApiResponse } from '../types/subscription';

export const subscriptionApi = {
  getPlans: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const response = await api.get<ApiResponse<SubscriptionPlan[]>>('/owner/subscription/plans');
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<SubscriptionStatus>> => {
    const response = await api.get<ApiResponse<SubscriptionStatus>>('/owner/subscription/status');
    return response.data;
  },

  submitPayment: async (planId: string, screenshot: File): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append('planId', planId);
    formData.append('screenshot', screenshot);

    const response = await api.post<ApiResponse<void>>('/owner/subscription/purchase', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPaymentHistory: async (): Promise<ApiResponse<PaymentRequest[]>> => {
    const response = await api.get<ApiResponse<PaymentRequest[]>>('/owner/subscription/payments');
    return response.data;
  },

  getAdminPhone: async (): Promise<ApiResponse<string>> => {
    const response = await api.get<ApiResponse<string>>('/owner/subscription/admin-phone');
    return response.data;
  },
};
