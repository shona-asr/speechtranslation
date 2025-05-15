import { useState } from "react";
import { useTranscribe_stream } from "@/hooks/useTranscriptionstream";
import PageContainer from "@/components/layout/PageContainer";
import AudioRecorder from "@/components/audiorec_stream";
import LangSelector from "@/components/LangSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clipboard, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AudioPlayer from "@/components/AudioPlayer";

const RealtimeTranscribe = () => {
  const [language, setLanguage] = useState<string>("auto");
  const [transcriptionText, setTranscriptionText] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const { 
    transcribe_stream, 
    isTranscribing,
    progress
  } = useTranscribe_stream();

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    try {
      const result = await transcribe_stream(blob, language);
      setTranscriptionText(result.transcription);
    } catch (error) {
      toast({
        title: "Transcription Error",
        description: (error as Error).message || "Failed to transcribe audio",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    setAudioBlob(file);
    try {
      const result = await transcribe_stream(file, language);
      setTranscriptionText(result.transcription);
    } catch (error) {
      toast({
        title: "Transcription Error",
        description: (error as Error).message || "Failed to transcribe audio",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcriptionText);
    toast({
      title: "Copied",
      description: "Transcription copied to clipboard",
    });
  };

  const downloadTranscription = () => {
    const element = document.createElement("a");
    const file = new Blob([transcriptionText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcription-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <PageContainer
      title="Real-Time Speech to Text"
      description="Experience instant, accurate transcription of your voice in real time."
    >
      {/* Options Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-grow max-w-xs">
              <LangSelector
                value={language}
                onChange={setLanguage}
                includeAuto={true}
                disabled={isTranscribing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recorder */}
      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        onUpload={handleFileUpload}
        isProcessing={isTranscribing}
      />

      {/* Progress & Result */}
      <Card>
        {isTranscribing && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Processing...</CardTitle>
            <CardDescription>{Math.round(progress)}%</CardDescription>
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>
        )}

        <CardHeader className={isTranscribing ? "" : "pb-3"}>
          <CardTitle className="text-lg">Transcription Result</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="border border-input rounded-md p-4 bg-muted/50 min-h-[150px]">
            {transcriptionText ? (
              <p>{transcriptionText}</p>
            ) : (
              <p className="text-muted-foreground">
                Start recording and your transcription will appear here...
              </p>
            )}
          </div>

          {audioBlob && transcriptionText && (
            <div className="mt-4">
              <AudioPlayer 
                audioBlob={audioBlob} 
                label="Original Audio" 
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={copyToClipboard}
            disabled={!transcriptionText}
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            onClick={downloadTranscription}
            disabled={!transcriptionText}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="default"
            onClick={() => window.location.href = "/translate"}
            disabled={!transcriptionText}
          >
            <FileText className="mr-2 h-4 w-4" />
            Translate
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default RealtimeTranscribe;
