import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Plus, X, Pencil, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";

interface Goal {
  id: string;
  text: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface GoalsTasksSidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function GoalsTasksSidebar({ isMobile = false, isOpen = false, onClose }: GoalsTasksSidebarProps = {}) {
  const [dailyGoals, setDailyGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("daily-goals");
    return saved ? JSON.parse(saved) : [];
  });
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("weekly-goals");
    return saved ? JSON.parse(saved) : [];
  });
  const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("monthly-goals");
    return saved ? JSON.parse(saved) : [];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [newDailyGoal, setNewDailyGoal] = useState("");
  const [newWeeklyGoal, setNewWeeklyGoal] = useState("");
  const [newMonthlyGoal, setNewMonthlyGoal] = useState("");
  const [newTask, setNewTask] = useState("");

  const [editingGoal, setEditingGoal] = useState<{ type: string; id: string; text: string } | null>(null);

  // Save to localStorage whenever goals or tasks change
  useEffect(() => {
    localStorage.setItem("daily-goals", JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  useEffect(() => {
    localStorage.setItem("weekly-goals", JSON.stringify(weeklyGoals));
  }, [weeklyGoals]);

  useEffect(() => {
    localStorage.setItem("monthly-goals", JSON.stringify(monthlyGoals));
  }, [monthlyGoals]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addGoal = (type: "daily" | "weekly" | "monthly", text: string) => {
    if (!text.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      text: text.trim(),
    };

    if (type === "daily") {
      setDailyGoals([...dailyGoals, goal]);
      setNewDailyGoal("");
    } else if (type === "weekly") {
      setWeeklyGoals([...weeklyGoals, goal]);
      setNewWeeklyGoal("");
    } else {
      setMonthlyGoals([...monthlyGoals, goal]);
      setNewMonthlyGoal("");
    }
  };

  const deleteGoal = (type: "daily" | "weekly" | "monthly", id: string) => {
    if (type === "daily") {
      setDailyGoals(dailyGoals.filter((g) => g.id !== id));
    } else if (type === "weekly") {
      setWeeklyGoals(weeklyGoals.filter((g) => g.id !== id));
    } else {
      setMonthlyGoals(monthlyGoals.filter((g) => g.id !== id));
    }
  };

  const startEditingGoal = (type: string, id: string, text: string) => {
    setEditingGoal({ type, id, text });
  };

  const saveEditedGoal = () => {
    if (!editingGoal || !editingGoal.text.trim()) return;

    const updateGoals = (goals: Goal[]) =>
      goals.map((g) => (g.id === editingGoal.id ? { ...g, text: editingGoal.text.trim() } : g));

    if (editingGoal.type === "daily") {
      setDailyGoals(updateGoals(dailyGoals));
    } else if (editingGoal.type === "weekly") {
      setWeeklyGoals(updateGoals(weeklyGoals));
    } else {
      setMonthlyGoals(updateGoals(monthlyGoals));
    }

    setEditingGoal(null);
  };

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const GoalItem = ({ goal, type }: { goal: Goal; type: "daily" | "weekly" | "monthly" }) => {
    const isEditing = editingGoal?.id === goal.id;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
          <Input
            value={editingGoal.text}
            onChange={(e) => setEditingGoal({ ...editingGoal, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEditedGoal();
              if (e.key === "Escape") setEditingGoal(null);
            }}
            autoFocus
            className="flex-1"
          />
          <Button size="sm" variant="ghost" onClick={saveEditedGoal}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditingGoal(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group">
        <span className="flex-1 text-sm">{goal.text}</span>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => startEditingGoal(type, goal.id, goal.text)}
        >
          <Pencil className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => deleteGoal(type, goal.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Goals & Tasks</h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Daily Goals */}
      <Card className="border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Daily Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyGoals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} type="daily" />
          ))}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Add daily goal..."
              value={newDailyGoal}
              onChange={(e) => setNewDailyGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal("daily", newDailyGoal)}
            />
            <Button size="sm" onClick={() => addGoal("daily", newDailyGoal)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goals */}
      <Card className="border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Weekly Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weeklyGoals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} type="weekly" />
          ))}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Add weekly goal..."
              value={newWeeklyGoal}
              onChange={(e) => setNewWeeklyGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal("weekly", newWeeklyGoal)}
            />
            <Button size="sm" onClick={() => addGoal("weekly", newWeeklyGoal)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Goals */}
      <Card className="border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Monthly Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {monthlyGoals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} type="monthly" />
          ))}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Add monthly goal..."
              value={newMonthlyGoal}
              onChange={(e) => setNewMonthlyGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal("monthly", newMonthlyGoal)}
            />
            <Button size="sm" onClick={() => addGoal("monthly", newMonthlyGoal)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card className="border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group">
              <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
              <span className={`flex-1 text-sm ${task.completed ? "line-through text-gray-400" : ""}`}>
                {task.text}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteTask(task.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Add task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button size="sm" onClick={addTask}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Mobile: Render as overlay with backdrop
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={onClose}
          />
        )}
        
        {/* Sidebar overlay */}
        <div 
          className={`fixed top-0 right-0 h-full w-80 bg-white z-50 overflow-y-auto p-8 shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop: Render inline as before
  return (
    <div className="w-full md:w-96 h-auto md:h-full bg-white border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto p-6 md:p-8 space-y-6">
      {sidebarContent}
    </div>
  );
}