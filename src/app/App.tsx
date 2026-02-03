import { useState } from "react";
import { TimelinePlanner } from "@/app/components/TimelinePlanner";
import { GoalsTasksSidebar } from "@/app/components/GoalsTasksSidebar";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function App() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="size-full flex flex-col md:flex-row">
      <div className="flex-1 overflow-auto">
        <TimelinePlanner />
      </div>
      <GoalsTasksSidebar 
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Floating menu button - mobile only */}
      {isMobile && (
        <Button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}