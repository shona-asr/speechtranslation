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
import { RefreshCw, SearchIcon } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';

type Rating = {
  id: number;
  userId: number;
  featureType: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export function RatingsTable() {
  const [featureType, setFeatureType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: ratings, isLoading, refetch } = useQuery({
    queryKey: ['/api/ratings', featureType],
    queryFn: async () => {
      const url = new URL('/api/ratings', window.location.origin);
      if (featureType) url.searchParams.append('featureType', featureType);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch ratings');
      return response.json() as Promise<Rating[]>;
    }
  });
  
  // Filter ratings by search term (in comments)
  const filteredRatings = ratings?.filter(rating => 
    rating.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getFeatureBadgeVariant = (featureType: string) => {
    switch (featureType) {
      case 'transcription': return 'default';
      case 'translation': return 'secondary';
      case 'text-to-speech': return 'outline';
      case 'speech-to-speech': return 'destructive';
      default: return 'default';
    }
  };
  
  const formatFeatureName = (featureType: string) => {
    return featureType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search comments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={featureType} onValueChange={setFeatureType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Features</SelectItem>
              <SelectItem value="transcription">Transcription</SelectItem>
              <SelectItem value="translation">Translation</SelectItem>
              <SelectItem value="text-to-speech">Text to Speech</SelectItem>
              <SelectItem value="speech-to-speech">Speech to Speech</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[180px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading ratings...
                </TableCell>
              </TableRow>
            ) : filteredRatings && filteredRatings.length > 0 ? (
              filteredRatings.map((rating) => (
                <TableRow key={rating.id}>
                  <TableCell className="font-medium">User #{rating.userId}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getFeatureBadgeVariant(rating.featureType) as any}
                      className="capitalize"
                    >
                      {formatFeatureName(rating.featureType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StarRating value={rating.rating} onChange={() => {}} readonly size="sm" />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {rating.comment || (
                      <span className="text-muted-foreground italic">No comment</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(rating.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No ratings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}