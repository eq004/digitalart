import React from 'react';
import { Button } from './ui/button';
import { Menu, RotateCcw, RotateCw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function MobileHeader({ onMenuClick, onUndo, onRedo, canUndo, canRedo }: MobileHeaderProps) {
  return (
    <div 
      className="bg-white/90 backdrop-blur-md shadow-lg px-4 py-3 flex items-center justify-between"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex justify-center">
        <ImageWithFallback
          src="https://cdn.jsdelivr.net/gh/Ninja4554/Cubist-images@df4b60ae76233bd34630c72408b97508e0359489/cubist-inspired-portraits.png"
          alt="Cubist Inspired Portraits"
          className="h-8 w-auto max-w-[200px] object-contain"
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="text-slate-700 hover:text-slate-900 disabled:text-slate-300 hover:bg-slate-100/80 min-w-[40px] min-h-[40px] p-2"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="text-slate-700 hover:text-slate-900 disabled:text-slate-300 hover:bg-slate-100/80 min-w-[40px] min-h-[40px] p-2"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}