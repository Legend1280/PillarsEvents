# Pillars Events Calendar - Developer Handoff

## Executive Summary

This document provides technical guidance for integrating the Pillars Events Calendar into the existing Pillars ecosystem. The calendar is currently a standalone React application with mock authentication and client-side state management, designed to be integrated with your backend infrastructure.

---

## Project Overview

**Repository**: https://github.com/Legend1280/PillarsEvents  
**Framework**: React 19 + Tailwind CSS 4  
**Current State**: Fully functional frontend with mock data  
**Integration Status**: Ready for backend integration

### What's Built
✅ Complete UI/UX matching Pillars brand identity  
✅ Login and authentication flow (mock)  
✅ Role-based permissions system (mock)  
✅ Month-view calendar interface  
✅ Event creation, viewing, and management  
✅ Department filtering and event tagging  
✅ Responsive design (desktop + tablet)  

### What's Needed
❌ Backend API integration  
❌ Real authentication system  
❌ Database persistence  
❌ User management integration  
❌ Email notifications  
❌ File upload for event images  

---

## Architecture Overview

### Current Architecture (Standalone)

```
┌─────────────────────────────────────┐
│     React Frontend (Port 3000)      │
│  ┌─────────────────────────────┐   │
│  │   AuthContext (Mock Auth)   │   │
│  │   EventsContext (In-Memory) │   │
│  └─────────────────────────────┘   │
│           ↓                         │
│  ┌─────────────────────────────┐   │
│  │  Login → Permissions →      │   │
│  │  Calendar → Event Modal     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Target Architecture (Integrated)

```
┌──────────────────────────────────────────────────────────┐
│                  Pillars Ecosystem                        │
│                                                           │
│  ┌─────────────────┐         ┌────────────────────┐     │
│  │  Main Pillars   │         │  Events Calendar   │     │
│  │  Application    │◄────────┤  (This Project)    │     │
│  │  (Existing)     │  Shared │                    │     │
│  └────────┬────────┘   Auth  └─────────┬──────────┘     │
│           │                             │                 │
│           └─────────────┬───────────────┘                 │
│                         ↓                                 │
│              ┌──────────────────────┐                    │
│              │   Backend API Layer  │                    │
│              │  - Authentication    │                    │
│              │  - User Management   │                    │
│              │  - Events CRUD       │                    │
│              │  - Permissions       │                    │
│              └──────────┬───────────┘                    │
│                         ↓                                 │
│              ┌──────────────────────┐                    │
│              │     Database         │                    │
│              │  - Users             │                    │
│              │  - Events            │                    │
│              │  - Permissions       │                    │
│              └──────────────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

---

## Integration Strategies

### Option 1: Standalone Integration (Recommended for MVP)
**Timeline**: 2-3 weeks  
**Complexity**: Low-Medium  

Keep the calendar as a separate application that shares authentication with the main Pillars app.

**Steps**:
1. Deploy calendar as subdomain (e.g., `calendar.pillars.care`)
2. Implement shared authentication via JWT tokens
3. Create dedicated API endpoints for calendar operations
4. Use iframe or link from main app to calendar

**Pros**: Faster deployment, isolated codebase, easier maintenance  
**Cons**: Separate deployment, potential UX friction

---

### Option 2: Embedded Component Integration
**Timeline**: 4-6 weeks  
**Complexity**: Medium-High  

Integrate calendar as a module within the existing Pillars application.

**Steps**:
1. Convert calendar to reusable React component library
2. Publish as npm package or integrate directly into monorepo
3. Share authentication context from main app
4. Use existing API infrastructure

**Pros**: Seamless UX, shared codebase, unified deployment  
**Cons**: Longer integration time, potential conflicts with existing code

---

### Option 3: Micro-Frontend Architecture
**Timeline**: 6-8 weeks  
**Complexity**: High  

Use Module Federation or similar to load calendar as micro-frontend.

**Steps**:
1. Configure Webpack Module Federation
2. Expose calendar as remote module
3. Consume in main application shell
4. Share dependencies and state

**Pros**: Independent deployments, team autonomy, scalable architecture  
**Cons**: Complex setup, requires infrastructure changes

---

## Backend API Requirements

### Authentication Endpoints

#### POST `/api/auth/login`
```json
Request:
{
  "email": "user@pillars.care",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@pillars.care",
    "name": "User Name",
    "hasPostingAccess": true,
    "role": "admin" | "doctor" | "staff" | "viewer"
  }
}
```

#### POST `/api/auth/logout`
```json
Request:
{
  "token": "jwt_token_here"
}

Response:
{
  "success": true
}
```

#### GET `/api/auth/me`
```json
Headers:
Authorization: Bearer jwt_token_here

Response:
{
  "id": "user_id",
  "email": "user@pillars.care",
  "name": "User Name",
  "hasPostingAccess": true,
  "role": "admin"
}
```

---

### Events Endpoints

