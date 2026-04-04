"use client";

import React, { useState, useRef } from 'react';

export default function Photobooth() {
  // สร้าง State เก็บรูปภาพ 6 ช่อง (เริ่มต้นเป็น null ทั้งหมด)
  const [images, setImages] = useState<(string | null)[]>(Array(6).fill(null));
  const [selectedFrame, setSelectedFrame] = useState('border-pink-400');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentSlot !== null) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...images];
        newImages[currentSlot] = event.target?.result as string;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (index: number) => {
    setCurrentSlot(index);
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">📸 My 6-Slot Photobooth</h1>

      {/* พื้นที่แสดงผลรูปภาพและกรอบ */}
      <div className="relative w-80 h-[480px] bg-white shadow-2xl overflow-hidden border-4 border-white mb-8">
        
        {/* Grid สำหรับ 6 รูป (2 คอลัมน์ 3 แถว) */}
        <div className="grid grid-cols-2 grid-rows-3 gap-2 p-2 h-full">
          {images.map((img, index) => (
            <div 
              key={index}
              onClick={() => triggerUpload(index)}
              className="relative bg-slate-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {img ? (
                <img src={img} className="w-full h-full object-cover" alt={`Slot ${index + 1}`} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  คลิกเพื่อใส่รูป {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* กรอบรูป (Overlay) - ใช้ไฟล์ my-frame.png ของคุณ */}
        <img 
          src="/my-frame.png" 
          className="absolute inset-0 w-full h-full pointer-events-none z-10" 
          alt="Frame"
        />
      </div>

      {/* Input ไฟล์ (ซ่อนไว้) */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleUpload} 
      />

      {/* เมนูเลือกสีกรอบ (ถ้าต้องการใช้ร่วมกับ Border) */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xs mb-4">
        <p className="mb-4 font-semibold text-slate-700 text-center">เลือกโทนสีกรอบ</p>
        <div className="flex justify-center gap-4 mb-8">
          {['border-pink-400', 'border-blue-400', 'border-yellow-400', 'border-slate-800'].map((color) => (
            <button
              key={color}
              onClick={() => setSelectedFrame(color)}
              className={`w-10 h-10 rounded-full ${color.replace('border', 'bg')} border-2 border-white shadow-sm hover:scale-110 transition-transform`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.print()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            บันทึก/พิมพ์รูปภาพ
          </button>
          <button 
            onClick={() => setImages(Array(6).fill(null))}
            className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            ล้างรูปทั้งหมด
          </button>
        </div>
      </div>