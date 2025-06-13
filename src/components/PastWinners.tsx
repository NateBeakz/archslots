import React, { useState } from 'react';
import { PastWinner } from '../lib/supabase/client';
import { Archive, Trophy, Medal, Award, Calendar, ChevronDown, Gift } from 'lucide-react';

interface PastWinnersProps {
  pastWinners: PastWinner[];
  archivedWeeks: { week_start_date: string; week_end_date: string }[];
  isLoading: boolean;
  onWeekSelect: (weekStartDate?: string) => void;
}

export function PastWinners({ pastWinners, archivedWeeks, isLoading, onWeekSelect }: PastWinnersProps) {
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {position}
          </div>
        );
    }
  };

  const handleWeekChange = (weekStartDate: string) => {
    setSelectedWeek(weekStartDate);
    onWeekSelect(weekStartDate || undefined);
  };

  // Group winners by week for display
  const winnersByWeek = pastWinners.reduce((acc, winner) => {
    if (!acc[winner.week_start_date]) {
      acc[winner.week_start_date] = [];
    }
    acc[winner.week_start_date].push(winner);
    return acc;
  }, {} as Record<string, PastWinner[]>);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Archive className="w-6 h-6 text-purple-400" />
          Past Winners Archive
        </h2>
        
        <div className="relative">
          <select
            value={selectedWeek}
            onChange={(e) => handleWeekChange(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none appearance-none pr-10"
          >
            <option value="">All Weeks</option>
            {archivedWeeks.map((week) => (
              <option key={week.week_start_date} value={week.week_start_date}>
                {formatDate(week.week_start_date)} - {formatDate(week.week_end_date)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-2 text-gray-400">Loading past winners...</span>
        </div>
      ) : Object.keys(winnersByWeek).length === 0 ? (
        <div className="text-center py-12">
          <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No past winners available</p>
          <p className="text-gray-500 text-sm mt-2">Winners will appear here after the first weekly reset</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(winnersByWeek)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([weekStart, winners]) => {
              const weekEnd = winners[0]?.week_end_date;
              return (
                <div key={weekStart} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-600">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Week: {formatDate(weekStart)} - {formatDate(weekEnd)}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {winners
                      .sort((a, b) => a.position - b.position)
                      .map((winner) => {
                        const isTopThree = winner.position <= 3;
                        return (
                          <div
                            key={`${winner.username}-${winner.week_start_date}-${winner.position}`}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                              isTopThree ? 'bg-gradient-to-r from-gray-600 to-gray-700 border border-gray-500' : 'bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getRankIcon(winner.position)}
                                <span className={`font-bold ${isTopThree ? 'text-white' : 'text-gray-300'}`}>
                                  #{winner.position}
                                </span>
                              </div>
                              
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {winner.username.charAt(0).toUpperCase()}
                              </div>
                              
                              <span className={`font-medium ${isTopThree ? 'text-white' : 'text-gray-300'}`}>
                                {winner.username}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`font-bold ${isTopThree ? 'text-green-400' : 'text-green-300'}`}>
                                  {formatCurrency(winner.weekly_wagered)}
                                </div>
                                <div className="text-xs text-gray-400">Weekly</div>
                              </div>
                              
                              {winner.prize_amount && (
                                <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  <Gift className="w-4 h-4" />
                                  {formatCurrency(winner.prize_amount)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {Object.keys(winnersByWeek).length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          {selectedWeek ? 'Showing winners for selected week' : `Showing ${Object.keys(winnersByWeek).length} archived weeks`} • 
          Data archived automatically each Monday at 00:00 UK time
        </div>
      )}
    </div>
  );
} 