import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useQuery } from '@tanstack/react-query';


const MetricCard = ({ title, value, description }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const SystemLogs = ({ logs }) => (
  <Card>
    <CardHeader>
      <CardTitle>System Logs</CardTitle>
      <CardDescription>Recent system events and errors</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border-b pb-3">
            <div className="flex justify-between">
              <div className="font-medium">{log.message}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                log.level === 'ERROR' ? 'bg-destructive/10 text-destructive' : 
                log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {log.level}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString()}</div>
            {log.metadata && (
              <div className="text-sm mt-1 bg-muted p-2 rounded">
                {typeof log.metadata === 'object' 
                  ? JSON.stringify(log.metadata, null, 2)
                  : String(log.metadata)
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const UsersTable = ({ users }) => (
  <Card>
    <CardHeader>
      <CardTitle>User Management</CardTitle>
      <CardDescription>Review and manage user accounts</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left font-medium p-2">ID</th>
              <th className="text-left font-medium p-2">Name</th>
              <th className="text-left font-medium p-2">Email</th>
              <th className="text-left font-medium p-2">Role</th>
              <th className="text-left font-medium p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.id}</td>
                <td className="p-2">{user.displayName}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-2">{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const RatingsTable = ({ ratings }) => (
  <Card>
    <CardHeader>
      <CardTitle>Feature Ratings</CardTitle>
      <CardDescription>User satisfaction by feature</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {ratings.map((item, index) => {
          const ratingValue = parseFloat(item.rating); // convert string to number
          console.log(item.feature, item.rating, typeof item.rating); // debug

          return (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <span>{item.feature}</span>
              <div className="flex items-center">
                <span className="mr-2 font-bold">
                  {!isNaN(ratingValue) ? ratingValue.toFixed(1) : 'N/A'}
                </span>
                <StarRating value={ratingValue} readonly size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);



const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const { summary, analytics, apiUsage, users, logs } = useAdminDashboard();

  const { data: ratings } = useQuery({
    queryKey: ['/api/ratings'],
    queryFn: async () => {
      const response = await fetch('/api/ratings');
      if (!response.ok) throw new Error('Failed to fetch ratings');
      return response.json();
    }
  });
  
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const analyticsData = analytics?.dailyStats || [];
  const usageData = apiUsage?.monthlyStats || [];
  const ratingsData = summary?.ratings?.averages ? [
    { feature: 'Transcription', rating: summary.ratings.averages.transcription },
    { feature: 'Translation', rating: summary.ratings.averages.translation },
    { feature: 'Text to Speech', rating: summary.ratings.averages.textToSpeech },
    { feature: 'Speech to Speech', rating: summary.ratings.averages.speechToSpeech }
  ] : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Users" 
              value={summary?.userCounts?.total.toString() || "0"} 
              description={`${summary?.userCounts?.admins || 0} admins, ${summary?.userCounts?.regular || 0} regular users`} 
            />
            <MetricCard 
              title="Active Users (Daily)" 
              value={analytics?.dailyStats?.[analytics.dailyStats.length - 1]?.activeUsers.toString() || "0"} 
              description="Based on latest activity" 
            />
            <MetricCard 
              title="API Calls (Today)" 
              value={(analytics?.dailyStats?.[analytics.dailyStats.length - 1]?.transcriptions + 
                     analytics?.dailyStats?.[analytics.dailyStats.length - 1]?.translations + 
                     analytics?.dailyStats?.[analytics.dailyStats.length - 1]?.tts + 
                     analytics?.dailyStats?.[analytics.dailyStats.length - 1]?.sts || 0).toString()} 
              description="Sum of all API calls" 
            />
            <MetricCard 
              title="Average Processing Time" 
              value={`${apiUsage?.averageResponseTime || 0}ms`} 
              description={`${logs?.filter(log => log.level === 'ERROR').length || 0} errors reported`} 
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage Trends (Last 7 Days)</CardTitle>
              <CardDescription>Daily activity across different features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <BarChart width={800} height={300} data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transcriptions" fill="#8884d8" name="Transcriptions" />
                  <Bar dataKey="translations" fill="#82ca9d" name="Translations" />
                  <Bar dataKey="tts" fill="#ffc658" name="Text-to-Speech" />
                  <Bar dataKey="sts" fill="#ff8042" name="Speech-to-Speech" />
                </BarChart>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Usage (Last 5 Months)</CardTitle>
              <CardDescription>API calls and data transferred</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <BarChart width={800} height={300} data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="apiCalls" fill="#8884d8" name="API Calls" />
                  <Bar yAxisId="right" dataKey="dataTransferred" fill="#82ca9d" name="Data Transferred (GB)" />
                </BarChart>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersTable users={users || []} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <SystemLogs logs={logs || []} />
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Bar Chart on the Left */}
            <Card className="lg:w-1/2 w-full">
              <CardHeader>
                <CardTitle>Feature Ratings</CardTitle>
                <CardDescription>Average user ratings by feature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <BarChart
                    width={400}
                    height={300}
                    data={ratingsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rating" fill="#8884d8" name="Average Rating" />
                  </BarChart>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Table on the Right */}
            <div className="lg:w-1/2 w-full">
              <RatingsTable ratings={ratingsData} />
            </div>
          </div>

          {/* What People Say Section Below */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">What People Say</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ratings?.filter(r => r.comment).map((rating, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">User #{rating.userId}</span>
                      <Badge variant="outline">{rating.featureType}</Badge>
                    </div>
                    <StarRating value={parseFloat(rating.rating)} readonly size="sm" />
                  </div>
                  <p className="text-muted-foreground">{rating.comment}</p>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default AdminDashboard;
