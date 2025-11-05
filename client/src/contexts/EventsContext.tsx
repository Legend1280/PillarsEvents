import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Event } from '@/types';
import { toast } from 'sonner';

interface EventsContextType {
  events: Event[];
  loading: boolean;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsByDate: (date: Date) => Event[];
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

const API_BASE_URL = 'https://server-production-9019.up.railway.app/api';

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${API_BASE_URL}/events?year=${currentYear}&limit=500`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      // Transform backend data to frontend format
      const transformedEvents = data.events.map((event: any) => {
        // Parse date as local date (YYYY-MM-DD format)
        let eventDate: Date;
        if (typeof event.date === 'string' && event.date.includes('-')) {
          const [year, month, day] = event.date.split('T')[0].split('-').map(Number);
          eventDate = new Date(year, month - 1, day); // month is 0-indexed
        } else {
          eventDate = new Date(event.date);
        }
        
        return {
          id: event.id,
          title: event.title,
          date: eventDate,
          time: event.time,
          description: event.description,
          host: event.host,
          location: event.location,
          department: event.department,
          tags: Array.isArray(event.tags) ? event.tags : (typeof event.tags === 'string' ? JSON.parse(event.tags) : []),
          status: event.status,
          createdBy: event.createdBy,
        };
      });

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const refreshEvents = async () => {
    await fetchEvents();
  };

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to create events');
        return;
      }

      // Format date as YYYY-MM-DD (local date without timezone conversion)
      const date = eventData.date instanceof Date ? eventData.date : new Date(eventData.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const payload = {
        title: eventData.title,
        date: formattedDate,
        time: eventData.time,
        description: eventData.description,
        host: eventData.host,
        location: eventData.location,
        department: eventData.department,
        tags: eventData.tags || [],
        status: eventData.status || 'published',
        imageUrl: eventData.imageUrl || null,
      };

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      const data = await response.json();
      
      // Parse date as local date
      let eventDate: Date;
      if (typeof data.event.date === 'string' && data.event.date.includes('-')) {
        const [year, month, day] = data.event.date.split('T')[0].split('-').map(Number);
        eventDate = new Date(year, month - 1, day);
      } else {
        eventDate = new Date(data.event.date);
      }
      
      // Add new event to state
      const newEvent: Event = {
        id: data.event.id,
        title: data.event.title,
        date: eventDate,
        time: data.event.time,
        description: data.event.description,
        host: data.event.host,
        location: data.event.location,
        department: data.event.department,
        tags: Array.isArray(data.event.tags) ? data.event.tags : (typeof data.event.tags === 'string' ? JSON.parse(data.event.tags) : []),
        status: data.event.status,
        createdBy: data.event.createdBy,
      };

      setEvents(prev => [...prev, newEvent]);
      
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
      throw error;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to update events');
        return;
      }

      // Format date if present (local date without timezone conversion)
      const payload: any = { ...eventData };
      if (payload.date) {
        const date = payload.date instanceof Date ? payload.date : new Date(payload.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        payload.date = `${year}-${month}-${day}`;
      }

      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }

      const data = await response.json();
      
      // Update event in state
      setEvents(prev =>
        prev.map(event => 
          event.id === id 
            ? {
                ...event,
                ...eventData,
                date: data.event.date ? new Date(data.event.date) : event.date,
              }
            : event
        )
      );
      
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Failed to update event');
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to delete events');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }

      // Remove event from state
      setEvents(prev => prev.filter(event => event.id !== id));
      
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'Failed to delete event');
      throw error;
    }
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
      value={{ events, loading, addEvent, updateEvent, deleteEvent, getEventsByDate, refreshEvents }}
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

