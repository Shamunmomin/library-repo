# Library Management SaaS

A comprehensive SaaS platform for library management built with Spring Boot (Java 17) backend and React (TypeScript) frontend.

---

## Architecture Overview

### Backend (Spring Boot Java 17)
**Package:** `com.lab.library`

```
src/main/java/com/lab/library/
├── config/           # App configurations, CORS, Rate Limiting, Swagger
├── security/         # JWT provider, JWT filter, Security config, UserDetailsService
├── controller/       # REST controllers
├── service/          # Business logic (one service per domain repository)
├── repository/       # JPA repositories
├── entity/           # JPA entities (UUID primary keys)
├── dto/              # Request/Response DTOs
│   ├── request/
│   └── response/
├── mapper/           # Entity <-> DTO mapping
├── enums/            # Enum types
├── exception/        # Custom exceptions & global handler
└── LibraryApplication.java
```

### Frontend (React + TypeScript)
```
src/
├── components/       # Shared/reusable components (Navbar, Sidebar, Loader, etc.)
├── pages/
│   ├── auth/         # Login, Register
│   ├── owner/        # Owner-specific pages
│   ├── admin/        # Admin-specific pages
│   └── shared/       # Shared pages (Splash, Subscription, etc.)
├── services/         # Axios instance, API service functions
├── types/            # TypeScript interfaces/types
├── utils/            # Helpers, constants, theme config
├── context/          # React contexts (AuthContext, ThemeContext)
├── hooks/            # Custom hooks (useAuth, useTheme)
├── guard/            # Route guards (AuthGuard, RoleGuard)
├── layouts/          # Layout wrappers (AuthLayout, OwnerLayout, AdminLayout)
└── assets/           # Static resources
```

---

## Entities (Database Schema)

| Entity | Key Fields |
|--------|-----------|
| **User** | id (UUID), name, email, password, phone, role (OWNER/ADMIN), enabled, createdAt, updatedAt |
| **Subscription** | id (UUID), user_id, packageType (BASE/PRO), status (PENDING/ACTIVE/EXPIRED/REJECTED), paymentScreenshot, startDate, endDate, createdAt, updatedAt |
| **Library** | id (UUID), user_id, name, address, phone, icon, createdAt, updatedAt |
| **Floor** | id (UUID), library_id, name, description, createdAt, updatedAt |
| **Seat** | id (UUID), floor_id, seatNumber, status (AVAILABLE/OCCUPIED/MAINTENANCE), createdAt, updatedAt |
| **Member** | id (UUID), library_id, name, email, phone, address, photo, joinDate, feeAmount, feeStatus (PAID/UNPAID/PARTIAL), createdAt, updatedAt |
| **SeatAllocation** | id (UUID), seat_id, member_id, startDate, endDate, status (ACTIVE/EXPIRED), createdAt, updatedAt |
| **Payment** | id (UUID), user_id, amount, paymentDate, paymentMethod, transactionId, status (PENDING/COMPLETED/FAILED/REFUNDED), createdAt, updatedAt |
| **RefreshToken** | id (UUID), user_id, token, expiryDate, createdAt |

---

## Implementation Plan (Phases & Tasks)

---

### Phase 1: Project Setup & Core Infrastructure ✅

#### Task 1.1: Backend - Dependencies & Configuration
**Sub-tasks:**
- [x] Add Maven dependencies: spring-boot-starter-validation, jjwt (io.jsonwebtoken), bucket4j (rate limiting), mapstruct, lombok, postgresql
- [x] Configure application.properties/yml (datasource, jpa, jwt secret, file upload, rate limit)
- [x] Create base package structure (config, security, controller, service, repository, entity, dto, mapper, enums, exception)
- [x] Create LibraryApplication.java main class with @SpringBootApplication

#### Task 1.2: Frontend - Dependencies & Configuration
**Sub-tasks:**
- [x] Install dependencies: react-router-dom, axios, tailwindcss, @heroicons/react, framer-motion, react-hot-toast
- [x] Configure Tailwind CSS with light/dark theme support
- [x] Create base folder structure (components, pages, services, types, utils, context, hooks, guard, layouts)
- [x] Set up Vite proxy for API calls to backend

---

### Phase 2: Authentication & Security ✅

#### Task 2.1: Backend - Enums & Entities Setup
**Sub-tasks:**
- [x] Create enum classes: Role, SubscriptionPackage, SubscriptionStatus, SeatStatus, FeeStatus, PaymentStatus, AllocationStatus
- [x] Create JPA entities (User, RefreshToken) with UUID primary keys, Lombok
- [x] Create JPA repositories (UserRepository, RefreshTokenRepository)

