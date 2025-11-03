# Permissions Components

This folder contains all components related to permission management and access control for the Pillars Events application.

## Components

### AccessRequestsDialog
Admin-only dialog component for managing user access requests.

**Features:**
- View all pending access requests
- Approve/Deny requests with one click
- See recent activity (approved/denied requests)
- Real-time status updates
- Beautiful UI with status badges

**Usage:**
```tsx
import { AccessRequestsDialog } from '@/components/permissions';

<AccessRequestsDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Props:**
- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback when dialog is closed

## Future Components

This folder can be extended with additional permission-related components:
- Permission guards/wrappers
- Role-based access control components
- User permission management
- etc.

