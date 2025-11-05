import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export const TimeInput = ({ id, value, onChange, required, className }: TimeInputProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse incoming value (HH:MM format from database)
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      if (h && m) {
        const hour = parseInt(h);
        const minute = parseInt(m);
        
        if (hour === 0) {
          setHours('12');
          setPeriod('AM');
        } else if (hour < 12) {
          setHours(hour.toString());
          setPeriod('AM');
        } else if (hour === 12) {
          setHours('12');
          setPeriod('PM');
        } else {
          setHours((hour - 12).toString());
          setPeriod('PM');
        }
        setMinutes(minute.toString().padStart(2, '0'));
      }
    }
  }, [value]);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const updateTime = (h: string, m: string, p: 'AM' | 'PM') => {
    let hour24 = parseInt(h);
    
    if (p === 'AM') {
      if (hour24 === 12) hour24 = 0;
    } else {
      if (hour24 !== 12) hour24 += 12;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
    onChange(timeString);
  };

  const handleHourChange = (newHour: string) => {
    setHours(newHour);
    updateTime(newHour, minutes, period);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinutes(newMinute);
    updateTime(hours, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    updateTime(hours, minutes, newPeriod);
  };

  const displayValue = value 
    ? `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')} ${period}`
    : '';

  return (
    <div className="relative" ref={pickerRef}>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={displayValue}
          onClick={() => setShowPicker(true)}
          readOnly
          required={required}
          placeholder="--:-- --"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background cursor-pointer",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
        <Clock 
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
        />
      </div>

      {showPicker && (
        <div className="absolute z-50 mt-2 bg-card border border-border rounded-lg shadow-lg p-3 w-full min-w-[220px]">
          <div className="flex gap-2 items-end justify-center">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <label className="text-xs text-muted-foreground mb-1.5">Hour</label>
              <select
                value={hours}
                onChange={(e) => handleHourChange(e.target.value)}
                size={4}
                className="w-14 px-1 py-0.5 text-center border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer overflow-y-auto"
                style={{ scrollbarWidth: 'thin' }}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = (i + 1).toString();
                  return (
                    <option key={hour} value={hour} className="py-0.5">
                      {hour.padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
            </div>

            <span className="text-xl font-bold mb-2">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <label className="text-xs text-muted-foreground mb-1.5">Minute</label>
              <select
                value={minutes}
                onChange={(e) => handleMinuteChange(e.target.value)}
                size={4}
                className="w-14 px-1 py-0.5 text-center border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer overflow-y-auto"
                style={{ scrollbarWidth: 'thin' }}
              >
                {Array.from({ length: 60 }, (_, i) => {
                  const minute = i.toString().padStart(2, '0');
                  return (
                    <option key={minute} value={minute} className="py-0.5">
                      {minute}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* AM/PM */}
            <div className="flex flex-col gap-1.5 mb-0.5">
              <button
                type="button"
                onClick={() => handlePeriodChange('AM')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  period === 'AM'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('PM')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  period === 'PM'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                PM
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="w-full mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

