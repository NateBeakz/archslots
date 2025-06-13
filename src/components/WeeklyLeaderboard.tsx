import React from 'react';
import { WeeklyLeaderboard as WeeklyLeaderboardType } from '../lib/supabase/client';
import { Trophy, Medal, Award, Calendar, RefreshCw } from 'lucide-react';

interface WeeklyLeaderboardProps {
  data: WeeklyLeaderboardType[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function WeeklyLeaderboard({ data, isLoading, onRefresh }: WeeklyLeaderboardProps) {
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
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {position}
          </div>
        );
    }
  };

  const currentWeekStart = data.length > 0 ? data[0].week_start_date : '';
  const currentWeekEnd = data.length > 0 ? data[0].week_end_date : '';

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Weekly Leaderboard
          </h2>
          {currentWeekStart && currentWeekEnd && (
            <p className="text-gray-400 mt-1">
              {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-gray-400">Loading weekly leaderboard...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No data available for this week</p>
          <p className="text-gray-500 text-sm mt-2">Check back later or try refreshing</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700">
            <div>Rank</div>
            <div>Player</div>
            <div>Weekly Wagered</div>
            <div>Weekly Deposited</div>
            <div>Lifetime Wagered</div>
          </div>
          
          {data.map((player, index) => {
            const position = index + 1;
            const isTopThree = position <= 3;
            
            return (
              <div
                key={`${player.username}-${player.week_start_date}`}
                className={`grid grid-cols-5 gap-4 px-4 py-4 rounded-lg transition-colors hover:bg-gray-700 ${
                  isTopThree ? 'bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600' : 'bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getRankIcon(position)}
                  <span className={`font-bold ${isTopThree ? 'text-white' : 'text-gray-300'}`}>
                    #{position}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-medium ${isTopThree ? 'text-white' : 'text-gray-300'}`}>
                    {player.username}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className={`font-bold text-lg ${isTopThree ? 'text-green-400' : 'text-green-300'}`}>
                    {formatCurrency(player.weekly_wagered)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-blue-400 font-medium">
                    {formatCurrency(player.total_deposit)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-400 font-medium">
                    {formatCurrency(player.total_lifetime_wagered)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing top {data.length} players • Updates hourly • Resets Monday 00:00 UK time
        </div>
      )}
    </div>
  );
} 