import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { CanvasElement, DrawingState } from '../App';
import { CanvasElementComponent } from './CanvasElement';

interface CanvasProps {
  elements: CanvasElement[];
  selectedElements: string[];
  drawingState: DrawingState;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
  onSaveState: () => void;
}

export interface CanvasRef {
  canvas: React.RefObject<HTMLCanvasElement>;
  drawingCanvas: React.RefObject<HTMLCanvasElement>;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(({
  elements,
  selectedElements,
  drawingState,
  onUpdateElement,
  onSelectElement,
  onClearSelection,
  onSaveState
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLineDrawing, setIsLineDrawing] = useState(false);
  const [lineStart, setLineStart] = useState<{x: number, y: number} | null>(null);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  const [linePreview, setLinePreview] = useState<{start: {x: number, y: number}, end: {x: number, y: number}} | null>(null);

  // Expose canvas refs to parent
  useImperativeHandle(ref, () => ({
    canvas: canvasRef,
    drawingCanvas: drawingCanvasRef
  }));

  // Initialize canvas
  useEffect(() => {
    const initCanvas = () => {
      if (!drawingCanvasRef.current) return;
      
      const canvas = drawingCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Set fixed A4 canvas size
      canvas.width = 794;
      canvas.height = 1123;
      
      // Set drawing properties
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    initCanvas();
  }, []);

  // Get touch/mouse position relative to canvas
  const getEventPosition = (e: React.TouchEvent | React.MouseEvent): {x: number, y: number} => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return {x: 0, y: 0};
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // Drawing event handlers
  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawingState.isDrawing) return;
    
    e.preventDefault();
    const pos = getEventPosition(e);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (drawingState.isLineMode) {
      if (!isLineDrawing) {
        setIsLineDrawing(true);
        setLineStart(pos);
        setLinePreview(null);
      } else {
        // Complete the line
        if (lineStart) {
          ctx.beginPath();
          ctx.moveTo(lineStart.x, lineStart.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = drawingState.color;
          ctx.lineWidth = drawingState.brushSize;
          ctx.globalCompositeOperation = drawingState.isErasing ? 'destination-out' : 'source-over';
          ctx.stroke();
          
          setIsLineDrawing(false);
          setLineStart(null);
          setLinePreview(null);
          onSaveState();
        }
      }
    } else {
      setIsDrawing(true);
      setLastPoint(pos);
      
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = drawingState.color;
      ctx.lineWidth = drawingState.brushSize;
      ctx.globalCompositeOperation = drawingState.isErasing ? 'destination-out' : 'source-over';
    }
  };

  const continueDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawingState.isDrawing) return;
    
    e.preventDefault();
    const pos = getEventPosition(e);
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (drawingState.isLineMode && isLineDrawing && lineStart) {
      // Update line preview without affecting the main canvas
      setLinePreview({
        start: lineStart,
        end: pos
      });
    } else if (!drawingState.isLineMode && isDrawing && lastPoint) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPoint(pos);
    }
  };

  const stopDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    // Don't handle stop drawing in line mode (handled in startDrawing)
    if (!drawingState.isDrawing || drawingState.isLineMode) return;
    
    e.preventDefault();
    setIsDrawing(false);
    setLastPoint(null);
    onSaveState();
  };

  // Handle canvas click for clearing selection
  const handleCanvasClick = (e: React.TouchEvent | React.MouseEvent) => {
    // Only clear selection if not in drawing mode and not actively drawing/manipulating
    if (!drawingState.isDrawing && !isDrawing && !isLineDrawing) {
      // Check if the click was on the background (not on an element)
      const target = e.target as HTMLElement;
      if (target === containerRef.current || target.tagName === 'CANVAS') {
        onClearSelection();
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 overflow-auto">
      {/* A4 Canvas Container */}
      <div className="relative bg-white a4-canvas canvas-container">
        <div 
          ref={containerRef}
          className="relative w-full h-full"
          style={{ cursor: drawingState.isDrawing ? 'crosshair' : 'default' }}
          onClick={handleCanvasClick}
        >
          {/* Background Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            width={794}
            height={1123}
          />

          {/* Canvas Elements - Lower Layer */}
          <div 
            className="absolute inset-0" 
            style={{ 
              zIndex: 1,
              pointerEvents: drawingState.isDrawing ? 'none' : 'auto'
            }}
          >
            {elements
              .filter(element => element.visible !== false)
              .map((element) => (
                <CanvasElementComponent
                  key={element.id}
                  element={element}
                  isSelected={selectedElements.includes(element.id)}
                  onUpdate={(updates) => onUpdateElement(element.id, updates)}
                  onSelect={() => onSelectElement(element.id)}
                  onSaveState={onSaveState}
                />
              ))}
          </div>
          
          {/* Drawing Canvas - Top Layer */}
          <canvas
            ref={drawingCanvasRef}
            className="absolute inset-0 w-full h-full"
            width={794}
            height={1123}
            style={{ 
              pointerEvents: drawingState.isDrawing ? 'auto' : 'none',
              zIndex: 10
            }}
            onMouseDown={startDrawing}
            onMouseMove={continueDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={continueDrawing}
            onTouchEnd={stopDrawing}
          />

          {/* Line Preview Layer */}
          {linePreview && drawingState.isLineMode && isLineDrawing && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 15 }}
              width={794}
              height={1123}
            >
              <line
                x1={linePreview.start.x}
                y1={linePreview.start.y}
                x2={linePreview.end.x}
                y2={linePreview.end.y}
                stroke={drawingState.color}
                strokeWidth={drawingState.brushSize}
                strokeLinecap="round"
                strokeOpacity={0.7}
                strokeDasharray="5,5"
              />
            </svg>
          )}

          {/* Line preview indicator */}
          {drawingState.isDrawing && drawingState.isLineMode && isLineDrawing && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm" style={{ zIndex: 20 }}>
              Click to complete line
            </div>
          )}

          {/* Mode Indicator */}
          {drawingState.isDrawing && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm pointer-events-none" style={{ zIndex: 20 }}>
              {drawingState.isFreeDrawing ? '🎨 Free Draw Mode' : '🎨 Drawing Mode'}
            </div>
          )}
          
          {!drawingState.isDrawing && elements.length > 0 && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm pointer-events-none" style={{ zIndex: 20 }}>
              👆 Selection Mode
            </div>
          )}

          {/* Helper text */}
          {elements.length === 0 && !drawingState.isDrawing && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none" style={{ zIndex: 5 }}>
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-lg">Start creating your cubist portrait!</p>
                <p className="text-sm mt-2">Drag face parts from the sidebar or enable draw mode</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});