
import { motion } from "framer-motion";
import { mockWins } from "@/lib/mocks/mockData";

export const RecentWinsTicker = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full overflow-hidden bg-[#11131f] py-2 select-none border-b border-white/5"
    >
      <div className="flex animate-marquee">
        {[...mockWins, ...mockWins].map((win, index) => (
          <span key={`${win.id}-${index}`} className="mx-4 whitespace-nowrap text-sm text-gray-200 flex-shrink-0">
            <span className="font-semibold">{win.username}</span> • {win.game} • <span className="text-green-400">+${win.amount}</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
};
