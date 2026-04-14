"use client";
import React, { useState, useRef } from 'react';

export default function PhotoboothApp() {
  const [page, setPage] = useState<'welcome' | 'editor'>('welcome');
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null));
  const [currentFrame, setCurrentFrame] = useState('/frame1.png');
  const [currentSlot, setCurrentSlot] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const frames = [
    { id: 1, src: '/frame1.png', label: 'Frame 1' },
    { id: 2, src: '/frame2.png', label: 'Frame 2' },
    { id: 3, src: '/frame3.png', label: 'Frame 3' },
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...images];
        newImages[currentSlot] = event.target?.result as string;
        setImages(newImages);
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
        ctx.drawImage(img, padding + (col * (slotW + padding)), padding + (row * (slotH + padding)), slotW, slotH);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-6 text-center">
        <div className="max-w-md w-full">
          <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white">
            <img 
              src="/welcome.jpg" 
              alt="Welcome" 
              className="w-full h-auto object-cover min-h-[300px]"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x1200?text=Check+welcome.jpg+in+public+folder"; }}
            />
          </div>
          <h1 className="text-4xl font-bold text-pink-600 mb-2">My Photobooth</h1>
          <p className="text-gray-500 mb-10">สร้างความทรงจำดีๆ ด้วยเฟรมสวยๆ ของคุณ</p>
          <button 
            onClick={() => setPage('editor')}
            className="bg-pink-500 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:bg-pink-600 transition-all hover:scale-105 active:scale-95"
          >
            เข้าสู่ Photobooth →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="bg-white p-3 shadow-2xl rounded-sm border border-gray-100">
          <div className="relative w-64 h-[400px] bg-white overflow-hidden">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 p-3 h-full">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => { setCurrentSlot(i); fileInputRef.current?.click(); }}
                  className="relative bg-gray-50 border border-dashed border-gray-300 cursor-pointer flex items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors"
                >
                  {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-400">คลิกเพิ่มรูป {i+1}</span>}
                </div>
              ))}
            </div>
            <img src={currentFrame} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          </div>
        </div>

        <div className="w-full max-w-xs space-y-6">
          <button onClick={() => setPage('welcome')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            ← กลับหน้าหลัก
          </button>
          <div>
            <p className="font-semibold mb-3 text-slate-700">เลือกลายกรอบรูป:</p>
            <div className="grid grid-cols-3 gap-2">
              {frames.map((f) => (
                <button 
                  key={f.id} 
                  onClick={() => setCurrentFrame(f.src)}
                  className={`border-2 p-1 rounded-md transition-all ${currentFrame === f.src ? 'border-pink-500 scale-105 bg-white' : 'border-transparent opacity-60'}`}
                >
                  <img src={f.src} className="w-full h-16 object-contain bg-gray-50" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={saveAsJpg} 
              className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-pink-600 transition-all active:scale-95"
            >
              SAVE AS JPG
            </button>
            <button 
              onClick={() => setImages(Array(4).fill(null))} 
              className="w-full text-xs text-gray-400 py-2 hover:text-red-400 transition-colors"
            >
              ล้างรูปภาพทั้งหมด
            </button>
          </div>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}