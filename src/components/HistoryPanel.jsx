import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Search, Clock } from 'lucide-react';
import { useOptions } from '/src/utils/optionsContext';
import loaderStore from '/src/utils/hooks/loader/useLoaderStore';
import { getHistory, removeHistory, clearHistory } from '/src/utils/hooks/loader/history';

const fmt = (t) =>
  new Date(t).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const HistoryPanel = ({ isOpen, onClose }) => {
  const { options } = useOptions();
  const { tabs, updateUrl, setLoading } = loaderStore();
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const light = options.type === 'light';

  useEffect(() => {
    if (isOpen) {
      setList(getHistory());
      setQ('');
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return list;
    return list.filter((h) => `${h.title} ${h.url}`.toLowerCase().includes(k));
  }, [list, q]);

  if (!isOpen) return null;

  const open = (url) => {
    const active = tabs.find((t) => t.active);
    if (active) {
      setLoading(active.id, true);
      updateUrl(active.id, url);
    }
    onClose();
  };

  const remove = (id) => {
    removeHistory(id);
    setList(getHistory());
  };

  const clear = () => {
    clearHistory();
    setList([]);
  };

  const border = light ? '#e5e7eb' : '#374151';
  const hover = light ? 'hover:bg-gray-100' : 'hover:bg-[#ffffff0c]';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: options.menuColor || '#1a252f', borderColor: border }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: border }}>
          <h2 className="text-lg font-medium">履歴</h2>
          <div className="flex items-center gap-1">
            <button onClick={clear} className={`text-xs px-2 py-1 rounded-md ${hover}`}>
              履歴を消去
            </button>
            <button onClick={onClose} className={`p-1 rounded-md ${hover}`}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b" style={{ borderColor: border }}>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 border" style={{ borderColor: border }}>
            <Search size={14} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="履歴を検索"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="text-center text-sm opacity-60 py-10">履歴はありません</p>
          )}
          {filtered.map((h) => (
            <div key={h.id} className={`group flex items-center gap-3 px-3 py-2 rounded-md ${hover}`}>
              <Clock size={15} className="shrink-0 opacity-60" />
              <button onClick={() => open(h.url)} className="flex-1 min-w-0 text-left">
                <div className="truncate text-sm">{h.title}</div>
                <div className="truncate text-xs opacity-60">{fmt(h.time)}</div>
              </button>
              <button
                onClick={() => remove(h.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md"
                aria-label="削除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default HistoryPanel;
