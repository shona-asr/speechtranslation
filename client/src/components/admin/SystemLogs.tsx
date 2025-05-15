import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DownloadIcon, RefreshCw, SearchIcon } from 'lucide-react';

type SystemLog = {
  id: number;
  message: string;
  level: string;
  component: string;
  feature: string | null;
  userId: number | null;
  timestamp: string;
  metadata: any | null;
};

export function SystemLogs() {
  const [level, setLevel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/logs', level],
    queryFn: async () => {
      const url = new URL('/api/admin/logs', window.location.origin);
      if (level) url.searchParams.append('level', level);
      
      const response = await fetch(url.toString(), {
        headers: { Authorization: '1' } // Using the demo admin user ID
      });
      
      if (!response.ok) throw new Error('Failed to fetch logs');
      return response.json() as Promise<SystemLog[]>;
    }
  });
  
  // Filter logs by search term
  const filteredLogs = logs?.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.feature && log.feature.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  const getLevelBadgeVariant = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR': return 'destructive';
      case 'WARN': return 'warning';
      case 'INFO': return 'secondary';
      case 'DEBUG': return 'outline';
      default: return 'default';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="WARN">Warning</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="DEBUG">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[150px]">Component</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[180px]">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading logs...
                </TableCell>
              </TableRow>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge 
                      variant={getLevelBadgeVariant(log.level) as any}
                      className="uppercase font-medium"
                    >
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.component}
                    {log.feature && (
                      <span className="text-xs text-muted-foreground ml-1">
                        [{log.feature}]
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{log.message}</span>
                      {log.userId && (
                        <span className="text-xs text-muted-foreground">
                          User ID: {log.userId}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}