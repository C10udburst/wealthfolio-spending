import React, { useState } from 'react';
import type { AddonContext } from '@wealthfolio/addon-sdk';
import { useSpendingData, useAccounts, useSettings } from '../hooks';
import { Header, KeyMetrics, SpendingChart } from '../components';
import { TimeFilter } from '../types';
import { Icons } from '@wealthfolio/ui';

export default function Dashboard({ ctx }: { ctx: AddonContext }) {
  const [selectedAccount, setSelectedAccount] = useState('TOTAL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('1Y');

  const { accounts, loading: accountsLoading } = useAccounts(ctx);
  const { settings, currency, loading: settingsLoading } = useSettings(ctx);
  const { data, loading: dataLoading, error } = useSpendingData(ctx, selectedAccount, timeFilter);

  const isLoading = accountsLoading || dataLoading || settingsLoading;

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Icons.AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load data</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Spending Tracker</h1>
      </div>

      <Header 
        accounts={accounts}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Icons.Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          <KeyMetrics 
            total={data.total}
            averageMonthly={data.averageMonthly}
            previousTotal={data.previousTotal}
            previousAverageMonthly={data.previousAverageMonthly}
            wealthSpentPercentage={data.wealthSpentPercentage}
            currency={currency}
          />
          
          <SpendingChart 
            dailyData={data.daily}
            monthlyData={data.monthly}
            currency={currency}
          />
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No spending data found for the selected period.
        </div>
      )}
    </div>
  );
}
