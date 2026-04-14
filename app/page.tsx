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
    { id: 1, src: '/frame1.png' },
    { id: 2, src: '/frame2.png' },
    { id: 3, src: '/frame3.png' },
  ];

  const filters = [
    { name: 'Original', value: 'none' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Warm', value: 'brightness(1.1) saturate(1.2) sepia(0.2)' },
  ];

  const startCamera = async () => {
    setIsCameraOpen(true);
    setShowUploadOption(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("ไม่สามารถเข้าถึงกล้องได้");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoRef.current.videoWidth;
      tempCanvas.height = videoRef.current.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.filter = filter;
        ctx.drawImage(videoRef.current, 0, 0);
        const newImages = [...images];
        newImages[currentSlot] = tempCanvas.toDataURL('image/jpeg');
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
        await new Promise((res) => { img.onload = res; });
        const col = i % 2;
        const row = Math.floor(i / 2);
        ctx.filter = filter; 
        ctx.drawImage(img, padding + (col * (slotW + padding)), padding + (row * (slotH + padding)), slotW, slotH);
        ctx.filter = 'none';
      }
    }
    const frameImg = new Image();
    frameImg.src = currentFrame;
    await new Promise((res) => { frameImg.onload = res; });
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.download = 'photobooth.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  if (page === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="max-w-md w-full flex flex-col items-center">
          <div className="mb-8 rounded-3xl overflow-hidden border-4 border-gray-100 shadow-2xl">
            <img src="/welcome.jpg" alt="Welcome" className="w-full h-auto" />
          </div>
          <h1 className="text-4xl font-bold text-red-900 mb-2">Photobooth</h1>
          <p className="text-gray-400 mb-8 italic">Capture your moments with style</p>
          <button 
            onClick={() => setPage('editor')}
            className="bg-red-800 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:bg-red-900 active:scale-95 transition-all"
          >
            เข้าสู่ Photobooth →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col md:flex-row gap-8 items-center max-w-4xl w-full">
        {/* Preview Area */}
        <div className="bg-white p-4 shadow-2xl rounded-lg">
          <div className="relative w-64 h-[400px] bg-gray-100 overflow-hidden">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 p-3 h-full">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => { setCurrentSlot(i); setShowUploadOption(true); }}
                  className={`relative flex items-center justify-center border-2 border-dashed ${currentSlot === i ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white'}`}
                >
                  {img ? <img src={img} style={{ filter: filter }} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-400">Slot {i+1}</span>}
                </div>
              ))}
            </div>
            <img src={currentFrame} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex-1 space-y-6 w-full max-w-xs">
          <button onClick={() => setPage('welcome')} className="text-sm text-gray-400 hover:text-red-800">← Back Home</button>
          
          <div>
            <p className="text-xs font-bold text-red-900 uppercase tracking-widest mb-3 border-l-4 border-red-800 pl-2">Filters</p>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button key={f.name} onClick={() => setFilter(f.value)} className={`px-4 py-2 text-xs rounded-full border transition-all ${filter === f.value ? 'bg-red-800 text-white border-red-800' : 'bg-white text-gray-600 border-gray-200'}`}>{f.name}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-red-900 uppercase tracking-widest mb-3 border-l-4 border-red-800 pl-2">Frames</p>
            <div className="grid grid-cols-3 gap-2">
              {frames.map((f) => (
                <button key={f.id} onClick={() => setCurrentFrame(f.src)} className={`p-1 rounded border-2 transition-all ${currentFrame === f.src ? 'border-red-800 scale-105' : 'border-transparent opacity-40'}`}>
                  <img src={f.src} className="w-full h-10 object-contain" />
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveAsJpg} className="w-full bg-red-800 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-red-900 active:scale-95 transition-all">SAVE AS JPG</button>
        </div>
      </div>

      {showUploadOption && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800">เลือกช่องที่ {currentSlot + 1}</h3>
            <button onClick={startCamera} className="w-full py-4 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 transition-colors">📸 ถ่ายภาพ</button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">📂 อัปโหลดรูปภาพ</button>
            <button onClick={() => setShowUploadOption(false)} className="w-full py-2 text-gray-400 text-sm">ปิด</button>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden border-4 border-red-800 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ filter: filter }} />
          </div>
          <div className="mt-10 flex items-center gap-10">
            <button onClick={stopCamera} className="text-white text-lg">ยกเลิก</button>
            <button onClick={takePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-red-800 active:scale-90 transition-all shadow-2xl"></button>
            <div className="w-12"></div>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}