#### Task 2.2: Backend - JWT Security Implementation
**Sub-tasks:**
- [x] Create JwtTokenProvider (generate access token 15min, refresh token 7 days, validate, extract claims)
- [x] Create JwtAuthenticationFilter (extract JWT, validate, set SecurityContext)
- [x] Create CustomUserDetailsService (load user by email from DB)
- [x] Create SecurityConfig (SecurityFilterChain, stateless session, permit /api/auth/**)
- [x] Create CorsConfig (CorsConfigurationSource for frontend origin)
- [x] Create RateLimitingConfig (bucket4j for login/register endpoints)

#### Task 2.3: Backend - Auth API
**Sub-tasks:**
- [x] Create AuthController: POST /api/auth/register, /login, /refresh-token, /logout
- [x] Create AuthService: register (default role OWNER), login, refresh token, logout
- [x] Create LoginRequest, RegisterRequest, RefreshTokenRequest DTOs
- [x] Create AuthResponse, UserResponse DTOs
- [x] Create UserMapper (MapStruct)

#### Task 2.4: Backend - Exception Handling
**Sub-tasks:**
- [x] Create custom exceptions: ResourceNotFoundException, BadRequestException, UnauthorizedException, DuplicateResourceException
- [x] Create GlobalExceptionHandler (@RestControllerAdvice) with proper error response format

#### Task 2.5: Frontend - Auth Services & Context
**Sub-tasks:**
- [x] Create axios instance with interceptors for JWT attachment and 401 refresh logic
- [x] Create auth service (login, register, refreshToken, logout API calls)
- [x] Create AuthContext with provider (user state, login, logout, isLoading)
- [x] Store tokens in localStorage, auto-refresh token on 401

#### Task 2.6: Frontend - Auth Pages
**Sub-tasks:**
- [x] Create Login page (email, password, validation, link to register)
- [x] Create Register page (name, email, password, phone, validation, link to login)
- [x] Form validation with error messages
- [x] Redirect to splash on successful login/register

#### Task 2.7: Frontend - Route Guards
**Sub-tasks:**
- [x] Create AuthGuard (check if authenticated, redirect to login if not)
- [x] Role-based access (requiredRole prop)
- [x] Define protected route wrappers in App.tsx

---

### Phase 3: User Onboarding & Subscription Flow ✅

#### Task 3.1: Backend - Subscription API
**Sub-tasks:**
- [x] Create Subscription entity and repository
- [x] Create SubscriptionService: create, get my, admin verify/reject
- [x] Create SubscriptionController: POST /api/subscriptions (multipart), GET /api/subscriptions/my, GET /api/subscriptions/{id}
- [x] Admin endpoints: GET /api/admin/subscriptions (with status filter), PUT /api/admin/subscriptions/{id}/verify
- [x] WebMvcConfig to serve uploaded files

#### Task 3.2: Backend - Library Setup Check API
**Sub-tasks:**
- [x] Create Library entity and repository
- [x] Create LibraryService: create, get by user, onboarding status
- [x] Create endpoint: GET /api/users/onboarding-status
- [x] Create UserService for current user extraction from SecurityContext

#### Task 3.3: Frontend - Splash Screen
**Sub-tasks:**
- [x] Animated splash screen with library icon + name (framer-motion)
- [x] Calls onboarding-status API with 2.5s delay
- [x] Logic: no subscription → /subscribe; PENDING → stays with message; REJECTED → /subscribe; ACTIVE + no library → /owner/library; ACTIVE + library → /owner/dashboard

#### Task 3.4: Frontend - Subscription Page
**Sub-tasks:**
- [x] Base and Pro package cards with feature comparison (animated selection)
- [x] QR code placeholder for payment
- [x] File upload for payment screenshot (mandatory validation)
- [x] Submit creates subscription; shows success/waiting message

#### Task 3.5: Frontend - Admin Subscription Management
**Sub-tasks:**
- [x] Subscription list with filters (All, Pending, Active, Rejected)
- [x] View payment screenshot link
- [x] Accept/Reject with optional rejection reason
- [x] Toast notifications on actions

---

### Phase 4: Library, Floor & Seat Management ✅

#### Task 4.1: Backend - Library API
**Sub-tasks:**
- [x] Create Library entity (already in Phase 3)
- [x] Update LibraryService: create with subscription limits, update, get library entity
- [x] Create LibraryController: POST (multipart), PUT /api/libraries/{id}, GET /api/libraries/my, GET /api/libraries/{id}
- [x] Enforce limits: BASE=1 library, PRO=2 libraries

#### Task 4.2: Backend - Floor & Seat API
**Sub-tasks:**
- [x] Create Floor and Seat entities (UUID PKs)
- [x] Create FloorResponse, SeatResponse DTOs
- [x] Create FloorMapper, SeatMapper (MapStruct)
- [x] Create FloorService: add, update, delete, get by library (BASE=1 floor limit)
- [x] Create SeatService: add single/bulk, update, delete, get by floor (BASE=100 seats limit)
- [x] Create FloorController: CRUD endpoints
- [x] Create SeatController: CRUD + bulk endpoints

#### Task 4.3: Frontend - Library Setup Page
**Sub-tasks:**
- [x] Library page with create form (name, address, phone, icon) or card view if exists
- [x] Form validation and toast feedback

#### Task 4.4: Frontend - Floor Management Page
**Sub-tasks:**
- [x] List floors with seat counts
- [x] Add floor form (inline toggle)
- [x] Edit floor (inline form)
- [x] Delete floor with confirmation
- [x] Navigate to seats per floor

#### Task 4.5: Frontend - Seat Management Page
**Sub-tasks:**
- [x] Visual seat grid (responsive columns)
- [x] Color-coded status (green=available, red=occupied, yellow=maintenance)
- [x] Bulk add seats (comma-separated)
- [x] Toggle seat status (AVAILABLE ↔ MAINTENANCE)
- [x] Delete individual seat with hover delete button
- [x] Availability stats bar

---

### Phase 5: Member & Seat Allocation Management

#### Task 5.1: Backend - Member API
**Sub-tasks:**
- [ ] Create MemberRequest DTO (name, email, phone, address, photo, feeAmount)
- [ ] Create MemberService: add, update, delete, get by library, get by id, search
- [ ] Create MemberController: CRUD endpoints

#### Task 5.2: Backend - Seat Allocation API
**Sub-tasks:**
- [ ] Create SeatAllocationRequest DTO (seatId, memberId, startDate, endDate)
- [ ] Create SeatAllocationService: allocate seat, end allocation, get active allocations, get member history
- [ ] Create SeatAllocationController: POST, PUT, GET endpoints

#### Task 5.3: Frontend - Member Management
**Sub-tasks:**
- [ ] List members with search/filter
- [ ] Add member form (modal)
- [ ] Edit member details
- [ ] Delete member with confirmation
- [ ] Show member photo, fee status, allocated seat

#### Task 5.4: Frontend - Seat Allocation
**Sub-tasks:**
- [ ] Allocate seat to member (select seat, member, date range)
- [ ] View all active allocations
- [ ] End allocation manually
- [ ] View allocation history for a member

---

### Phase 6: Owner Dashboard & Reporting

#### Task 6.1: Backend - Owner Dashboard API
**Sub-tasks:**
- [ ] Create DashboardService: get total seats, occupied seats, active members, pending dues, recent allocations, monthly revenue
- [ ] Create DashboardController: GET /api/dashboard/owner/stats

#### Task 6.2: Backend - Reports API (Pro feature)
**Sub-tasks:**
- [ ] Create report services: payment report, member report, seat utilization report
- [ ] PDF generation using iText or JasperReports
- [ ] GET /api/reports/payments, GET /api/reports/members, GET /api/reports/utilization
- [ ] Check subscription package before allowing download

#### Task 6.3: Frontend - Owner Dashboard
**Sub-tasks:**
- [ ] Dashboard cards: total seats, occupied, free, active members, pending dues, monthly income
- [ ] Charts/visualizations (recharts or chart.js)
- [ ] Recent allocations list
- [ ] Quick action buttons (add member, allocate seat)
- [ ] Lazy load dashboard components

#### Task 6.4: Frontend - Owner Reports
**Sub-tasks:**
- [ ] Reports page with date range filter (Pro only)
- [ ] Download PDF reports
- [ ] Show payment collection history
- [ ] Show member fee status (paid/unpaid)

#### Task 6.5: Frontend - Member Fee Tracking
**Sub-tasks:**
- [ ] List with fee status filter (paid/unpaid/partial)
- [ ] Mark fee as paid
- [ ] View payment history per member
- [ ] Send reminders (optional)

---

### Phase 7: Admin Panel

#### Task 7.1: Backend - Admin APIs
**Sub-tasks:**
- [ ] GET /api/admin/libraries (list all libraries with filters: active/expired subscription)
- [ ] GET /api/admin/libraries/{id} (library details)
- [ ] DELETE /api/admin/libraries/{id} (delete library)
- [ ] GET /api/admin/users (list all owners)
- [ ] GET /api/admin/payments (list all payments with filters)
- [ ] GET /api/admin/subscriptions (list all subscriptions)
- [ ] GET /api/admin/reports/payments (download payment statement PDF)
- [ ] GET /api/admin/dashboard/stats (admin dashboard stats)

#### Task 7.2: Frontend - Admin Dashboard
**Sub-tasks:**
- [ ] Stats cards: total libraries, active subscriptions, expired, total owners, total revenue
- [ ] Charts for platform growth
- [ ] Recent subscription requests

#### Task 7.3: Frontend - Admin Library Management
**Sub-tasks:**
- [ ] Library list with search/filter (active/expired/all)
- [ ] Library detail view (owner info, subscription, floors/seats count)
- [ ] Delete library with confirmation

#### Task 7.4: Frontend - Admin User & Payment Management
**Sub-tasks:**
- [ ] User list with search
- [ ] User detail view (subscriptions, libraries)
- [ ] Payment list with filters (date range, status)
- [ ] Download payment statements PDF

---

### Phase 8: UI/UX & Performance

#### Task 8.1: Theme System
**Sub-tasks:**
- [ ] Create ThemeContext with light/dark toggle
- [ ] Define CSS variables for both themes
- [ ] Persist theme preference in localStorage
- [ ] Apply theme classes to all components
- [ ] Dark mode styling for all pages

#### Task 8.2: Responsive Design
**Sub-tasks:**
- [ ] Mobile-responsive sidebar (collapsible hamburger menu)
- [ ] Responsive tables (horizontal scroll on mobile)
- [ ] Responsive grid layouts
- [ ] Touch-friendly buttons and inputs
- [ ] Test on multiple screen sizes

#### Task 8.3: Animations & Loading States
**Sub-tasks:**
- [ ] Splash screen animation (framer-motion)
- [ ] Page transition animations
- [ ] Skeleton loaders for dashboard cards
- [ ] Loading spinners for API calls
- [ ] Toast notifications for success/error

#### Task 8.4: Lazy Loading & Code Splitting
**Sub-tasks:**
- [ ] Lazy load route pages with React.lazy()
- [ ] Code split by route
- [ ] Image lazy loading
- [ ] Optimize bundle size

---

### Phase 9: Final Integration & Testing

#### Task 9.1: Integration Testing
**Sub-tasks:**
- [ ] Test full auth flow (register → login → token refresh → logout)
- [ ] Test onboarding flow (subscription → library creation)
- [ ] Test CRUD operations for all entities
- [ ] Test subscription limits enforcement
- [ ] Test admin operations

#### Task 9.2: Bug Fixes & Polish
**Sub-tasks:**
- [ ] Fix any identified issues
- [ ] Error message refinement
- [ ] Performance optimization
- [ ] Final review

---

## How the Application Works

### As Owner:

1. **Register** → Default role is OWNER. Login with credentials.
2. **Splash Screen** → Animated library logo appears. System checks subscription & library status.
3. **No Subscription** → See subscription page with Base ($) and Pro ($$) packages. Pay via QR code, upload screenshot. Wait for admin approval.
4. **Subscription Pending** → Waiting page with "Admin will verify your payment" message.
5. **Subscription Rejected** → Notification with reason, option to resubscribe.
6. **Subscription Active + No Library** → Add library form (name, address, phone, icon).
7. **Subscription Active + Library Exists** → Redirected to Owner Dashboard.
8. **Dashboard** → See stats: total seats, occupied/free seats, active members, pending dues, monthly income charts.
9. **Manage Floors** → Add/Edit/Delete floors for your library.
10. **Manage Seats** → Add seats to floors (bulk or single), edit, delete. Visual grid shows available/occupied.
11. **Manage Members** → Add members with details and photo. Track fee status (paid/unpaid).
12. **Allocate Seats** → Assign seats to members with date range.
13. **Member History** → View each member's allocation and payment history.
14. **Reports (Pro)** → Download PDF reports of payments, members, seat utilization.
15. **Limitations (Base)** → 1 library, 1 floor, 100 seats, no PDF downloads.
16. **Limitations (Pro)** → Up to 2 libraries, unlimited floors & seats, PDF downloads.

### As Admin:

1. **Login** → Admin credentials (seeded or promoted by another admin).
2. **Dashboard** → Platform-wide stats: total libraries, active/expired subscriptions, total owners, total revenue.
3. **Subscription Requests** → View pending requests. See payment screenshot. Accept or Reject.
4. **Library Management** → View all libraries with filters (active/expired subscription). View details. Delete library if needed.
5. **User Management** → View all owners, their subscription status, libraries.
6. **Payment Reports** → View all payments with date filters. Download payment statements PDF.
7. **Platform Oversight** → Monitor overall platform health and growth.

### Security Features:
- JWT access tokens (15 min) + refresh tokens (7 days)
- Rate limiting on auth endpoints
- Route guards based on roles
- Secure password hashing (BCrypt)
- All non-public endpoints require JWT authentication

---

*This README serves as the master plan. Each task requires approval before execution.*
