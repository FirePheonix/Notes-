import React from 'react';
import { ColorPicker } from './ColorPicker';
import { StrokeWidth, StrokeStyle, Roughness, EdgeStyle, Tool } from '../types/canvas';
import { Minus, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface PropertiesPanelProps {
  selectedTool: Tool;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: StrokeWidth;
  strokeStyle: StrokeStyle;
  roughness: Roughness;
  edgeStyle: EdgeStyle;
  onStrokeColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onStrokeWidthChange: (width: StrokeWidth) => void;
  onStrokeStyleChange: (style: StrokeStyle) => void;
  onRoughnessChange: (roughness: Roughness) => void;
  onEdgeStyleChange: (style: EdgeStyle) => void;
  // Text-specific props
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  onFontSizeChange?: (size: number) => void;
  onFontFamilyChange?: (family: string) => void;
  onTextAlignChange?: (align: 'left' | 'center' | 'right') => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedTool,
  strokeColor,
  backgroundColor,
  strokeWidth,
  strokeStyle,
  roughness,
  edgeStyle,
  onStrokeColorChange,
  onBackgroundColorChange,
  onStrokeWidthChange,
  onStrokeStyleChange,
  onRoughnessChange,
  onEdgeStyleChange,
  fontSize = 16,
  fontFamily = 'Arial, sans-serif',
  textAlign = 'left',
  onFontSizeChange = () => {},
  onFontFamilyChange = () => {},
  onTextAlignChange = () => {},
}) => {
  // Show text-specific controls when text tool is selected
  if (selectedTool === 'text') {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-56">
          <div className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Type size={16} />
            Text Properties
          </div>
          
          <ColorPicker
            selectedColor={strokeColor}
            onColorSelect={onStrokeColorChange}
            label="Text Color"
          />

          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Font Size</div>
            <div className="flex gap-1">
              {[12, 16, 20, 24, 32].map((size) => (
                <button
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={`flex-1 h-8 rounded border transition-colors text-xs flex items-center justify-center ${
                    fontSize === size
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Font Family</div>
            <select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Times, serif">Times</option>
              <option value="Courier, monospace">Courier</option>
              <option value="Georgia, serif">Georgia</option>
            </select>
          </div>

          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Text Align</div>
            <div className="flex gap-1">
              {[
                { align: 'left' as const, icon: AlignLeft },
                { align: 'center' as const, icon: AlignCenter },
                { align: 'right' as const, icon: AlignRight },
              ].map(({ align, icon: Icon }) => (
                <button
                  key={align}
                  onClick={() => onTextAlignChange(align)}
                  className={`flex-1 h-8 rounded border transition-colors flex items-center justify-center ${
                    textAlign === align
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show drawing tools properties for other tools
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-56">
        <ColorPicker
          selectedColor={strokeColor}
          onColorSelect={onStrokeColorChange}
          label="Stroke"
        />
        
        <ColorPicker
          selectedColor={backgroundColor}
          onColorSelect={onBackgroundColorChange}
          label="Background"
        />

        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Stroke width</div>
          <div className="flex gap-1">
            {[1, 2, 4].map((width) => (
              <button
                key={width}
                onClick={() => onStrokeWidthChange(width as StrokeWidth)}
                className={`flex-1 h-8 rounded border transition-colors flex items-center justify-center ${
                  strokeWidth === width
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Minus 
                  size={16} 
                  strokeWidth={width} 
                  className="text-gray-600"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Stroke style</div>
          <div className="flex gap-1">
            {[
              { style: 'solid' as StrokeStyle, pattern: '────' },
              { style: 'dashed' as StrokeStyle, pattern: '-- --' },
              { style: 'dotted' as StrokeStyle, pattern: '· · · ·' },
            ].map(({ style, pattern }) => (
              <button
                key={style}
                onClick={() => onStrokeStyleChange(style)}
                className={`flex-1 h-8 rounded border transition-colors text-xs flex items-center justify-center ${
                  strokeStyle === style
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Sloppiness</div>
          <div className="flex gap-1">
            {[
              { roughness: 0 as Roughness, label: '──' },
              { roughness: 1 as Roughness, label: '∼∼' },
              { roughness: 2 as Roughness, label: '≈≈' },
            ].map(({ roughness: r, label }) => (
              <button
                key={r}
                onClick={() => onRoughnessChange(r)}
                className={`flex-1 h-8 rounded border transition-colors flex items-center justify-center ${
                  roughness === r
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Edges</div>
          <div className="flex gap-1">
            {[
              { style: 'sharp' as EdgeStyle, label: '⬜' },
              { style: 'round' as EdgeStyle, label: '⬭' },
            ].map(({ style, label }) => (
              <button
                key={style}
                onClick={() => onEdgeStyleChange(style)}
                className={`flex-1 h-8 rounded border transition-colors flex items-center justify-center ${
                  edgeStyle === style
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
