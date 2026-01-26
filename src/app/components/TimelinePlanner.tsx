import { useEffect, useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TimelineEventDialog, TimelineEventData } from "@/app/components/TimelineEventDialog";
import { Button } from "@/app/components/ui/button";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Generate time markers for the 24-hour timeline
const timeMarkers = Array.from({ length: 25 }, (_, i) => {
  const hour = i;
  return `${hour.toString().padStart(2, "0")}:00`;
});

const ItemTypes = {
  EVENT: "event",
};

interface DraggableEventProps {
  event: TimelineEventData;
  index: number;
  moveEvent: (dragIndex: number, hoverIndex: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  style: React.CSSProperties;
  getEndTime: (event: TimelineEventData) => string;
  formatDuration: (minutes: number) => string;
}

function DraggableEvent({
  event,
  index,
  moveEvent,
  onEdit,
  onDelete,
  style,
  getEndTime,
  formatDuration,
}: DraggableEventProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EVENT,
    item: { index, eventId: event.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.EVENT,
    hover: (item: { index: number; eventId: string }) => {
      if (item.index !== index) {
        moveEvent(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`absolute left-1 right-1 ${event.color} text-white rounded p-2 shadow-md group/event cursor-move overflow-hidden ${
        isDragging ? "opacity-50" : ""
      }`}
      style={style}
    >
      <div className="flex items-start gap-1">
        <GripVertical className="w-4 h-4 flex-shrink-0 opacity-50" />
        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <div className="font-semibold truncate">{event.title}</div>
            <div className="text-xs opacity-90 mt-1">{formatDuration(event.durationMinutes)}</div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-white/20 rounded"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-white/20 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelinePlannerContent() {
  const [events, setEvents] = useState<TimelineEventData[]>(() => {
  const saved = localStorage.getItem("weekly-events");
  return saved ? JSON.parse(saved) : [];
});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
  localStorage.setItem("weekly-events", JSON.stringify(events));
}, [events]);

  const handleAddEvent = (day: string) => {
    setSelectedEvent(null);
    setSelectedDay(day);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: TimelineEventData) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const recalculateStartTimes = (dayEvents: TimelineEventData[]) => {
    let currentTime = 0; // Start at 00:00
    return dayEvents.map((event) => {
      const updatedEvent = { ...event, startTime: minutesToTime(currentTime) };
      currentTime += event.durationMinutes;
      return updatedEvent;
    });
  };

  const handleSaveEvent = (eventData: TimelineEventData) => {
    if (selectedEvent) {
      // Editing existing event
      const updatedEvents = events.map((e) => (e.id === eventData.id ? { ...eventData, startTime: e.startTime } : e));
      
      // Recalculate start times for the day
      const dayEvents = updatedEvents.filter((e) => e.day === eventData.day);
      const otherDayEvents = updatedEvents.filter((e) => e.day !== eventData.day);
      const recalculatedDayEvents = recalculateStartTimes(dayEvents);
      
      setEvents([...otherDayEvents, ...recalculatedDayEvents]);
    } else {
      // Adding new event
      const dayEvents = events.filter((e) => e.day === eventData.day);
      const totalScheduled = dayEvents.reduce((sum, e) => sum + e.durationMinutes, 0);

      // Check if event would exceed 24 hours
      if (totalScheduled + eventData.durationMinutes > 1440) {
        alert("Event would exceed 24 hours!");
        return;
      }

      const startTime = minutesToTime(totalScheduled);
      setEvents([...events, { ...eventData, startTime }]);
    }
  };

  const moveEvent = (day: string, dragIndex: number, hoverIndex: number) => {
    const dayEvents = getEventsForDay(day);
    const draggedEvent = dayEvents[dragIndex];

    // Reorder events
    const newOrder = [...dayEvents];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, draggedEvent);

    // Recalculate start times
    const recalculated = recalculateStartTimes(newOrder);

    // Update all events
    const otherDayEvents = events.filter((e) => e.day !== day);
    setEvents([...otherDayEvents, ...recalculated]);
  };

  const getEventsForDay = (day: string) => {
    return events
      .filter((e) => e.day === day)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  };

  const getEventStyle = (event: TimelineEventData) => {
    const startMinutes = timeToMinutes(event.startTime);
    const percentage = (startMinutes / 1440) * 100;
    const heightPercentage = (event.durationMinutes / 1440) * 100;

    return {
      top: `${percentage}%`,
      height: `${heightPercentage}%`,
    };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const getEndTime = (event: TimelineEventData) => {
    const endMinutes = timeToMinutes(event.startTime) + event.durationMinutes;
    return minutesToTime(endMinutes);
  };

  const getDayStats = (day: string) => {
    const dayEvents = getEventsForDay(day);
    const scheduledMinutes = dayEvents.reduce((sum, e) => sum + e.durationMinutes, 0);
    const unscheduledMinutes = 1440 - scheduledMinutes;

    return {
      scheduled: formatDuration(scheduledMinutes),
      unscheduled: formatDuration(unscheduledMinutes),
      percentage: ((scheduledMinutes / 1440) * 100).toFixed(0),
    };
  };

  return (
    <div className="w-full h-auto md:h-full overflow-auto p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Weekly Timeline Planner</h1>
          <p className="text-gray-600">
            Click the + button on any day to add an activity. Drag events to reorder them within the day.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-8 overflow-x-auto">
            {/* Time column */}
            <div className="border-r bg-gray-50 min-w-[60px]">
              <div className="h-16 p-4 border-b bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-semibold">Time</span>
              </div>
              <div className="relative" style={{ height: "1200px" }}>
                {timeMarkers.map((time, index) => (
                  <div
                    key={time}
                    className="absolute w-full border-t text-xs text-gray-500 px-2"
                    style={{ top: `${(index / 24) * 100}%` }}
                  >
                    {time}
                  </div>
                ))}
              </div>
              {/* Stats footer placeholder */}
              <div className="h-20 border-t bg-gray-100"></div>
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const stats = getDayStats(day);

              return (
                <div key={day} className="border-r last:border-r-0">
                  <div className="h-16 p-4 border-b bg-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm">{day}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddEvent(day)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="relative" style={{ height: "1200px" }}>
                    {/* Hour markers */}
                    {timeMarkers.map((_, index) => (
                      <div
                        key={index}
                        className="absolute w-full border-t border-gray-100"
                        style={{ top: `${(index / 24) * 100}%` }}
                      />
                    ))}

                    {/* Events */}
                    {dayEvents.map((event, index) => (
                      <DraggableEvent
                        key={event.id}
                        event={event}
                        index={index}
                        moveEvent={(dragIndex, hoverIndex) => moveEvent(day, dragIndex, hoverIndex)}
                        onEdit={() => handleEditEvent(event)}
                        onDelete={() => handleDeleteEvent(event.id)}
                        style={getEventStyle(event)}
                        getEndTime={getEndTime}
                        formatDuration={formatDuration}
                      />
                    ))}
                  </div>

                  {/* Stats footer */}
                  <div className="h-20 border-t bg-gray-50 p-2">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Scheduled:</span>
                        <span className="font-semibold text-green-600">{stats.scheduled}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Free:</span>
                        <span className="font-semibold text-blue-600">{stats.unscheduled}</span>
                      </div>
                      <div className="text-center pt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TimelineEventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        day={selectedDay}
      />
    </div>
  );
}

export function TimelinePlanner() {
  return (
    <DndProvider backend={HTML5Backend}>
      <TimelinePlannerContent />
    </DndProvider>
  );
}