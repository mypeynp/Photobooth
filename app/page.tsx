"use client";
import React, { useState, useRef } from 'react';

export default function Photobooth() {
  const [imgSource, setImgSource] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<string>('border-pink-400');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImgSource(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">📸 My Photobooth</h1>

      {/* พื้นที่แสดงผลรูปภาพและกรอบ */}
      <div className="relative w-72 h-96 bg-white shadow-2xl overflow-hidden border-4 border-white mb-8">
        {imgSource ? (
          <img src={imgSource} className="w-full h-full object-cover" alt="User upload" />
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-200 text-slate-400">
            ยังไม่มีรูปภาพ
          </div>
        )}
        {/* กรอบรูป (Overlay) */}
        <div className={`absolute inset-0 pointer-events-none border-[20px] ${selectedFrame} opacity-90 transition-all`}></div>
      </div>

      {/* เมนูเลือกกรอบรูป */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xs">
        <p className="mb-4 font-semibold text-slate-700 text-center">เลือกสีกรอบรูป</p>
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
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            อัปโหลดรูปภาพ
          </button>
          
          <button 
            onClick={() => window.print()}
            className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            บันทึกรูปภาพ
          </button>
        </div>
      </div>
    </div>
  );
}