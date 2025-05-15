import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Mic, MicOff, LanguagesIcon, RefreshCcw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from "@/lib/audio";
import AudioVisualizer from "@/components/AudioVisualizer";
import LangSelector from "@/components/LangSelector";

// 5-second interval for real-time transcription
const RECORDING_INTERVAL = 5000;

interface RealtimeTranscriptionWidgetProps {
  onTranscriptionComplete?: (transcription: string, language: string, audioBlob: Blob) => void;
}

const RealtimeTranscriptionWidget: React.FC<RealtimeTranscriptionWidgetProps> = ({ 
  onTranscriptionComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const recorderRef = useRef<AudioRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingQueueRef = useRef<{blob: Blob, timestamp: number}[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptionRef = useRef<string>('');

  // Initialize audio recorder
  useEffect(() => {
    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorder({
        onDataAvailable: async (blob) => {
          // Queue this chunk for processing
          processingQueueRef.current.push({
            blob,
            timestamp: Date.now()
          });
          
          processNextInQueue();
        },
        onError: (error) => {
          console.error('Recording error:', error);
          toast({
            title: 'Recording Error',
            description: error.message,
            variant: 'destructive'
          });
          stopRecording();
        }
      });
    }
    
    return () => {
      stopRecording();
    };
  }, []);

  // Timer for recording time
  useEffect(() => {
    if (isRecording && !isPaused) {
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isRecording, isPaused]);

  // Process each audio chunk in the queue
  const processNextInQueue = useCallback(async () => {
    if (isProcessing || processingQueueRef.current.length === 0) return;
    
    setIsProcessing(true);
    const { blob } = processingQueueRef.current.shift()!;
    
    try {
      // Send the audio blob to the server for transcription
      const formData = new FormData();
      formData.append('audio_chunk', blob, 'chunk.wav');
      formData.append('language', selectedLanguage);
      
      console.log('Sending chunk for processing, size:', Math.round(blob.size / 1024), 'KB');
      
      const response = await fetch('/api/transcribe_stream', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Transcription API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.transcription) {
        // Add a space only if there's already text and the new chunk doesn't start with punctuation
        const space = transcriptionRef.current && 
                     !data.transcription.match(/^[.,!?;:)}\]]/);
        
        transcriptionRef.current += (space ? ' ' : '') + data.transcription;
        setTranscription(transcriptionRef.current);
        
        console.log('Received transcription chunk:', data.transcription);
        
        // Callback to parent if provided
        if (onTranscriptionComplete) {
          onTranscriptionComplete(transcriptionRef.current, selectedLanguage, blob);
        }
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Error',
        description: error.message || 'Failed to transcribe audio',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      // Process next in queue if available
      if (processingQueueRef.current.length > 0) {
        processNextInQueue();
      }
    }
  }, [isProcessing, selectedLanguage, onTranscriptionComplete]);

  // Start recording with visualization
  const startRecording = async () => {
    try {
      // Reset state
      setTranscription('');
      transcriptionRef.current = '';
      setRecordingTime(0);
      processingQueueRef.current = [];
      
      // Set up audio context and analyzer for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      // Request microphone access
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to analyzer for visualization
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      source.connect(analyserRef.current);
      
      // Start visualization
      visualize();
      
      // Start recording
      await recorderRef.current?.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Set up interval for continuous recording chunks
      recordingTimerRef.current = setInterval(() => {
        if (recorderRef.current?.isRecording() && !isPaused) {
          // Stop current recording and start a new one
          recorderRef.current.stop();
          recorderRef.current.start();
        }
      }, RECORDING_INTERVAL);
      
      toast({
        title: 'Recording Started',
        description: 'Your speech is being transcribed in real-time'
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone',
        variant: 'destructive'
      });
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (isPaused) {
      recorderRef.current?.start();
      setIsPaused(false);
      toast({
        title: 'Recording Resumed',
        description: 'Continuing transcription'
      });
    } else {
      recorderRef.current?.stop();
      setIsPaused(true);
      toast({
        title: 'Recording Paused',
        description: 'Transcription paused'
      });
    }
  };

  // Stop recording and clean up
  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    if (recorderRef.current?.isRecording()) {
      recorderRef.current.stop();
    }
    
    // Clean up audio context and stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setAudioData(null);
    
    if (transcriptionRef.current.trim()) {
      toast({
        title: 'Recording Complete',
        description: 'Transcription finished'
      });
    }
  };

  // Copy transcription to clipboard
  const copyTranscription = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      toast({
        title: 'Copied',
        description: 'Transcription copied to clipboard'
      });
    }
  };

  // Reset transcription
  const resetTranscription = () => {
    setTranscription('');
    transcriptionRef.current = '';
    toast({
      title: 'Reset',
      description: 'Transcription cleared'
    });
  };

  // Audio visualization function
  const visualize = () => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    const updateVisualization = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getFloatTimeDomainData(dataArray);
      setAudioData(dataArray);
      
      if (isRecording) {
        requestAnimationFrame(updateVisualization);
      }
    };
    
    updateVisualization();
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap">
          <CardTitle className="flex items-center gap-2">
            Real-time Transcription
            {isProcessing && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                Processing...
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <LangSelector 
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              label="Language"
              disabled={isRecording}
              includeAuto={true}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Audio Visualization */}
        <div className="h-10 bg-muted/30 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
          {isRecording ? (
            <AudioVisualizer audioData={audioData} className="w-full h-full" />
          ) : (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Click Record to start real-time transcription
            </div>
          )}
        </div>
        
        {/* Recording Time and Status */}
        {isRecording && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isPaused ? "outline" : "default"} className="font-mono">
                {formatTime(recordingTime)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {isPaused ? 'Paused' : 'Recording...'}
              </span>
            </div>
            <Badge 
              variant="outline" 
              className="font-mono text-xs flex items-center gap-1"
            >
              <LanguagesIcon className="h-3 w-3" />
              {selectedLanguage === 'auto' ? 'Auto-detect' : selectedLanguage}
            </Badge>
          </div>
        )}
        
        {/* Transcription Result */}
        <div 
          className={`p-3 h-32 mb-4 overflow-y-auto border rounded-lg ${
            transcription ? 'bg-card' : 'bg-muted/30'
          }`}
        >
          {transcription ? (
            <p className="text-sm">{transcription}</p>
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-10">
              Transcription will appear here...
            </p>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-x-2">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Mic className="mr-2 h-4 w-4" />
                Record
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                >
                  {isPaused ? (
                    <><Mic className="mr-2 h-4 w-4" />Resume</>
                  ) : (
                    <><MicOff className="mr-2 h-4 w-4" />Pause</>
                  )}
                </Button>
                
                <Button 
                  onClick={stopRecording} 
                  variant="destructive"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
          </div>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              disabled={!transcription}
              onClick={copyTranscription}
              title="Copy transcription"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              disabled={!transcription}
              onClick={resetTranscription}
              title="Reset transcription"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeTranscriptionWidget;