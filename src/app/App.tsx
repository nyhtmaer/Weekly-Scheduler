import { TimelinePlanner } from "@/app/components/TimelinePlanner";
import { GoalsTasksSidebar } from "@/app/components/GoalsTasksSidebar";

export default function App() {
  return (
    <div className="size-full flex flex-col md:flex-row">
      <div className="flex-1 overflow-auto">
        <TimelinePlanner />
      </div>
      <GoalsTasksSidebar />
    </div>
  );
}