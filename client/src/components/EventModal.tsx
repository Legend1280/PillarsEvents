import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { Event, Department, EventTag } from '@/types';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, User, Tag, Building2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  event?: Event | null;
}

const DEPARTMENTS: Department[] = ['Cardiology', 'Wellness', 'Imaging', 'General'];
const TAGS: EventTag[] = ['Staff Meeting', 'Patient Workshop', 'Corporate Wellness', 'Training'];
const HOSTS = ['Dr. Johnson', 'Dr. Smith', 'Sarah Williams', 'Tech Team', 'Admin Team'];

export default function EventModal({ isOpen, onClose, selectedDate, event }: EventModalProps) {
  const { user } = useAuth();
  const { addEvent, updateEvent, getEventsByDate } = useEvents();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    description: '',
    host: '',
    location: '',
    department: 'General' as Department,
    tags: [] as string[],
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        time: event.time,
        description: event.description,
        host: event.host,
        location: event.location,
        department: (event.department as Department) || 'General',
        tags: event.tags || [],
      });
      setIsEditing(false);
    } else {
      setFormData({
        title: '',
        time: '',
        description: '',
        host: '',
        location: '',
        department: 'General',
        tags: [],
      });
      setIsEditing(true);
    }
  }, [event, isOpen]);

  const handleSubmit = (status: 'draft' | 'published') => {
    if (!selectedDate || !user) return;

    if (!formData.title || !formData.time || !formData.host || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eventData = {
      ...formData,
      date: selectedDate,
      status,
      createdBy: user.id,
    };

    if (event) {
      updateEvent(event.id, eventData);
      toast.success('Event updated successfully');
    } else {
      addEvent(eventData);
      toast.success(status === 'draft' ? 'Event saved as draft' : 'Event published successfully');
    }

    onClose();
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const dayEvents = selectedDate ? getEventsByDate(selectedDate) : [];
  const canEdit = user?.hasPostingAccess && (isEditing || !event);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event && !isEditing ? 'Event Details' : event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {selectedDate?.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </DialogDescription>
        </DialogHeader>

        {!canEdit && event ? (
          // View mode
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{event.title}</h3>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Host: {event.host}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              {event.department && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{event.department}</span>
                </div>
              )}
              {event.tags && event.tags.length > 0 && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-secondary/20 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {event.description && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{event.description}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : !user?.hasPostingAccess ? (
          // No permission to create
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You don't have permission to create events. Please request access from an administrator.
            </p>
            {dayEvents.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Events on this day:</h4>
                <div className="space-y-2">
                  {dayEvents.map(evt => (
                    <div key={evt.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{evt.title}</div>
                      <div className="text-sm text-muted-foreground">{evt.time} • {evt.host}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          // Edit/Create mode
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit('published'); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">Host *</Label>
                <Select value={formData.host} onValueChange={(value) => setFormData({ ...formData, host: value })}>
                  <SelectTrigger id="host">
                    <SelectValue placeholder="Select host" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOSTS.map(host => (
                      <SelectItem key={host} value={host}>{host}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value as Department })}>
                <SelectTrigger id="department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={() => handleSubmit('draft')}>
                Save Draft
              </Button>
              <Button type="submit">
                Publish Event
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

