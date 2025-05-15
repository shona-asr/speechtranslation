import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'inverse';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend,
  trendDirection = 'up',
  variant = 'default',
  className
}: MetricCardProps) {
  // Determine if trend is positive based on direction
  const isTrendPositive = trend !== undefined && (
    (trendDirection === 'up' && trend > 0) || 
    (trendDirection === 'down' && trend < 0) ||
    (trendDirection === 'inverse' && trend < 0)
  );
  
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    destructive: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
  };

  return (
    <Card className={cn(
      "border", 
      variantStyles[variant],
      className
    )}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            
            {trend !== undefined && (
              <p className={cn(
                "mt-1 text-xs font-medium flex items-center",
                isTrendPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {isTrendPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                <span className="ml-1">from last period</span>
              </p>
            )}
          </div>
          
          {icon && (
            <div className="p-2 rounded-full bg-primary/10">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}