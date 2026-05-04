import { useState, useEffect } from 'react';
import type { AddonContext } from '@wealthfolio/addon-sdk';
import { SpendingData, TimeFilter, SpendingDay } from '../types';

export function useSpendingData(ctx: AddonContext, accountId: string, timeFilter: TimeFilter) {
  const [data, setData] = useState<SpendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const history = await ctx.api.portfolio.getHistoricalValuations(accountId);
        
        // Sort history by date to ensure correct delta calculation
        const sortedHistory = [...history].sort((a, b) => 
          new Date(a.valuationDate).getTime() - new Date(b.valuationDate).getTime()
        );

        // Calculate daily spending from netContribution delta
        const allDailySpending: SpendingDay[] = [];
        for (let i = 1; i < sortedHistory.length; i++) {
          const prev = sortedHistory[i - 1];
          const curr = sortedHistory[i];
          
          const delta = curr.netContribution - prev.netContribution;
          // If delta is negative, it's spending
          const spendingAmount = delta < 0 ? Math.abs(delta) : 0;
          
          allDailySpending.push({
            date: curr.valuationDate,
            amount: spendingAmount
          });
        }

        // Current period data
        const { startDate, endDate } = getTimeRange(timeFilter);
        const filteredDaily = filterData(allDailySpending, startDate, endDate);
        
        // Previous period data (for comparison)
        const prevRange = getPreviousTimeRange(timeFilter, startDate);
        const prevFilteredDaily = filterData(allDailySpending, prevRange.startDate, prevRange.endDate);

        // Aggregate monthly for current period
        const monthlySpending = aggregateMonthly(filteredDaily);
        
        // Calculate metrics for current period
        const total = filteredDaily.reduce((sum, d) => sum + d.amount, 0);
        const uniqueMonths = new Set(filteredDaily.map(d => d.date.substring(0, 7))).size;
        const averageMonthly = uniqueMonths > 0 ? total / uniqueMonths : 0;

        // Calculate metrics for previous period
        const previousTotal = prevFilteredDaily.reduce((sum, d) => sum + d.amount, 0);
        const prevUniqueMonths = new Set(prevFilteredDaily.map(d => d.date.substring(0, 7))).size;
        const previousAverageMonthly = prevUniqueMonths > 0 ? previousTotal / prevUniqueMonths : 0;

        // Wealth spent percentage
        // Use the latest valuation total value as denominator
        const latestValuation = sortedHistory[sortedHistory.length - 1];
        const totalWealth = latestValuation ? latestValuation.totalValue : 0;
        const wealthSpentPercentage = totalWealth > 0 ? (total / totalWealth) * 100 : 0;

        setData({
          daily: filteredDaily,
          monthly: monthlySpending,
          total,
          averageMonthly,
          previousTotal,
          previousAverageMonthly,
          wealthSpentPercentage
        });
        setError(null);
      } catch (err) {
        ctx.api.logger.error('Failed to fetch spending data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [ctx, accountId, timeFilter]);

  return { data, loading, error };
}

function getTimeRange(filter: TimeFilter): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  let startDate: Date;

  if (filter === 'ALL') {
    startDate = new Date(0);
    return { startDate, endDate };
  }

  const now = new Date();
  switch (filter) {
    case '3M':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6M':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case 'YTD':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '1Y':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case '3Y':
      startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
      break;
    case '5Y':
      startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }

  return { startDate, endDate };
}

function getPreviousTimeRange(filter: TimeFilter, currentStart: Date): { startDate: Date, endDate: Date } {
  const endDate = new Date(currentStart.getTime() - 1);
  let startDate: Date;

  if (filter === 'ALL') {
    return { startDate: new Date(0), endDate };
  }

  const diff = new Date().getTime() - currentStart.getTime();
  startDate = new Date(currentStart.getTime() - diff);

  return { startDate, endDate };
}

function filterData(data: SpendingDay[], start: Date, end: Date): SpendingDay[] {
  const startIso = start.toISOString().split('T')[0];
  const endIso = end.toISOString().split('T')[0];
  return data.filter(d => d.date >= startIso && d.date <= endIso);
}

function aggregateMonthly(data: SpendingDay[]): SpendingDay[] {
  const months: Record<string, number> = {};
  
  data.forEach(d => {
    const month = d.date.substring(0, 7); // YYYY-MM
    months[month] = (months[month] || 0) + d.amount;
  });

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date: `${date}-01`, amount }));
}
