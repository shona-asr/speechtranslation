
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export function useAdminDashboard() {
  const { user } = useAuth();
  const userId = user?.uid || "1"; // Default to 1 for demo purposes if no user ID available

  // Create a common headers object to use for all admin API requests
  const headers = {
    'Authorization': userId
  };

  const { data: summary } = useQuery({
    queryKey: ['adminDashboard', 'summary'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/summary', { headers });
      if (!response.ok) throw new Error('Failed to fetch dashboard summary');
      return response.json();
    },
    enabled: !!user, // Only run query if user is logged in
  });

  const { data: analytics } = useQuery({
    queryKey: ['adminDashboard', 'analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/daily', { headers });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: apiUsage } = useQuery({
    queryKey: ['adminDashboard', 'apiUsage'],
    queryFn: async () => {
      const response = await fetch('/api/admin/api-usage', { headers });
      if (!response.ok) throw new Error('Failed to fetch API usage');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: users } = useQuery({
    queryKey: ['adminDashboard', 'users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', { headers });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: logs } = useQuery({
    queryKey: ['adminDashboard', 'logs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/logs', { headers });
      if (!response.ok) throw new Error('Failed to fetch system logs');
      return response.json();
    },
    enabled: !!user,
  });

  return {
    summary,
    analytics,
    apiUsage,
    users,
    logs
  };
}
