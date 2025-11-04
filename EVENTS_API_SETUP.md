# Events API - Setup और Usage Guide

## 🚀 Quick Setup

### 1. Database Setup

PostgreSQL में `events` table create करें:

```bash
# Server directory में जाएं
cd server

# Schema file को run करें
psql -U your_username -d your_database -f schema.sql
```

### 2. Backend Dependencies Install करें

```bash
cd server
npm install
# या
pnpm install
```

### 3. Frontend Dependencies Already Installed हैं

Frontend में कोई नया dependency add नहीं हुआ है, सब पहले से है।

### 4. Server Start करें

```bash
cd server
npm run dev
```

Server चलेगा on: `http://localhost:8000`

### 5. Frontend Start करें (अलग terminal में)

```bash
cd client
npm run dev
# या
pnpm dev
```

## 🎯 Features Implemented

### Backend (server/routes/index.js)

✅ **GET /api/events** - सभी events fetch करें
- Query parameters: `month`, `year`, `department`, `status`, `page`, `limit`
- Pagination support के साथ
- Multiple filters support

✅ **GET /api/events/:id** - Single event fetch करें

✅ **POST /api/events** - नया event create करें
- Authentication required (Bearer token)
- Posting access check
- Complete validation

✅ **PUT /api/events/:id** - Event update करें
- Authentication required
- Dynamic field updates

✅ **DELETE /api/events/:id** - Event delete करें
- Authentication required

### Frontend (client/src/contexts/EventsContext.tsx)

✅ Backend से events fetch करना (on page load)
✅ "Publish Event" button से event create करना
✅ PostgreSQL में data store होना
✅ Event update करना
✅ Event delete करना
✅ Real-time UI updates
✅ Error handling के साथ toast notifications

## 📝 Usage

### Event Create करने के लिए:

1. Login करें (posting access के साथ)
2. "New Event" button click करें या calendar पर कोई date click करें
3. Form में सभी details भरें:
   - Title *
   - Time *
   - Host *
   - Location *
   - Department
   - Tags
   - Description
4. "Publish Event" button click करें
5. Event तुरंत database में save होगा और calendar पर दिखेगा

### Draft Save करने के लिए:

- "Save Draft" button click करें
- Event "draft" status के साथ save होगा

## 🔐 Authentication

सभी POST, PUT, DELETE operations के लिए Bearer token required है:

```javascript
Authorization: Bearer <your-jwt-token>
```

Token localStorage से automatically pickup होता है।

## 🗄️ Database Schema

```sql
events table:
- id (UUID, Primary Key)
- title (VARCHAR)
- date (TIMESTAMP)
- time (VARCHAR)
- description (TEXT)
- host (VARCHAR)
- location (VARCHAR)
- department (VARCHAR)
- tags (JSONB) - stored as JSON array
- status (VARCHAR: 'draft' | 'published')
- image_url (TEXT, optional)
- created_by (UUID, Foreign Key -> users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 📡 API Examples

### Create Event
```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Cardiology Team Meeting",
    "date": "2025-11-28T00:00:00Z",
    "time": "10:00 AM",
    "description": "Monthly team sync",
    "host": "Dr. Johnson",
    "location": "Conference Room A",
    "department": "Cardiology",
    "tags": ["Staff Meeting"],
    "status": "published"
  }'
```

### Get All Events
```bash
curl http://localhost:8000/api/events?year=2025&month=11
```

### Update Event
```bash
curl -X PUT http://localhost:8000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Updated Title"}'
```

### Delete Event
```bash
curl -X DELETE http://localhost:8000/api/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚠️ Important Notes

1. **Database**: `events` table पहले create होना चाहिए (schema.sql use करें)
2. **Authentication**: Login user के पास `has_posting_access = true` होना चाहिए
3. **JWT Token**: Valid JWT token required for create/update/delete operations
4. **CORS**: Backend में CORS enabled है for `http://localhost:5173`

## 🐛 Troubleshooting

### Error: "Authorization token missing"
- Login करें और valid token ensure करें
- localStorage में 'token' check करें

### Error: "Access denied"
- User को posting access grant करें database में
- `UPDATE users SET has_posting_access = true WHERE email = 'user@example.com'`

### Error: "Failed to fetch events"
- Backend server running है check करें
- PostgreSQL database connected है check करें
- `events` table exists check करें

## ✅ Testing Checklist

- [ ] Database table created
- [ ] Backend server running
- [ ] Frontend server running
- [ ] User logged in with posting access
- [ ] Create new event working
- [ ] Event appears in database
- [ ] Event appears in calendar
- [ ] Update event working
- [ ] Delete event working
- [ ] Toast notifications showing correctly

