import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ZoomControls } from './components/ZoomControls';
import { ActionButtons } from './components/ActionButtons';
import { ChatSidebar } from './components/ChatSidebar';
import { useChatContext } from './contexts/ChatContext';
import { useHistory } from './hooks/useHistory';
import { Element, Tool, StrokeWidth, StrokeStyle, Roughness, EdgeStyle } from './types/canvas';

export default function DrawingApp(): React.JSX.Element {
  const { currentChat, saveElements } = useChatContext();
  
  const {
    state: elements,
    set: setElements,
    replace: replaceElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Element[]>([]);

  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [strokeColor, setStrokeColor] = useState('#1971c2');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(2);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>('solid');
  const [roughness, setRoughness] = useState<Roughness>(1);
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>('round');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Text-specific properties
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Load chat elements when a chat is selected
  useEffect(() => {
    if (currentChat) {
      replaceElements(currentChat.elements || []);
    }
  }, [currentChat, replaceElements]);

  // Auto-save disabled to improve performance - use manual save button instead
  // useEffect(() => {
  //   if (currentChat && elements.length > 0) {
  //     autoSaveElements(elements);
  //   }
  // }, [elements, currentChat, autoSaveElements]);

  const handleToolSelect = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    if (tool !== 'select') {
      setSelectedElements([]);
    }
  }, []);

  const handleElementsChange = useCallback((newElements: Element[]) => {
    setElements(newElements);
  }, [setElements]);

  const handleElementsReplace = useCallback((newElements: Element[]) => {
    replaceElements(newElements);
  }, [replaceElements]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const handlePanChange = useCallback((newPanX: number, newPanY: number) => {
    setPanX(newPanX);
    setPanY(newPanY);
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentChat) {
      alert('Please select or create a chat first!');
      return;
    }

    try {
      await saveElements(elements);
      alert('Canvas saved successfully!');
    } catch (error) {
      alert('Failed to save canvas');
    }
  }, [currentChat, elements, saveElements]);

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `drawing-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  return (
    <div className="h-screen bg-gray-100 relative overflow-hidden">
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {currentChat && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-30">
            <h3 className="text-sm font-medium text-gray-800">
              {currentChat.title}
            </h3>
          </div>
        )}

        {!currentChat && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Welcome to Drawing App
              </h2>
              <p className="text-gray-600 mb-4">
                Create a new chat or select an existing one to start drawing
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Open Chat Panel
              </button>
            </div>
          </div>
        )}

        <Toolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
        />

        <PropertiesPanel
          selectedTool={selectedTool}
          strokeColor={strokeColor}
          backgroundColor={backgroundColor}
          strokeWidth={strokeWidth}
          strokeStyle={strokeStyle}
          roughness={roughness}
          edgeStyle={edgeStyle}
          onStrokeColorChange={setStrokeColor}
          onBackgroundColorChange={setBackgroundColor}
          onStrokeWidthChange={setStrokeWidth}
          onStrokeStyleChange={setStrokeStyle}
          onRoughnessChange={setRoughness}
          onEdgeStyleChange={setEdgeStyle}
          fontSize={fontSize}
          fontFamily={fontFamily}
          textAlign={textAlign}
          onFontSizeChange={setFontSize}
          onFontFamilyChange={setFontFamily}
          onTextAlignChange={setTextAlign}
        />

        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <ActionButtons
          onSave={handleSave}
          onDownload={handleDownload}
        />

        <Canvas
          elements={elements}
          selectedTool={selectedTool}
          selectedElements={selectedElements}
          strokeColor={strokeColor}
          backgroundColor={backgroundColor}
          strokeWidth={strokeWidth}
          strokeStyle={strokeStyle}
          roughness={roughness}
          zoom={zoom}
          panX={panX}
          panY={panY}
          onElementsChange={handleElementsChange}
          onElementsReplace={handleElementsReplace}
          onSelectionChange={setSelectedElements}
          onPanChange={handlePanChange}
          fontSize={fontSize}
          fontFamily={fontFamily}
          textAlign={textAlign}
        />
      </div>
    </div>
  );
}