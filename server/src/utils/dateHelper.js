/**
 * Date Range Helper to parse filter strings or custom date ranges
 * into accurate start and end JavaScript Date objects.
 */
export const getDateRange = ({ timeRange, startDate, endDate }) => {
  if (!timeRange && !startDate && !endDate) return null;
  if (
    timeRange === 'all' ||
    timeRange === 'all_time' ||
    timeRange === 'all time' ||
    timeRange === 'All' ||
    timeRange === 'All Time'
  ) {
    return null;
  }

  const now = new Date();

  // 1. TODAY
  if (timeRange === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end, label: 'Today' };
  }

  // 2. YESTERDAY
  if (timeRange === 'yesterday') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    return { start, end, label: 'Yesterday' };
  }

  // 3. THIS WEEK (Monday to Sunday / end of today)
  if (timeRange === 'this_week' || timeRange === 'this week') {
    const day = now.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (diffToMonday + 6), 23, 59, 59, 999);
    return { start, end, label: 'This Week' };
  }

  // 4. THIS MONTH
  if (timeRange === 'this_month' || timeRange === 'this month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end, label: 'This Month' };
  }

  // 5. LAST MONTH
  if (timeRange === 'last_month' || timeRange === 'last month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end, label: 'Last Month' };
  }

  // 6. LAST 3 MONTHS
  if (timeRange === 'last_3_months' || timeRange === 'last 3 months') {
    const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end, label: 'Last 3 Months' };
  }

  // 7. CUSTOM RANGE
  if (timeRange === 'custom' || (startDate && endDate)) {
    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e, label: 'Custom Range' };
    }
  }

  return null;
};
