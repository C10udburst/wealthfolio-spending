export interface SpendingDay {
  date: string;
  amount: number;
}

export interface SpendingData {
  daily: SpendingDay[];
  monthly: SpendingDay[];
  total: number;
  averageMonthly: number;
  previousTotal: number;
  previousAverageMonthly: number;
  wealthSpentPercentage: number;
}

export type TimeFilter = '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | 'ALL';
