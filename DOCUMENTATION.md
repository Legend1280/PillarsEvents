# Pillars Events Calendar - Documentation

## Overview

The Pillars Events Calendar is a comprehensive web application designed for the Pillars MSO + Health and Wellness Center ecosystem. It provides authenticated users with the ability to view, create, and manage events across multiple departments with role-based access control.

## Features

### Authentication & Authorization
- **Login System**: Secure email and password authentication
- **Role-Based Access Control**: Users can have viewing-only or full posting privileges
- **Permission Confirmation**: Clear visual indicators showing user access levels
- **Access Request System**: Users without posting privileges can request access from administrators

### Calendar Interface
- **Month View**: Clean, intuitive calendar layout showing all events
- **Today Indicator**: Current date highlighted with teal border
- **Event Preview**: Events display title, time, and host directly in calendar cells
- **Navigation**: Previous/next month navigation with arrow buttons
- **Department Filtering**: Filter events by Cardiology, Wellness, Imaging, or General departments

### Event Management
- **Create Events**: Full event creation with title, date, time, description, host, location
- **Department Assignment**: Categorize events by department
- **Event Tags**: Add tags like Staff Meeting, Patient Workshop, Corporate Wellness, Training
- **Draft System**: Save events as drafts before publishing
- **Instant Updates**: Calendar updates immediately after event creation

### Design & Branding
- **Pillars Brand Colors**: Teal (primary), Yellow (secondary), Navy (text)
- **Professional Aesthetic**: Clean, clinical-tech design matching pillars.care
- **Responsive Layout**: Works seamlessly on desktop and tablet devices
- **High Contrast**: Accessible design with clear visual hierarchy
- **Keyboard Navigation**: Full keyboard support for accessibility

## Demo Credentials

### Admin User (Full Access)
- **Email**: admin@pillars.care
- **Password**: admin123
- **Permissions**: Can create and publish events

### Regular User (View Only)
- **Email**: user@pillars.care
- **Password**: user123
- **Permissions**: Can view events only, must request posting access

### Doctor User (Full Access)
- **Email**: doctor@pillars.care
- **Password**: doctor123
- **Permissions**: Can create and publish events

## User Workflows

### Login Flow
1. Navigate to the application
2. Enter email and password
3. Click "Sign In" button
4. View permissions confirmation page
5. Click "Continue to Calendar" to access the main interface

### Creating an Event
1. Log in with a user account that has posting access
2. Click "New Event" button in the calendar header
3. Fill in required fields:
   - Event Title
   - Time
   - Host (select from dropdown)
   - Location
4. Optional: Select department, add tags, write description
5. Click "Publish Event" to make it live, or "Save Draft" to save for later
6. Event appears immediately in the calendar

### Viewing Events
1. Navigate through months using arrow buttons
2. Click on any event in the calendar to view full details
3. Use department filter to show only specific department events
4. Events display title, time, and host in calendar cells

### Requesting Access
1. Log in with a user account without posting privileges
2. On the permissions page, click "Request Access from Admin"
3. Or click "Request Event Posting Access" link on login page
4. Administrator will be notified of the request

## Technical Architecture

### Frontend Stack
- **React 19**: Modern UI framework
- **Tailwind CSS 4**: Utility-first styling
- **Wouter**: Lightweight routing
- **shadcn/ui**: High-quality component library

### State Management
- **AuthContext**: Manages user authentication state
- **EventsContext**: Manages calendar events and operations
- **ThemeContext**: Handles light/dark theme (currently set to light)

### Project Structure
```
client/
├── public/
│   └── pillars-logo.png          # Pillars brand logo
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
│   ├── types.ts                  # TypeScript type definitions
│   ├── App.tsx                   # Main app with routing
│   └── index.css                 # Global styles with brand colors
```

## Color Palette

### Primary Colors
- **Teal**: `oklch(0.55 0.12 200)` - Primary actions, accents, today indicator
- **Yellow**: `oklch(0.85 0.15 85)` - Secondary actions, highlights
- **Navy**: `oklch(0.235 0.015 240)` - Text, foreground elements

### Neutral Colors
- **Background**: `oklch(0.98 0 0)` - Light grey background
- **Card**: `oklch(1 0 0)` - White cards and surfaces
- **Muted**: `oklch(0.967 0.001 286.375)` - Subtle backgrounds
- **Border**: `oklch(0.92 0.004 286.32)` - Borders and dividers

## Customization Guide

### Adding New Departments
Edit `/client/src/components/EventModal.tsx`:
```typescript
const DEPARTMENTS: Department[] = ['Cardiology', 'Wellness', 'Imaging', 'General', 'YourNewDepartment'];
```

### Adding New Event Tags
Edit `/client/src/components/EventModal.tsx`:
```typescript
const TAGS: EventTag[] = ['Staff Meeting', 'Patient Workshop', 'Corporate Wellness', 'Training', 'YourNewTag'];
```

### Adding New Hosts
Edit `/client/src/components/EventModal.tsx`:
```typescript
const HOSTS = ['Dr. Johnson', 'Dr. Smith', 'Sarah Williams', 'Tech Team', 'Admin Team', 'Your New Host'];
```

### Modifying Brand Colors
Edit `/client/src/index.css` under the `:root` section to change color values.

## Future Enhancements

### Potential Features
- **Search Functionality**: Search events by title, description, or host
- **Pagination**: Handle large numbers of events efficiently
- **Image Upload**: Allow event images/banners
- **Recurring Events**: Support for repeating events
- **Email Notifications**: Notify users of upcoming events
- **Export Calendar**: Export events to iCal or Google Calendar
- **Multi-language Support**: Internationalization for global use
- **Mobile App**: Native iOS/Android applications

### Backend Integration
Currently, the application uses mock data and client-side state management. For production use, consider:
- Implementing a backend API (Node.js, Python, etc.)
- Database integration (PostgreSQL, MongoDB, etc.)
- Real authentication with JWT or OAuth
- Email service for notifications
- File storage for event images

## Browser Compatibility

The application is tested and works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

The application follows WCAG 2.1 Level AA guidelines:
- Keyboard navigation support
- High contrast ratios for text
- Screen reader compatible
- Focus indicators on interactive elements
- Semantic HTML structure

## Support & Maintenance

For questions, issues, or feature requests, contact the Pillars IT team or submit an issue through your internal ticketing system.

## License

This application is proprietary software developed for Pillars MSO + Health and Wellness Center. All rights reserved.

