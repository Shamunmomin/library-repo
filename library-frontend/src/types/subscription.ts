export interface SubscriptionPlan {
  id: string;
  planType: 'BASIC' | 'PRO';
  name: string;
  price: number;
  maxFloors: number;
  maxSeats: number;
  maxMembers: number;
  description: string | null;
  durationDays: number;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | null;
  planName: string | null;
  startDate: string | null;
  endDate: string | null;
  pendingPayment: boolean;
}

export interface PaymentRequest {
  id: string;
  libraryId: string;
  userId: string;
  userName: string;
  libraryName: string;
  planType: 'BASIC' | 'PRO';
  planName: string;
  amount: number;
  screenshotPath: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface PaymentApprovalRequest {
  adminNotes?: string;
}
