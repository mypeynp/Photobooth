"use client";
import React, { useState, useRef } from 'react';

export default function Photobooth() {
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null));
  const [currentFrame, setCurrentFrame] = useState('/my-frame.png'); // รูปเริ่มต้น
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSlot, setCurrentSlot] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // รายชื่อกรอบรูปที่มีในโฟลเดอร์ public (แก้ชื่อให้ตรงกับไฟล์จริงของคุณ)
  const frames = [
    { id: 1, src: '/frame1.png', label: 'กรอบ 1' },
    { id: 2, src: '/frame2.png', label: 'กรอบ 2' },
    { id: 3, src: '/frame3.png', label: 'กรอบ 3' },
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

  const openUpload = (index: number) => {
    setCurrentSlot(index);
    fileInputRef.current?.click();
  };

  // ฟังก์ชันเซฟรูปเป็น JPG
  const saveAsJpg = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ตั้งค่าขนาด Canvas (สมมติว่า 800x1200 เพื่อความคมชัด)
    canvas.width = 800;
    canvas.height = 1200;

    // 1. วาดพื้นหลังสีขาว
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. วาดรูป 4 ช่อง
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
        const x = padding + (col * (slotW + padding));
        const y = padding + (row * (slotH + padding));

        // วาดรูปแบบ Crop (Object-fit: cover)
        ctx.drawImage(img, x, y, slotW, slotH);
      }
    }

    // 3. วาดกรอบรูปทับด้านบน
    const frameImg = new Image();
    frameImg.src = currentFrame;
    await new Promise((resolve) => { frameImg.onload = resolve; });
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 4. ดาวน์โหลดเป็น JPG
    const link = document.createElement('a');
    link.download = 'photobooth-result.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] p-6 text-slate-800">
      <h1 className="text-2xl font-bold mb-6">✨ Custom Photobooth</h1>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* ส่วนแสดงผล Photobooth */}
        <div className="bg-white p-3 shadow-2xl rounded-sm border border-gray-200">
          <div className="relative w-64 h-[400px] bg-white overflow-hidden">
            {/* Grid 4 ช่อง (2x2) */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2 p-3 h-full">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => openUpload(i)}
                  className="relative bg-gray-50 border border-dashed border-gray-300 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {img ? (
                    <img src={img} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400">Click to add {i+1}</span>
                  )}
                </div>
              ))}
            </div>

            {/* กรอบรูป Overlay */}
            <img src={currentFrame} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
          </div>
        </div>

        {/* ส่วนควบคุม (สลับกรอบ + เซฟ) */}
        <div className="w-full max-w-xs space-y-6">
          <div>
            <p className="font-semibold mb-3">เลือกลายกรอบรูป:</p>
            <div className="grid grid-cols-3 gap-2">
              {frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setCurrentFrame(frame.src)}
                  className={`border-2 p-1 rounded-md transition-all ${currentFrame === frame.src ? 'border-indigo-600 scale-105' : 'border-transparent opacity-60'}`}
                >
                  <img src={frame.src} className="w-full h-16 object-contain bg-gray-100" />
                  <span className="text-[10px] block mt-1 text-center">{frame.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={saveAsJpg}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
            >
              SAVE AS JPG
            </button>
            <button 
              onClick={() => setImages(Array(4).fill(null))}
              className="w-full text-gray-400 text-sm py-2"
            >
              Clear All Photos
            </button>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
      
      {/* Hidden Canvas สำหรับประมวลผลรูปตอนเซฟ */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}