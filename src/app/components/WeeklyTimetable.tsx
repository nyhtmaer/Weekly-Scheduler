import { useState } from "react";
import { EventDialog, EventData } from "@/app/components/EventDialog";
import { Button } from "@/app/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

export function WeeklyTimetable() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleAddEvent = (day: string, time: string) => {
    setSelectedEvent(null);
    setSelectedDay(day);
    setSelectedTime(time);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: EventData) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const handleSaveEvent = (eventData: EventData) => {
    if (selectedEvent) {
      setEvents(events.map((e) => (e.id === eventData.id ? eventData : e)));
    } else {
      setEvents([...events, eventData]);
    }
  };

  const getEventsForCell = (day: string, time: string) => {
    return events.filter((event) => {
      if (event.day !== day) return false;
      const eventStart = event.startTime;
      const eventEnd = event.endTime;
      return eventStart <= time && eventEnd > time;
    });
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getEventHeight = (event: EventData) => {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);
    const durationMinutes = endMinutes - startMinutes;
    const hours = durationMinutes / 60;
    return `${hours * 6}rem`; // 6rem per hour (height of one cell)
  };

  const getEventTop = (event: EventData, cellTime: string) => {
    const cellMinutes = timeToMinutes(cellTime);
    const eventMinutes = timeToMinutes(event.startTime);
    if (eventMinutes <= cellMinutes) return "0";
    const diffMinutes = eventMinutes - cellMinutes;
    const hours = diffMinutes / 60;
    return `${hours * 6}rem`;
  };

  const isEventStart = (event: EventData, time: string) => {
    return event.startTime === time;
  };

  return (
    <div className="w-full h-full overflow-auto p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Weekly Planner</h1>
          <p className="text-gray-600">Click on any time slot to add an event</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 border-r bg-gray-100"></div>
            {days.map((day) => (
              <div key={day} className="p-4 text-center border-r last:border-r-0 bg-gray-100">
                <div className="font-semibold">{day}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8">
            <div className="border-r bg-gray-50">
              {timeSlots.map((time) => (
                <div key={time} className="h-24 p-2 border-b text-sm text-gray-600 flex items-center justify-center">
                  {time}
                </div>
              ))}
            </div>

            {days.map((day) => (
              <div key={day} className="border-r last:border-r-0">
                {timeSlots.map((time) => {
                  const cellEvents = getEventsForCell(day, time);
                  const displayedEvents = cellEvents.filter((e) => isEventStart(e, time));

                  return (
                    <div
                      key={`${day}-${time}`}
                      className="h-24 border-b relative group hover:bg-blue-50 transition-colors"
                    >
                      <button
                        onClick={() => handleAddEvent(day, time)}
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10"
                      >
                        <Plus className="w-5 h-5 text-blue-600" />
                      </button>

                      {displayedEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 ${event.color} text-white rounded p-2 z-20 overflow-hidden shadow-md group/event`}
                          style={{
                            top: getEventTop(event, time),
                            height: getEventHeight(event),
                          }}
                        >
                          <div className="text-sm flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{event.title}</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event);
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        day={selectedDay}
        time={selectedTime}
      />
    </div>
  );
}