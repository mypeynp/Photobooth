"use client";
import React, { useState } from 'react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Photobooth Is Back!</h1>
      <p className="mb-8 text-red-200">ถ้าเห็นข้อความนี้กลางจอและพื้นหลังสีแดง แสดงว่าระบบปกติแล้วครับ</p>
      <button 
        onClick={() => alert("ระบบพร้อมทำงาน!")}
        className="bg-white text-red-900 px-8 py-3 rounded-full font-bold shadow-lg"
      >
        เริ่มใช้งาน
      </button>
    </div>
  );
}