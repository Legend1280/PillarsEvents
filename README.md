# Pillars Events Calendar

A comprehensive events calendar application designed for the Pillars MSO + Health and Wellness Center ecosystem, featuring role-based access control, department filtering, and seamless brand integration.

![Pillars Events Calendar](client/public/pillars-logo.png)

---

## 🎯 Overview

The Pillars Events Calendar provides healthcare professionals and staff with an intuitive interface to view, create, and manage events across multiple departments. Built with modern web technologies and designed to integrate seamlessly with the existing Pillars ecosystem.

### Key Features

✅ **Authentication & Permissions** - Secure login with role-based access control  
✅ **Month-View Calendar** - Clean, intuitive calendar interface  
✅ **Event Management** - Create, view, and manage events with rich details  
✅ **Department Filtering** - Filter events by Cardiology, Wellness, Imaging, or General  
✅ **Event Tagging** - Categorize with tags like Staff Meeting, Patient Workshop, Training  
✅ **Responsive Design** - Works seamlessly on desktop and tablet devices  
✅ **Brand Integration** - Matches Pillars brand identity with teal, yellow, and navy colors  

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Access to Pillars backend API (for production use)

### Installation

```bash
# Clone the repository
git clone https://github.com/Legend1280/PillarsEvents.git
cd PillarsEvents

# Install dependencies
cd client
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## 🔐 Demo Credentials

The current version includes mock authentication for demonstration purposes:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@pillars.care | admin123 | Full access - can create/edit events |
| **Doctor** | doctor@pillars.care | doctor123 | Full access - can create/edit events |
| **User** | user@pillars.care | user123 | View only - must request posting access |

---

## 📚 Documentation

### For Developers

- **[DEV_HANDOFF.md](DEV_HANDOFF.md)** - Complete technical integration guide
- **[INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)** - Step-by-step integration checklist
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Feature documentation and user guide

### Quick Links

- **Backend API Requirements**: See `DEV_HANDOFF.md` → "Backend API Requirements"
- **Database Schema**: See `DEV_HANDOFF.md` → "Database Schema"
- **Integration Strategies**: See `DEV_HANDOFF.md` → "Integration Strategies"
- **Frontend Integration**: See `DEV_HANDOFF.md` → "Frontend Integration Guide"

---

## 🏗️ Architecture

### Current State (Standalone)

```
React Frontend (Client-Side)
├── Mock Authentication
├── In-Memory Event Storage
└── Client-Side State Management
```

### Target State (Integrated)

```
React Frontend
├── Real Authentication (JWT/OAuth)
├── Backend API Integration
└── Database Persistence
```

**Status**: Frontend complete, ready for backend integration

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Routing**: Wouter
- **State Management**: React Context API
- **Build Tool**: Vite

---

## 📦 Project Structure

```
client/
├── public/
│   └── pillars-logo.png          # Brand logo
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   └── EventModal.tsx        # Event creation/viewing modal
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Authentication state
│   │   ├── EventsContext.tsx     # Events state
│   │   └── ThemeContext.tsx      # Theme management
│   ├── pages/
│   │   ├── Login.tsx             # Login screen
│   │   ├── Permissions.tsx       # Permissions confirmation
│   │   └── Calendar.tsx          # Main calendar interface
│   ├── types.ts                  # TypeScript definitions
│   ├── App.tsx                   # Main app with routing
│   └── index.css                 # Global styles
```

---

## 🔄 Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| UI/UX Design | ✅ Complete | Matches Pillars brand |
| Frontend Logic | ✅ Complete | All features implemented |
| Mock Authentication | ✅ Complete | Ready to replace with real auth |
| Mock Data | ✅ Complete | Ready to replace with API |
| Backend API | ⏳ Pending | See DEV_HANDOFF.md |
| Database | ⏳ Pending | Schema provided |
| Production Auth | ⏳ Pending | Integration guide provided |

---

## 🎨 Design System

### Brand Colors

- **Primary (Teal)**: `oklch(0.55 0.12 200)` - Actions, highlights, today indicator
- **Secondary (Yellow)**: `oklch(0.85 0.15 85)` - Secondary actions, accents
- **Foreground (Navy)**: `oklch(0.235 0.015 240)` - Text, headings
- **Background**: `oklch(0.98 0 0)` - Light grey background
- **Card**: `oklch(1 0 0)` - White surfaces

### Typography

- **Font Family**: System font stack (San Francisco, Segoe UI, Roboto)
- **Headings**: Bold, navy color
- **Body**: Regular, dark grey
- **Labels**: Medium weight, smaller size

---

## 🚦 Getting Started for Developers

### 1. Review Documentation

Start by reading the integration guides:
- `DEV_HANDOFF.md` for complete technical details
- `INTEGRATION_CHECKLIST.md` for step-by-step tasks

### 2. Set Up Backend

Follow the backend setup section in `DEV_HANDOFF.md`:
- Create database schema
- Implement authentication API
- Build events CRUD endpoints
- Set up permissions system

### 3. Integrate Frontend

Replace mock implementations with real API calls:
- Update `AuthContext.tsx` for real authentication
- Update `EventsContext.tsx` for real events data
- Add API client utility (`lib/api.ts`)
- Configure environment variables

### 4. Test Integration

- Test authentication flow
- Test event CRUD operations
- Test permissions system
- Verify error handling

### 5. Deploy

- Deploy backend to production
- Deploy frontend to production
- Configure DNS and SSL (if standalone)
- Monitor for issues

---

## 📈 Roadmap

### Phase 1: Backend Integration (Weeks 1-2)
- [ ] Database schema implementation
- [ ] Authentication API
- [ ] Events CRUD API
- [ ] Permissions API

### Phase 2: Frontend Integration (Weeks 2-3)
- [ ] Replace mock authentication
- [ ] Connect to events API
- [ ] Add loading states
- [ ] Implement error handling

### Phase 3: Main App Integration (Weeks 3-4)
- [ ] Choose integration strategy
- [ ] Implement shared authentication
- [ ] Add navigation links
- [ ] Test user flows

### Phase 4: Testing & Deployment (Weeks 4-5)
- [ ] Comprehensive testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Production deployment

### Future Enhancements
- [ ] Search functionality
- [ ] Recurring events
- [ ] Email notifications
- [ ] Image upload for events
- [ ] Calendar export (iCal, CSV)
- [ ] Mobile app

---

## 🧪 Testing

### Run Tests (Coming Soon)

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Manual Testing

1. **Login Flow**: Test with all three demo accounts
2. **Permissions**: Verify access control works correctly
3. **Event Creation**: Create events with all fields
4. **Department Filter**: Test filtering by each department
5. **Calendar Navigation**: Navigate between months
6. **Event Viewing**: Click events to view details

---

## 🤝 Contributing

This is a proprietary project for Pillars MSO + Health and Wellness Center. For internal contributions:

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Request review from team lead

---

## 📝 License

Proprietary software developed for Pillars MSO + Health and Wellness Center. All rights reserved.

---

## 📞 Support

### For Development Questions
- Review `DEV_HANDOFF.md` for technical details
- Check `INTEGRATION_CHECKLIST.md` for step-by-step guidance
- Contact the development team lead

### For Business Questions
- Contact the product owner
- Submit feature requests through internal channels

---

## 🙏 Acknowledgments

- **Design**: Based on Pillars brand identity at pillars.care
- **UI Components**: Built with shadcn/ui
- **Icons**: Lucide React

---

**Repository**: https://github.com/Legend1280/PillarsEvents  
**Status**: Frontend Complete - Ready for Backend Integration  
**Last Updated**: October 27, 2025

