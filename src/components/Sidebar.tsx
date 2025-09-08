import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  X, 
  ChevronDown, 
  ChevronRight, 
  Pencil, 
  Eraser, 
  Minus,
  Camera,
  Save,
  PenTool,
  Layers
} from 'lucide-react';
import { DrawingState, CanvasElement } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LayersPanel } from './LayersPanel';

interface SidebarProps {
  onAddElement: (type: string, index: number) => void;
  onClose: () => void;
  drawingState: DrawingState;
  onDrawingStateChange: (state: DrawingState) => void;
  onSave: () => void;
  onImageUpload: (file: File) => void;
  onAddSignature: () => void;
  elements: CanvasElement[];
  selectedElements: string[];
  onSelectElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onToggleElementVisibility: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

interface FacePartCategory {
  name: string;
  type: string;
  count: number;
  icon: string;
}

const categories: FacePartCategory[] = [
  { name: 'Head Shapes', type: 'head', count: 8, icon: '👤' },
  { name: 'Eyes', type: 'eyes', count: 15, icon: '👁️' },
  { name: 'Noses', type: 'noses', count: 11, icon: '👃' },
  { name: 'Mouths', type: 'mouths', count: 11, icon: '👄' },
  { name: 'Ears', type: 'ears', count: 11, icon: '👂' },
  { name: 'Misc', type: 'misc', count: 11, icon: '✨' },
];

export function Sidebar({ 
  onAddElement, 
  onClose, 
  drawingState, 
  onDrawingStateChange,
  onSave,
  onImageUpload,
  onAddSignature,
  elements,
  selectedElements,
  onSelectElement,
  onDeleteElement,
  onToggleElementVisibility,
  onMoveLayer
}: SidebarProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(['head']);

  const toggleCategory = (type: string) => {
    setOpenCategories(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getTypePrefix = (type: string): string => {
    switch(type.toLowerCase()) {
      case 'head': return 'headShapes';
      case 'eyes': return 'Eyes';
      case 'ears': return 'Ears';
      case 'noses': return 'noses';
      case 'mouths': return 'mouths';
      case 'misc': return 'misc';
      default: return type;
    }
  };

  const updateDrawingState = (updates: Partial<DrawingState>) => {
    onDrawingStateChange({ ...drawingState, ...updates });
  };

  return (
    <div 
      className="h-full bg-white/95 backdrop-blur-md shadow-xl overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Cubist Tools</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="md:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col p-4">
        {/* Complete Drawing Tools Section */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Pencil className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Drawing Tools</span>
            </div>

            {/* Main Draw Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="draw-mode" 
                checked={drawingState.isDrawing}
                onCheckedChange={(checked) => updateDrawingState({ 
                  isDrawing: checked,
                  isFreeDrawing: checked // Auto-enable free drawing when drawing is enabled
                })}
              />
              <Label htmlFor="draw-mode">Enable Drawing</Label>
            </div>

            {/* Free Draw Mode */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="free-draw" 
                  checked={drawingState.isFreeDrawing}
                  onCheckedChange={(checked) => updateDrawingState({ 
                    isFreeDrawing: checked,
                    isErasing: false,
                    isLineMode: false 
                  })}
                />
                <Label htmlFor="free-draw">Free Draw Mode</Label>
              </div>

              {/* Free Draw Tools Panel */}
              {drawingState.isFreeDrawing && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg space-y-3 border border-blue-200">
                  {/* Eraser - Prominently at top */}
                  <Button
                    variant={drawingState.isErasing ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateDrawingState({ 
                      isErasing: !drawingState.isErasing,
                      isLineMode: false 
                    })}
                    className="w-full flex items-center gap-2 h-auto py-3"
                  >
                    <Eraser className="h-5 w-5" />
                    <span>{drawingState.isErasing ? 'Stop Erasing' : 'Erase'}</span>
                  </Button>
                  
                  {/* Drawing Style Toggle */}
                  <Button
                    variant={drawingState.isLineMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateDrawingState({ 
                      isLineMode: !drawingState.isLineMode,
                      isErasing: false 
                    })}
                    className="w-full flex items-center gap-2 h-auto py-2"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="text-sm">{drawingState.isLineMode ? 'Switch to Free Draw' : 'Switch to Line Mode'}</span>
                  </Button>

                  {/* Color Palette */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Color Palette</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'orange'].map((color) => (
                        <Button
                          key={color}
                          variant={drawingState.color === color ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateDrawingState({ color })}
                          className={`w-10 h-10 p-0 rounded-full transition-all ${
                            drawingState.color === color ? 'ring-2 ring-primary ring-offset-2' : ''
                          } ${
                            color === 'black' ? 'bg-black hover:bg-gray-800' :
                            color === 'white' ? 'bg-white hover:bg-gray-100 border-gray-300' :
                            color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                            color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                            color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                            color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                            color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                            'bg-orange-500 hover:bg-orange-600'
                          }`}
                          title={color.charAt(0).toUpperCase() + color.slice(1)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Brush Size Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Brush Size</Label>
                      <Badge variant="secondary" className="text-xs">
                        {drawingState.brushSize}px
                      </Badge>
                    </div>
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
              )}
            </div>

            {/* Signature Tool */}
            <div className="pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
                onClick={onAddSignature}
              >
                <PenTool className="h-4 w-4" />
                <span>Add Signature</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="elements" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="elements" className="flex items-center gap-2">
              <span>🎭</span>
              <span>Elements</span>
            </TabsTrigger>
            <TabsTrigger value="layers" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Layers</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="elements" className="flex-1 mt-4">
            {/* Face Parts Categories with ScrollArea */}
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {categories.map((category) => (
                  <Collapsible
                    key={category.type}
                    open={openCategories.includes(category.type)}
                    onOpenChange={() => toggleCategory(category.type)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {category.count}
                          </Badge>
                        </div>
                        {openCategories.includes(category.type) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-2 mt-2">
                      <ScrollArea className="h-48">
                        <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg">
                          {Array.from({ length: category.count }, (_, i) => i + 1).map((index) => (
                            <button
                              key={index}
                              onClick={() => onAddElement(category.type, index)}
                              className="aspect-square bg-white rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:scale-105 transition-all duration-200 p-1 flex items-center justify-center"
                            >
                              <ImageWithFallback
                                src={`https://cdn.jsdelivr.net/gh/Ninja4554/Cubist-images/${getTypePrefix(category.type)}${index}.png`}
                                alt={`${category.name} ${index}`}
                                className="w-full h-full object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="layers" className="flex-1 mt-4">
            <LayersPanel
              elements={elements}
              selectedElements={selectedElements}
              onSelectElement={onSelectElement}
              onDeleteElement={onDeleteElement}
              onToggleVisibility={onToggleElementVisibility}
              onMoveLayer={onMoveLayer}
            />
          </TabsContent>
        </Tabs>

        {/* Upload and Save */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <label className="w-full">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImageUpload(file);
                  // Reset input so same file can be uploaded again
                  e.target.value = '';
                }
              }}
            />
            <Button
              variant="outline"
              className="w-full bg-gradient-to-r from-yellow-100 to-pink-100 hover:from-yellow-200 hover:to-pink-200"
              asChild
            >
              <div>
                <Camera className="h-4 w-4 mr-2" />
                Upload Image
              </div>
            </Button>
          </label>
          
          <Button
            onClick={onSave}
            className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-500 hover:to-pink-500 text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Artwork
          </Button>
        </div>
      </div>
    </div>
  );
}