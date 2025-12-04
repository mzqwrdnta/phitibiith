import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, X, Plus, Image as ImageIcon, Trash2, Move, ZoomIn, ZoomOut, RotateCw, RotateCcw, Palette, Type, MousePointer2 } from 'lucide-react';
import { Button, IconButton } from './UI';
import { TemplateType, TemplateConfig, Sticker, FilterType } from '../types';
import { generateAiSticker } from '../services/geminiService';

interface EditorProps {
  photos: string[];
  onReset: () => void;
}

// HIGH RESOLUTION TEMPLATES
const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  strip: {
    id: 'strip',
    name: 'Classic',
    width: 600,
    height: 1800,
    defaultBackgroundColor: '#fff0f5', 
    photoSlots: [
      { x: 50, y: 50, w: 500, h: 500 },
      { x: 50, y: 580, w: 500, h: 500 },
      { x: 50, y: 1110, w: 500, h: 500 },
    ]
  },
  y2k: {
    id: 'y2k',
    name: 'Y2K Wave',
    width: 800,
    height: 2000,
    defaultBackgroundColor: '#fdf6e3', // Cream
    photoSlots: [
      { x: 100, y: 120, w: 600, h: 450 },
      { x: 100, y: 620, w: 600, h: 450 },
      { x: 100, y: 1120, w: 600, h: 450 },
    ]
  },
  grid: {
    id: 'grid',
    name: '2x2 Grid',
    width: 1200,
    height: 1600,
    defaultBackgroundColor: '#ffffff',
    photoSlots: [
      { x: 50, y: 50, w: 525, h: 700 },
      { x: 625, y: 50, w: 525, h: 700 },
      { x: 50, y: 800, w: 525, h: 700 },
      { x: 625, y: 800, w: 525, h: 700 },
    ]
  },
  film: {
    id: 'film',
    name: 'Cinema',
    width: 600,
    height: 1800,
    defaultBackgroundColor: '#000000',
    photoSlots: [
      { x: 80, y: 50, w: 440, h: 330 },
      { x: 80, y: 430, w: 440, h: 330 },
      { x: 80, y: 810, w: 440, h: 330 },
      { x: 80, y: 1190, w: 440, h: 330 },
    ]
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    width: 1200,
    height: 1200,
    defaultBackgroundColor: '#1a1a1a',
    photoSlots: [
      { x: 50, y: 50, w: 700, h: 1100 },
      { x: 800, y: 50, w: 350, h: 525 },
      { x: 800, y: 625, w: 350, h: 525 },
    ]
  },
  retro: {
    id: 'retro',
    name: 'Polaroid',
    width: 1200,
    height: 1200,
    defaultBackgroundColor: '#fdf6e3',
    photoSlots: [
      { x: 60, y: 60, w: 510, h: 510, rotate: -2 },
      { x: 630, y: 60, w: 510, h: 510, rotate: 2 },
      { x: 60, y: 630, w: 510, h: 510, rotate: 1 },
      { x: 630, y: 630, w: 510, h: 510, rotate: -1 },
    ]
  },
  wide: {
      id: 'wide',
      name: 'Wide',
      width: 1800,
      height: 600,
      defaultBackgroundColor: '#e0f7fa',
      photoSlots: [
          { x: 50, y: 50, w: 500, h: 500 },
          { x: 600, y: 50, w: 500, h: 500 },
          { x: 1150, y: 50, w: 500, h: 500 },
      ]
  }
};

const FILTERS: { id: FilterType; name: string; css: string }[] = [
    { id: 'normal', name: 'Normal', css: 'none' },
    { id: 'grayscale', name: 'B&W', css: 'grayscale(100%) contrast(1.1)' },
    { id: 'sepia', name: 'Sepia', css: 'sepia(80%) contrast(1.1)' },
    { id: 'vivid', name: 'Vivid', css: 'saturate(1.5) contrast(1.1)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(1.2) brightness(0.9) saturate(0.8)' },
];

const PRESET_STICKERS = [
  // Coquette / Cute
  '🎀', '💖', '🧸', '🌸', '🩰', '🦢', '🍰', '🍓', '🍒', '💌',
  // Y2K / Grunge
  '⛓️', '🧷', '💿', '🦋', '🔥', '👽', '💀', '🩹', '🎸', '🔌',
  // Sparkles
  '✨', '🌟', '💫', '⚡', '🌙', '☁️', '🫧', '💎',
  // Fun
  '😎', '🌈', '🍦', '🍕', '🐶', '🐱', '🦄', '💊', '☮️', '☯️'
];

