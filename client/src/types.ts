export interface User {
  id: string;
  email: string;
  name: string;
  hasPostingAccess: boolean;
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

