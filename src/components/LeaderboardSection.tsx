import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getLeaderboard } from '@/lib/services/affiliateService';
import type { AffiliateStats } from '@/lib/supabase/client';
import { PrizesBox } from './PrizesBox';

export const LeaderboardSection = () => {
  const [stats, setStats] = useState<AffiliateStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  // Placeholder: set to true when you have real archive data
  const hasArchiveData = false;
  // Placeholder: replace with real archive data when available
  const archiveWeeks: { week: string; winners: number }[] = [];

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getLeaderboard(100);
      setStats(data);
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const displayedStats = isExpanded ? stats : stats.slice(0, 10);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
      className="px-4"
    >
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          <span className="gradient-text">Weekly Leaderboard</span>
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Total Wagered</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Total Deposited</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedStats.map((stat, index) => (
                          <tr 
                            key={stat.username}
                            className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className={`
                                font-mono font-bold
                                ${index === 0 ? 'text-yellow-400' : ''}
                                ${index === 1 ? 'text-gray-300' : ''}
                                ${index === 2 ? 'text-amber-600' : ''}
                              `}>
                                #{index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{stat.username}</td>
                            <td className="px-6 py-4 text-right font-mono">
                              ${stat.lifetime_wagered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right font-mono">
                              ${stat.deposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {stats.length > 10 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 
                              text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show All Rankings <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            <p className="text-center text-sm text-gray-400 mt-4">
              Stats update hourly • Only showing players with wagering activity
            </p>
          </div>
          <div className="w-full md:w-80 flex-shrink-0">
            <PrizesBox />
          </div>
        </div>

        {/* Past Winners Archive Section - only once, coming soon, no example data */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-2xl font-bold gradient-text mb-0">Past Winners Archive</h3>
            <span className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">Coming Soon</span>
          </div>
          {!hasArchiveData ? (
            <div className="text-gray-400 text-center text-sm">This section will display previous weekly winners as soon as results are available.</div>
          ) : (
            <div className="space-y-4">
              {archiveWeeks.map((week) => (
                <div key={week.week} className="bg-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between border border-white/10">
                  <div>
                    <div className="font-semibold text-lg text-white">{week.week}</div>
                    <div className="text-gray-400 text-sm">{week.winners} winner{week.winners !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 md:mt-0">Winner details coming soon</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};
