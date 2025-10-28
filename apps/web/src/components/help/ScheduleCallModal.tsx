'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleCallModal({ isOpen, onClose }: ScheduleCallModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [callType, setCallType] = useState('video');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [currentMonth1, setCurrentMonth1] = useState(new Date());
  const [currentMonth2, setCurrentMonth2] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Call scheduled:', { selectedDate, selectedTime, callType, phone, notes });
    onClose();
  };

  // Generate time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (calendar: 1 | 2, direction: 'prev' | 'next') => {
    const setter = calendar === 1 ? setCurrentMonth1 : setCurrentMonth2;
    const current = calendar === 1 ? currentMonth1 : currentMonth2;
    
    setter(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const renderCalendar = (monthDate: Date, calendarNumber: 1 | 2) => {
    const days = getDaysInMonth(monthDate);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3 px-2">
          <button
            type="button"
            onClick={() => navigateMonth(calendarNumber, 'prev')}
            className="p-1 hover:bg-muted rounded transition-all"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <h3 className="text-sm text-muted-foreground">{monthName}</h3>
          <button
            type="button"
            onClick={() => navigateMonth(calendarNumber, 'next')}
            className="p-1 hover:bg-muted rounded transition-all"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-xs text-muted-foreground/60 p-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }
            
            const isSelectable = isDateSelectable(date);
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => isSelectable && setSelectedDate(date)}
                disabled={!isSelectable}
                style={isSelected ? { backgroundColor: '#0C115B' } : {}}
                className={`aspect-square p-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'text-primary-foreground shadow-md'
                    : isSelectable
                    ? 'bg-white hover:bg-muted border border-input'
                    : 'text-muted-foreground cursor-not-allowed'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="text-base text-muted-foreground">Schedule a Call</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Call Type */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Call Type <span className="text-danger">*</span>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setCallType('video')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  callType === 'video'
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-input bg-background text-foreground hover:border-gray-400'
                }`}
              >
                Video Call
              </button>
              <button
                type="button"
                onClick={() => setCallType('phone')}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  callType === 'phone'
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-input bg-background text-foreground hover:border-gray-400'
                }`}
              >
                Phone Call
              </button>
            </div>
          </div>

          {/* Dual Calendar Date Selection */}
          <div>
            <label className="block text-sm text-muted-foreground mb-3">
              Select Date <span className="text-danger">*</span>
            </label>
            <div className="flex gap-4 p-4 bg-muted rounded-lg">
              {renderCalendar(currentMonth1, 1)}
              <div className="w-px bg-border" />
              {renderCalendar(currentMonth2, 2)}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Select Time (EST) <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-muted rounded-lg">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    style={selectedTime === time ? { backgroundColor: '#0C115B', borderColor: '#0C115B' } : {}}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'text-primary-foreground shadow-md'
                        : 'border-input bg-background text-foreground hover:border-gray-400'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phone Number (if phone call) */}
          {callType === 'phone' && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={callType === 'phone'}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
              placeholder="What would you like to discuss?"
            />
          </div>

          {/* Summary */}
          {selectedDate && selectedTime && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                <Calendar className="inline h-4 w-4 mr-1" />
                {selectedDate.toLocaleDateString('en-GB')}
                <Clock className="inline h-4 w-4 ml-4 mr-1" />
                {selectedTime} EST
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedDate || !selectedTime}
            >
              Schedule Call
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
