import { useTheme } from '../../context/ThemeContext';
import { Palette, X, RotateCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ThemeCustomizer = ({ isOpen, onClose }) => {
  const { dark, setDark, customColors, updateCustomColor, resetTheme, saveThemeToDB } = useTheme();

  if (!isOpen) return null;

  const handleFinalSave = async () => {
    await saveThemeToDB(); // This saves it to MySQL + LocalStorage
    toast.success("Theme preference saved!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl p-6 border" 
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        
        <div className="flex justify-between mb-6">
          <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Palette size={18} /> Theme Editor
          </h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="space-y-6">
          {/* Accent Color Picker */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-muted)' }}>Brand Accent</label>
            <div className="flex items-center gap-3 p-2 rounded-2xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
              <input 
                type="color" 
                value={customColors['--accent'] || '#22c55e'} 
                onChange={(e) => updateCustomColor('--accent', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{customColors['--accent'] || '#22c55e'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button onClick={resetTheme} className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={handleFinalSave}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)' }}
            >
              <Check size={16} /> Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};