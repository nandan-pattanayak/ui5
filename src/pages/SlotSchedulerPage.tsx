import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCalendarSlots } from '@/hooks/useSlot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const SlotSchedulerPage = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const id = idParam || search.get('id') || '';
  const { calendarSlots, isLoading, fetchCalendarSlots } = useCalendarSlots();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCalendarSlots(id);
    }
  }, [id]);

  const handleSlotSelection = (date: string, slot: string) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayOfWeek = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const getDateNumber = (dateStr: string) => {
    return dateStr.split('-')[0];
  };

  const convertSlotToISO = (dateStr: string, slot: string) => {
    try {
      console.log('Converting slot:', { dateStr, slot });
      
      const [day, month, year] = dateStr.split('-');
      
      // Handle different time formats (12:00 PM, 12:00, etc.)
      let time, period;
      if (slot.includes(' ')) {
        [time, period] = slot.split(' ');
      } else {
        time = slot;
        period = null;
      }
      
      const [hours, minutes = '0'] = time.split(':');
      
      let hour24 = parseInt(hours);
      
      if (period) {
        if (period.toUpperCase() === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
      }

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minutes));
      
      console.log('Converted date object:', date);
      console.log('ISO string:', date.toISOString());
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date created');
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('Error converting slot to ISO:', error);
      throw new Error(`Failed to convert time slot: ${slot} for date: ${dateStr}`);
    }
  };

  const handleConfirmBooking = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meeting title",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const startTime = convertSlotToISO(selectedDate, selectedSlot);
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 minutes later

      const requestData = {
        id: id,
        title: title.trim(),
        description: description.trim(),
        start_time: startTime,
        end_time: endDate.toISOString(),
      };

      console.log('Sending booking request:', requestData);
      console.log('Selected date:', selectedDate, 'Selected slot:', selectedSlot);
      console.log('Converted start time:', startTime);

      const response = await fetch(`https://my-fastapi-service-608954479960.us-central1.run.app/calendar/schedule-meeting?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Failed to schedule meeting: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      setBookingResult(result);
      
      toast({
        title: "Success",
        description: "Meeting scheduled successfully!",
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Schedule a Meeting
            </h1>
            <p className="text-muted-foreground">
              Select your preferred date and time slot
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Date Selection */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Available Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {calendarSlots.map((dayData) => (
                    <Button
                      key={dayData.date}
                      variant={selectedDate === dayData.date ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center space-y-1"
                      onClick={() => {
                        setSelectedDate(dayData.date);
                        setSelectedSlot('');
                      }}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {getDayOfWeek(dayData.date)}
                      </span>
                      <span className="text-lg font-bold">
                        {getDateNumber(dayData.date)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {dayData.slots.length} slots
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  {selectedDate ? formatDate(selectedDate) : 'Select a date first'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {calendarSlots
                      .find(day => day.date === selectedDate)
                      ?.slots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          size="sm"
                          className="text-sm"
                          onClick={() => handleSlotSelection(selectedDate, slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Please select a date to view available time slots</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Confirmation */}
          {selectedDate && selectedSlot && !bookingResult && (
            <Card className="mt-8 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Selected: {formatDate(selectedDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Time: {selectedSlot}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">
                      Meeting Title *
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter meeting title"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter meeting description"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleConfirmBooking}
                  disabled={isBooking || !title.trim()}
                >
                  {isBooking ? 'Scheduling...' : 'Confirm Booking'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {bookingResult && (
            <Card className="mt-8 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Meeting Scheduled Successfully!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your meeting "{bookingResult.summary}" has been added to your calendar.
                    </p>
                    <div className="bg-background/50 rounded-lg p-4 text-left">
                      <p className="text-sm"><strong>Event ID:</strong> {bookingResult.id}</p>
                      <p className="text-sm"><strong>Start:</strong> {new Date(bookingResult.start).toLocaleString()}</p>
                      <p className="text-sm"><strong>End:</strong> {new Date(bookingResult.end).toLocaleString()}</p>
                    </div>
                  </div>
                  {bookingResult.htmlLink && (
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                      <a 
                        href={bookingResult.htmlLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in Google Calendar
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {calendarSlots.length === 0 && !isLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Available Slots
                </h3>
                <p className="text-muted-foreground">
                  There are currently no available time slots for this calendar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotSchedulerPage;