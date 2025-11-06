export interface User {
  id: string;
  email: string;
  name: string;
  hasPostingAccess: boolean;
  role?: 'admin' | 'member';
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  host: string;
  location: string;
  imageUrl?: string;
  department?: string;
  tags?: string[];
  status: 'draft' | 'published';
  createdBy: string;
}

export type Department = 'Cardiology' | 'Wellness' | 'Imaging' | 'General';
export type EventTag = 'Staff Meeting' | 'Patient Workshop' | 'Corporate Wellness' | 'Training';

export interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}
