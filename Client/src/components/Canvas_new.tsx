import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Element, Point, Tool } from '../types/canvas';
import { generateId, normalizeRect, isPointInElement } from '../utils/math';
import { CodeBlock } from './CodeBlock';
import { analyzeCode } from '../services/geminiService';

interface CanvasProps {
  elements: Element[];
  selectedTool: Tool;
  selectedElements: string[];
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  zoom: number;
  panX: number;
  panY: number;
  onElementsChange: (elements: Element[]) => void;
  onElementsReplace: (elements: Element[]) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onPanChange: (panX: number, panY: number) => void;
  // Text properties
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

const CANVAS_WIDTH = 5000;
const CANVAS_HEIGHT = 3000;

// Dummy languages data for CodeBlock dependency
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
];

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedTool,
  selectedElements,
  strokeColor,
  backgroundColor,
  strokeWidth,
  strokeStyle,
  roughness,
  zoom,
  panX,
  panY,
  onElementsChange,
  onElementsReplace,
  onSelectionChange,
  onPanChange,
  fontSize = 16,
  fontFamily = 'Arial, sans-serif',
  textAlign = 'left',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<{
    elementId: string;
    handle: ResizeHandle;
    startBounds: { x: number; y: number; width: number; height: number };
    startMouse: Point;
  } | null>(null);
  const [isErasing, setIsErasing] = useState(false);
  const [erasedElements, setErasedElements] = useState<Set<string>>(new Set());
  
  // NEW TEXT TOOL STATE - simplified
  const [isTextActive, setIsTextActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const getMousePosition = useCallback((event: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current?.scrollLeft || 0;
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    return {
      x: (event.clientX - rect.left + scrollLeft) / zoom,
      y: (event.clientY - rect.top + scrollTop) / zoom,
    };
  }, [zoom]);
  
  const handleElementDragStart = useCallback((elementId: string, event: React.MouseEvent) => {
    const point = getMousePosition(event);
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setDraggedElement(elementId);
      setDragOffset({ x: point.x - element.x, y: point.y - element.y });
    }
  }, [elements, getMousePosition]);

  const handleCodeAnalysis = useCallback(async (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element || !element.code) return;

    onElementsReplace(elements.map(el => 
      el.id === elementId ? { ...el, isExecuting: true } : el
    ));

    try {
      const analysis = await analyzeCode(element.code, element.codeLanguage || 'javascript');
      onElementsReplace(elements.map(el => 
        el.id === elementId ? { 
          ...el, 
          codeOutput: analysis.output, 
          codeExplanation: analysis.explanation, 
          isExecuting: false 
        } : el
      ));
    } catch (error) {
      console.error('Error analyzing code:', error);
      onElementsReplace(elements.map(el => 
        el.id === elementId ? { 
          ...el, 
          codeOutput: 'Error: Failed to analyze code', 
          codeExplanation: 'Unable to connect to AI service.', 
          isExecuting: false 
        } : el
      ));
    }
  }, [elements, onElementsReplace]);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxWidth = 300;
        const width = Math.min(maxWidth, img.width);
        const height = width / aspectRatio;

        const containerRect = containerRef.current?.getBoundingClientRect();
        const scrollLeft = containerRef.current?.scrollLeft || 0;
        const scrollTop = containerRef.current?.scrollTop || 0;
        const centerX = (scrollLeft + (containerRect?.width || 800) / 2) / zoom;
        const centerY = (scrollTop + (containerRect?.height || 600) / 2) / zoom;

        const newElement: Element = {
          id: generateId(), type: 'image', x: centerX - width / 2, y: centerY - height / 2, width, height,
          strokeColor: 'transparent', backgroundColor: 'transparent', strokeWidth: strokeWidth as any,
          strokeStyle: strokeStyle as any, roughness: roughness as any, opacity: 1, imageUrl, angle: 0, isDeleted: false,
        };
        onElementsChange([...elements, newElement]);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  }, [elements, onElementsChange, strokeWidth, strokeStyle, roughness, zoom]);

  // NEW TEXT TOOL FUNCTIONS - simplified and working
  const startTextInput = useCallback((point: Point, existingElement?: Element) => {
    setTextPosition(point);
    setTextInput(existingElement?.text || '');
    setEditingTextId(existingElement?.id || null);
    setIsTextActive(true);
    
    // Focus the input after state update
    setTimeout(() => {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    }, 10);
  }, []);

  const finishTextInput = useCallback(() => {
    if (!textInput.trim()) {
      setIsTextActive(false);
      setEditingTextId(null);
      setTextInput('');
      return;
    }

    if (editingTextId) {
      // Update existing text element
      const updatedElements = elements.map(el => 
        el.id === editingTextId ? { ...el, text: textInput } : el
      );
      onElementsChange(updatedElements);
    } else {
      // Create new text element
      const newElement: Element = {
        id: generateId(),
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        width: Math.max(textInput.length * fontSize * 0.6, 20),
        height: fontSize * 1.2,
        strokeColor,
        backgroundColor: 'transparent',
        strokeWidth: strokeWidth as any,
        strokeStyle: strokeStyle as any,
        roughness: roughness as any,
        opacity: 1,
        text: textInput,
        fontSize,
        fontFamily,
        angle: 0,
        isDeleted: false,
      };
      onElementsChange([...elements, newElement]);
    }

    setIsTextActive(false);
    setEditingTextId(null);
    setTextInput('');
  }, [textInput, editingTextId, elements, onElementsChange, textPosition, strokeColor, strokeWidth, strokeStyle, roughness, fontSize, fontFamily]);

  const handleResizeElement = useCallback((elementId: string, handle: ResizeHandle, mouseX: number, mouseY: number) => {
    if (!isResizing) return;

    const deltaX = mouseX - isResizing.startMouse.x;
    const deltaY = mouseY - isResizing.startMouse.y;
    
    const newElements = elements.map(el => {
      if (el.id !== elementId) return el;
      
      let { x, y, width, height } = isResizing.startBounds;

      if (handle.includes('w')) { x += deltaX; width -= deltaX; }
      if (handle.includes('e')) { width += deltaX; }
      if (handle.includes('n')) { y += deltaY; height -= deltaY; }
      if (handle.includes('s')) { height += deltaY; }

      if (width < 20) { width = 20; if (handle.includes('w')) x = isResizing.startBounds.x + isResizing.startBounds.width - 20; }
      if (height < 20) { height = 20; if (handle.includes('n')) y = isResizing.startBounds.y + isResizing.startBounds.height - 20; }

      return { ...el, x, y, width, height };
    });
    
    onElementsReplace(newElements);
  }, [isResizing, elements, onElementsReplace]);

  const handleErase = useCallback((point: Point) => {
    const elementToErase = [...elements].reverse().find(el => 
      !el.isDeleted && !erasedElements.has(el.id) && isPointInElement(point, el)
    );
    
    if (elementToErase) {
      setErasedElements(prev => new Set([...prev, elementToErase.id]));
      const newElements = elements.filter(el => el.id !== elementToErase.id);
      onElementsChange(newElements);
      if (selectedElements.includes(elementToErase.id)) {
        onSelectionChange(selectedElements.filter(id => id !== elementToErase.id));
      }
    }
  }, [elements, erasedElements, selectedElements, onSelectionChange, onElementsChange]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const point = getMousePosition(event);
    
    // Close text input if clicking elsewhere
    if (isTextActive) {
      finishTextInput();
      return;
    }
    
    if (selectedTool === 'eraser') { 
      setIsErasing(true); 
      setErasedElements(new Set()); 
      handleErase(point); 
      return; 
    }
    
    const selectedElement = selectedElements.length === 1 ? elements.find(el => el.id === selectedElements[0]) : null;
    if (selectedElement && selectedTool === 'select') {
      const handles = getResizeHandles(selectedElement);
      for (const handle of handles) {
        if (Math.abs(point.x - handle.x) < 8 / zoom && Math.abs(point.y - handle.y) < 8 / zoom) {
          setIsResizing({
            elementId: selectedElement.id, handle: handle.type,
            startBounds: { x: selectedElement.x, y: selectedElement.y, width: selectedElement.width, height: selectedElement.height },
            startMouse: point,
          });
          return;
        }
      }
    }
    
    if (selectedTool === 'hand') { 
      setIsPanning(true); 
      setLastPanPoint({ x: event.clientX, y: event.clientY }); 
      return; 
    }

    // NEW TEXT TOOL LOGIC - simplified
    if (selectedTool === 'text') {
      // Check if clicking on existing text element
      const clickedTextElement = [...elements].reverse().find(el => 
        !el.isDeleted && el.type === 'text' && isPointInElement(point, el)
      );
      
      if (clickedTextElement) {
        // Edit existing text
        startTextInput(point, clickedTextElement);
      } else {
        // Create new text at click position
        startTextInput(point);
      }
      return;
    }

    if (selectedTool === 'code') {
      const newElement: Element = {
        id: generateId(), type: 'code', x: point.x, y: point.y, width: 450, height: 300,
        strokeColor: '#8b5cf6', backgroundColor: 'transparent', strokeWidth: strokeWidth as any,
        strokeStyle: strokeStyle as any, roughness: roughness as any, opacity: 1,
        code: `// ${LANGUAGES.find(l => l.value === 'javascript')?.label} code\nconsole.log("Hello, AI!");`,
        codeLanguage: 'javascript', codeOutput: '', codeExplanation: '', isExecuting: false,
        angle: 0, isDeleted: false,
      };
      onElementsChange([...elements, newElement]);
      onSelectionChange([newElement.id]);
      return;
    }

    if (selectedTool === 'image') { 
      fileInputRef.current?.click(); 
      return; 
    }

    if (selectedTool === 'select') {
      const clickedElement = [...elements].reverse().find(el => !el.isDeleted && isPointInElement(point, el));
      if (clickedElement) {
        if (clickedElement.type === 'code') {
          onSelectionChange([clickedElement.id]);
          return;
        }
        if (!selectedElements.includes(clickedElement.id)) onSelectionChange([clickedElement.id]);
        setDraggedElement(clickedElement.id);
        setDragOffset({ x: point.x - clickedElement.x, y: point.y - clickedElement.y });
      } else {
        onSelectionChange([]);
      }
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    if (selectedTool === 'draw') setCurrentPath([point]);
  }, [
    selectedTool, elements, selectedElements, getMousePosition, onSelectionChange, zoom,
    handleErase, isTextActive, finishTextInput, startTextInput, strokeWidth, strokeStyle, roughness, onElementsChange
  ]);

  const getResizeHandles = (element: Element) => {
    const handleSize = 8 / zoom;
    return [
      { x: element.x, y: element.y, type: 'nw' as ResizeHandle },
      { x: element.x + element.width / 2, y: element.y, type: 'n' as ResizeHandle },
      { x: element.x + element.width, y: element.y, type: 'ne' as ResizeHandle },
      { x: element.x + element.width, y: element.y + element.height / 2, type: 'e' as ResizeHandle },
      { x: element.x + element.width, y: element.y + element.height, type: 'se' as ResizeHandle },
      { x: element.x + element.width / 2, y: element.y + element.height, type: 's' as ResizeHandle },
      { x: element.x, y: element.y + element.height, type: 'sw' as ResizeHandle },
      { x: element.x, y: element.y + element.height / 2, type: 'w' as ResizeHandle },
    ].map(h => ({ ...h, x: h.x - handleSize / 2, y: h.y - handleSize / 2 }));
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const point = getMousePosition(event);
    if (isErasing && selectedTool === 'eraser') { handleErase(point); return; }
    if (isResizing) { handleResizeElement(isResizing.elementId, isResizing.handle, point.x, point.y); return; }
    
    if (isPanning && containerRef.current) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }

    if (draggedElement) {
      const newElements = elements.map(el => el.id === draggedElement ? { ...el, x: point.x - dragOffset.x, y: point.y - dragOffset.y } : el);
      onElementsReplace(newElements);
      return;
    }
    
    if (isDrawing && selectedTool === 'draw') setCurrentPath(prev => [...prev, point]);
  }, [
    getMousePosition, isErasing, selectedTool, handleErase, isResizing, handleResizeElement,
    isPanning, lastPanPoint, draggedElement, dragOffset, elements, onElementsReplace, isDrawing
  ]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (isErasing) { setIsErasing(false); setErasedElements(new Set()); return; }
    if (isResizing) { setIsResizing(null); onElementsChange(elements); return; }
    if (isPanning) { setIsPanning(false); return; }
    if (draggedElement) { setDraggedElement(null); onElementsChange(elements); return; }
    if (!isDrawing) return;
    
    const endPoint = getMousePosition(event);
    
    if (selectedTool === 'draw' && currentPath.length > 1) {
      const newElement: Element = {
        id: generateId(), type: 'draw',
        x: Math.min(...currentPath.map(p => p.x)), y: Math.min(...currentPath.map(p => p.y)),
        width: Math.max(...currentPath.map(p => p.x)) - Math.min(...currentPath.map(p => p.x)),
        height: Math.max(...currentPath.map(p => p.y)) - Math.min(...currentPath.map(p => p.y)),
        strokeColor, backgroundColor: 'transparent', strokeWidth: strokeWidth as any, strokeStyle: strokeStyle as any,
        roughness: roughness as any, opacity: 1, points: currentPath, angle: 0, isDeleted: false,
      };
      onElementsChange([...elements, newElement]);
      setCurrentPath([]);
    } else if (['rectangle', 'circle', 'diamond', 'line', 'arrow'].includes(selectedTool)) {
      const rect = normalizeRect(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
      if (rect.width > 5 || rect.height > 5) {
        const newElement: Element = {
          id: generateId(), type: selectedTool, x: rect.x, y: rect.y, width: rect.width, height: rect.height,
          strokeColor, backgroundColor: ['line', 'arrow'].includes(selectedTool) ? 'transparent' : backgroundColor,
          strokeWidth: strokeWidth as any, strokeStyle: strokeStyle as any, roughness: roughness as any,
          opacity: 1, angle: 0, isDeleted: false,
        };
        onElementsChange([...elements, newElement]);
      }
    }
    
    setIsDrawing(false);
  }, [
    isErasing, isResizing, isPanning, draggedElement, isDrawing, getMousePosition, selectedTool, currentPath,
    strokeColor, backgroundColor, strokeWidth, strokeStyle, roughness, elements, onElementsChange, startPoint
  ]);
  
  useEffect(() => {
    const canvasElement = svgRef.current;
    if (canvasElement) {
      // Use document-level listeners for move and up to handle dragging outside the canvas
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  const renderElement = (element: Element) => {
    if (element.isDeleted) return null;

    const strokeDasharray = element.strokeStyle === 'dashed' ? '8,4' : element.strokeStyle === 'dotted' ? '2,4' : 'none';
    const commonProps = { 
      stroke: element.strokeColor, 
      fill: element.backgroundColor === 'transparent' ? 'none' : element.backgroundColor, 
      strokeWidth: element.strokeWidth, 
      strokeDasharray, 
      opacity: element.opacity 
    };

    switch (element.type) {
      case 'rectangle': 
        return <rect key={element.id} x={element.x} y={element.y} width={element.width} height={element.height} {...commonProps} />;
      case 'circle': 
        return <ellipse key={element.id} cx={element.x + element.width / 2} cy={element.y + element.height / 2} rx={element.width / 2} ry={element.height / 2} {...commonProps} />;
      case 'diamond': 
        return <path key={element.id} d={`M ${element.x + element.width / 2} ${element.y} L ${element.x + element.width} ${element.y + element.height / 2} L ${element.x + element.width / 2} ${element.y + element.height} L ${element.x} ${element.y + element.height / 2} Z`} {...commonProps} />;
      case 'line': 
        return <line key={element.id} x1={element.x} y1={element.y} x2={element.x + element.width} y2={element.y + element.height} {...commonProps} />;
      case 'arrow':
        const angle = Math.atan2(element.height, element.width);
        const arrowX = element.x + element.width;
        const arrowY = element.y + element.height;
        return (
          <g key={element.id}>
            <line x1={element.x} y1={element.y} x2={arrowX} y2={arrowY} {...commonProps} />
            <path d={`M ${arrowX} ${arrowY} L ${arrowX - 15 * Math.cos(angle - Math.PI / 6)} ${arrowY - 15 * Math.sin(angle - Math.PI / 6)} M ${arrowX} ${arrowY} L ${arrowX - 15 * Math.cos(angle + Math.PI / 6)} ${arrowY - 15 * Math.sin(angle + Math.PI / 6)}`} {...commonProps} fill="none" />
          </g>
        );
      case 'draw': 
        return <path key={element.id} d={`M ${element.points?.[0].x} ${element.points?.[0].y} ${element.points?.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`} {...commonProps} fill="none" />;
      case 'text': 
        return (
          <g key={element.id}>
            {(element.text || '').split('\n').map((line, i) => (
              <text 
                key={i} 
                x={element.x} 
                y={element.y + (element.fontSize || 16) + (i * 20)} 
                fill={element.strokeColor} 
                fontSize={element.fontSize || 16} 
                fontFamily={element.fontFamily || 'Arial, sans-serif'} 
                opacity={element.opacity}
              >
                {line}
              </text>
            ))}
          </g>
        );
      case 'image': 
        return <image key={element.id} x={element.x} y={element.y} width={element.width} height={element.height} href={element.imageUrl} opacity={element.opacity} preserveAspectRatio="xMidYMid meet" />;
      case 'code': 
        return <rect key={element.id} x={element.x} y={element.y} width={element.width} height={element.height} fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4,2" />;
      default: 
        return null;
    }
  };

  const renderSelectionHandles = (element: Element) => {
    if (!selectedElements.includes(element.id) || selectedTool !== 'select') return null;

    const handles = getResizeHandles(element);
    const handleSize = 8 / zoom;

    return (
      <g key={`handles-${element.id}`}>
        <rect x={element.x} y={element.y} width={element.width} height={element.height} fill="none" stroke="#1971c2" strokeWidth={1 / zoom} strokeDasharray={`${4 / zoom},${2 / zoom}`} />
        {handles.map((handle, index) => (
          <rect 
            key={index} 
            x={handle.x} 
            y={handle.y} 
            width={handleSize} 
            height={handleSize} 
            fill="white" 
            stroke="#1971c2" 
            strokeWidth={1 / zoom} 
            style={{ cursor: `${handle.type}-resize` }} 
          />
        ))}
      </g>
    );
  };

  const getCursorStyle = () => {
    if (isResizing) return `${isResizing.handle}-resize`;
    if (draggedElement) return 'grabbing';
    switch (selectedTool) {
      case 'hand': return isPanning ? 'grabbing' : 'grab';
      case 'select': return 'default';
      case 'text': return 'text';
      case 'eraser': return 'pointer';
      default: return 'crosshair';
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50 overflow-auto relative" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f9fafb' }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
      
      <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
        
        {/* NEW TEXT INPUT - positioned in the canvas */}
        {isTextActive && (
          <input
            ref={textInputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                finishTextInput();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsTextActive(false);
                setTextInput('');
                setEditingTextId(null);
              }
            }}
            onBlur={finishTextInput}
            className="absolute bg-white border border-blue-500 px-2 py-1 outline-none"
            style={{
              left: `${textPosition.x}px`,
              top: `${textPosition.y}px`,
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              color: strokeColor,
              textAlign: textAlign,
              minWidth: '100px',
              zIndex: 1000,
            }}
            placeholder="Type text..."
            autoFocus
          />
        )}
        
        <svg 
          ref={svgRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          className="absolute top-0 left-0" 
          onMouseDown={handleMouseDown} 
          style={{ cursor: getCursorStyle() }}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="white" fillOpacity="0.9" />
          {elements.map(renderElement)}
          {elements.map(renderSelectionHandles)}
        </svg>

        {elements.filter(el => el.type === 'code' && !el.isDeleted).map(element => (
          <CodeBlock 
            key={element.id} 
            element={element} 
            zoom={zoom} 
            isSelected={selectedElements.includes(element.id)}
            onCodeChange={(code) => onElementsReplace(elements.map(el => el.id === element.id ? { ...el, code } : el))}
            onLanguageChange={(language) => onElementsReplace(elements.map(el => el.id === element.id ? { ...el, codeLanguage: language } : el))}
            onHeightChange={(height) => onElementsReplace(elements.map(el => el.id === element.id ? { ...el, height } : el))}
            onExecute={() => handleCodeAnalysis(element.id)}
            onClose={() => onElementsChange(elements.filter(el => el.id !== element.id))}
            onSelect={() => onSelectionChange([element.id])}
            onDragStart={handleElementDragStart}
          />
        ))}
      </div>
      
      {/* Welcome message */}
      {elements.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-center z-10">
          <p className="text-lg font-medium">🎨 Welcome to your AI-powered canvas!</p>
          <p className="text-sm">Start drawing, or create code blocks to begin.</p>
          <p className="text-xs mt-2 text-gray-500">Canvas size: {CANVAS_WIDTH} × {CANVAS_HEIGHT}px</p>
        </div>
      )}
      
      {/* Tool status indicators */}
      {selectedTool === 'text' && !isTextActive && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded text-sm z-20">
          Text Mode - Click anywhere to add text
        </div>
      )}
      {isTextActive && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded text-sm z-20">
          Text Input - Press Enter to save, Escape to cancel
        </div>
      )}
      {selectedTool === 'eraser' && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded text-sm z-20">
          Eraser Mode - Click or drag to erase elements
        </div>
      )}
    </div>
  );
};
