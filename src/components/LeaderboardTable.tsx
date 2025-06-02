
import { Trophy, Medal, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TierProgress } from "./TierProgress";

interface LeaderboardEntry {
  rank: number;
  username: string;
  thisWeekWager: number;
  lifetimeWagered: number;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
}

export const LeaderboardTable = ({ data, isLoading }: LeaderboardTableProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="text-gray-400 font-mono text-sm">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30 animate-pulse-glow";
      case 2:
        return "bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30";
      case 3:
        return "bg-gradient-to-r from-orange-400/20 to-orange-600/20 border-orange-400/30";
      default:
        return rank <= 10 ? "bg-arch-green/5 border-arch-green/20" : "bg-white/5 border-white/10";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-pulse bg-[#1c1c2b] h-12 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Rank</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Player</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Wager ($)</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Lifetime ($)</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {data.map((player, index) => (
              <motion.tr
                key={player.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border border-transparent rounded-lg ${getRankClass(player.rank)} hover:scale-[1.02] transition-all duration-300`}
              >
                <td className="py-4 px-2">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(player.rank)}
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div>
                    <div className="font-semibold text-white">
                      {player.username}
                    </div>
                    <TierProgress wager={player.lifetimeWagered} />
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="font-mono font-bold text-arch-green">
                    ${player.thisWeekWager.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="font-mono text-gray-300">
                    ${player.lifetimeWagered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};
