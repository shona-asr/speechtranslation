import { useState, useEffect, useRef } from "react";
import { Mic, Square, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioRecorder as Recorder } from "@/lib/audio";
import AudioVisualizer from "./AudioVisualizer";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onUpload?: (file: File) => void;
  isRecording?: boolean;
  isProcessing?: boolean;
}

const AudioRecorder = ({
  onRecordingComplete,
  onUpload,
  isRecording: externalIsRecording,
  isProcessing = false
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const animationFrameRef = useRef<number | null>(null);

  // Controlled recording state from parent if provided
  useEffect(() => {
    if (externalIsRecording !== undefined) {
      setIsRecording(externalIsRecording);
    }
  }, [externalIsRecording]);

  useEffect(() => {
    if (!recorderRef.current) {
      recorderRef.current = new Recorder({
        onStop: (blob) => {
          setIsRecording(false);
          onRecordingComplete(blob);
        },
        onError: (error) => {
          toast({
            title: "Recording Error",
            description: error.message,
            variant: "destructive",
          });
          setIsRecording(false);
        }
      });
    }

    return () => {
      if (recorderRef.current && recorderRef.current.isRecording()) {
        recorderRef.current.stop();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onRecordingComplete, toast]);

  const startRecording = async () => {
    if (isProcessing) return;

    try {
      await recorderRef.current?.start();
      setIsRecording(true);
      simulateAudioData();
    } catch (error) {
      toast({
        title: "Recording Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };


  const simulateAudioData = () => {
    const generateAudioData = () => {
      const data = new Float32Array(50);
      for (let i = 0; i < 50; i++) {
        data[i] = Math.random() * 0.5 + 0.2;
      }
      setAudioData(data);

      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(generateAudioData);
      }
    };

    generateAudioData();
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col items-center justify-center py-8">
        <Button
          size="lg"
          className={cn(
            "w-16 h-16 rounded-full mb-4",
            isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
          )}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? (
            <Square className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {isRecording && (
          <>
            <p className="text-destructive animate-pulse">Recording...</p>
            <AudioVisualizer audioData={audioData} className="mt-4 mb-4" />
          </>
        )}

        <p className="text-muted-foreground mt-4">
          {isProcessing ? 'Processing...' : 'Tap to start recording'}
        </p>


      </div>
    </div>
  );
};

export default AudioRecorder;
