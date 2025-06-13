import { useState, useEffect } from 'react';
import { WeeklyLeaderboard, PastWinner } from '../lib/supabase/client';

interface WeeklyLeaderboardHook {
  currentWeekData: WeeklyLeaderboard[];
  pastWinners: PastWinner[];
  archivedWeeks: { week_start_date: string; week_end_date: string }[];
  isLoading: boolean;
  error: string | null;
  refreshCurrentWeek: () => Promise<void>;
  refreshPastWinners: (weekStartDate?: string) => Promise<void>;
  refreshArchivedWeeks: () => Promise<void>;
}

export function useWeeklyLeaderboard(): WeeklyLeaderboardHook {
  const [currentWeekData, setCurrentWeekData] = useState<WeeklyLeaderboard[]>([]);
  const [pastWinners, setPastWinners] = useState<PastWinner[]>([]);
  const [archivedWeeks, setArchivedWeeks] = useState<{ week_start_date: string; week_end_date: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentWeek = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/weekly-leaderboard?action=current-week&limit=100');
      const result = await response.json();
      
      if (result.success) {
        setCurrentWeekData(result.data);
      } else {
        setError(result.error || 'Failed to fetch current week data');
      }
    } catch (err) {
      setError('Error fetching current week data');
      console.error('Error fetching current week:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPastWinners = async (weekStartDate?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = weekStartDate 
        ? `/api/weekly-leaderboard?action=past-winners&weekStartDate=${weekStartDate}&limit=50`
        : '/api/weekly-leaderboard?action=past-winners&limit=50';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setPastWinners(result.data);
      } else {
        setError(result.error || 'Failed to fetch past winners');
      }
    } catch (err) {
      setError('Error fetching past winners');
      console.error('Error fetching past winners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArchivedWeeks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/weekly-leaderboard?action=archived-weeks');
      const result = await response.json();
      
      if (result.success) {
        setArchivedWeeks(result.data);
      } else {
        setError(result.error || 'Failed to fetch archived weeks');
      }
    } catch (err) {
      setError('Error fetching archived weeks');
      console.error('Error fetching archived weeks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch current week and archived weeks on mount
  useEffect(() => {
    fetchCurrentWeek();
    fetchArchivedWeeks();
  }, []);

  return {
    currentWeekData,
    pastWinners,
    archivedWeeks,
    isLoading,
    error,
    refreshCurrentWeek: fetchCurrentWeek,
    refreshPastWinners: fetchPastWinners,
    refreshArchivedWeeks: fetchArchivedWeeks
  };
} 