import { weeklyLeaderboardService } from '../lib/services/weeklyLeaderboardService';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const weekStartDate = url.searchParams.get('weekStartDate');

  try {
    switch (action) {
      case 'current-week':
        const currentWeekData = await weeklyLeaderboardService.getCurrentWeekLeaderboard(limit);
        return new Response(JSON.stringify({
          success: true,
          data: currentWeekData,
          message: 'Current week leaderboard retrieved successfully'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'past-winners':
        const pastWinnersData = await weeklyLeaderboardService.getPastWinners(weekStartDate || undefined, limit);
        return new Response(JSON.stringify({
          success: true,
          data: pastWinnersData,
          message: 'Past winners retrieved successfully'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'archived-weeks':
        const archivedWeeksData = await weeklyLeaderboardService.getArchivedWeeks();
        return new Response(JSON.stringify({
          success: true,
          data: archivedWeeksData,
          message: 'Archived weeks retrieved successfully'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action. Use: current-week, past-winners, or archived-weeks'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in weekly leaderboard API:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: Request) {
  // Verify the request is from an authorized source
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.VITE_CRON_SECRET_KEY}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case 'take-snapshot':
        const snapshotSuccess = await weeklyLeaderboardService.takeWeeklySnapshot();
        return new Response(JSON.stringify({
          success: snapshotSuccess,
          message: snapshotSuccess ? 'Snapshot taken successfully' : 'Failed to take snapshot'
        }), {
          status: snapshotSuccess ? 200 : 500,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'update-leaderboard':
        const updateSuccess = await weeklyLeaderboardService.updateWeeklyLeaderboard();
        return new Response(JSON.stringify({
          success: updateSuccess,
          message: updateSuccess ? 'Leaderboard updated successfully' : 'Failed to update leaderboard'
        }), {
          status: updateSuccess ? 200 : 500,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'weekly-reset':
        const resetSuccess = await weeklyLeaderboardService.performWeeklyReset();
        return new Response(JSON.stringify({
          success: resetSuccess,
          message: resetSuccess ? 'Weekly reset completed successfully' : 'Failed to perform weekly reset'
        }), {
          status: resetSuccess ? 200 : 500,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'hourly-update':
        const hourlySuccess = await weeklyLeaderboardService.performHourlyUpdate();
        return new Response(JSON.stringify({
          success: hourlySuccess,
          message: hourlySuccess ? 'Hourly update completed successfully' : 'Failed to perform hourly update'
        }), {
          status: hourlySuccess ? 200 : 500,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action. Use: take-snapshot, update-leaderboard, weekly-reset, or hourly-update'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in weekly leaderboard POST API:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 