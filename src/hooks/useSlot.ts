import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CalendarSlot {
  date: string;
  slots: string[];
}

export const useCalendarSlots = () => {
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCalendarSlots = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://my-fastapi-service-608954479960.us-central1.run.app/calendar/free-slots?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar slots');
      }

      const data: CalendarSlot[] = await response.json();
      setCalendarSlots(data);
      return data;
    } catch (error) {
      console.error('Error fetching calendar slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calendarSlots,
    isLoading,
    fetchCalendarSlots
  };
};