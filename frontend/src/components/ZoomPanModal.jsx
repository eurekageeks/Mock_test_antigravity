import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';

export default function ZoomPanModal({ imageUrl, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.005;
    setScale(prev => Math.min(Math.max(0.5, prev + scaleAmount), 5));
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-fade-in overflow-hidden">
      
      {/* Controls */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl z-10 shadow-2xl">
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.5))} className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors">
          <ZoomOut size={20} />
        </button>
        <span className="text-white font-mono font-bold text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(5, s + 0.5))} className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors">
          <ZoomIn size={20} />
        </button>
        <div className="w-px h-8 bg-white/20 mx-1"></div>
        <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors" title="Reset">
          <Maximize size={20} />
        </button>
      </div>

      <button onClick={onClose} className="absolute top-6 right-6 p-3 text-white hover:bg-white/20 rounded-xl transition-colors z-10 backdrop-blur-xl border border-white/20 bg-white/10">
        <X size={24} />
      </button>

      {/* Canvas */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <img 
          src={imageUrl} 
          alt="Zoomed Reference" 
          draggable={false}
          className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-100 ease-out shadow-2xl rounded-lg"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            pointerEvents: 'none' // Prevent native image drag
          }} 
        />
      </div>
      
      <div className="absolute bottom-6 text-white/50 text-sm font-medium tracking-wide">
        Scroll to zoom • Click and drag to pan
      </div>
    </div>
  );
}
