import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { Button } from './UI';

interface CameraCaptureProps {
  onCaptureComplete: (photos: string[]) => void;
  requiredPhotos: number;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCaptureComplete, requiredPhotos }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 7680 }, 
            height: { ideal: 4320 }
          }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access camera. Please allow permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // High res capture
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror effect
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);

      setCapturedPhotos(prev => {
        const newPhotos = [...prev, dataUrl];
        if (newPhotos.length >= requiredPhotos) {
            setTimeout(() => onCaptureComplete(newPhotos), 800);
        }
        return newPhotos;
      });
    }
  }, [requiredPhotos, onCaptureComplete]);

  // Handle Countdown sequence
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      takePhoto();
      if (capturedPhotos.length < requiredPhotos - 1) {
        setCountdown(null); 
        setTimeout(() => setCountdown(3), 1500); // 1.5s pause between shots
      } else {
        setCountdown(null);
      }
    }
  }, [countdown, capturedPhotos.length, requiredPhotos, takePhoto]);

  const startSession = () => {
    setCapturedPhotos([]);
    setCountdown(3);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-red-500 p-8 text-center bg-gray-100 rounded-3xl">
        <p className="text-xl font-bold mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry Permission</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="relative w-full bg-black rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] md:aspect-video flex flex-col mb-6 ring-8 ring-white">
        {/* Video Feed */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100" 
        />
        
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash Overlay */}
        {isFlashing && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />}

        {/* Countdown Overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/10 backdrop-blur-[2px]">
            <span className="text-[120px] md:text-[180px] font-black text-white drop-shadow-2xl animate-bounce leading-none">
              {countdown}
            </span>
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md">
                REC ●
            </div>
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col items-center space-y-4 w-full px-4">
          
        {/* Progress Indicators */}
        <div className="flex gap-4 mb-2">
            {Array.from({ length: requiredPhotos }).map((_, i) => (
            <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < capturedPhotos.length 
                    ? 'bg-pink-500 scale-125' 
                    : 'bg-gray-300'
                }`}
            />
            ))}
        </div>

        {capturedPhotos.length === 0 && countdown === null ? (
            <Button onClick={startSession} size="lg" className="w-full max-w-xs shadow-pink-500/40 shadow-lg text-xl py-6">
                <Camera className="w-6 h-6 mr-2" />
                Start Photo Session
            </Button>
        ) : (
             <div className="text-center h-16 flex items-center justify-center">
                 {countdown !== null ? (
                    <p className="text-xl font-bold text-gray-700 animate-pulse">Get Ready!</p>
                 ) : (
                    <p className="text-xl font-bold text-gray-700">Processing...</p>
                 )}
             </div>
        )}
        
        <p className="text-gray-400 text-sm mt-4">
            {countdown === null && capturedPhotos.length === 0 ? "Make sure you have good lighting!" : `Taking photo ${capturedPhotos.length + 1} of ${requiredPhotos}`}
        </p>
      </div>
    </div>
  );
};