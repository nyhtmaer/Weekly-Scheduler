import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TimelineEventDialog, TimelineEventData } from "@/app/components/TimelineEventDialog";
import { Button } from "@/app/components/ui/button";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";

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
  onEdit: () => void;
  onDelete: () => void;
  style: React.CSSProperties;
  getEndTime: (event: TimelineEventData) => string;
  formatDuration: (minutes: number) => string;
}

interface DroppableDayColumnProps {
  day: string;
  children: React.ReactNode;
  onDropAtPosition: (draggedEvent: TimelineEventData, dragIndex: number, targetMinutes: number) => void;
  events: TimelineEventData[];
}

function DraggableEvent({
  event,
  index,
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

  // Determine if event is too small to show full details (less than 30 minutes)
  const isSmallEvent = event.durationMinutes < 30;
  const isTinyEvent = event.durationMinutes < 15;

  const eventContent = (
    <div
      ref={drag}
      className={`absolute left-1 right-1 ${event.color} text-white rounded shadow-md group/event cursor-move overflow-visible ${
        isDragging ? "opacity-50" : ""
      } ${isTinyEvent ? "p-0.5" : "p-2"}`}
      style={style}
    >
      {isTinyEvent ? (
        // Tiny event: Just show title in one line with minimal padding
        <div className="flex items-center gap-0.5 text-[10px] leading-tight px-1">
          <GripVertical className="w-2.5 h-2.5 flex-shrink-0 opacity-50" />
          <span className="truncate flex-1 font-semibold">{event.title}</span>
          <div className="flex gap-0.5 opacity-0 group-hover/event:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-0.5 hover:bg-white/20 rounded"
            >
              <Pencil className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-0.5 hover:bg-white/20 rounded"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      ) : isSmallEvent ? (
        // Small event: Show title only with compact layout
        <div className="flex items-center gap-1">
          <GripVertical className="w-3 h-3 flex-shrink-0 opacity-50" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{event.title}</div>
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
      ) : (
        // Regular event: Show all details
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
      )}
    </div>
  );

  // Wrap all events with tooltip
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {eventContent}
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-gray-900 text-white p-2">
        <div className="space-y-1">
          <div className="font-semibold">{event.title}</div>
          <div className="text-xs">
            {event.startTime} - {getEndTime(event)}
          </div>
          <div className="text-xs opacity-80">{formatDuration(event.durationMinutes)}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function DroppableDayColumn({ day, children, onDropAtPosition, events }: DroppableDayColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [, drop] = useDrop({
    accept: ItemTypes.EVENT,
    drop: (item: { index: number; eventId: string }, monitor) => {
      if (!ref.current) return;
      
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const boundingRect = ref.current.getBoundingClientRect();
      const hoverY = clientOffset.y - boundingRect.top;
      const hoverPercentage = hoverY / boundingRect.height;
      const targetMinutes = Math.round(hoverPercentage * 1440); // 1440 minutes in a day
      
      const draggedEvent = events[item.index];
      if (draggedEvent) {
        onDropAtPosition(draggedEvent, item.index, targetMinutes);
      }
    },
  });

  drop(ref);

  return (
    <div ref={ref} className="relative" style={{ height: "1200px" }}>
      {children}
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

  const timeToMinutes = useCallback((time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }, []);

  const minutesToTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }, []);

  const getEndTime = useCallback((event: TimelineEventData) => {
    const endMinutes = timeToMinutes(event.startTime) + event.durationMinutes;
    return minutesToTime(endMinutes);
  }, [timeToMinutes, minutesToTime]);

  const getEventsForDay = useCallback((day: string) => {
    return events
      .filter((e) => e.day === day)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [events, timeToMinutes]);

  const handleAddEvent = useCallback((day: string) => {
    setSelectedEvent(null);
    setSelectedDay(day);
    setDialogOpen(true);
  }, []);

  const handleEditEvent = useCallback((event: TimelineEventData) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter((e) => e.id !== eventId));
  }, []);

  const handleSaveEvent = useCallback((eventData: TimelineEventData) => {
    setEvents(prev => {
      if (selectedEvent) {
        // Editing existing event - just update it
        return prev.map((e) => (e.id === eventData.id ? eventData : e));
      } else {
        // Adding new event
        return [...prev, eventData];
      }
    });
  }, [selectedEvent]);

  const handleDropAtPosition = useCallback((day: string, draggedEvent: TimelineEventData, dragIndex: number, targetMinutes: number) => {
    // Clamp target minutes to valid range
    const clampedMinutes = Math.max(0, Math.min(1440 - draggedEvent.durationMinutes, targetMinutes));
    
    setEvents(prev => {
      // Get all events for this day except the dragged one
      const dayEvents = prev.filter(e => e.day === day);
      const otherDayEvents = dayEvents.filter((_, idx) => idx !== dragIndex);
      
      // Create updated dragged event with new start time
      const updatedDraggedEvent = {
        ...draggedEvent,
        startTime: minutesToTime(clampedMinutes),
      };
      
      // Add the dragged event back and sort by start time
      const updatedDayEvents = [...otherDayEvents, updatedDraggedEvent].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      
      // Update all events
      const allOtherEvents = prev.filter((e) => e.day !== day);
      return [...allOtherEvents, ...updatedDayEvents];
    });
  }, [minutesToTime, timeToMinutes]);

  const getEventStyle = useCallback((event: TimelineEventData) => {
    const startMinutes = timeToMinutes(event.startTime);
    const percentage = (startMinutes / 1440) * 100;
    const heightPercentage = (event.durationMinutes / 1440) * 100;

    return {
      top: `${percentage}%`,
      height: `${heightPercentage}%`,
    };
  }, [timeToMinutes]);

  const getDayStats = useCallback((day: string) => {
    const dayEvents = getEventsForDay(day);
    const scheduledMinutes = dayEvents.reduce((sum, e) => sum + e.durationMinutes, 0);
    const unscheduledMinutes = 1440 - scheduledMinutes;

    return {
      scheduled: formatDuration(scheduledMinutes),
      unscheduled: formatDuration(unscheduledMinutes),
      percentage: ((scheduledMinutes / 1440) * 100).toFixed(0),
    };
  }, [getEventsForDay, formatDuration]);

  return (
    <div className="w-full h-auto md:h-full overflow-auto p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Weekly Timeline Planner</h1>
          <p className="text-gray-600">
            Click the + button to add an activity with specific start and end times. Drag events to reposition them to any time in the day.
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

                  <DroppableDayColumn
                    day={day}
                    onDropAtPosition={(draggedEvent, dragIndex, targetMinutes) =>
                      handleDropAtPosition(day, draggedEvent, dragIndex, targetMinutes)
                    }
                    events={dayEvents}
                  >
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
                        onEdit={() => handleEditEvent(event)}
                        onDelete={() => handleDeleteEvent(event.id)}
                        style={getEventStyle(event)}
                        getEndTime={getEndTime}
                        formatDuration={formatDuration}
                      />
                    ))}
                  </DroppableDayColumn>

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