const BG_COLORS = [
    '#ffffff', '#fff0f5', '#e6e6fa', '#f0f8ff', '#f5f5dc', '#1a1a1a', '#ffb7b2', '#000000', '#fdf6e3'
];

export const Editor: React.FC<EditorProps> = ({ photos, onReset }) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('y2k');
  const [activeFilter, setActiveFilter] = useState<FilterType>('normal');
  const [bgColor, setBgColor] = useState<string>('#fdf6e3');
  const [showDate, setShowDate] = useState(true);
  
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  
  // AI
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStickers, setGeneratedStickers] = useState<string[]>([]);
  
  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentTemplate = TEMPLATES[activeTemplate];

  // Initialize bg color when template changes
  useEffect(() => {
      setBgColor(currentTemplate.defaultBackgroundColor);
      // Add default decor stickers for Y2K template if empty
      if (activeTemplate === 'y2k' && stickers.length === 0) {
          setStickers([
             { id: 'def-1', url: '🧸', x: 150, y: 1750, scale: 2.5, rotation: -15 },
             { id: 'def-2', url: '✨', x: 700, y: 100, scale: 2, rotation: 0 },
             { id: 'def-3', url: '⛓️', x: 100, y: 100, scale: 2, rotation: 45 },
          ]);
      }
  }, [activeTemplate]);

  // --- DRAWING FUNCTIONS ---

  // Procedural Wavy Checkerboard
  const drawWavyCheckerboard = (ctx: CanvasRenderingContext2D, width: number, height: number, color1: string, color2: string) => {
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, width, height);
      
      const tileSize = 80;
      ctx.fillStyle = color2; // Black usually
      
      for (let y = 0; y < height; y += 10) {
          const rowPhase = (y / 150) * Math.PI * 2; // Wavy vertical
          for (let x = 0; x < width; x += tileSize) {
              // Distort X based on sine of Y
              const xOffset = Math.sin(y * 0.01) * 30;
              
              // Simple checker logic
              const colIndex = Math.floor(x / tileSize);
              const rowIndex = Math.floor(y / tileSize);
              
              // Draw warped rects is hard, let's draw strips
          }
      }

      // Simpler approach: Standard warped checkerboard
      // We will draw many small rects
      const cols = Math.ceil(width / tileSize) + 2;
      const rows = Math.ceil(height / tileSize);

      for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
              if ((r + c) % 2 === 1) {
                  const x = c * tileSize - 50;
                  const y = r * tileSize;
                  
                  // Wavy distortion
                  const wave = Math.sin(y * 0.005) * 60; // Amplitude 60
                  
                  ctx.beginPath();
                  // Top left
                  ctx.moveTo(x + wave, y);
                  // Top right
                  ctx.lineTo(x + tileSize + wave, y);
                  // Bottom right (wave shifts slightly)
                  const waveBottom = Math.sin((y + tileSize) * 0.005) * 60;
                  ctx.lineTo(x + tileSize + waveBottom, y + tileSize);
                  // Bottom left
                  ctx.lineTo(x + waveBottom, y + tileSize);
                  ctx.fill();
              }
          }
      }
  };

  const drawFilmStripHoles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "#ffffff";
      const holeW = 30;
      const holeH = 20;
      const gap = 30;
      
      // Left side holes
      for (let y = 20; y < height; y += (holeH + gap)) {
          ctx.fillRect(15, y, holeW, holeH);
          ctx.fillRect(width - 15 - holeW, y, holeW, holeH);
      }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set Dimensions
    canvas.width = currentTemplate.width;
    canvas.height = currentTemplate.height;

    // --- Background ---
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (activeTemplate === 'y2k') {
        // Draw Wavy Checkers (Cream & Black)
        drawWavyCheckerboard(ctx, canvas.width, canvas.height, bgColor, '#000000');
    } else if (activeTemplate === 'film') {
        // Draw Film Holes
        drawFilmStripHoles(ctx, canvas.width, canvas.height);
    }

    // --- Photos ---
    const filter = FILTERS.find(f => f.id === activeFilter);
    ctx.filter = filter ? filter.css : 'none';

    const slots = currentTemplate.photoSlots;
    photos.forEach((photoUrl, index) => {
      if (index >= slots.length) return;
      
      const slot = slots[index];
      const img = new Image();
      img.src = photoUrl;
      
      if (img.complete) {
          drawPhotoInSlot(ctx, img, slot);
      } else {
          img.onload = () => drawPhotoInSlot(ctx, img, slot);
      }
    });

    // --- Reset Filter ---
    ctx.filter = 'none';

    // --- Date Stamp ---
    if (showDate) {
        ctx.font = activeTemplate === 'y2k' ? "bold 30px 'Courier New', monospace" : "bold 30px 'Courier New', monospace";
        ctx.fillStyle = (activeTemplate === 'modern' || activeTemplate === 'film' || activeTemplate === 'y2k') ? '#ffffff' : '#ff69b4';
        
        // Shadow for readability
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;

        ctx.textAlign = "right";
        const dateStr = new Date().toLocaleDateString();
        // Position tweak for film
        const dx = activeTemplate === 'film' ? canvas.width - 60 : canvas.width - 40;
        const dy = activeTemplate === 'film' ? canvas.height - 40 : canvas.height - 30;
        
        ctx.fillText(dateStr, dx, dy);
        ctx.shadowColor = "transparent";
    }

    // --- Stickers ---
    stickers.forEach(sticker => {
        ctx.save();
        ctx.translate(sticker.x, sticker.y);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.scale(sticker.scale, sticker.scale);
        
        // Selection Halo
        if (sticker.id === selectedStickerId) {
             ctx.strokeStyle = '#3b82f6';
             ctx.lineWidth = 4 / sticker.scale;
             ctx.setLineDash([10, 5]);
             ctx.beginPath();
             // Adjust circle size based on content approximate size
             ctx.arc(0, 0, 60, 0, 2 * Math.PI);
             ctx.stroke();
             
             // Draw handle indicator
             ctx.fillStyle = '#3b82f6';
             ctx.beginPath();
             ctx.arc(0, 60, 10 / sticker.scale, 0, 2 * Math.PI);
             ctx.fill();
        }

        if (sticker.url.startsWith('data:') || sticker.url.startsWith('http')) {
             const sImg = new Image();
             sImg.src = sticker.url;
             if (sImg.complete) {
                 ctx.drawImage(sImg, -50, -50, 100, 100); 
             }
        } else {
            // Emoji
            ctx.font = "80px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Shadow for stickers to pop
            ctx.shadowColor = "rgba(0,0,0,0.2)";
            ctx.shadowBlur = 10;
            ctx.fillText(sticker.url, 0, 0);
        }
        ctx.restore();
    });

    // --- Branding ---
    if (activeTemplate === 'strip') {
        ctx.font = "bold 40px Quicksand, sans-serif";
        ctx.fillStyle = "#ff69b4";
        ctx.textAlign = "center";
        ctx.fillText("KawaiiBooth AI ✨", canvas.width / 2, canvas.height - 80);
    }
  };

  const drawPhotoInSlot = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, slot: any) => {
      ctx.save();
      
      if (slot.rotate) {
          const cx = slot.x + slot.w / 2;
          const cy = slot.y + slot.h / 2;
          ctx.translate(cx, cy);
          ctx.rotate((slot.rotate * Math.PI) / 180);
          ctx.translate(-cx, -cy);
      }

      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.fillStyle = "white";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      ctx.shadowColor = "transparent";

      const padding = activeTemplate === 'y2k' ? 15 : 20;
      const ix = slot.x + padding;
      const iy = slot.y + padding;
      const iw = slot.w - (padding * 2);
      const ih = slot.h - (padding * 2); 
      
      ctx.beginPath();
      // For Polaroid/Retro, bottom padding is larger, we simulate crop
      const bottomCrop = slot.rotate ? 80 : 0;
      ctx.rect(ix, iy, iw, ih - bottomCrop);
      ctx.clip();

      const ratio = Math.max(iw / img.width, (ih) / img.height);
      const centerShift_x = (img.width * ratio - iw) / 2;
      const centerShift_y = (img.height * ratio - ih) / 2;

      ctx.drawImage(img, 
        0, 0, img.width, img.height,
        ix - centerShift_x, iy - centerShift_y, img.width * ratio, img.height * ratio
      );
      
      ctx.restore();
  };

  useEffect(() => {
    // Render loop to ensure images load
    let animId: number;
    const loop = () => {
        renderCanvas();
        animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [activeTemplate, stickers, photos, activeFilter, bgColor, selectedStickerId, showDate]);


  // --- INTERACTION HANDLERS (Drag & Drop) ---

  const getCanvasCoordinates = (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
      };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      
      // Check collision (reverse order)
      let clickedId = null;
      for (let i = stickers.length - 1; i >= 0; i--) {
          const s = stickers[i];
          // Hitbox approx (scale * 50)
          const radius = 50 * s.scale; 
          const dist = Math.sqrt(Math.pow(x - s.x, 2) + Math.pow(y - s.y, 2));
          if (dist < radius) {
              clickedId = s.id;
              break;
          }
      }

      if (clickedId) {
          setSelectedStickerId(clickedId);
          setIsDragging(true);
          const s = stickers.find(st => st.id === clickedId);
          if (s) {
              setDragOffset({ x: x - s.x, y: y - s.y });
          }
          // Prevent scrolling on touch
          e.currentTarget.setPointerCapture(e.pointerId);
      } else {
          setSelectedStickerId(null);
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging || !selectedStickerId) return;
      
      const { x, y } = getCanvasCoordinates(e);
      
      setStickers(prev => prev.map(s => {
          if (s.id === selectedStickerId) {
              return { ...s, x: x - dragOffset.x, y: y - dragOffset.y };
          }
          return s;
      }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // --- ACTIONS ---

  const handleAddSticker = (content: string, isAi: boolean = false) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      url: content,
      x: currentTemplate.width / 2,
      y: currentTemplate.height / 2,
      scale: 2.0, // Bigger default for high res
      rotation: (Math.random() - 0.5) * 30, // Random tilt
      isAiGenerated: isAi
    };
    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
      setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleGenerateAiSticker = async () => {
      if (!aiPrompt.trim()) return;
      setIsGenerating(true);
      try {
          const stickerData = await generateAiSticker(aiPrompt);
          setGeneratedStickers(prev => [stickerData, ...prev]);
          handleAddSticker(stickerData, true);
          setAiPrompt('');
      } catch (e) {
          alert('Failed to generate sticker. Try again!');
      } finally {
          setIsGenerating(false);
      }
  };

  const handleDownload = () => {
    setSelectedStickerId(null);
    // Wait for state to clear selection before render
    setTimeout(() => {
        renderCanvas();
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `kawaiibooth-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        }
    }, 100);
  };

  const deleteSelectedSticker = () => {
      if (selectedStickerId) {
          setStickers(prev => prev.filter(s => s.id !== selectedStickerId));
          setSelectedStickerId(null);
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1600px] mx-auto p-2 md:p-4 h-[calc(100vh-100px)]">
      
      {/* LEFT: Preview */}
      <div className="flex-1 flex flex-col items-center bg-gray-100 p-4 rounded-3xl shadow-inner overflow-hidden relative group">
         <div className="flex justify-between w-full max-w-lg mb-2 items-center z-10">
            <h2 className="text-xl font-bold text-gray-700 flex gap-2 items-center">
                <MousePointer2 size={16} /> Drag stickers to move
            </h2>
            <div className="text-xs text-gray-400 font-mono">
                {currentTemplate.width}x{currentTemplate.height}px
            </div>
         </div>
         
         <div className="relative shadow-2xl h-full w-full flex items-center justify-center">
             <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-full object-contain border-4 border-white rounded-sm bg-white cursor-move touch-none shadow-xl"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
             />
         </div>
      </div>

      {/* RIGHT: Tools */}
      <div className="lg:w-[420px] bg-white p-5 rounded-3xl shadow-xl flex flex-col gap-5 overflow-y-auto h-full max-h-[40vh] lg:max-h-full">
        
        {/* Template Selector */}
        <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ImageIcon size={14}/> Layout
            </h3>
            <div className="grid grid-cols-4 gap-2">
                {(Object.keys(TEMPLATES) as TemplateType[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTemplate(t)}
                        className={`py-2 px-1 text-[10px] md:text-xs rounded-lg border-2 font-bold transition-all ${
                            activeTemplate === t 
                            ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' 
                            : 'border-gray-100 text-gray-500 hover:border-pink-200'
                        }`}
                    >
                        {TEMPLATES[t].name}
                    </button>
                ))}
            </div>
        </section>

        {/* Sticker Controls (Contextual) */}
       {selectedStickerId && (
    <section className="
        /* --- Tampilan Mobile (HP) --- */
        fixed bottom-24 left-4 right-4 z-50 
        bg-white/95 backdrop-blur-md 
        shadow-[0_0_20px_rgba(59,130,246,0.3)] 
        border-2 border-blue-400
        
        /* --- Tampilan Desktop (Laptop) --- */
        lg:static lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto
        lg:bg-blue-50 lg:border lg:border-blue-100 lg:shadow-sm
        
        /* --- Umum --- */
        p-3 rounded-2xl animate-in slide-in-from-bottom duration-300
    ">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
                {/* Icon Edit biar jelas */}
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Edit Sticker
            </h3>
            <div className="flex gap-2">
                {/* Tombol Hapus diberi warna merah muda biar warning tapi cute */}
                <IconButton 
                    size="sm" 
                    icon={<Trash2 size={16}/>} 
                    variant="danger" 
                    onClick={deleteSelectedSticker} 
                />
                
                {/* Tombol Close */}
                <button 
                    onClick={() => setSelectedStickerId(null)} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                    <X size={16}/>
                </button>
            </div>
        </div>

        {/* Baris Kontrol: Zoom & Rotate */}
        <div className="flex justify-between gap-3">
            {/* Group Zoom */}
            <div className="flex flex-1 justify-center items-center gap-3 bg-blue-50/80 lg:bg-white rounded-xl p-2 border border-blue-100">
                    <IconButton 
                        size="sm" 
                        icon={<ZoomOut size={18}/>} 
                        onClick={() => updateSticker(selectedStickerId, { scale: stickers.find(s=>s.id===selectedStickerId)!.scale * 0.9 })} 
                    />
                    <span className="text-[10px] text-blue-400 font-mono">SIZE</span>
                    <IconButton 
                        size="sm" 
                        icon={<ZoomIn size={18}/>} 
                        onClick={() => updateSticker(selectedStickerId, { scale: stickers.find(s=>s.id===selectedStickerId)!.scale * 1.1 })} 
                    />
            </div>

            {/* Group Rotate */}
            <div className="flex flex-1 justify-center items-center gap-3 bg-blue-50/80 lg:bg-white rounded-xl p-2 border border-blue-100">
                    <IconButton 
                        size="sm" 
                        icon={<RotateCcw size={18}/>} 
                        onClick={() => updateSticker(selectedStickerId, { rotation: stickers.find(s=>s.id===selectedStickerId)!.rotation - 15 })} 
                    />
                    <span className="text-[10px] text-blue-400 font-mono">ROT</span>
                    <IconButton 
                        size="sm" 
                        icon={<RotateCw size={18}/>} 
                        onClick={() => updateSticker(selectedStickerId, { rotation: stickers.find(s=>s.id===selectedStickerId)!.rotation + 15 })} 
                    />
            </div>
        </div>
    </section>
)}

        {/* Stickers */}
        <section className="flex-1 min-h-0 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles size={14}/> Add Stickers
            </h3>
            
            <div className="grid grid-cols-5 gap-2 bg-gray-50 p-3 rounded-xl overflow-y-auto flex-1 content-start scrollbar-thin">
                {PRESET_STICKERS.map(emoji => (
                    <button 
                        key={emoji}
                        onClick={() => handleAddSticker(emoji)}
                        className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-white rounded-lg active:scale-95"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </section>

        {/* AI & Filters (Compact) */}
        <section className="space-y-3">
             <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="AI Sticker (e.g. pink bow)"
                    className="flex-1 bg-white px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiSticker()}
                />
                <Button 
                    onClick={handleGenerateAiSticker} 
                    isLoading={isGenerating}
                    disabled={!aiPrompt}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                    Generate
                </Button>
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
                 {FILTERS.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                            activeFilter === f.id ? 'bg-black text-white' : 'bg-white text-gray-500'
                        }`}
                    >
                        {f.name}
                    </button>
                ))}
                 <button 
                    onClick={() => setShowDate(!showDate)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${showDate ? 'bg-pink-100 text-pink-600 border-pink-200' : 'bg-gray-50'}`}
                 >
                    Date
                 </button>
            </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
            <Button onClick={onReset} variant="secondary" className="flex-1">
                New
            </Button>
            <Button onClick={handleDownload} className="flex-[2] shadow-lg shadow-pink-200" icon={<Download size={18}/>}>
                Download
            </Button>
        </div>

      </div>
    </div>
  );
};