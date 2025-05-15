import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Languages, Server } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";

const DashboardStats = () => {
  const { historyItems } = useHistory();
  
  // Calculate statistics
  const audioMinutes = historyItems
    .filter(item => item.type === 'transcription' || item.type === 'speechToSpeech')
    .length;
  
  const translations = historyItems
    .filter(item => item.type === 'translation' || item.type === 'speechToSpeech')
    .length;
  
  const apiCalls = historyItems.length;
  
  // Simulate percentage of monthly limits
  const audioPercentage = Math.min(100, (audioMinutes / 50) * 100);
  const translationsPercentage = Math.min(100, (translations / 150) * 100);
  const apiCallsPercentage = Math.min(100, (apiCalls / 300) * 100);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Audio Processed</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{audioMinutes}</div>
              <div className="text-muted-foreground ml-2 mb-1 text-sm">minutes</div>
            </div>
            <Progress value={audioPercentage} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(audioPercentage)}% of your monthly limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Translations</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{translations}</div>
              <div className="text-muted-foreground ml-2 mb-1 text-sm">texts</div>
            </div>
            <Progress value={translationsPercentage} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(translationsPercentage)}% of your monthly limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Calls</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{apiCalls}</div>
              <div className="text-muted-foreground ml-2 mb-1 text-sm">requests</div>
            </div>
            <Progress value={apiCallsPercentage} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(apiCallsPercentage)}% of your monthly limit</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DashboardStats;
