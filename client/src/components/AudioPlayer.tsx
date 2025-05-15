import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Volume1, VolumeX, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  audioBlob: Blob;
  className?: string;
  label?: string;
}

const AudioPlayer = ({ audioBlob, className, label }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Create audio URL from blob
    audioUrl.current = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl.current);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      if (!isFinite(audio.duration)) {
        audio.currentTime = Number.MAX_SAFE_INTEGER;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          audio.currentTime = 0;
          setDuration(audio.duration);
        };
      } else {
        setDuration(audio.duration);
      }
    });


    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      URL.revokeObjectURL(audioUrl.current);
    };
  }, [audioBlob]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };
  
  const downloadAudio = () => {
    try {
      const url = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      
      // Create a timestamp for unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `audio-${timestamp}.${getAudioExtension(audioBlob.type)}`;
      
      link.href = url;
      link.download = fileName;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Audio Downloaded",
        description: `Successfully saved as ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download the audio file",
        variant: "destructive",
      });
    }
  };
  
  const getAudioExtension = (mimeType: string): string => {
    const types: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/wave': 'wav',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/aac': 'aac',
      'audio/m4a': 'm4a',
      'audio/flac': 'flac'
    };
    
    return types[mimeType] || 'mp3'; // Default to mp3 if type unknown
  };

  return (
    <div className={cn("bg-card border rounded-md p-4", className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">{label}</div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={downloadAudio}
            title="Download audio"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>

        <div className="flex items-center">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
          >
            <VolumeIcon />
          </Button>
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
      
      {!label && (
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex items-center gap-1 text-xs"
            onClick={downloadAudio}
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
