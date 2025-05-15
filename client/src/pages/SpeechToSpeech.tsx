import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import LangSelector from "@/components/LangSelector";
import AudioRecorder from "@/components/AudioRecorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSpeechToSpeech } from "@/hooks/useSpeechToSpeech";
import AudioPlayer from "@/components/AudioPlayer";
import { Eye, EyeOff, FileText, Download } from "lucide-react";

const SpeechToSpeech = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>("auto");
  const [targetLanguage, setTargetLanguage] = useState<string>("english");
  const [originalAudioBlob, setOriginalAudioBlob] = useState<Blob | null>(null);
  const [translatedAudioBlob, setTranslatedAudioBlob] = useState<Blob | null>(null);
  const [originalText, setOriginalText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [showText, setShowText] = useState<boolean>(false);
  const { toast } = useToast();

  const { convertSpeechToSpeech, isConverting } = useSpeechToSpeech();

  const saveTextAsFile = (text: string, filePrefix: string) => {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${filePrefix}-${timestamp}.txt`;

      link.href = url;
      link.download = fileName;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);

      toast({
        title: "File Saved",
        description: `Successfully saved as ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Error Saving File",
        description: "Failed to save the text file",
        variant: "destructive",
      });
    }
  };

  const handleRecordingComplete = async (
    blob: Blob,
    sourceLang: string,
    targetLang: string
  ) => {
    setOriginalAudioBlob(blob);
    try {
      const result = await convertSpeechToSpeech(blob, sourceLang, targetLang);
      console.log("Speech-to-Speech result:", result);

      setOriginalText(result.originalText);
      setTranslatedText(result.translatedText);
      setTranslatedAudioBlob(result.translatedAudio);

      toast({
        title: "Processing Complete",
        description: "Speech translated successfully"
      });
    } catch (error) {
      console.error("Speech-to-Speech Error:", error);
      toast({
        title: "Speech-to-Speech Error",
        description: (error as Error).message || "Failed to convert speech",
        variant: "destructive",
      });
    }
  };


  const handleFileUpload = async (file: File) => {
    setOriginalAudioBlob(file);

    try {
      const result = await convertSpeechToSpeech(file, sourceLanguage, targetLanguage);
      console.log("Speech-to-Speech file upload result:", result);

      setOriginalText(result.originalText);
      setTranslatedText(result.translatedText);
      setTranslatedAudioBlob(result.translatedAudio);

      toast({
        title: "Processing Complete",
        description: "Audio file translated successfully"
      });
    } catch (error) {
      console.error("Speech-to-Speech File Upload Error:", error);
      toast({
        title: "Speech-to-Speech Error",
        description: (error as Error).message || "Failed to convert speech",
        variant: "destructive",
      });
    }
  };

  return (
    <PageContainer
      title="Speech to Speech"
      description="Translate spoken words to another language"
    >
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <LangSelector
              value={sourceLanguage}
              onChange={setSourceLanguage}
              includeAuto={true}
              label="Source Language"
              disabled={isConverting}
            />
            <LangSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
              includeAuto={false}
              label="Target Language"
              disabled={isConverting}
            />
          </div>
        </CardContent>
      </Card>

      <AudioRecorder
  onRecordingComplete={handleRecordingComplete}
  onUpload={handleFileUpload}
  sourceLanguage={sourceLanguage}
  targetLanguage={targetLanguage}
  isProcessing={isConverting}
/>



      {/* Toggle Button */}
      {originalText && translatedText && (
        <div className="mb-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowText(!showText)}
            className="flex items-center gap-2"
          >
            {showText ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Text
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Text
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {originalText && translatedText && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Speech */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Original Speech</CardTitle>
            </CardHeader>
            <CardContent>
              {showText && (
                <div className="border border-input rounded-md p-4 bg-muted/50 min-h-[80px] mb-4 overflow-y-auto max-h-[150px]">
                  <p className="text-sm">{originalText}</p>
                </div>
              )}

              {originalAudioBlob && (
                <AudioPlayer 
                  audioBlob={originalAudioBlob} 
                  label="Original Audio"
                  className="mt-2"
                />
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-6 flex justify-between">
              {!showText && originalText && (
                <div className="text-xs text-muted-foreground italic">
                  Transcription available (toggle "Show Text" to view)
                </div>
              )}
              {originalText && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => saveTextAsFile(originalText, 'transcription')}
                  className="ml-auto flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">Save Text</span>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Translated Speech */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Translated Speech ({targetLanguage})</CardTitle>
            </CardHeader>
            <CardContent>
              {showText && (
                <div className="border border-input rounded-md p-4 bg-muted/50 min-h-[80px] mb-4 overflow-y-auto max-h-[150px]">
                  <p className="text-sm">{translatedText}</p>
                </div>
              )}

              {translatedAudioBlob && (
                <AudioPlayer 
                  audioBlob={translatedAudioBlob} 
                  label="Translated Audio"
                  className="mt-2"
                />
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-6 flex justify-between">
              {!showText && translatedText && (
                <div className="text-xs text-muted-foreground italic">
                  Translation available (toggle "Show Text" to view)
                </div>
              )}
              {translatedText && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => saveTextAsFile(translatedText, 'translation')}
                  className="ml-auto flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">Save Text</span>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default SpeechToSpeech;
