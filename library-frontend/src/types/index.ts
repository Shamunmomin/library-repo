export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'OWNER' | 'ADMIN'
  enabled: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export type SubscriptionPackage = 'BASE' | 'PRO'
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REJECTED'
export type OnboardingStep = 'SUBSCRIBE' | 'PENDING_REVIEW' | 'SETUP_LIBRARY' | 'DASHBOARD'

export interface Subscription {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  packageType: SubscriptionPackage
  status: SubscriptionStatus
  paymentScreenshot: string | null
  rejectionReason?: string
  startDate: string | null
  endDate: string | null
  createdAt: string
}

export interface Library {
  id: string
  userId: string
  name: string
  address: string
  phone: string
  icon: string | null
  createdAt: string
}

export interface Floor {
  id: string
  libraryId: string
  name: string
  description: string
  seatCount: number
  createdAt: string
}

export type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'

export interface Seat {
  id: string
  floorId: string
  seatNumber: string
  status: SeatStatus
  createdAt: string
}

export type FeeStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'EXPIRED'
export type FeeCycle = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'
export type MemberPaymentStatus = 'COMPLETED' | 'REVERSED'

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface MemberPayment {
  id: string
  memberId: string
  amount: number
  periodStart: string | null
  paidUpTo: string
  paymentDate: string
  method: PaymentMethod | null
  receiptNo: string | null
  remarks: string | null
  status: MemberPaymentStatus
  reversedBy: string | null
  reversedAt: string | null
  reverseReason: string | null
  createdAt: string
}

export interface Member {
  id: string
  libraryId: string
  name: string
  email: string
  phone: string
  address: string
  photo: string | null
  joinDate: string
  paidUpTo?: string
  feeAmount: number
  feeCycle: FeeCycle
  feeStatus: FeeStatus
  effectiveFeeStatus: FeeStatus
  allocatedSeat: string | null
  createdAt: string
}

export type AllocationStatus = 'ACTIVE' | 'EXPIRED'

export interface SeatAllocation {
  id: string
  seatId: string
  seatNumber: string
  memberId: string
  memberName: string
  startDate: string
  endDate: string
  status: AllocationStatus
  createdAt: string
  seat?: Seat
  member?: Member
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface Payment {
  id: string
  user: User
  amount: number
  subscriptionType: string
  subscriptionEndDate: string
  paymentDate: string
  paymentMethod: string
  status: PaymentStatus
  createdAt: string
}

export interface OnboardingStatus {
  hasSubscription: boolean
  subscription: Subscription | null
  hasLibrary: boolean
  library: Library | null
  nextStep: OnboardingStep
  notice: string | null
}

export interface OwnerDashboardStats {
  totalSeats: number
  occupiedSeats: number
  availableSeats: number
  activeMembers: number
  pendingDues: number
  monthlyRevenue: number
  recentAllocations: SeatAllocation[]
}

export interface AdminDashboardStats {
  totalLibraries: number
  activeSubscriptions: number
  expiredSubscriptions: number
  totalOwners: number
  totalRevenue: number
  pendingRequests: number
}

export interface LibraryDetail {
  id: string
  userId: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  name: string
  address: string
  phone: string
  icon: string | null
  subscriptionPackage: string
  subscriptionStatus: string
  floorCount: number
  totalSeats: number
  occupiedSeats: number
  createdAt: string
}

export interface ApiError {
  status: number
  message: string
  timestamp: string
  path: string
}
