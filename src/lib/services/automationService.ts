import { ShuffleApiService } from './shuffleApiService';
import { WeeklyLeaderboardService } from './weeklyLeaderboardService';
import { getUKWeekStart, getUKWeekEnd } from '../utils/dateUtils';

export class AutomationService {
  private static instance: AutomationService;
  private shuffleApiService: ShuffleApiService;
  private weeklyLeaderboardService: WeeklyLeaderboardService;

  private constructor() {
    this.shuffleApiService = ShuffleApiService.getInstance();
    this.weeklyLeaderboardService = new WeeklyLeaderboardService();
  }

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  public async runHourlyUpdate(): Promise<boolean> {
    try {
      console.log('Starting hourly update...');
      
      // 1. Update affiliate stats from Shuffle API
      const statsUpdated = await this.shuffleApiService.updateAffiliateStats();
      if (!statsUpdated) {
        throw new Error('Failed to update affiliate stats');
      }

      // 2. Take weekly snapshot
      const snapshotTaken = await this.weeklyLeaderboardService.takeWeeklySnapshot();
      if (!snapshotTaken) {
        throw new Error('Failed to take weekly snapshot');
      }

      // 3. Update weekly leaderboard
      const leaderboardUpdated = await this.weeklyLeaderboardService.updateWeeklyLeaderboard();
      if (!leaderboardUpdated) {
        throw new Error('Failed to update weekly leaderboard');
      }

      console.log('Hourly update completed successfully');
      return true;
    } catch (error) {
      console.error('Error in hourly update:', error);
      return false;
    }
  }

  public async runWeeklyReset(): Promise<boolean> {
    try {
      console.log('Starting weekly reset...');
      
      // 1. Archive previous week winners
      const winnersArchived = await this.weeklyLeaderboardService.archivePreviousWeekWinners();
      if (!winnersArchived) {
        throw new Error('Failed to archive previous week winners');
      }

      // 2. Take baseline snapshot for new week
      const snapshotTaken = await this.weeklyLeaderboardService.takeWeeklySnapshot();
      if (!snapshotTaken) {
        throw new Error('Failed to take baseline snapshot for new week');
      }

      // 3. Initialize new week leaderboard
      const leaderboardInitialized = await this.weeklyLeaderboardService.initializeNewWeekLeaderboard();
      if (!leaderboardInitialized) {
        throw new Error('Failed to initialize new week leaderboard');
      }

      console.log('Weekly reset completed successfully');
      return true;
    } catch (error) {
      console.error('Error in weekly reset:', error);
      return false;
    }
  }

  public async runManualTrigger(type: 'hourly' | 'weekly'): Promise<boolean> {
    try {
      if (type === 'hourly') {
        return await this.runHourlyUpdate();
      } else {
        return await this.runWeeklyReset();
      }
    } catch (error) {
      console.error(`Error in manual ${type} trigger:`, error);
      return false;
    }
  }
} 