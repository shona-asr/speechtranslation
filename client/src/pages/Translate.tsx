import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import LangSelector from "@/components/LangSelector";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clipboard, Download, Mic, Upload, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslate } from "@/hooks/useTranslate";
import AudioPlayer from "@/components/AudioPlayer";
import { base64toBlob } from "@/lib/audio";

const Translate = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>("auto");
  const [targetLanguage, setTargetLanguage] = useState<string>("english");
  const [sourceText, setSourceText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();
  
  const { translate, isTranslating } = useTranslate();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await translate(sourceText, sourceLanguage, targetLanguage);
      setTranslatedText(result.translatedText);
      
      if (result.audioContent) {
        const blob = base64toBlob(result.audioContent);
        setAudioBlob(blob);
      }
    } catch (error) {
      toast({
        title: "Translation Error",
        description: (error as Error).message || "Failed to translate text",
        variant: "destructive",
      });
    }
  };

  const clearSourceText = () => {
    setSourceText("");
    setTranslatedText("");
    setAudioBlob(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied",
      description: "Translation copied to clipboard",
    });
  };

  return (
    <PageContainer
      title="Text Translation"
      description="Translate between multiple languages"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Text */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-medium">Source Text</h3>
              <LangSelector
                value={sourceLanguage}
                onChange={setSourceLanguage}
                includeAuto={true}
                disabled={isTranslating}
              />
            </div>

            <Textarea
              className="min-h-[200px] mb-3"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={isTranslating}
            />

            <div className="flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSourceText}
                disabled={!sourceText || isTranslating}
              >
                Clear
              </Button>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" disabled>
                  <Mic className="mr-1 h-4 w-4" />
                  Speak
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Upload className="mr-1 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Text */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-medium">Translation</h3>
              <LangSelector
                value={targetLanguage}
                onChange={setTargetLanguage}
                includeAuto={false}
                disabled={isTranslating}
              />
            </div>

            <div className="min-h-[200px] p-3 bg-muted/50 border border-input rounded-md mb-3">
              {translatedText ? (
                <p>{translatedText}</p>
              ) : (
                <p className="text-muted-foreground">
                  Translation will appear here...
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                disabled={!translatedText}
              >
                <Clipboard className="mr-1 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!audioBlob}
              >
                <Volume2 className="mr-1 h-4 w-4" />
                Listen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!translatedText}
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
            </div>
            
            {audioBlob && (
              <div className="mt-4">
                <AudioPlayer audioBlob={audioBlob} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={handleTranslate}
          disabled={!sourceText || isTranslating}
        >
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      </div>
    </PageContainer>
  );
};

export default Translate;
