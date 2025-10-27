import { createContext, useContext, useState, ReactNode } from 'react';
import { Event } from '@/types';

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: Date) => Event[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Mock initial events
const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Cardiology Team Meeting',
    date: new Date(2025, 9, 28),
    time: '10:00 AM',
    description: 'Monthly team sync and case review',
    host: 'Dr. Johnson',
    location: 'Conference Room A',
    department: 'Cardiology',
    tags: ['Staff Meeting'],
    status: 'published',
    createdBy: '1',
  },
  {
    id: '2',
    title: 'Patient Wellness Workshop',
    date: new Date(2025, 9, 30),
    time: '2:00 PM',
    description: 'Introduction to mindfulness and stress management',
    host: 'Sarah Williams',
    location: 'Wellness Center',
    department: 'Wellness',
    tags: ['Patient Workshop'],
    status: 'published',
    createdBy: '3',
  },
  {
    id: '3',
    title: 'Imaging Equipment Training',
    date: new Date(2025, 10, 5),
    time: '9:00 AM',
    description: 'New MRI system training for staff',
    host: 'Tech Team',
    location: 'Imaging Department',
    department: 'Imaging',
    tags: ['Training'],
    status: 'published',
    createdBy: '1',
  },
];

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, eventData: Partial<Event>) => {
    setEvents(prev =>
      prev.map(event => (event.id === id ? { ...event, ...eventData } : event))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventsByDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <EventsContext.Provider
      value={{ events, addEvent, updateEvent, deleteEvent, getEventsByDate }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}

