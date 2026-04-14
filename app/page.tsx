"use client";
import React, { useState, useRef } from 'react';

export default function PhotoboothApp() {
  const [page, setPage] = useState<'welcome' | 'editor'>('welcome');
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null));
  const [currentFrame, setCurrentFrame] = useState('/frame1.png');
  const [currentSlot, setCurrentSlot] = useState<number>(0);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [filter, setFilter] = useState('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const frames = [
    { id: 1, src: '/frame1.png', label: 'Frame 1' },
    { id: 2, src: '/frame2.png', label: 'Frame 2' },
    { id: 3, src: '/frame3.png', label: 'Frame 3' },
  ];

  const filters = [
    { name: 'Original', value: 'none' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(80%)' },
    { name: 'Warm', value: 'brightness(1.1) saturate(1.2) sepia(0.2)' },
    { name: 'Cool', value: 'contrast(1.1) brightness(1.1) hue-rotate(180deg)' },
  ];

  const startCamera = async () => {
    setIsCameraOpen(true);
    setShowUploadOption(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตสิทธิ์");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.filter = filter;
        ctx.drawImage(video, 0, 0);
        const data = tempCanvas.toDataURL('image/jpeg');
        const newImages = [...images];
        newImages[currentSlot] = data;
        setImages(newImages);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...images];
        newImages[currentSlot] = event.target?.result as string;
        setImages(newImages);
        setShowUploadOption(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAsJpg = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1200;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = 20;
    const slotW = (canvas.width - (padding * 3)) / 2;
    const slotH = (canvas.height - (padding * 3)) / 2;

    for (let i = 0; i < 4; i++) {
      if (images[i]) {
        const img = new Image();
        img.src = images[i]!;
        await new Promise((resolve) => { img.onload = resolve; });
        
        const col = i % 2;
        const row = Math.floor(i / 2);
        const destX = padding + (col * (slotW + padding));
        const destY = padding + (row * (slotH + padding));

        const imgRatio = img.width / img.height;
        const slotRatio = slotW / slotH;
        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

        if (imgRatio > slotRatio) {
          srcW = img.height * slotRatio;
          srcX = (img.width - srcW) / 2;
        } else {
          srcH = img.width / slotRatio;
          srcY = (img.height - srcH) / 2;
        }

        ctx.filter = filter; 
        ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, slotW, slotH);
        ctx.filter = 'none'; 
      }
    }

    const frameImg = new Image();
    frameImg.src = currentFrame;
    await new Promise((resolve) => { frameImg.onload = resolve; });
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    const link = document.createElement('a');
    link.download = 'photobooth-result.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  if (page === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="max-w-md w-full">
          <div className="mb-8 rounded-3xl overflow-hidden border-8 border-white bg-white shadow-xl">
            <img 
              src="/welcome.jpg" 
              alt="Welcome" 
              className="w-full h-auto object-cover min-h-[300px]"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x1200?text=welcome.jpg"; }}
            />
          </div>
          {/* แก้เป็นสีแดงเข้ม */}
          <h1 className="text-4xl font-bold text-red-800 mb-2">Photobooth</h1>
          <p className="text-gray-500 mb-10 italic">Capture your moments with style</p>
          <button 
            onClick={() => setPage('editor')}
            className="bg-red-800 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:bg-red-900 transition-all active:scale-95"
          >
            เข้าสู่ Photobooth →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start max-w-5xl">
        <div className="bg-white p-3 shadow-2xl rounded-sm border border-gray-100">
          <div className="relative w-64 h-[400px] bg-white overflow-hidden">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 p-3 h-full">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => { setCurrentSlot(i); setShowUploadOption(true); }}
                  className={`relative bg-gray-50 border border-dashed cursor-pointer flex items-center justify-center overflow-hidden ${currentSlot === i ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                >
                  {img ? (
                    <img 
                      src={img} 
                      style={{ filter: filter }} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-mono">Slot {i+1}</span>
                  )}
                </div>
              ))}
            </div>
            <img src={currentFrame} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          </div>
        </div>

        <div className="w-full max-w-xs space-y-6">
          <button onClick={() => setPage('welcome')} className="text-sm text-gray-400 hover:text-red-700 font-mono transition-colors">← Home</button>
          
          <div>
            <p className="font-semibold mb-3 text-slate-700 font-mono text-sm border-l-4 border-red-700 pl-2">SELECT FILTER:</p>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button 
                  key={f.name}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${filter === f.value ? 'bg-red-700 text-white border-red-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold mb-3 text-slate-700 font-mono text-sm border-l-4 border-red-700 pl-2">SELECT FRAME:</p>
            <div className="grid grid-cols-3 gap-2">
              {frames.map((f) => (
                <button key={f.id} onClick={() => setCurrentFrame(f.src)} className={`border-2 p-1 rounded-md transition-all ${currentFrame === f.src ? 'border-red-700 scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                  <img src={f.src} className="w-full h-12 object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* ปุ่ม SAVE เป็นสีแดงเข้ม */}
          <button onClick={saveAsJpg} className="w-full bg-red-800 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-red-900 transition-all active:scale-95 font-mono">SAVE AS JPG</button>
        </div>
      </div>

      {showUploadOption && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800">ช่องที่ {currentSlot + 1}</h3>
            <button onClick={startCamera} className="w-full py-4 bg-red-700 text-white rounded-xl font-bold hover:bg-red-800 transition-colors shadow-md">📸 ถ่ายภาพ</button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors">📂 เลือกจากเครื่อง</button>
            <button onClick={() => setShowUploadOption(false)} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600">ยกเลิก</button>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg aspect-video bg-gray-900 rounded-2xl overflow-hidden border-4 border-red-700 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ filter: filter }} />
            <div className="absolute top-4 right-4 bg-red-700 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">LIVE</div>
          </div>
          <div className="mt-8 flex items-center gap-8">
            <button onClick={stopCamera} className="text-white hover:text-red-400 transition-colors">Cancel</button>
            <button onClick={takePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-red-700 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"></button>
            <div className="w-12"></div>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}