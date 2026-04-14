"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function PhotoboothApp() {
  const [page, setPage] = useState<'welcome' | 'editor'>('welcome');
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null));
  const [currentFrame, setCurrentFrame] = useState('/frame1.png');
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. หน้า Welcome
  if (page === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="max-w-sm w-full text-center">
          <img 
            src="/welcome.jpg" 
            alt="Welcome" 
            className="w-full h-auto mb-8 mx-auto"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x600?text=welcome.jpg"; }}
          />
          <button 
            onClick={() => setPage('editor')}
            className="text-[#700010] text-2xl font-bold hover:opacity-70 transition-all font-['LineSeedTH']"
          >
            เข้าสู่ photobooth
          </button>
        </div>
      </div>
    );
  }

  // 2. หน้า Photobooth
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentSlot !== null) {
      const url = URL.createObjectURL(file);
      const newImages = [...images];
      newImages[currentSlot] = url;
      setImages(newImages);
      setCurrentSlot(null);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("ไม่สามารถเข้าถึงกล้องได้");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && currentSlot !== null) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const url = canvasRef.current.toDataURL('image/jpeg');
      const newImages = [...images];
      newImages[currentSlot] = url;
      setImages(newImages);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
    setCurrentSlot(null);
  };

  const downloadImage = () => {
    // ฟังก์ชันดาวน์โหลดเบื้องต้น (สามารถพัฒนาต่อยอดด้วย html2canvas ได้)
    alert("กำลังเตรียมไฟล์ JPG สำหรับดาวน์โหลด...");
  };

  const shareToSocial = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white p-4 font-['LineSeedTH'] text-black">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-start justify-center pt-10">
        
        {/* ส่วนแสดงผล Photobooth 4 ช่อง */}
        <div className="relative w-72 h-[450px] bg-white border border-gray-200 shrink-0">
          <div className="grid grid-cols-2 grid-rows-2 gap-1 p-2 h-full">
            {images.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentSlot(i)}
                className={`relative flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer border ${currentSlot === i ? 'border-red-500' : 'border-transparent'}`}
              >
                {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs text-center px-1">กดเพื่อเพิ่มรูป {i+1}</span>}
              </div>
            ))}
          </div>
          {/* กรอบรูป Overlay */}
          <img src={currentFrame} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
        </div>

        {/* ส่วนควบคุม (Control Panel) */}
        <div className="flex-1 w-full space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#700010] mb-4 text-center md:text-left">SELECT FRAME</h2>
            <div className="flex gap-4 justify-center md:justify-start">
              {['/frame1.png', '/frame2.png', '/frame3.png'].map((f, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentFrame(f)}
                  className={`w-16 h-20 border-2 transition-all ${currentFrame === f ? 'border-red-600 scale-105' : 'border-gray-200'}`}
                >
                  <img src={f} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={downloadImage} className="w-full bg-[#700010] text-white py-4 rounded-full font-bold text-lg hover:opacity-90">download</button>
            <button onClick={shareToSocial} className="w-full border-2 border-[#700010] text-[#700010] py-3 rounded-full font-bold hover:bg-red-50">Share to Social Media</button>
            <button onClick={() => setPage('welcome')} className="w-full text-gray-400 text-sm py-2">Back to Home</button>
          </div>
        </div>
      </div>

      {/* Modal สำหรับเลือกวิธีเพิ่มรูป (Upload/Camera) */}
      {currentSlot !== null && !isCameraOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl max-w-xs w-full text-center space-y-4">
            <h3 className="text-xl font-bold">เลือกวิธีเพิ่มรูปที่ {currentSlot + 1}</h3>
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-100 py-3 rounded-xl hover:bg-gray-200">อัพโหลดรูปภาพ</button>
            <button onClick={startCamera} className="w-full bg-gray-100 py-3 rounded-xl hover:bg-gray-200">เปิดกล้องถ่ายรูป</button>
            <button onClick={() => setCurrentSlot(null)} className="w-full text-red-500 font-bold pt-2">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* หน้าจอเปิดกล้อง */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-red-800 active:scale-90 transition-all shadow-lg"></button>
          </div>
          <button onClick={stopCamera} className="mt-8 text-white underline">ปิดกล้อง</button>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}