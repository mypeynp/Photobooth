"use client";
import React, { useState, useRef } from 'react';

export default function Photobooth() {
  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSlot, setCurrentSlot] = useState<number>(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...images];
        // ใส่รูปในช่องที่เลือก หรือช่องที่ว่างอยู่
        const targetSlot = currentSlot;
        newImages[targetSlot] = event.target?.result as string;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const openUpload = (index: number) => {
    setCurrentSlot(index);
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f2f5] p-4">
      <div className="bg-white p-4 shadow-2xl rounded-lg">
        {/* พื้นที่รูป 6 ช่อง */}
        <div className="relative w-72 h-[450px] bg-white overflow-hidden">
          
          {/* Grid 6 ช่อง */}
          <div className="grid grid-cols-2 grid-rows-3 gap-1 p-1 h-full">
            {images.map((img, i) => (
              <div 
                key={i} 
                onClick={() => openUpload(i)}
                className="relative bg-gray-100 border border-dashed border-gray-300 overflow-hidden cursor-pointer flex items-center justify-center"
              >
                {img ? (
                  <img src={img} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-gray-400">รูปที่ {i+1}</span>
                )}
              </div>
            ))}
          </div>

          {/* กรอบรูป Overlay - เช็คชื่อไฟล์ให้ตรงกับในเครื่องคุณนะครับ */}
          <img 
            src="/my-frame.png" 
            className="absolute inset-0 w-full h-full pointer-events-none z-10" 
            alt="Frame"
          />
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
      
      <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
        <p className="text-center text-sm text-gray-500 mb-2">💡 คลิกที่ช่องสีเทาเพื่อเลือกรูปใส่แต่ละช่อง</p>
        <button 
          onClick={() => window.print()}
          className="bg-black text-white w-full py-3 rounded-full font-bold"
        >
          SAVE / PRINT
        </button>
        <button 
          onClick={() => setImages(Array(6).fill(null))}
          className="text-gray-500 text-sm"
        >
          ล้างรูปทั้งหมด
        </button>
      </div>
    </div>
  );
}