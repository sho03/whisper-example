import { Backdrop, CircularProgress } from '@mui/material';
import React, { useState, useRef } from 'react';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioChunksRef.current) {
      console.error("/api/upload_function")
      return;
    }
    const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
    const formData = new FormData();
    formData.append('audio', blob)

    try {
      setLoading(true)
      const response = await fetch('/api/upload_function', {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error uploading audio:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <h1>Audio Recorder</h1>
      <button onClick={startRecording} disabled={isRecording}>
        録音の開始
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        録音の終了 
      </button>
      <div>
        {audioURL && (
          <audio controls src={audioURL}>
            <source type="audio/wav" />
          </audio>
        )}
      </div>
      <div>
        <button onClick={uploadAudio} disabled={!audioURL}>書き出しと要約</button>
      </div>
      { result && 
        (
      <div>
        <div>
          <h2>サマリ</h2>
          <div>{result.abstract_summary}</div>
        </div>
        <div>
          <h2>キーポイント</h2>
          <div>{result.key_points}</div>
        </div>
        <div>
          <h2>アクションアイテム</h2>
          <div>{result.action_items}</div>
        </div>
        <div>
          <h2>センチメント</h2>
          <div>{result.sentiment}</div>
        </div>
      </div>
        )
      }
    </div>
  );
};

export default AudioRecorder;

type Result = {
  abstract_summary: string,
  key_points: string,
  action_items: string,
  sentiment: string
}
