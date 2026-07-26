  # Library Management SaaS - Project Structure & Plan

  ## Architecture Overview

  - **Backend**: Java 17 + Spring Boot 4.1.0 + PostgreSQL + JWT Auth
  - **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS
  - **Auth**: JWT with role-based access (SUPER_ADMIN, LIBRARY_OWNER)
  - **Database**: PostgreSQL , UUID PKs, soft deletes, audit fields
  - **Notifications**: Firebase Cloud Messaging + Expo Push
  - **Scheduling**: Spring @Scheduled for daily 6 AM jobs
  - **Storage**: Local file system for uploads
  - **Containerization**: Docker + Docker Compose

  ---

  ## PHASE 1: PROJECT SETUP & CONFIGURATION

  ### Task 1.1: Backend Initial Setup (library/)
  - [ ] Update pom.xml with all dependencies:
    - spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-validation
    - spring-boot-starter-security, spring-boot-starter-mail
    - spring-boot-starter-actuator
    - jjwt-api, jjwt-impl, jjwt-jackson (0.12.6)
    - firebase-admin
    - lombok
    - jackson-databind
    - springdoc-openapi (for Swagger)
  - [ ] Configure application.properties 
    - PostgreSQL connection
    - JWT secret & expiration
    - File upload paths
    - Firebase config path
    - CORS settings
  - [ ] Create Dockerfile for backend
  - [ ] Create package structure:
    - com.lab.library.config
    - com.lab.library.security
    - com.lab.library.entity
    - com.lab.library.dto
    - com.lab.library.repository
    - com.lab.library.service
    - com.lab.library.controller
    - com.lab.library.exception
    - com.lab.library.scheduler
    - com.lab.library.notification
    - com.lab.library.audit
    - com.lab.library.util

  ### Task 1.2: Frontend Initial Setup (library-frontend/)
  - [ ] Install npm dependencies:
    - react-router-dom, @tanstack/react-query, react-hook-form, @hookform/resolvers
    - axios, zod, tailwindcss, @tailwindcss/vite, lucide-react
    - date-fns, recharts, react-hot-toast
    - firebase, expo-constants
  - [ ] Configure Tailwind CSS with vite plugin
  - [ ] Create folder structure:
    - src/api (axios instance, endpoints)
    - src/components (shared components)
    - src/pages (page components)
    - src/hooks (custom hooks)
    - src/store (auth context/state)
    - src/types (TypeScript types)
    - src/utils (helpers)
    - src/lib (configs)
  - [ ] Set up React Router with auth guards
  - [ ] Set up React Query client
  - [ ] Configure Axios interceptor for JWT

  ---

  ---

  ## PHASE 2: BACKEND ENTITIES & REPOSITORIES

  ### Task 2.1: Base Entity & Audit
  - [ ] BaseEntity (abstract class with id, createdAt, updatedAt, deletedAt)
  - [ ] AuditableEntity (with createdBy, updatedBy)

  ### Task 2.2: JPA Entities
  - [ ] Role entity
  - [ ] User entity
  - [ ] Library entity
  - [ ] SubscriptionPlan entity
  - [ ] LibrarySubscription entity
  - [ ] Floor entity
  - [ ] Seat entity
  - [ ] Member entity
  - [ ] PaymentRequest entity
  - [ ] Notification entity
  - [ ] ExpoPushToken entity

  ### Task 2.3: JPA Repositories
  - [ ] UserRepository (findByEmail, findByUsername, existsByEmail)
  - [ ] LibraryRepository (search, filter by status)
  - [ ] SubscriptionPlanRepository
  - [ ] LibrarySubscriptionRepository
  - [ ] FloorRepository (findByLibraryIdOrderBySortOrder)
  - [ ] SeatRepository (findByLibraryIdAndFloorId, findByStatus)
  - [ ] MemberRepository (search, filter by status, findBySubscriptionEndBetween)
  - [ ] PaymentRequestRepository (findByLibraryIdAndStatus)
  - [ ] NotificationRepository (findByLibraryIdOrderByCreatedAtDesc)
  - [ ] ExpoPushTokenRepository

  ---

  ## PHASE 3: BACKEND DTOs & MAPPER

  ### Task 3.1: Request DTOs
  - [ ] LoginRequest, RegisterRequest
  - [ ] LibraryRequest
  - [ ] SubscriptionPlanRequest
  - [ ] FloorRequest
  - [ ] SeatRequest
  - [ ] MemberRequest
  - [ ] PaymentRequestDTO
  - [ ] NotificationRequest

  ### Task 3.2: Response DTOs
  - [ ] AuthResponse (token, user details)
  - [ ] LibraryResponse
  - [ ] SubscriptionPlanResponse
  - [ ] DashboardResponse (Owner + Admin)
  - [ ] FloorResponse
  - [ ] SeatResponse
  - [ ] MemberResponse
  - [ ] PaymentResponse
  - [ ] NotificationResponse
  - [ ] PagedResponse<T> (generic paginated response)
  - [ ] ApiResponse<T> (standard API response wrapper)

  ### Task 3.3: Mappers (using MapStruct or manual)
  - [ ] LibraryMapper
  - [ ] FloorMapper
  - [ ] SeatMapper
  - [ ] MemberMapper
  - [ ] PaymentMapper
  - [ ] NotificationMapper

  ---

  ## PHASE 4: SECURITY MODULE

  ### Task 4.1: JWT Implementation
  - [ ] JwtTokenProvider - generate, validate, extract claims
  - [ ] JwtAuthenticationFilter - once per request filter
  - [ ] JwtAuthenticationEntryPoint - 401 handler

  ### Task 4.2: Security Configuration
  - [ ] SecurityConfig - SecurityFilterChain, CORS, CSRF disable
  - [ ] CustomUserDetailsService - load by email/username
  - [ ] Role-based access with @PreAuthorize on method level

  ### Task 4.3: Tenant Context
  - [ ] TenantContext holder (ThreadLocal)
  - [ ] TenantFilter - extract tenant from JWT
  - [ ] TenantAware - interface for entities

  ---

  ## PHASE 5: BACKEND SERVICES

  ### Task 5.1: Auth Service
  - [ ] login() - authenticate, generate JWT
  - [ ] register() - create user with role
  - [ ] validateToken()
  - [ ] refreshToken()

  ### Task 5.2: Super Admin Services
  - [ ] LibraryService - CRUD, search, activate/suspend
  - [ ] SubscriptionPlanService - CRUD
  - [ ] LibrarySubscriptionService - assign plan, renew, history
  - [ ] PaymentRequestService - view pending, approve, reject
  - [ ] AdminDashboardService - metrics

  ### Task 5.3: Library Owner Services
  - [ ] OwnerDashboardService - dashboard metrics
  - [ ] FloorService - CRUD with tenant isolation
  - [ ] SeatService - CRUD, activate/inactivate
  - [ ] MemberService - CRUD, search, filter, soft delete
  - [ ] SubscriptionService - renew, history, expiring soon
  - [ ] PaymentRequestService - submit payment proof

  ### Task 5.4: Validation Services
  - [ ] LibraryPlanValidator - validate max members, seats
  - [ ] SubscriptionValidator - validate dates, overlaps

  ---

  ## PHASE 6: CONTROLLERS & EXCEPTION HANDLING

  ### Task 6.1: Global Exception Handler
  - [ ] GlobalExceptionHandler @ControllerAdvice
    - ResourceNotFoundException → 404
    - BadRequestException → 400
    - UnauthorizedException → 401
    - AccessDeniedException → 403
    - ValidationException → 422
    - DuplicateResourceException → 409
  - [ ] ErrorResponse DTO

  ### Task 6.2: Auth Controller
  - [ ] POST /api/auth/login
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/refresh
  - [ ] GET /api/auth/profile

  ### Task 6.3: Super Admin Controllers
  - [ ] Admin Library Controller
    - GET /api/admin/libraries (paginated, searchable)
    - GET /api/admin/libraries/{id}
    - PUT /api/admin/libraries/{id}/activate
    - PUT /api/admin/libraries/{id}/suspend
    - DELETE /api/admin/libraries/{id}
  - [ ] Admin Plan Controller
    - CRUD /api/admin/plans
  - [ ] Admin Subscription Controller
    - POST /api/admin/subscriptions (assign)
    - GET /api/admin/subscriptions/history
  - [ ] Admin Payment Controller
    - GET /api/admin/payments/pending
    - POST /api/admin/payments/{id}/approve
    - POST /api/admin/payments/{id}/reject
  - [ ] Admin Dashboard Controller
    - GET /api/admin/dashboard

  ### Task 6.4: Library Owner Controllers
  - [ ] Owner Dashboard Controller
    - GET /api/owner/dashboard
  - [ ] Floor Controller
    - CRUD /api/owner/floors
  - [ ] Seat Controller
    - CRUD /api/owner/seats
    - PUT /api/owner/seats/{id}/status
  - [ ] Member Controller
    - CRUD /api/owner/members
    - GET /api/owner/members/search
    - GET /api/owner/members/filter
  - [ ] Member Subscription Controller
    - POST /api/owner/members/{id}/renew
    - GET /api/owner/members/{id}/payments
  - [ ] Owner Payment Controller
    - POST /api/owner/payments/request
    - GET /api/owner/payments/history
  - [ ] Notification Controller
    - GET /api/owner/notifications
    - PUT /api/owner/notifications/{id}/read
  - [ ] Owner Subscription Controller
    - GET /api/owner/subscription/status
  - [ ] Profile Controller
    - GET /api/owner/profile
    - PUT /api/owner/profile

  ---

  ## PHASE 7: SCHEDULED JOBS

  ### Task 7.1: Daily Subscription Check Job
  - [ ] @Scheduled(cron = "0 0 9 * * *") - every day at 9 AM
  - [ ] Check all members:
    - If subscription end date < today → mark EXPIRED
    - If subscription end date is in 3 days → send warning notification
  - [ ] Check library subscriptions:
    - If expired → mark library EXPIRED
  - [ ] Send push notifications via FCM/Expo

  ### Task 7.2: Notification Service
  - [ ] Create and persist notification
  - [ ] Send FCM push notification
  - [ ] Send Expo push notification
  - [ ] Mark as read

  ---

  ## PHASE 8: FRONTEND SETUP & CORE

  ### Task 8.1: Tailwind & Global Styles
  - [ ] Configure Tailwind with custom theme
  - [ ] Create global CSS with design system
  - [ ] Set up font families (Inter or system fonts)

  ### Task 8.2: API Layer
  - [ ] Axios instance with interceptor
  - [ ] Auth token management
  - [ ] API endpoint functions (auth, admin, owner)
  - [ ] TypeScript types/interfaces for all DTOs

  ### Task 8.3: Auth & Routing
  - [ ] AuthContext / AuthProvider
  - [ ] Login page
  - [ ] ProtectedRoute component (role-based)
  - [ ] SubscriptionExpired handler redirect

  ### Task 8.4: Shared Components
  - [ ] Layout (Sidebar + Header + Content)
  - [ ] DataTable with pagination
  - [ ] SearchInput
  - [ ] FilterDropdown
  - [ ] StatCard for dashboard
  - [ ] Modal
  - [ ] ConfirmDialog
  - [ ] LoadingSpinner
  - [ ] EmptyState
  - [ ] StatusBadge
  - [ ] FileUpload
  - [ ] Pagination

  ---

  ## PHASE 9: FRONTEND PAGES - SUPER ADMIN

  ### Task 9.1: Admin Dashboard
  - [ ] Total Libraries, Active, Expired, Pending, Revenue cards
  - [ ] Recent activity / charts (recharts)

  ### Task 9.2: Library Management
  - [ ] Library list with search & filters
  - [ ] Library detail view
  - [ ] Activate/Suspend library
  - [ ] Delete library

  ### Task 9.3: Subscription Plans
  - [ ] Plans list
  - [ ] Create/Edit plan form
  - [ ] Delete plan

  ### Task 9.4: Library Subscriptions
  - [ ] Assign plan to library
  - [ ] Subscription history

  ### Task 9.5: Payment Approvals
  - [ ] Pending requests cards
  - [ ] Approve/Reject with reason
  - [ ] Payment screenshot viewer

  ### Task 9.6: Admin Reports
  - [ ] Library report
  - [ ] Subscription report
  - [ ] Revenue report

  ---

  ## PHASE 10: FRONTEND PAGES - LIBRARY OWNER

  ### Task 10.1: Subscription Expired Screen
  - [ ] Expired subscription alert
  - [ ] Renew button + payment QR
  - [ ] Upload payment screenshot form

  ### Task 10.2: Owner Dashboard
  - [ ] Total Members, Seats, Occupied, Available stats
  - [ ] Expired/Active members
  - [ ] Today's collections
  - [ ] Subscription status

  ### Task 10.3: Floor Management
  - [ ] Floor list (cards/table)
  - [ ] Add/Edit floor modal
  - [ ] Delete with confirmation

  ### Task 10.4: Seat Management
  - [ ] Seat list with floor filter
  - [ ] Add/Edit seat modal
  - [ ] Toggle active/inactive

  ### Task 10.5: Member Management
  - [ ] Member list with search & filters
    - Active, Expired, Expiring in 7 days, Expiring Today
    - Filter by floor, seat
  - [ ] Add/Edit member form (photo, details, subscription)
  - [ ] Member detail view
  - [ ] Delete member

  ### Task 10.6: Subscription Actions
  - [ ] Renew member subscription
  - [ ] View payment history per member
  - [ ] View expired/active members

  ### Task 10.7: Notifications
  - [ ] Notification bell in header
  - [ ] Notification dropdown/list
  - [ ] Mark as read

  ### Task 10.8: Owner Reports
  - [ ] Active members report
  - [ ] Expired members report
  - [ ] Income report
  - [ ] Seat occupancy report

  ---

  ## PHASE 11: NOTIFICATIONS & FIREBASE

  ### Task 11.1: Backend Firebase Setup
  - [ ] Firebase Admin SDK initialization
  - [ ] FCM service to send push notifications
  - [ ] Expo push notification service

  ### Task 11.2: Frontend Notification Setup
  - [ ] Firebase Web SDK config
  - [ ] Notification permission request
  - [ ] Service worker for push
  - [ ] Expo push token registration

