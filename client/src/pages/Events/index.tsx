import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common';
import { Header } from '@/components/layouts';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import EventModal from './EventModal';
import AccessRequestsDialog from './AccessRequestsDialog';
import { Event } from '@/types';
import './Events.css';

export default function Events() {
  const [, setLocation] = useLocation();
  const { user, logout, initializing } = useAuth();
  const { events, getEventsByDate } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);

  useEffect(() => {
    // Only redirect if initialization is complete AND user is still null
    // Add a small delay to ensure state has settled
    if (!initializing && !user) {
      const timer = setTimeout(() => {
        if (!user) {
          setLocation('/');
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [user, initializing, setLocation]);

  // Show nothing while initializing
  if (initializing) return null;
  
  // If still no user after initialization, show nothing (redirect will happen)
  if (!user) return null;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('https://server-production-9019.up.railway.app/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch (_) {
      // ignore network errors; proceed with local logout
    } finally {
      logout();
      setLocation('/');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setIsModalOpen(true);
  };

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const filteredEvents = departmentFilter === 'all' 
    ? events 
    : events.filter(e => e.department === departmentFilter);

  const renderCalendarDays = () => {
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Week day headers
    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="calendar-header-day">
          {day}
        </div>
      );
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day calendar-day-empty" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsByDate(date).filter(e => 
        departmentFilter === 'all' || e.department === departmentFilter
      );
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`calendar-day ${isToday ? 'calendar-day-today' : ''}`}
        >
          <div className={`calendar-day-number ${isToday ? 'today-number' : ''}`}>
            {day}
          </div>
          <div className="calendar-events">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                onClick={(e) => handleEventClick(event, e)}
                className="calendar-event"
              >
                <div className="event-title">{event.title}</div>
                <div className="event-time">{event.time}</div>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="event-more">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="events-page">
      {/* Header */}
      <Header
        userName={user.name}
        userRole={user.role}
        onLogout={handleLogout}
        onViewRequests={user.role === 'admin' ? () => setIsRequestsDialogOpen(true) : undefined}
      />

      {/* Calendar Controls */}
      <div className="container py-6">
        <div className="calendar-controls">
          <div className="calendar-navigation">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="calendar-month-title">
              {monthYear}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="calendar-actions">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <span>{departmentFilter === 'all' ? 'All' : departmentFilter}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Wellness">Wellness</SelectItem>
                <SelectItem value="Imaging">Imaging</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            {user.hasPostingAccess && (
              <Button onClick={() => { setSelectedDate(new Date()); setSelectedEvent(null); setIsModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-indicator legend-today"></div>
            <span>Today</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator legend-event"></div>
            <span>Event</span>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        event={selectedEvent}
      />

      {/* Access Requests Dialog (Admin Only) */}
      {user.role === 'admin' && (
        <AccessRequestsDialog
          isOpen={isRequestsDialogOpen}
          onClose={() => setIsRequestsDialogOpen(false)}
        />
      )}
    </div>
  );
}

