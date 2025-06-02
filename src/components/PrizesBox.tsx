
import { Gift, Star } from "lucide-react";

export const PrizesBox = () => {
  const prizes = [
    { place: "1st", prize: "$150 bonus credit", color: "text-yellow-400" },
    { place: "2nd", prize: "$100 bonus credit", color: "text-gray-300" },
    { place: "3rd", prize: "$50 bonus credit", color: "text-orange-400" },
    { place: "4-10", prize: "$10 voucher each", color: "text-arch-green" },
  ];

  return (
    <div className="glass rounded-2xl p-6 neon-purple animate-bounce-in">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="w-6 h-6 text-arch-purple" />
        <h3 className="text-xl font-bold text-arch-purple">
          WEEKLY PRIZE POOL
        </h3>
      </div>
      
      <div className="space-y-4">
        {prizes.map((prize, index) => (
          <div
            key={prize.place}
            className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${prize.color}`} />
              <span className={`font-bold ${prize.color}`}>
                {prize.place}
              </span>
            </div>
            <span className="text-white font-medium">
              {prize.prize}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-arch-purple/10 rounded-lg border border-arch-purple/20">
        <p className="text-sm text-gray-300 text-center">
          Prizes are awarded automatically at the end of each week. 
          <span className="text-arch-purple font-semibold"> Winners will be contacted directly.</span>
        </p>
      </div>
    </div>
  );
};
