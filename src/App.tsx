import React, { useRef, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { MobileHeader } from './components/MobileHeader';
import { DrawingTools } from './components/DrawingTools';
import { Button } from './components/ui/button';
import { Menu, X } from 'lucide-react';

export interface CanvasElement {
  id: string;
  type: string;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  src: string;
  selected: boolean;
  visible?: boolean;
}

export interface DrawingState {
  isDrawing: boolean;
  isFreeDrawing: boolean;
  isErasing: boolean;
  isLineMode: boolean;
  brushSize: number;
  color: string;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    isFreeDrawing: false,
    isErasing: false,
    isLineMode: false,
    brushSize: 5,
    color: 'black'
  });
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<{ canvas: React.RefObject<HTMLCanvasElement>; drawingCanvas: React.RefObject<HTMLCanvasElement> } | null>(null);

  const saveState = () => {
    // Ensure we have access to the drawing canvas
    if (!canvasRef.current?.drawingCanvas.current) {
      setTimeout(() => saveState(), 100);
      return;
    }
    
    const state = {
      elements: [...elements],
      drawingData: canvasRef.current.drawingCanvas.current.toDataURL()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    if (newHistory.length > 50) {
      setHistory(newHistory.slice(1));
      setHistoryIndex(newHistory.length - 2);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setHistoryIndex(historyIndex - 1);
      
      if (canvasRef.current?.drawingCanvas.current && prevState.drawingData) {
        const ctx = canvasRef.current.drawingCanvas.current.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, 794, 1123);
            ctx.drawImage(img, 0, 0);
          };
          img.src = prevState.drawingData;
        }
      } else if (canvasRef.current?.drawingCanvas.current) {
        // Clear canvas if no drawing data
        const ctx = canvasRef.current.drawingCanvas.current.getContext('2d');
        ctx?.clearRect(0, 0, 794, 1123);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setHistoryIndex(historyIndex + 1);
      
      if (canvasRef.current?.drawingCanvas.current && nextState.drawingData) {
        const ctx = canvasRef.current.drawingCanvas.current.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, 794, 1123);
            ctx.drawImage(img, 0, 0);
          };
          img.src = nextState.drawingData;
        }
      } else if (canvasRef.current?.drawingCanvas.current) {
        // Clear canvas if no drawing data
        const ctx = canvasRef.current.drawingCanvas.current.getContext('2d');
        ctx?.clearRect(0, 0, 794, 1123);
      }
    }
  };

  const addElement = (type: string, index: number) => {
    // A4 canvas dimensions: 794px x 1123px
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;
    
    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type,
      index,
      x: type === 'head' ? 0 : (A4_WIDTH / 2 - 40), // Center other elements, head at origin
      y: type === 'head' ? 0 : (A4_HEIGHT / 2 - 40),
      width: type === 'head' ? A4_WIDTH : 80,  // Head fills entire A4 width
      height: type === 'head' ? A4_HEIGHT : 80, // Head fills entire A4 height
      rotation: 0,
      src: `https://cdn.jsdelivr.net/gh/Ninja4554/Cubist-images/${getTypePrefix(type)}${index}.png`,
      selected: false,
      visible: true
    };

    setElements(prev => [...prev, newElement]);
    setSidebarOpen(false);
    setTimeout(() => saveState(), 100);
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

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteSelected = () => {
    setElements(prev => prev.filter(el => !selectedElements.includes(el.id)));
    setSelectedElements([]);
    saveState();
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElements(prev => prev.filter(selectedId => selectedId !== id));
    saveState();
  };

  const toggleElementVisibility = (id: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, visible: !el.visible } : el
    ));
    saveState();
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    setElements(prev => {
      const currentIndex = prev.findIndex(el => el.id === id);
      if (currentIndex === -1) return prev;
      
      const newElements = [...prev];
      const targetIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
      
      if (targetIndex >= 0 && targetIndex < newElements.length) {
        [newElements[currentIndex], newElements[targetIndex]] = [newElements[targetIndex], newElements[currentIndex]];
      }
      
      return newElements;
    });
    saveState();
  };

  const selectElement = (id: string) => {
    setSelectedElements([id]);
    setElements(prev => prev.map(el => ({ ...el, selected: el.id === id })));
  };

  const clearSelection = () => {
    setSelectedElements([]);
    setElements(prev => prev.map(el => ({ ...el, selected: false })));
  };

  // Save artwork function with Chromebook compatibility
  const saveArtwork = async () => {
    if (!canvasRef.current?.canvas.current || !canvasRef.current?.drawingCanvas.current) {
      alert('Canvas not ready. Please try again.');
      return;
    }
    
    try {
      // Check if we're on a Chromebook or have File System Access API
      const isChromebook = /CrOS/.test(navigator.userAgent);
      const hasFileSystemAccess = 'showSaveFilePicker' in window;
      
      // Create a temporary canvas to combine elements and drawing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        alert('Could not create temporary canvas.');
        return;
      }
      
      // Set A4 canvas size
      tempCanvas.width = 794;
      tempCanvas.height = 1123;
      
      // Fill with white background
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Render only visible canvas elements first (so they appear under drawings)
      for (const element of elements.filter(el => el.visible !== false)) {
        if (element.type === 'signature') {
          // Handle text signatures
          tempCtx.save();
          tempCtx.translate(element.x + element.width / 2, element.y + element.height / 2);
          tempCtx.rotate((element.rotation * Math.PI) / 180);
          tempCtx.fillStyle = 'black';
          tempCtx.font = '20px Arial';
          tempCtx.textAlign = 'center';
          tempCtx.fillText(element.src || 'Signature', 0, 0);
          tempCtx.restore();
        } else {
          // Handle image elements
          try {
            const img = new Image();
            
            // For uploaded images (data URLs), no need for CORS
            if (element.src.startsWith('data:')) {
              await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                  tempCtx.save();
                  tempCtx.translate(element.x + element.width / 2, element.y + element.height / 2);
                  tempCtx.rotate((element.rotation * Math.PI) / 180);
                  tempCtx.drawImage(
                    img,
                    -element.width / 2,
                    -element.height / 2,
                    element.width,
                    element.height
                  );
                  tempCtx.restore();
                  resolve();
                };
                img.onerror = () => reject(new Error(`Failed to load image: ${element.id}`));
                img.src = element.src;
              });
            } else {
              // For external images, try with and without CORS
              img.crossOrigin = 'anonymous';
              await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error(`Image load timeout: ${element.id}`));
                }, 8000); // Longer timeout for Chromebooks
                
                img.onload = () => {
                  clearTimeout(timeout);
                  tempCtx.save();
                  tempCtx.translate(element.x + element.width / 2, element.y + element.height / 2);
                  tempCtx.rotate((element.rotation * Math.PI) / 180);
                  tempCtx.drawImage(
                    img,
                    -element.width / 2,
                    -element.height / 2,
                    element.width,
                    element.height
                  );
                  tempCtx.restore();
                  resolve();
                };
                
                img.onerror = () => {
                  clearTimeout(timeout);
                  // Try without CORS for Chromebook compatibility
                  const fallbackImg = new Image();
                  fallbackImg.onload = () => {
                    tempCtx.save();
                    tempCtx.translate(element.x + element.width / 2, element.y + element.height / 2);
                    tempCtx.rotate((element.rotation * Math.PI) / 180);
                    tempCtx.drawImage(
                      fallbackImg,
                      -element.width / 2,
                      -element.height / 2,
                      element.width,
                      element.height
                    );
                    tempCtx.restore();
                    resolve();
                  };
                  fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${element.id}`));
                  fallbackImg.src = element.src;
                };
                
                img.src = element.src;
              });
            }
          } catch (imgError) {
            console.warn(`Skipping image element ${element.id}:`, imgError);
            // Continue with other elements
          }
        }
      }
      
      // Draw the drawing canvas on top (freehand drawings)
      tempCtx.drawImage(canvasRef.current.drawingCanvas.current, 0, 0);
      
      const filename = `cubist-art-${Date.now()}.jpg`;
      
      // Try modern File System Access API for Chromebooks first
      if (hasFileSystemAccess && isChromebook) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'JPEG Images',
              accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
            }]
          });
          
          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve) => {
            tempCanvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/jpeg', 0.9);
          });
          
          // Write to file
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log('Artwork saved successfully using File System Access API');
          return;
        } catch (fsError) {
          console.log('File System Access API failed, falling back to download link');
        }
      }
      
      // Fallback: Create download link (works on all Chromebooks)
      const dataURL = tempCanvas.toDataURL('image/jpeg', 0.9);
      
      // For Chromebooks, try using URL.createObjectURL for better memory management
      if (isChromebook) {
        try {
          const blob = await new Promise<Blob>((resolve) => {
            tempCanvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/jpeg', 0.9);
          });
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = filename;
          link.href = url;
          
          // Chromebook-specific download behavior
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        } catch (blobError) {
          // Final fallback: standard download link
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Standard download for other devices
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      console.log('Artwork saved successfully as JPEG');
      
      // Show Chromebook-specific message if applicable
      if (isChromebook) {
        setTimeout(() => {
          alert('Artwork saved to your Downloads folder! You can also save to Google Drive by opening the file and choosing "Move to Drive".');
        }, 500);
      }
      
    } catch (error) {
      console.error('Error saving artwork:', error);
      
      // Chromebook-specific error handling
      if (/CrOS/.test(navigator.userAgent)) {
        alert('Error saving artwork. Please check your internet connection and storage permissions, then try again. On Chromebooks, ensure you have space in your Downloads folder.');
      } else {
        alert('Error saving artwork. Some images may not have loaded properly. Please try again.');
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const A4_WIDTH = 794;
        const A4_HEIGHT = 1123;
        
        // Create a new uploaded image element
        const newElement: CanvasElement = {
          id: `uploaded-${Date.now()}`,
          type: 'uploaded',
          index: 1,
          x: A4_WIDTH / 2 - 100, // Center horizontally
          y: A4_HEIGHT / 2 - 100, // Center vertically
          width: 200,
          height: 200,
          rotation: 0,
          src: e.target.result as string,
          selected: false,
          visible: true
        };
        
        setElements(prev => [...prev, newElement]);
        setTimeout(() => saveState(), 100);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add signature functionality
  const addSignature = () => {
    const signature = prompt('Enter your signature:');
    if (signature) {
      const A4_WIDTH = 794;
      const A4_HEIGHT = 1123;
      
      const newElement: CanvasElement = {
        id: `signature-${Date.now()}`,
        type: 'signature',
        index: 1,
        x: A4_WIDTH - 200, // Position near bottom right
        y: A4_HEIGHT - 80,
        width: 150,
        height: 40,
        rotation: 0,
        src: signature, // Store the actual signature text
        selected: false,
        visible: true
      };
      
      setElements(prev => [...prev, newElement]);
      setTimeout(() => saveState(), 100);
    }
  };

  // Initialize canvas and save initial state
  useEffect(() => {
    setTimeout(() => saveState(), 100);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
      );

      // Undo/Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && !isTyping) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }
        if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
          return;
        }
      }

      // Delete selected elements with Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.length > 0) {
        if (isTyping) {
          return;
        }
        
        e.preventDefault();
        deleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElements, deleteSelected, undo, redo]);

  // Handle clicks outside canvas to clear selection
  const handleAppClick = (e: React.MouseEvent) => {
    // Don't clear selection if clicking on interactive elements or the canvas area
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button, input, textarea, select, [role="button"], .canvas-container, canvas, [data-radix-popper-content-wrapper]');
    
    // Only clear selection if clicking in the main background area and we have selections
    if (!isInteractiveElement && selectedElements.length > 0) {
      // Additional check - only clear if clicking on the main app background
      const isMainBackground = target.classList.contains('h-screen') || 
                              target === e.currentTarget ||
                              (target.closest('.h-screen') && !target.closest('header, .sidebar, .canvas-container, [role="dialog"], [role="menu"]'));
      
      if (isMainBackground) {
        clearSelection();
      }
    }
  };

  return (
    <div 
      className="h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden"
      onClick={handleAppClick}
    >
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <div className={`
          absolute inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-72
        `}>
          <Sidebar 
            onAddElement={addElement}
            onClose={() => setSidebarOpen(false)}
            drawingState={drawingState}
            onDrawingStateChange={setDrawingState}
            onSave={() => saveArtwork()}
            onImageUpload={handleImageUpload}
            onAddSignature={addSignature}
            elements={elements}
            selectedElements={selectedElements}
            onSelectElement={selectElement}
            onDeleteElement={deleteElement}
            onToggleElementVisibility={toggleElementVisibility}
            onMoveLayer={moveLayer}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <Canvas
            ref={canvasRef}
            elements={elements}
            selectedElements={selectedElements}
            drawingState={drawingState}
            onUpdateElement={updateElement}
            onSelectElement={selectElement}
            onClearSelection={clearSelection}
            onSaveState={saveState}
          />
        </div>
      </div>

      {/* Drawing Tools - Bottom Bar */}
      <DrawingTools
        drawingState={drawingState}
        onDrawingStateChange={setDrawingState}
        onDeleteSelected={deleteSelected}
        onAddSignature={addSignature}
        hasSelection={selectedElements.length > 0}
      />
    </div>
  );
}