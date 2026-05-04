import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  ToggleGroup,
  ToggleGroupItem
} from '@wealthfolio/ui';
import { TimeFilter } from '../types';

interface HeaderProps {
  accounts: { id: string, name: string }[];
  selectedAccount: string;
  onAccountChange: (id: string) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

export default function Header({ 
  accounts, 
  selectedAccount, 
  onAccountChange,
  timeFilter,
  onTimeFilterChange
}: HeaderProps) {
  const timeFilters: TimeFilter[] = ['3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'ALL'];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Select value={selectedAccount} onValueChange={onAccountChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TOTAL">Total Portfolio</SelectItem>
            {accounts.map(acc => (
              <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ToggleGroup 
        type="single" 
        value={timeFilter} 
        onValueChange={(v) => v && onTimeFilterChange(v as TimeFilter)}
        className="bg-muted/50 p-1 rounded-full"
      >
        {timeFilters.map(f => (
          <ToggleGroupItem key={f} value={f} className="text-xs px-3 rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm">
            {f}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
