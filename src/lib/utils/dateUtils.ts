/**
 * Gets the UK time equivalent week start (Monday at 00:00 UK time)
 */
export function getUKWeekStart(inputDate: Date = new Date()): string {
  const ukTime = new Date(inputDate.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const ukDate = new Date(ukTime.setHours(0, 0, 0, 0));
  
  // Calculate days back to Monday (1 = Monday, 7 = Sunday)
  const dayOfWeek = ukDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(ukDate);
  monday.setDate(ukDate.getDate() - daysToMonday);
  
  return monday.toISOString().split('T')[0];
}

/**
 * Gets the UK time equivalent week end (Sunday at 23:59 UK time)
 */
export function getUKWeekEnd(weekStartDate: string): string {
  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return endDate.toISOString().split('T')[0];
}

/**
 * Checks if the current time is Friday in UK timezone
 */
export function isFridayUK(): boolean {
  const ukTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
  return ukTime.getDay() === 5; // 5 is Friday
}

/**
 * Gets the current UK time
 */
export function getCurrentUKTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
} 