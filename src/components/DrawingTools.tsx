import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { 
  Pencil, 
  Eraser, 
  Minus, 
  PenTool, 
  Trash2,
  Palette,
  Settings
} from 'lucide-react';
import { DrawingState } from '../App';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface DrawingToolsProps {
  drawingState: DrawingState;
  onDrawingStateChange: (state: DrawingState) => void;
  onDeleteSelected: () => void;
  onAddSignature: () => void;
  hasSelection: boolean;
}

export function DrawingTools({ 
  drawingState, 
  onDrawingStateChange, 
  onDeleteSelected,
  onAddSignature,
  hasSelection 
}: DrawingToolsProps) {
  const updateDrawingState = (updates: Partial<DrawingState>) => {
    onDrawingStateChange({ ...drawingState, ...updates });
  };

  const colors = [
    { name: 'black', value: 'black', bg: 'bg-black', hover: 'hover:bg-gray-800' },
    { name: 'white', value: 'white', bg: 'bg-white', hover: 'hover:bg-gray-100', border: 'border-gray-300' },
    { name: 'red', value: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-500' },
    { name: 'blue', value: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-500' },
    { name: 'green', value: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-500' },
    { name: 'yellow', value: 'yellow', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', border: 'border-yellow-500' },
    { name: 'purple', value: 'purple', bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'border-purple-500' },
    { name: 'orange', value: 'orange', bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'border-orange-500' },
  ];

  return (
    <div 
      className="bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 flex items-center justify-between gap-4 overflow-x-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Side - Main Tools */}
      <div className="flex items-center gap-2">
        {/* Draw Mode Toggle */}
        <Button
          variant={drawingState.isDrawing ? "default" : "outline"}
          size="sm"
          onClick={() => updateDrawingState({ isDrawing: !drawingState.isDrawing })}
          className="flex items-center gap-2 min-w-fit"
        >
          <Pencil className="h-4 w-4" />
          <span className="hidden sm:inline">Draw</span>
          {drawingState.isDrawing && <Badge variant="secondary" className="ml-1">ON</Badge>}
        </Button>

        {/* Drawing Tools - Only show when drawing is enabled */}
        {drawingState.isDrawing && (
          <>
            <Button
              variant={drawingState.isErasing ? "default" : "outline"}
              size="sm"
              onClick={() => updateDrawingState({ 
                isErasing: !drawingState.isErasing,
                isLineMode: false 
              })}
              className="flex items-center gap-1"
            >
              <Eraser className="h-4 w-4" />
              <span className="hidden sm:inline">Erase</span>
            </Button>

            <Button
              variant={drawingState.isLineMode ? "default" : "outline"}
              size="sm"
              onClick={() => updateDrawingState({ 
                isLineMode: !drawingState.isLineMode,
                isErasing: false 
              })}
              className="flex items-center gap-1"
            >
              <Minus className="h-4 w-4" />
              <span className="hidden sm:inline">Line</span>
            </Button>

            {/* Color Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-300" 
                    style={{ backgroundColor: drawingState.color }}
                  />
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" side="top">
                <div className="space-y-4">
                  <h4 className="font-medium">Drawing Settings</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color) => (
                        <Button
                          key={color.value}
                          variant={drawingState.color === color.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateDrawingState({ color: color.value })}
                          className={`w-8 h-8 p-0 ${color.bg} ${color.hover} ${color.border || ''}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Brush Size: {drawingState.brushSize}px
                    </label>
                    <Slider
                      value={[drawingState.brushSize]}
                      onValueChange={([value]) => updateDrawingState({ brushSize: value })}
                      max={20}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>

      {/* Center - Quick Status */}
      <div className="flex items-center gap-2">
        {drawingState.isDrawing && (
          <div className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
            {drawingState.isFreeDrawing ? 
              (drawingState.isErasing ? 'Free Erasing' : drawingState.isLineMode ? 'Free Line Mode' : 'Free Drawing') :
              (drawingState.isErasing ? 'Erasing' : drawingState.isLineMode ? 'Line Mode' : 'Drawing')
            }
          </div>
        )}
        
        {hasSelection && (
          <Badge variant="outline" className="text-xs">
            Selected
          </Badge>
        )}
      </div>

      {/* Right Side - Action Tools */}
      <div className="flex items-center gap-2">
        {/* Signature Tool */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddSignature}
          className="flex items-center gap-1"
        >
          <PenTool className="h-4 w-4" />
          <span className="hidden sm:inline">Sign</span>
        </Button>

        {/* Delete Selected */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  );
}