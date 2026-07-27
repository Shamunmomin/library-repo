export const APP_NAME = 'LibraryPro'

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  SPLASH: '/splash',
  SUBSCRIBE: '/subscribe',
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_LIBRARY: '/owner/library',
  OWNER_FLOORS: '/owner/floors',
  OWNER_SEATS: '/owner/seats',
  OWNER_MEMBERS: '/owner/members',
  OWNER_ALLOCATIONS: '/owner/allocations',
  OWNER_REPORTS: '/owner/reports',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_LIBRARIES: '/admin/libraries',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_USERS: '/admin/users',
  ADMIN_PAYMENTS: '/admin/payments',
} as const

export const SUBSCRIPTION_PACKAGES = {
  BASE: {
    name: 'Base',
    price: 499,
    features: [
      '1 Library',
      '1 Floor',
      'Up to 100 Seats',
      'Member Management',
      'Seat Allocation',
      'Basic Reports',
    ],
    limits: {
      libraries: 1,
      floors: 1,
      seats: 100,
      canDownloadPdf: false,
    },
  },
  PRO: {
    name: 'Pro',
    price: 999,
    features: [
      'Up to 2 Libraries',
      'Multiple Floors',
      'Unlimited Seats',
      'Member Management',
      'Seat Allocation',
      'Download PDF Reports',
      'Advanced Analytics',
      'Priority Support',
    ],
    limits: {
      libraries: 2,
      floors: Infinity,
      seats: Infinity,
      canDownloadPdf: true,
    },
  },
} as const