#### GET `/api/events`
```json
Query Parameters:
- month: number (1-12)
- year: number (2025)
- department: string (optional)
- status: "published" | "draft" (optional)

Response:
{
  "events": [
    {
      "id": "event_id",
      "title": "Cardiology Team Meeting",
      "date": "2025-10-28T00:00:00Z",
      "time": "10:00 AM",
      "description": "Monthly team sync",
      "host": "Dr. Johnson",
      "location": "Conference Room A",
      "department": "Cardiology",
      "tags": ["Staff Meeting"],
      "status": "published",
      "imageUrl": "https://...",
      "createdBy": "user_id",
      "createdAt": "2025-10-20T12:00:00Z",
      "updatedAt": "2025-10-20T12:00:00Z"
    }
  ],
  "total": 15
}
```

#### POST `/api/events`
```json
Headers:
Authorization: Bearer jwt_token_here

Request:
{
  "title": "New Event",
  "date": "2025-11-01T00:00:00Z",
  "time": "14:00",
  "description": "Event description",
  "host": "Dr. Smith",
  "location": "Main Hall",
  "department": "Wellness",
  "tags": ["Patient Workshop"],
  "status": "published" | "draft",
  "imageUrl": "https://..." (optional)
}

Response:
{
  "event": {
    "id": "new_event_id",
    // ... full event object
  }
}
```

#### PUT `/api/events/:id`
```json
Headers:
Authorization: Bearer jwt_token_here

Request:
{
  "title": "Updated Event Title",
  // ... any fields to update
}

Response:
{
  "event": {
    // ... updated event object
  }
}
```

#### DELETE `/api/events/:id`
```json
Headers:
Authorization: Bearer jwt_token_here

Response:
{
  "success": true
}
```

---

### Permissions Endpoints

#### POST `/api/permissions/request-access`
```json
Headers:
Authorization: Bearer jwt_token_here

Request:
{
  "userId": "user_id",
  "reason": "I need to post events for my department"
}

Response:
{
  "requestId": "request_id",
  "status": "pending"
}
```

#### GET `/api/permissions/requests` (Admin only)
```json
Headers:
Authorization: Bearer jwt_token_here

Response:
{
  "requests": [
    {
      "id": "request_id",
      "userId": "user_id",
      "userName": "User Name",
      "userEmail": "user@pillars.care",
      "reason": "Need posting access",
      "status": "pending",
      "createdAt": "2025-10-20T12:00:00Z"
    }
  ]
}
```

#### POST `/api/permissions/approve/:requestId` (Admin only)
```json
Headers:
Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "user": {
    // ... updated user with hasPostingAccess: true
  }
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  has_posting_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  description TEXT,
  host VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  tags JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'draft',
  image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_department ON events(department);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_by ON events(created_by);
```

### Access Requests Table
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_requests_user_id ON access_requests(user_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
```

---

## Frontend Integration Guide

### Step 1: Replace Mock Authentication

**Current Code** (`client/src/contexts/AuthContext.tsx`):
```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  // Mock implementation
  const mockUser = MOCK_USERS[email];
  if (mockUser && mockUser.password === password) {
    setUser(mockUser.user);
    return true;
  }
  return false;
};
```

**Replace With**:
```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
```

---

### Step 2: Replace Mock Events Data

**Current Code** (`client/src/contexts/EventsContext.tsx`):
```typescript
const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
```

**Replace With**:
```typescript
const [events, setEvents] = useState<Event[]>([]);

