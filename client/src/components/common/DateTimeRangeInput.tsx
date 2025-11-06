import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimeRangeInputProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  timeValue: string;
  onTimeChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

// Generate smart default time based on current time
const getSmartDefaultTime = (): { start: string; end: string } => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  let startHour: number;
  let startMinute: number;
  
  if (currentMinutes < 30) {
    // e.g., 6:10 → 6:30 - 7:30
    startHour = currentHour;
    startMinute = 30;
  } else {
    // e.g., 6:43 → 7:00 - 8:00
    startHour = currentHour + 1;
    startMinute = 0;
  }
  
  const endHour = startHour + 1;
  
  // Format to 12-hour with AM/PM
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, '0')}${period}`;
  };
  
  return {
    start: formatTime(startHour, startMinute),
    end: formatTime(endHour, startMinute)
  };
};

// Generate time options in 15-minute intervals
const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const period = hour >= 12 ? 'pm' : 'am';
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      options.push(`${hour12}:${minute.toString().padStart(2, '0')}${period}`);
    }
  }
  
  return options;
};

export const DateTimeRangeInput = ({ 
  selectedDate, 
  onDateChange, 
  timeValue, 
  onTimeChange, 
  required,
  className 
}: DateTimeRangeInputProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const calendarRef = useRef<HTMLDivElement>(null);
  const startTimePickerRef = useRef<HTMLDivElement>(null);
  const endTimePickerRef = useRef<HTMLDivElement>(null);
  const startTimeListRef = useRef<HTMLDivElement>(null);
  const endTimeListRef = useRef<HTMLDivElement>(null);

  // Initialize smart default time on mount or when no value
  useEffect(() => {
    if (!timeValue) {
      const smartTime = getSmartDefaultTime();
      setTimeRange(smartTime);
      onTimeChange(`${smartTime.start} - ${smartTime.end}`);
    } else {
      // Parse existing time value
      const [start, end] = timeValue.split(' - ');
      if (start && end) {
        setTimeRange({ start, end });
      }
    }
  }, [timeValue, onTimeChange]);

  // Scroll to selected time when dropdown opens
  useEffect(() => {
    if (showStartTimePicker && startTimeListRef.current) {
      const selectedButton = startTimeListRef.current.querySelector('[data-selected="true"]');
      if (selectedButton) {
        selectedButton.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    }
  }, [showStartTimePicker]);

  useEffect(() => {
    if (showEndTimePicker && endTimeListRef.current) {
      const selectedButton = endTimeListRef.current.querySelector('[data-selected="true"]');
      if (selectedButton) {
        selectedButton.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    }
  }, [showEndTimePicker]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (startTimePickerRef.current && !startTimePickerRef.current.contains(event.target as Node)) {
        setShowStartTimePicker(false);
      }
      if (endTimePickerRef.current && !endTimePickerRef.current.contains(event.target as Node)) {
        setShowEndTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onDateChange(newDate);
    setShowCalendar(false);
  };

  const handleStartTimeSelect = (time: string) => {
    const newTimeRange = { ...timeRange, start: time };
    setTimeRange(newTimeRange);
    onTimeChange(`${newTimeRange.start} - ${newTimeRange.end}`);
    setShowStartTimePicker(false);
  };

  const handleEndTimeSelect = (time: string) => {
    const newTimeRange = { ...timeRange, end: time };
    setTimeRange(newTimeRange);
    onTimeChange(`${newTimeRange.start} - ${newTimeRange.end}`);
    setShowEndTimePicker(false);
  };

  // Generate end time options with durations relative to start time (24 hours in 15-min intervals)
  const getEndTimeOptions = (): { time: string; duration: string }[] => {
    if (!timeRange.start) return [];
    
    const options: { time: string; duration: string }[] = [];
    
    // Parse start time
    const [startTime, startPeriod] = timeRange.start.split(/(am|pm)/i);
    let [startHours, startMinutes] = startTime.split(':').map(Number);
    
    if (startPeriod && startPeriod.toLowerCase() === 'pm' && startHours !== 12) {
      startHours += 12;
    } else if (startPeriod && startPeriod.toLowerCase() === 'am' && startHours === 12) {
      startHours = 0;
    }
    
    // Generate 24 hours worth of options in 15-minute intervals (96 intervals)
    for (let i = 1; i <= 96; i++) {
      const durationMinutes = i * 15;
      const endTotalMinutes = startHours * 60 + startMinutes + durationMinutes;
      let endHours = Math.floor(endTotalMinutes / 60) % 24;
      const endMinutes = endTotalMinutes % 60;
      
      const endPeriod = endHours >= 12 ? 'pm' : 'am';
      const endHours12 = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
      
      const endTimeStr = `${endHours12}:${endMinutes.toString().padStart(2, '0')}${endPeriod}`;
      
      // Format duration
      let durationStr = '';
      if (durationMinutes < 60) {
        durationStr = `${durationMinutes} mins`;
      } else {
        const hours = Math.floor(durationMinutes / 60);
        const mins = durationMinutes % 60;
        if (mins === 0) {
          durationStr = hours === 1 ? '1 hr' : `${hours} hrs`;
        } else {
          durationStr = `${hours}:${mins.toString().padStart(2, '0')} hrs`;
        }
      }
      
      options.push({ time: endTimeStr, duration: durationStr });
    }
    
    return options;
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

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(viewDate);
  const timeOptions = generateTimeOptions();

  const currentDate = selectedDate || new Date();
  const displayDate = formatDisplayDate(currentDate);
  const displayTime = `${timeRange.start} - ${timeRange.end}`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3 py-3 rounded-lg">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Button */}
            <button
              type="button"
              onClick={() => {
                setShowCalendar(!showCalendar);
                setShowStartTimePicker(false);
                setShowEndTimePicker(false);
              }}
              className={cn(
                "text-sm font-medium text-foreground transition-colors px-2 py-1 rounded",
                showCalendar 
                  ? "border-b-2 border-primary" 
                  : "hover:bg-muted/50"
              )}
            >
              {displayDate}
            </button>
            
            {/* Start Time */}
            <div className="relative inline-block" ref={startTimePickerRef}>
              <button
                type="button"
                onClick={() => {
                  setShowStartTimePicker(!showStartTimePicker);
                  setShowEndTimePicker(false);
                  setShowCalendar(false);
                }}
                className={cn(
                  "text-sm font-medium text-foreground transition-colors px-2 py-1 rounded",
                  showStartTimePicker 
                    ? "border-b-2 border-primary" 
                    : "hover:bg-muted/50"
                )}
              >
                {timeRange.start}
              </button>
              
              {showStartTimePicker && (
                <div ref={startTimeListRef} className="absolute z-50 mt-2 bg-background border-0 rounded-lg shadow-lg p-1 min-w-[140px] max-h-60 overflow-y-auto">
                  {timeOptions.map(time => (
                    <button
                      key={`start-${time}`}
                      type="button"
                      onClick={() => handleStartTimeSelect(time)}
                      data-selected={timeRange.start === time}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded whitespace-nowrap",
                        timeRange.start === time && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <span className="text-muted-foreground">-</span>
            
            {/* End Time */}
            <div className="relative inline-block" ref={endTimePickerRef}>
              <button
                type="button"
                onClick={() => {
                  setShowEndTimePicker(!showEndTimePicker);
                  setShowStartTimePicker(false);
                  setShowCalendar(false);
                }}
                className={cn(
                  "text-sm font-medium text-foreground transition-colors px-2 py-1 rounded",
                  showEndTimePicker 
                    ? "border-b-2 border-primary" 
                    : "hover:bg-muted/50"
                )}
              >
                {timeRange.end}
              </button>
              
              {showEndTimePicker && (
                <div ref={endTimeListRef} className="absolute z-50 mt-2 bg-background border-0 rounded-lg shadow-lg p-1 min-w-[180px] max-h-60 overflow-y-auto">
                  {getEndTimeOptions().map(option => (
                    <button
                      key={`end-${option.time}`}
                      type="button"
                      onClick={() => handleEndTimeSelect(option.time)}
                      data-selected={timeRange.end === option.time}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded whitespace-nowrap",
                        timeRange.end === option.time && "bg-primary/10 font-medium"
                      )}
                    >
                      <span className={cn(timeRange.end === option.time ? "text-primary" : "text-foreground")}>
                        {option.time}
                      </span>
                      {' '}
                      <span className={cn(timeRange.end === option.time ? "text-primary" : "text-muted-foreground")}>
                        ({option.duration})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div 
          ref={calendarRef}
          className="absolute z-50 mt-2 bg-background border-0 rounded-lg shadow-lg p-4 min-w-[280px]"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "p-2 rounded-full hover:bg-primary/10 transition-colors",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    isToday && !isSelected && "bg-blue-100 text-blue-900"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

