import React from 'react';
import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="fixed bottom-4 left-4 z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2">
        <button
          onClick={onZoomOut}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="Zoom out"
        >
          <Minus size={16} />
        </button>
        
        <button
          onClick={onResetZoom}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded min-w-12 text-center"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        
        <button
          onClick={onZoomIn}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded ${
            canUndo 
              ? 'hover:bg-gray-100 text-gray-600' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <RotateCcw size={16} />
        </button>
        
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded ${
            canRedo 
              ? 'hover:bg-gray-100 text-gray-600' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>
    </div>
  );
};
