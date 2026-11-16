import { createPortal } from 'react-dom';
import { X, Globe, Check } from 'lucide-react';
import { useOptions } from '/src/utils/optionsContext';
import { searchConfig } from '/src/utils/config';

const SettingsPanel = ({ isOpen, onClose }) => {
  const { options, updateOption } = useOptions();
  if (!isOpen) return null;

  const light = options.type === 'light';
  const border = light ? '#e5e7eb' : '#374151';
  const hover = light ? 'hover:bg-gray-100' : 'hover:bg-[#ffffff0c]';
  const current = options.engineName || 'Google';

  const choose = (v) => {
    updateOption({
      engine: v.engine,
      engineName: v.engineName,
      engineIcon: v.engineIcon,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: options.menuColor || '#1a252f', borderColor: border }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: border }}>
          <h2 className="text-lg font-medium">設定</h2>
          <button onClick={onClose} className={`p-1 rounded-md ${hover}`}>
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3 pb-1 text-xs opacity-70">デフォルトの検索エンジン</div>
        <div className="overflow-y-auto p-2">
          {searchConfig.map((c) => {
            const v = c.value;
            const selected = v.engineName === current;
            return (
              <button
                key={c.option}
                onClick={() => choose(v)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left ${hover}`}
              >
                {v.engineIcon ? (
                  <img src={v.engineIcon} alt="" className="w-4 h-4 shrink-0" loading="lazy" />
                ) : (
                  <Globe size={16} className="shrink-0" />
                )}
                <span className="flex-1">{c.option}</span>
                {selected && <Check size={16} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SettingsPanel;
