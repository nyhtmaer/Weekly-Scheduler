import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

interface TimelineEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: TimelineEventData) => void;
  event?: TimelineEventData | null;
  day?: string;
}

export interface TimelineEventData {
  id: string;
  title: string;
  day: string;
  startTime: string; // HH:MM format
  durationMinutes: number;
  color: string;
}

const colors = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Teal", value: "bg-teal-500" },
  { name: "Indigo", value: "bg-indigo-500" },
];

export function TimelineEventDialog({ open, onClose, onSave, event, day }: TimelineEventDialogProps) {
  const [title, setTitle] = useState("");
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("10:00");
  const [selectedDay, setSelectedDay] = useState(day || "Monday");
  const [color, setColor] = useState("bg-blue-500");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setSelectedDay(event.day);
      setColor(event.color);
      setFromTime(event.startTime);
      // Calculate end time from start time + duration
      const [startHours, startMinutes] = event.startTime.split(":").map(Number);
      const totalStartMinutes = startHours * 60 + startMinutes;
      const totalEndMinutes = totalStartMinutes + event.durationMinutes;
      const endHours = Math.floor(totalEndMinutes / 60) % 24;
      const endMinutes = totalEndMinutes % 60;
      setToTime(`${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`);
    } else {
      setTitle("");
      setSelectedDay(day || "Monday");
      setFromTime("09:00");
      setToTime("10:00");
      setColor("bg-blue-500");
    }
  }, [event, day, open]);

  const handleSave = () => {
    // Parse times
    const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
    const [toHours, toMinutes] = toTime.split(":").map(Number);
    
    const fromTotalMinutes = fromHours * 60 + fromMinutes;
    let toTotalMinutes = toHours * 60 + toMinutes;
    
    // Handle overnight events (to time is next day)
    if (toTotalMinutes <= fromTotalMinutes) {
      toTotalMinutes += 1440; // Add 24 hours
    }
    
    const durationMinutes = toTotalMinutes - fromTotalMinutes;
    
    if (durationMinutes <= 0) {
      alert("End time must be after start time");
      return;
    }

    if (durationMinutes > 1440) {
      alert("Event cannot be longer than 24 hours");
      return;
    }

    const eventData: TimelineEventData = {
      id: event?.id || Date.now().toString(),
      title,
      day: selectedDay,
      startTime: fromTime,
      durationMinutes,
      color,
    };
    onSave(eventData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Activity</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sleep, Breakfast, Work"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="day">Day</Label>
            <select
              id="day"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label>Time Period</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fromTime" className="text-xs text-gray-500">From</Label>
                <Input
                  id="fromTime"
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="toTime" className="text-xs text-gray-500">To</Label>
                <Input
                  id="toTime"
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full ${c.value} ${
                    color === c.value ? "ring-2 ring-offset-2 ring-gray-900" : ""
                  }`}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
