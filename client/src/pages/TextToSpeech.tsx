import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import LangSelector from "@/components/LangSelector";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import AudioPlayer from "@/components/AudioPlayer";

const TextToSpeech = () => {
  const [language, setLanguage] = useState<string>("english");
  const [text, setText] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();
  
  const { convertTextToSpeech, isConverting } = useTextToSpeech();

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter text to convert to speech",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await convertTextToSpeech(text, language);
      setAudioBlob(result.audioBlob);
    } catch (error) {
      toast({
        title: "Text-to-Speech Error",
        description: (error as Error).message || "Failed to convert text to speech",
        variant: "destructive",
      });
    }
  };

  return (
    <PageContainer
      title="Text to Speech"
      description="Convert text to natural-sounding speech"
    >
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4">
            <LangSelector
              value={language}
              onChange={setLanguage}
              includeAuto={false}
              disabled={isConverting}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Enter Text
            </label>
            <Textarea
              className="min-h-[150px]"
              placeholder="Type or paste text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isConverting}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerateSpeech}
              disabled={!text.trim() || isConverting}
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              {isConverting ? "Generating..." : "Generate Speech"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player */}
      {audioBlob && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioPlayer 
              audioBlob={audioBlob} 
              className="mb-4"
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                const url = URL.createObjectURL(audioBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `speech-${Date.now()}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              Download Audio
            </Button>
          </CardFooter>
        </Card>
      )}
    </PageContainer>
  );
};

export default TextToSpeech;
