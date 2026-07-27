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

export interface Subscription {
  id: string
  userId: string
  packageType: SubscriptionPackage
  status: SubscriptionStatus
  paymentScreenshot: string
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
  icon: string
  createdAt: string
}

export interface Floor {
  id: string
  libraryId: string
  name: string
  description: string
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

export type FeeStatus = 'PAID' | 'UNPAID' | 'PARTIAL'

export interface Member {
  id: string
  libraryId: string
  name: string
  email: string
  phone: string
  address: string
  photo: string
  joinDate: string
  feeAmount: number
  feeStatus: FeeStatus
  createdAt: string
}

export type AllocationStatus = 'ACTIVE' | 'EXPIRED'

export interface SeatAllocation {
  id: string
  seatId: string
  memberId: string
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
  userId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionId: string
  status: PaymentStatus
  createdAt: string
}

export interface OnboardingStatus {
  hasSubscription: boolean
  subscription: Subscription | null
  hasLibrary: boolean
  library: Library | null
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

export interface ApiError {
  status: number
  message: string
  timestamp: string
  path: string
}
