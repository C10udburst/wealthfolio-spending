import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@wealthfolio/ui';
import { SpendingDay } from '../types';

interface EventTimelineProps {
  data: SpendingDay[];
  currency?: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  amount: number;
  lane: number;
}

export default function EventTimeline({ data, currency = 'USD' }: EventTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const formatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }), [currency]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const significantEvents = useMemo(() => {
    // Only show events with significant spending (>0)
    // and limit to last 50 events to keep it clean
    const filtered = data
      .filter(d => d.amount > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Assign lanes
    const events: TimelineEvent[] = [];
    const lanes: number[] = []; // tracks end time of last event in each lane

    filtered.forEach((d, i) => {
      const eventTime = new Date(d.date).getTime();
      let assignedLane = -1;

      for (let l = 0; l < lanes.length; l++) {
        // If event starts after previous event in lane ends (using 1 day buffer)
        if (eventTime > lanes[l] + 24 * 60 * 60 * 1000) {
          assignedLane = l;
          lanes[l] = eventTime;
          break;
        }
      }

      if (assignedLane === -1) {
        assignedLane = lanes.length;
        lanes.push(eventTime);
      }

      events.push({
        id: `${d.date}-${i}`,
        date: d.date,
        amount: d.amount,
        lane: assignedLane
      });
    });

    return events;
  }, [data]);

  const timeRange = useMemo(() => {
    if (data.length < 2) return null;
    const start = new Date(data[0].date).getTime();
    const end = new Date(data[data.length - 1].date).getTime();
    return { start, end, duration: end - start };
  }, [data]);

  const getPosition = (dateStr: string) => {
    if (!timeRange || containerWidth === 0) return 0;
    const time = new Date(dateStr).getTime();
    return ((time - timeRange.start) / timeRange.duration) * containerWidth;
  };

  if (!timeRange || significantEvents.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">No significant events to display.</p></CardContent>
      </Card>
    );
  }

  const laneHeight = 32;
  const totalLanes = Math.max(...significantEvents.map(e => e.lane), 0) + 1;

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader>
        <CardTitle>Spending Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative w-full border rounded-lg bg-muted/20 overflow-x-auto min-h-[150px]">
          <div 
            className="relative" 
            style={{ 
              height: totalLanes * laneHeight + 40,
              width: Math.max(containerWidth, 800) 
            }}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-between px-2">
               {/* Simplified grid - could add month labels here */}
            </div>

            <TooltipProvider>
              {significantEvents.map((event) => (
                <Tooltip key={event.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute h-6 rounded-full bg-primary/80 border border-primary flex items-center justify-center cursor-default hover:bg-primary transition-colors"
                      style={{
                        left: getPosition(event.date),
                        top: 20 + event.lane * laneHeight,
                        width: '12px',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-bold">{new Date(event.date).toLocaleDateString()}</p>
                      <p>Spent: {formatter.format(event.amount)}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
