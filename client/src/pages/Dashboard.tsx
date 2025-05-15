import { Link } from "wouter";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import DashboardStats from "@/components/layout/DashboardStats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mic, Languages, Volume2, RotateCcw } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { formatDistance } from "date-fns";

const Dashboard = () => {
  const { historyItems } = useHistory();

  // Get the 5 most recent history items
  const recentActivities = historyItems.slice(0, 5);

  return (
    <PageContainer
      title="Dashboard"
      description="Manage your speech processing tasks"
    >
      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Transcribe Card */}
          <Link href="/transcribe">
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <Mic className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Transcribe Audio</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Convert speech to text with high accuracy
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Translate Card */}
          <Link href="/translate">
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <Languages className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Translate Text</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Translate between multiple languages
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Text to Speech Card */}
          <Link href="/text-to-speech">
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <Volume2 className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Text to Speech</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Convert text to natural-sounding speech
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Speech to Speech Card */}
          <Link href="/speech-to-speech">
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <RotateCcw className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Speech to Speech</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Translate speech directly to another language
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Usage Statistics */}
      <DashboardStats />

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/history">
            <Button variant="link" className="p-0">
              View All
            </Button>
          </Link>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {activity.type === "transcription" && (
                          <Mic className="text-primary mr-2 h-4 w-4" />
                        )}
                        {activity.type === "translation" && (
                          <Languages className="text-primary mr-2 h-4 w-4" />
                        )}
                        {activity.type === "textToSpeech" && (
                          <Volume2 className="text-primary mr-2 h-4 w-4" />
                        )}
                        {activity.type === "speechToSpeech" && (
                          <RotateCcw className="text-primary mr-2 h-4 w-4" />
                        )}
                        <span className="capitalize">{activity.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm truncate max-w-xs">
                        {activity.type === "transcription" && activity.transcription && activity.transcription.substring(0, 50) + "..."}
                        {activity.type === "translation" && activity.originalText && activity.originalText.substring(0, 50) + "..."}
                        {activity.type === "textToSpeech" && activity.text && activity.text.substring(0, 50) + "..."}
                        {activity.type === "speechToSpeech" && activity.originalText && activity.originalText.substring(0, 50) + "..."}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.type === "transcription" && activity.language}
                      {activity.type === "translation" && `${activity.sourceLanguage} → ${activity.targetLanguage}`}
                      {activity.type === "textToSpeech" && activity.language}
                      {activity.type === "speechToSpeech" && `${activity.originalLanguage} → ${activity.translatedLanguage}`}
                    </TableCell>
                    <TableCell>
                      {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/history?id=${activity.id}`}>
                        <Button variant="link" className="p-0">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No recent activities found. Start using the app to see your history here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </section>
    </PageContainer>
  );
};

export default Dashboard;