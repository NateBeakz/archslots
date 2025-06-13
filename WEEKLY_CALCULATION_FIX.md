# Weekly Calculation Fix Documentation

## Problem Identified
The original implementation had a flaw in calculating weekly amounts. The API returns cumulative lifetime values, but we need to show **weekly differences** in the leaderboard, not lifetime totals.

## Root Cause
- API returns: `lifetimeWagered` and `deposit` (cumulative values)
- Previous logic was inconsistent in calculating weekly differences
- Some places used "last snapshot" instead of "start of week baseline"

## Solution Implemented

### 1. **Proper Baseline System**
- **First snapshot of each week** serves as the baseline
- Weekly amounts = Current values - Start-of-week baseline
- Consistent calculation across all components

### 2. **Weekly Calculation Logic**
```javascript
// Get FIRST snapshot of current week (baseline)
const firstSnapshot = await supabase
  .from('weekly_snapshots')
  .eq('username', username)
  .eq('week_start_date', currentWeekStart)
  .order('snapshot_datetime', { ascending: true })  // FIRST, not LAST
  .limit(1);

if (firstSnapshot && firstSnapshot.length > 0) {
  // Calculate weekly difference from baseline
  weeklyWagered = current.lifetime_wagered - firstSnapshot.lifetime_wagered_at_snapshot;
  weeklyDeposit = current.deposit - firstSnapshot.deposit_at_snapshot;
} else {
  // No baseline = new user or start of week, so all current is "weekly"
  weeklyWagered = current.lifetime_wagered;
  weeklyDeposit = current.deposit;
}
```

### 3. **Data Flow**
1. **Hourly Process**:
   - Fetch current API data
   - Update `affiliate_stats` (lifetime values)
   - Take snapshot in `weekly_snapshots`
   - Calculate weekly differences using baseline
   - Update `weekly_leaderboard` with weekly amounts

2. **Weekly Reset** (Monday 00:00 UK):
   - Archive previous week winners
   - Take baseline snapshot for new week
   - Initialize new week leaderboard with zeros

### 4. **Database Schema Clarification**
- `affiliate_stats.lifetime_wagered` = Cumulative total
- `weekly_leaderboard.weekly_wagered` = **Weekly difference**
- `weekly_leaderboard.total_deposit` = **Weekly deposit** (not lifetime)
- `weekly_snapshots` = Historical snapshots for calculations

### 5. **UI Updates**
- Changed column header from "Total Deposited" to "Weekly Deposited"
- Displays weekly amounts, not lifetime amounts
- Added proper weekly calculation debugging

## Files Modified

### Core Logic
- `src/lib/services/weeklyLeaderboardService.ts` - Fixed calculation logic
- `scripts/update-stats.js` - Fixed script calculation logic
- `scripts/weekly-reset.js` - Fixed baseline establishment

### Database & Types
- `src/lib/supabase/schema.sql` - Added clarifying comments
- `src/lib/supabase/client.ts` - Type definitions

### UI Components
- `src/components/WeeklyLeaderboard.tsx` - Updated column labels
- Scripts maintain weekly vs lifetime distinction

### Testing
- `scripts/test-weekly-calculation.js` - New debugging script
- Added `npm run test-weekly` command

## Verification Commands

### Test the Fix
```bash
# Run the test script to verify calculations
npm run test-weekly

# Run a complete update to see weekly calculations
npm run update-stats

# Test weekly reset (be careful - this resets the week!)
npm run weekly-reset
```

### Expected Behavior
1. **New Week Start**: All current values treated as weekly
2. **Mid-Week Updates**: Weekly = Current - Start-of-week baseline
3. **Leaderboard Display**: Shows weekly amounts, not lifetime
4. **Historical Data**: Past winners archive lifetime totals

## Key Benefits
- ✅ **Accurate Weekly Competition**: Users compete on weekly activity
- ✅ **Fair Reset System**: Everyone starts at zero each Monday
- ✅ **Proper Baseline Tracking**: First snapshot of week = baseline
- ✅ **Clear Data Separation**: Weekly vs Lifetime values distinct
- ✅ **Debugging Tools**: Test script shows calculation logic

## Monitoring
Watch for:
- Weekly amounts should reset to zero on Monday
- Baseline snapshots should exist for current week
- Weekly calculations should make sense vs lifetime totals
- UI should show "Weekly" values, not cumulative 