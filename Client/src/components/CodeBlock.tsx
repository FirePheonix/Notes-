import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Copy, Loader, Sparkles, X } from 'lucide-react';
import { Element } from '../types/canvas';

interface CodeBlockProps {
  element: Element;
  zoom: number;
  isSelected: boolean;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  onHeightChange: (height: number) => void;
  onExecute: () => void;
  onClose: () => void;
  onSelect: () => void;
  onDragStart: (elementId: string, e: React.MouseEvent) => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
];

export const CodeBlock: React.FC<CodeBlockProps> = ({
  element,
  zoom,
  isSelected,
  onCodeChange,
  onLanguageChange,
  onHeightChange,
  onExecute,
  onClose,
  onSelect,
  onDragStart,
}) => {
  const { id, x, y, width, height, code, codeLanguage, codeOutput, codeExplanation, isExecuting } = element;
  
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-grow textarea height based on content
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
    }
  }, [code, width]); // Re-run on code change or width change

  const handleTextareaBlur = () => {
    setIsEditing(false);
    // Persist final height to global state only when editing is done
    if (containerRef.current) {
      const newHeight = containerRef.current.offsetHeight;
      if (Math.abs(newHeight - height) > 1) {
        onHeightChange(newHeight);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea && code) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = code.substring(0, start) + '  ' + code.substring(end);
        onCodeChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      textareaRef.current?.blur();
    }
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    onDragStart(id, e);
  };
  
  const handleBodyMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      ref={containerRef}
      data-element-id={id} // For html2canvas to find this element
      className={`absolute bg-white border-2 rounded-lg shadow-xl flex flex-col transition-all`}
      style={{
        left: x,
        top: y,
        width: width,
        height: 'auto', // Let the content define the height
        minHeight: 150,
        fontFamily: 'sans-serif',
        pointerEvents: 'auto',
        outline: isSelected ? `2px solid #3b82f6` : 'none',
        outlineOffset: '2px',
      }}
      onMouseDown={handleBodyMouseDown}
    >
      <div 
        className="bg-gray-100 border-b border-gray-200 p-1.5 flex items-center justify-between text-xs text-gray-600 shrink-0 cursor-move"
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
          </div>
          <select
            value={codeLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-white border border-gray-300 px-1.5 py-0.5 rounded outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); copyToClipboard(); }} className="p-1 hover:bg-gray-200 rounded" title="Copy code"><Copy size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onExecute(); }} disabled={isExecuting} className="p-1 hover:bg-gray-200 rounded" title="Analyze with AI">
            {isExecuting ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 hover:bg-gray-200 rounded" title="Close"><X size={14} /></button>
        </div>
      </div>

      <div 
        className="bg-[#282c34] text-[#abb2bf] font-mono text-sm p-3 flex-shrink-0" 
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); textareaRef.current?.focus(); }}
      >
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onBlur={handleTextareaBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-inherit font-inherit resize-none outline-none p-0"
          placeholder="Enter your code here..."
          spellCheck={false}
        />
      </div>

      {(codeOutput || codeExplanation) && (
        <div className="border-t border-gray-200 text-xs flex-shrink-0">
          {codeOutput && (
            <div className="p-2 bg-gray-50">
              <div className="font-semibold text-gray-600 mb-1">OUTPUT:</div>
              <pre className="text-gray-800 whitespace-pre-wrap font-mono bg-white p-1.5 rounded border text-[11px] max-h-32 overflow-y-auto">{codeOutput}</pre>
            </div>
          )}
          {codeExplanation && (
            <div className="p-2 bg-blue-50/50 border-t border-gray-200">
              <div className="font-semibold text-blue-600 mb-1 flex items-center gap-1"><Sparkles size={12} /> AI EXPLANATION:</div>
              <div className="text-blue-800 leading-relaxed text-[11px] max-h-32 overflow-y-auto">{codeExplanation}</div>
            </div>
          )}
        </div>
      )}

      {isExecuting && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-purple-600">
            <Loader size={16} className="animate-spin" />
            <span className="font-medium text-sm">Analyzing...</span>
          </div>
        </div>
      )}
    </div>
  );
};
