import React from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label: string;
}

const strokeColors = [
  '#000000', // black
  '#e03131', // red
  '#2f9e44', // green
  '#1971c2', // blue
  '#f08c00', // orange
  '#7c2d12', // brown
  '#6741d9', // purple
  '#c2255c', // pink
];

const backgroundColors = [
  'transparent',
  '#ffe3e3', // light red
  '#e7f5ff', // light blue
  '#e6fcf5', // light green
  '#fff4e6', // light orange
  '#f3e5f5', // light purple
  '#fff0f6', // light pink
  '#f8f9fa', // light gray
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onColorSelect, 
  label 
}) => {
  const colorOptions = label === 'Background' ? backgroundColors : strokeColors;
  
  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">{label}</div>
      <div className="grid grid-cols-4 gap-1.5">
        {colorOptions.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-6 h-6 rounded border transition-all ${
              selectedColor === color
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ 
              backgroundColor: color === 'transparent' ? '#ffffff' : color,
              backgroundImage: color === 'transparent' 
                ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)' 
                : 'none',
              backgroundSize: color === 'transparent' ? '6px 6px' : 'auto'
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};
