import React from 'react';
import { Download, Save, BookOpen } from 'lucide-react';

interface ActionButtonsProps {
  onSave: () => void;
  onDownload: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onDownload,
}) => {
  return (
    <div className="fixed top-4 right-4 z-10">
      <div className="flex items-center gap-3">        
        <button 
          onClick={onSave}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Save size={16} />
          Save
        </button>
        
        <button 
          onClick={onDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Download size={16} />
          Download
        </button>
        
        <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700">
          <BookOpen size={16} />
          Library
        </button>
      </div>
    </div>
  );
};
