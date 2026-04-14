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
    link.download = 'photobooth-result.