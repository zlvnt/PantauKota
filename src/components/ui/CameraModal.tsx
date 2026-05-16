import { useEffect, useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setLoading(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setError('Kamera tidak dapat diakses. Pastikan browser Anda memiliki izin untuk menggunakan kamera.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to file
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.85);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/15">
          <h3 className="font-semibold font-display text-on-surface text-lg">Kamera</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-surface-container-low hover:text-on-surface rounded-full transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[3/4] sm:aspect-video bg-black flex items-center justify-center overflow-hidden">
          {loading && <Loader2 className="w-8 h-8 animate-spin text-white absolute" />}
          {error ? (
            <div className="text-center px-6">
              <p className="text-error text-sm font-medium">{error}</p>
              <button 
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-surface-container-high hover:bg-surface text-on-surface text-xs font-semibold rounded-lg transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Controls */}
        <div className="p-6 flex justify-center bg-surface-container-lowest">
          <button
            onClick={handleCapture}
            disabled={!!error || loading}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-ambient hover:scale-105 hover:bg-primary-dim active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            title="Ambil Foto"
          >
            <Camera className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