useEffect(() => {
  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/events', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    setEvents(data.events);
  };
  
  fetchEvents();
}, []);
```

---

### Step 3: Update Event Creation

**Current Code** (`client/src/contexts/EventsContext.tsx`):
```typescript
const addEvent = (eventData: Omit<Event, 'id'>) => {
  const newEvent: Event = {
    ...eventData,
    id: Date.now().toString(),
  };
  setEvents(prev => [...prev, newEvent]);
};
```

**Replace With**:
```typescript
const addEvent = async (eventData: Omit<Event, 'id'>) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });
  
  const data = await response.json();
  setEvents(prev => [...prev, data.event]);
};
```

---

### Step 4: Add API Configuration

Create `client/src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.fetch(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data: any) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' });
  },
};
```

---

## Environment Configuration

### Development Environment

Create `.env.development`:
```bash
VITE_API_URL=http://localhost:4000/api
VITE_APP_TITLE=Pillars Events Calendar (Dev)
VITE_APP_LOGO=/pillars-logo.png
```

### Production Environment

Create `.env.production`:
```bash
VITE_API_URL=https://api.pillars.care/api
VITE_APP_TITLE=Pillars Events Calendar
VITE_APP_LOGO=/pillars-logo.png
```

---

## Authentication Integration Options

### Option A: Shared JWT Tokens
If the main Pillars app already uses JWT authentication:

1. Use the same JWT secret across applications
2. Validate tokens on the backend
3. Share user session via cookies or localStorage
4. Redirect to main app for login if token is invalid

### Option B: OAuth/SSO Integration
If Pillars uses OAuth or SSO:

1. Implement OAuth flow in calendar app
2. Use authorization code flow
3. Exchange code for access token
4. Store token and use for API calls

### Option C: Session-Based Authentication
If Pillars uses session cookies:

1. Configure CORS to allow credentials
2. Use `credentials: 'include'` in fetch calls
3. Backend validates session cookie
4. Share session across subdomains

---

## Deployment Checklist

### Pre-Deployment
- [ ] Replace all mock data with API calls
- [ ] Configure environment variables
- [ ] Set up CORS policies on backend
- [ ] Implement error handling and loading states
- [ ] Add request retry logic for failed API calls
- [ ] Implement token refresh mechanism
- [ ] Add API rate limiting on backend
- [ ] Set up logging and monitoring

### Security
- [ ] Implement HTTPS for all API calls
- [ ] Validate all user inputs on backend
- [ ] Sanitize data before storing in database
- [ ] Implement CSRF protection
- [ ] Add rate limiting to prevent abuse
- [ ] Set secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] Implement proper password hashing (bcrypt, Argon2)
- [ ] Add SQL injection prevention (parameterized queries)

### Testing
- [ ] Unit tests for components
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for critical flows
- [ ] Load testing for concurrent users
- [ ] Security testing (OWASP Top 10)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

### Monitoring
- [ ] Set up application performance monitoring (APM)
- [ ] Configure error tracking (Sentry, Rollbar)
- [ ] Add analytics tracking
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Create dashboards for key metrics

---

## Migration Path

### Phase 1: Backend Setup (Week 1-2)
1. Design and create database schema
2. Implement authentication endpoints
3. Build events CRUD API
4. Set up permissions system
5. Create API documentation

### Phase 2: Frontend Integration (Week 2-3)
1. Replace mock authentication with real API
2. Update events context to use API
3. Add loading states and error handling
4. Implement token management
5. Test all user flows

### Phase 3: Testing & QA (Week 3-4)
1. Comprehensive testing of all features
2. Performance optimization
3. Security audit
4. Bug fixes and refinements
5. User acceptance testing

### Phase 4: Deployment (Week 4)
1. Deploy backend to production
2. Deploy frontend to production
3. Configure DNS and SSL
4. Monitor for issues
5. Gather user feedback

---

## Known Limitations & Future Enhancements

### Current Limitations
- No image upload for events (placeholder in UI)
- No recurring events support
- No email notifications
- No search functionality
- No event export (iCal, CSV)
- No mobile app
- Client-side filtering only (should be server-side for large datasets)

### Recommended Enhancements
1. **Search & Filters**: Full-text search across events
2. **Recurring Events**: Support for daily/weekly/monthly repeating events
3. **Notifications**: Email/SMS reminders for upcoming events
4. **File Attachments**: Upload documents, images, agendas
5. **Calendar Sync**: Export to Google Calendar, Outlook, iCal
6. **Comments**: Allow users to comment on events
7. **RSVP System**: Track event attendance
8. **Multi-timezone Support**: Display events in user's local timezone
9. **Audit Logs**: Track who created/modified events
10. **Advanced Permissions**: Fine-grained access control per department

---

## Support & Contact

### Technical Questions
For integration questions or technical support, contact:
- **Development Team**: [Your team contact]
- **Repository**: https://github.com/Legend1280/PillarsEvents
- **Documentation**: See `DOCUMENTATION.md` in repository

### Code Review
Before merging to production, please review:
- All API integrations
- Security implementations
- Performance optimizations
- Error handling
- User experience flows

---

## Quick Start for Developers

### 1. Clone Repository
```bash
git clone https://github.com/Legend1280/PillarsEvents.git
cd PillarsEvents
```

### 2. Install Dependencies
```bash
cd client
pnpm install
```

### 3. Configure Environment
```bash
cp .env.example .env.development
# Edit .env.development with your API URL
```

### 4. Run Development Server
```bash
pnpm dev
```

### 5. Review Code Structure
- `client/src/contexts/` - State management (replace mock data here)
- `client/src/pages/` - Main page components
- `client/src/components/` - Reusable UI components
- `client/src/types.ts` - TypeScript type definitions

### 6. Start Integration
Begin by replacing mock authentication in `AuthContext.tsx`, then move to events in `EventsContext.tsx`.

---

## Appendix: API Testing with cURL

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pillars.care","password":"admin123"}'
```

### Get Events
```bash
curl -X GET http://localhost:4000/api/events?month=10&year=2025 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Event
```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Event",
    "date": "2025-11-01T00:00:00Z",
    "time": "14:00",
    "description": "Test description",
    "host": "Dr. Smith",
    "location": "Main Hall",
    "department": "General",
    "status": "published"
  }'
```

---

**Document Version**: 1.0  
**Last Updated**: October 27, 2025  
**Prepared By**: Manus AI Development Team

