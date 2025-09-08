import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CanvasElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onSelect: () => void;
  onSaveState: () => void;
}

export function CanvasElementComponent({ 
  element, 
  isSelected, 
  onUpdate, 
  onSelect,
  onSaveState 
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number, elementX: number, elementY: number} | null>(null);
  const [resizeStart, setResizeStart] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [rotateStart, setRotateStart] = useState<{angle: number, rotation: number} | null>(null);
  
  const elementRef = useRef<HTMLDivElement>(null);

  // Get touch/mouse position
  const getEventPosition = (e: React.TouchEvent | React.MouseEvent): {x: number, y: number} => {
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  };

  // Calculate angle between two points
  const getAngle = (centerX: number, centerY: number, pointX: number, pointY: number): number => {
    return Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI);
  };

  // Handle drag start
  const handlePointerDown = (e: React.TouchEvent | React.MouseEvent, action: 'drag' | 'resize' | 'rotate') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSelected) {
      onSelect();
    }

    const pos = getEventPosition(e);

    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: pos.x,
        y: pos.y,
        elementX: element.x,
        elementY: element.y
      });
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeStart({
        x: pos.x,
        y: pos.y,
        width: element.width,
        height: element.height
      });
    } else if (action === 'rotate') {
      setIsRotating(true);
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngle = getAngle(centerX, centerY, pos.x, pos.y);
        setRotateStart({
          angle: currentAngle,
          rotation: element.rotation
        });
      }
    }
  };

  // Handle pointer move
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const pos = 'touches' in e 
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };

      if (isDragging && dragStart) {
        const deltaX = pos.x - dragStart.x;
        const deltaY = pos.y - dragStart.y;
        
        // Constrain to A4 canvas bounds (794 x 1123)
        const newX = Math.max(0, Math.min(794 - element.width, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(1123 - element.height, dragStart.elementY + deltaY));
        
        onUpdate({
          x: newX,
          y: newY
        });
      } else if (isResizing && resizeStart) {
        const deltaX = pos.x - resizeStart.x;
        const deltaY = pos.y - resizeStart.y;
        
        onUpdate({
          width: Math.max(20, resizeStart.width + deltaX),
          height: Math.max(20, resizeStart.height + deltaY)
        });
      } else if (isRotating && rotateStart) {
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const currentAngle = getAngle(centerX, centerY, pos.x, pos.y);
          const deltaAngle = currentAngle - rotateStart.angle;
          
          onUpdate({
            rotation: rotateStart.rotation + deltaAngle
          });
        }
      }
    };

    const handlePointerUp = () => {
      if (isDragging || isResizing || isRotating) {
        onSaveState();
      }
      
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setDragStart(null);
      setResizeStart(null);
      setRotateStart(null);
    };

    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('mouseup', handlePointerUp);
      document.addEventListener('touchmove', handlePointerMove, { passive: false });
      document.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, isResizing, isRotating, dragStart, resizeStart, rotateStart]);

  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        border: isSelected ? '2px dashed #3b82f6' : '2px solid transparent',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={(e) => handlePointerDown(e, 'drag')}
      onTouchStart={(e) => handlePointerDown(e, 'drag')}
      onClick={(e) => {
        e.stopPropagation();
        if (!isSelected) {
          onSelect();
        }
      }}
    >
      {/* Element Content */}
      <div className="w-full h-full bg-transparent rounded-lg flex items-center justify-center overflow-hidden">
        {element.type === 'signature' ? (
          <div className="w-full h-full flex items-center justify-center">
            <span 
              className="text-black font-bold"
              style={{ 
                fontSize: `${Math.min(element.width / 8, element.height / 2)}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {element.src || 'Signature'}
            </span>
          </div>
        ) : (
          <ImageWithFallback
            src={element.src}
            alt={`${element.type} ${element.index}`}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Selection Handles */}
      {isSelected && (
        <>
          {/* Resize Handle */}
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full cursor-nw-resize flex items-center justify-center shadow-lg"
            onMouseDown={(e) => handlePointerDown(e, 'resize')}
            onTouchStart={(e) => handlePointerDown(e, 'resize')}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>

          {/* Rotate Handle */}
          <div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full cursor-grab flex items-center justify-center shadow-lg"
            onMouseDown={(e) => handlePointerDown(e, 'rotate')}
            onTouchStart={(e) => handlePointerDown(e, 'rotate')}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>

          {/* Selection Indicator */}
          <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {element.type} {element.index}
          </div>
        </>
      )}
    </div>
  );
}