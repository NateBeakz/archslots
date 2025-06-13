export function isFridayUK(): boolean {
  const now = new Date();
  const ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  return ukTime.getDay() === 5; // 5 is Friday (0 is Sunday)
}

export function getWeekStart(): string {
  const now = new Date();
  const ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const day = ukTime.getDay();
  const diff = ukTime.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const weekStart = new Date(ukTime.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

export function getWeekEnd(): string {
  const weekStart = new Date(getWeekStart());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd.toISOString().split('T')[0];
} 