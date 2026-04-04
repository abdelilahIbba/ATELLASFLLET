import React, { useRef, useState, useEffect } from 'react';
import { Trash2, PenLine } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  onChange: (dataUrl: string | null) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ label, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const isEmptyRef = useRef(true);
  const [isEmpty, setIsEmpty] = useState(true);
  // Keep latest onChange ref to avoid stale closure in event listener
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const source = 'touches' in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
    return {
      x: (source.clientX - rect.left) * scaleX,
      y: (source.clientY - rect.top) * scaleY,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
    isEmptyRef.current = true;
    setIsEmpty(true);
    onChangeRef.current(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const startDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = getPos(e, canvas);
    };

    const drawLine = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current || !lastPosRef.current) return;
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPosRef.current = pos;
      if (isEmptyRef.current) {
        isEmptyRef.current = false;
        setIsEmpty(false);
      }
    };

    const stopDraw = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      if (!isEmptyRef.current) {
        onChangeRef.current(canvas.toDataURL('image/png'));
      }
    };

    canvas.addEventListener('mousedown', startDraw, { passive: false });
    canvas.addEventListener('mousemove', drawLine, { passive: false });
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', drawLine, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', drawLine);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', drawLine);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, []); // attach once — all mutable state is via refs

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
        {!isEmpty && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Effacer
          </button>
        )}
      </div>
      <div
        className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/20 bg-white"
        style={{ touchAction: 'none' }}
      >
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300">
            <PenLine className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Signer ici</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          className="w-full h-28 cursor-crosshair block"
        />
      </div>
    </div>
  );
};

export default SignaturePad;
