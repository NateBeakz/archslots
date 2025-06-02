
import { Timer } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

export const NavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">
          <span className="gradient-text">ArchSlots</span>
        </div>
        
        <div className="flex items-center gap-2 text-arch-green">
          <Timer className="w-5 h-5" />
          <span className="text-sm font-medium">LIVE WEEK TIMER</span>
          <CountdownTimer />
        </div>
      </div>
    </nav>
  );
};
