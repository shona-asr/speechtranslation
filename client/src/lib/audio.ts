export interface AudioRecorderOptions {
  onDataAvailable?: (data: Blob) => void;
  onStart?: () => void;
  onStop?: (data: Blob) => void;
  onError?: (error: Error) => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private options: AudioRecorderOptions;

  constructor(options: AudioRecorderOptions = {}) {
    this.options = options;
  }

  async start() {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        return;
      }

      this.chunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
          if (this.options.onDataAvailable) {
            this.options.onDataAvailable(event.data);
          }
        }
      });

      this.mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(this.chunks, { type: 'audio/wav' });
        if (this.options.onStop) {
          this.options.onStop(blob);
        }
        this.stopStream();
      });

      this.mediaRecorder.start();
      if (this.options.onStart) {
        this.options.onStart();
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  private stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  isRecording() {
    return this.mediaRecorder?.state === 'recording';
  }
}

export const createAudioElement = (audioBlob: Blob): HTMLAudioElement => {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  return audio;
};

export const playAudio = (audioElement: HTMLAudioElement) => {
  if (audioElement) {
    audioElement.play();
  }
};

export const pauseAudio = (audioElement: HTMLAudioElement) => {
  if (audioElement) {
    audioElement.pause();
  }
};

export function base64toBlob(base64Data: string, contentType: string = 'audio/mp3'): Blob {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
