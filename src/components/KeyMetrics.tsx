import React from 'react';
import { Card, CardContent, Icons, cn } from '@wealthfolio/ui';

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  isPercentage?: boolean;
  currency: string;
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ 
  title, 
  value, 
  previousValue, 
  isPercentage, 
  currency, 
  icon, 
  description 
}: MetricCardProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const diff = previousValue !== undefined && previousValue !== 0 
    ? ((value - previousValue) / previousValue) * 100 
    : null;

  const displayValue = isPercentage 
    ? `${value.toFixed(2)}%` 
    : `${currency} ${formatter.format(value)}`;

  return (
    <Card className="overflow-hidden border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {displayValue}
          </h2>
          
          <div className="flex flex-col">
            {diff !== null && (
              <span className={cn(
                "text-sm font-medium",
                diff > 0 ? "text-orange-500" : "text-green-500"
              )}>
                {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground mt-1">
                {description}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KeyMetricsProps {
  total: number;
  averageMonthly: number;
  previousTotal: number;
  previousAverageMonthly: number;
  wealthSpentPercentage: number;
  currency?: string;
}

export default function KeyMetrics({ 
  total, 
  averageMonthly, 
  previousTotal, 
  previousAverageMonthly,
  wealthSpentPercentage,
  currency = 'USD' 
}: KeyMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <MetricCard 
        title="Total Spending"
        value={total}
        previousValue={previousTotal}
        currency={currency}
        icon={<Icons.CreditCard className="h-5 w-5" />}
      />
      
      <MetricCard 
        title="Monthly Average"
        value={averageMonthly}
        previousValue={previousAverageMonthly}
        currency={currency}
        icon={<Icons.TrendingDown className="h-5 w-5" />}
        description="Based on active months"
      />

      <MetricCard 
        title="Wealth Spent"
        value={wealthSpentPercentage}
        isPercentage
        currency={currency}
        icon={<Icons.PieChart className="h-5 w-5" />}
        description="Against net worth"
      />
    </div>
  );
}
