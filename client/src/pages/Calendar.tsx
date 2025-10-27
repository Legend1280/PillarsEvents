import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { ChevronLeft, ChevronRight, LogOut, Plus, Filter } from 'lucide-react';
import EventModal from '@/components/EventModal';
import { Event, Department } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Calendar() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { events, getEventsByDate } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setLocation('/');
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
        <div key={`header-${day}`} className="text-center font-semibold text-sm text-muted-foreground py-2">
          {day}
        </div>
      );
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 border border-border bg-muted/20" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsByDate(date).filter(e => 
        departmentFilter === 'all' || e.department === departmentFilter
      );
      const isToday =
        date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`min-h-24 border border-border bg-card hover:bg-accent/10 cursor-pointer transition-colors p-2 ${
            isToday ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                onClick={(e) => handleEventClick(event, e)}
                className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors border-l-2 border-primary truncate"
              >
                <div className="font-medium text-foreground">{event.title}</div>
                <div className="text-muted-foreground">{event.time}</div>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground pl-1">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/pillars-logo.png" alt="Pillars" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Events Calendar</h1>
                <p className="text-sm text-muted-foreground">Pillars MSO + Health and Wellness Center</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Controls */}
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
              {monthYear}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
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
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="grid grid-cols-7">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/10 border-l-2 border-primary"></div>
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
    </div>
  );
}

