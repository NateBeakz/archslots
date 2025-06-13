import React from 'react';
import { useWeeklyLeaderboard } from '../hooks/useWeeklyLeaderboard';
import { WeeklyLeaderboard } from '../components/WeeklyLeaderboard';
import { PastWinners } from '../components/PastWinners';
import { AlertCircle } from 'lucide-react';

export function WeeklyLeaderboardPage() {
  const {
    currentWeekData,
    pastWinners,
    archivedWeeks,
    isLoading,
    error,
    refreshCurrentWeek,
    refreshPastWinners,
    refreshArchivedWeeks
  } = useWeeklyLeaderboard();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-red-200 font-semibold">Error Loading Data</h3>
              <p className="text-red-300 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-white font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Weekly Leaderboard Competition
          </h1>
          <p className="text-gray-400 text-lg">
            Compete for weekly prizes • Updates hourly • Resets Monday 00:00 UK time
          </p>
        </div>

        {/* Current Week Leaderboard */}
        <WeeklyLeaderboard
          data={currentWeekData}
          isLoading={isLoading}
          onRefresh={refreshCurrentWeek}
        />

        {/* Past Winners Archive */}
        <PastWinners
          pastWinners={pastWinners}
          archivedWeeks={archivedWeeks}
          isLoading={isLoading}
          onWeekSelect={(weekStartDate) => {
            refreshPastWinners(weekStartDate);
          }}
        />

        {/* Information Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">Weekly Competition</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• Track your weekly wagering progress</li>
                <li>• Compete against other players</li>
                <li>• Weekly prizes for top performers</li>
                <li>• Resets every Monday at 00:00 UK time</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium text-purple-400 mb-2">Updates & Archives</h4>
              <ul className="text-gray-300 space-y-2">
                <li>• Data updates automatically every hour</li>
                <li>• Past winners archived weekly</li>
                <li>• Historical data always available</li>
                <li>• Real-time progress tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prize Structure (Example) */}
        <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-6 border border-yellow-700">
          <h3 className="text-xl font-semibold text-yellow-200 mb-4">Weekly Prize Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-yellow-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-300">🥇</div>
              <div className="text-yellow-200 font-semibold">1st Place</div>
              <div className="text-yellow-300 text-lg font-bold">$1,000</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-300">🥈</div>
              <div className="text-gray-200 font-semibold">2nd Place</div>
              <div className="text-gray-300 text-lg font-bold">$500</div>
            </div>
            <div className="text-center p-4 bg-amber-800 rounded-lg">
              <div className="text-2xl font-bold text-amber-300">🥉</div>
              <div className="text-amber-200 font-semibold">3rd Place</div>
              <div className="text-amber-300 text-lg font-bold">$250</div>
            </div>
            <div className="text-center p-4 bg-blue-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-300">4️⃣</div>
              <div className="text-blue-200 font-semibold">4th Place</div>
              <div className="text-blue-300 text-lg font-bold">$100</div>
            </div>
            <div className="text-center p-4 bg-green-800 rounded-lg">
              <div className="text-2xl font-bold text-green-300">5️⃣</div>
              <div className="text-green-200 font-semibold">5th Place</div>
              <div className="text-green-300 text-lg font-bold">$50</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 