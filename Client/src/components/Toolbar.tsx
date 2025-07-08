import React from 'react';
import { 
  MousePointer, 
  Hand, 
  Square, 
  Diamond, 
  Circle, 
  ArrowRight, 
  Minus, 
  Pencil, 
  Type,
  Image, 
  Eraser,
  Lock,
  Code
} from 'lucide-react';
import { Tool } from '../types/canvas';

interface ToolbarProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const tools: { tool: Tool; icon: React.ReactNode; label: string }[] = [
  { tool: 'select', icon: <MousePointer size={18} />, label: 'Select' },
  { tool: 'hand', icon: <Hand size={18} />, label: 'Hand' },
  { tool: 'rectangle', icon: <Square size={18} />, label: 'Rectangle' },
  { tool: 'diamond', icon: <Diamond size={18} />, label: 'Diamond' },
  { tool: 'circle', icon: <Circle size={18} />, label: 'Circle' },
  { tool: 'arrow', icon: <ArrowRight size={18} />, label: 'Arrow' },
  { tool: 'line', icon: <Minus size={18} />, label: 'Line' },
  { tool: 'draw', icon: <Pencil size={18} />, label: 'Draw' },
  { tool: 'text', icon: <Type size={18} />, label: 'Text' },
  { tool: 'code', icon: <Code size={18} />, label: 'Code Block' },
  { tool: 'image', icon: <Image size={18} />, label: 'Image' },
  { tool: 'eraser', icon: <Eraser size={18} />, label: 'Eraser' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, onToolSelect }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex items-center gap-1">
        <div className="flex items-center gap-1 px-2">
          <Lock size={14} className="text-gray-400" />
        </div>
        <div className="w-px h-8 bg-gray-200" />
        {tools.map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => onToolSelect(tool)}
            className={`p-2.5 rounded-md transition-colors ${
              selectedTool === tool
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            } ${tool === 'code' ? 'bg-gradient-to-r from-purple-100 to-blue-100' : ''}`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
};
