import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  ToggleGroup,
  ToggleGroupItem,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@wealthfolio/ui';
import { Bar, ComposedChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { SpendingDay } from '../types';

interface SpendingChartProps {
  dailyData: SpendingDay[];
  monthlyData: SpendingDay[];
  currency?: string;
}

export default function SpendingChart({ dailyData, monthlyData, currency = 'USD' }: SpendingChartProps) {
  const [view, setView] = useState<'daily' | 'monthly'>('monthly');
  const rawData = view === 'daily' ? dailyData : monthlyData;

  const data = useMemo(() => {
    let cumulative = 0;
    return rawData.map(d => {
      cumulative += d.amount;
      return {
        ...d,
        cumulative,
        displayAmount: d.amount > 0 ? d.amount : null
      };
    });
  }, [rawData]);

  const useLineGraph = data.length > 150;

  const chartConfig = {
    displayAmount: {
      label: view === 'daily' ? 'Daily ' : 'Monthly ',
      color: "hsl(25, 95%, 55%)", // Warm orange
    },
    cumulative: {
      label: "Total ",
      color: "hsl(25, 95%, 40%)",
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Spending Over Time</CardTitle>
        <ToggleGroup 
          type="single" 
          value={view} 
          onValueChange={(v) => v && setView(v as 'daily' | 'monthly')}
          className="bg-muted/50 p-1 rounded-full"
        >
          <ToggleGroupItem value="daily" className="text-xs h-7 rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm">Daily</ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="text-xs h-7 rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm">Monthly</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[350px] w-full">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return view === 'daily' 
                      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  }}
                  minTickGap={30}
                />
                <YAxis 
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${currency} ${value.toLocaleString()}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${currency} ${value.toLocaleString()}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                
                {useLineGraph ? (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="displayAmount"
                    stroke="none"
                    dot={{ r: 3, fill: 'var(--color-displayAmount)', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                ) : (
                  <Bar 
                    yAxisId="left"
                    dataKey="displayAmount" 
                    fill="var(--color-displayAmount)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={view === 'daily' ? undefined : 40}
                  />
                )}
                
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative"
                  stroke="var(--color-cumulative)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
