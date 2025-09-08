import React from 'react';
import { CanvasElement } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedElements: string[];
  onSelectElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

export function LayersPanel({
  elements,
  selectedElements,
  onSelectElement,
  onDeleteElement,
  onToggleVisibility,
  onMoveLayer
}: LayersPanelProps) {
  const getLayerName = (element: CanvasElement) => {
    if (element.type === 'signature') {
      return `Signature: ${element.src?.substring(0, 15)}...`;
    }
    if (element.type === 'uploaded') {
      return 'Uploaded Image';
    }
    return `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${element.index}`;
  };

  const getLayerIcon = (element: CanvasElement) => {
    switch (element.type) {
      case 'head': return '👤';
      case 'eyes': return '👁️';
      case 'ears': return '👂';
      case 'noses': return '👃';
      case 'mouths': return '👄';
      case 'misc': return '🎨';
      case 'signature': return '✍️';
      case 'uploaded': return '📷';
      default: return '🎭';
    }
  };

  // Sort elements by z-index (rendering order)
  const sortedElements = [...elements].reverse(); // Reverse to show top layer first

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span>🎨</span>
          Layers ({elements.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="space-y-1 p-3 pt-0">
            {sortedElements.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm">No layers yet</p>
                <p className="text-xs">Add elements to see them here</p>
              </div>
            ) : (
              sortedElements.map((element, index) => (
                <div
                  key={element.id}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all
                    ${selectedElements.includes(element.id) 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-muted/50 border-transparent hover:bg-muted'
                    }
                  `}
                  onClick={() => onSelectElement(element.id)}
                >
                  {/* Layer Icon */}
                  <span className="text-sm">{getLayerIcon(element)}</span>
                  
                  {/* Layer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">
                      {getLayerName(element)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(element.x)}, {Math.round(element.y)}
                    </div>
                  </div>

                  {/* Layer Controls */}
                  <div className="flex items-center gap-1">
                    {/* Move Up/Down */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveLayer(element.id, 'up');
                      }}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveLayer(element.id, 'down');
                      }}
                      disabled={index === sortedElements.length - 1}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>

                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(element.id);
                      }}
                    >
                      {element.visible !== false ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement(element.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}