import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Search, Clock } from 'lucide-react';
import loaderStore from '/src/utils/hooks/loader/useLoaderStore';
import { getHistory, removeHistory, clearHistory } from '/src/utils/hooks/loader/history';
import '/src/styles/chrome.css';

const fmt = (t) =>
  new Date(t).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const HistoryPanel = ({ isOpen, onClose }) => {
  const { tabs, updateUrl, setLoading } = loaderStore();
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');

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

  return createPortal(
    <div className="cm-backdrop flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="cm-dialog w-full max-w-xl max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cm-header">
          <h2 className="cm-title">履歴</h2>
          <div className="flex items-center gap-1">
            <button type="button" onClick={clear} className="cm-text-btn">
              閲覧履歴を消去
            </button>
            <button type="button" onClick={onClose} className="cm-icon-btn" aria-label="閉じる">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-3">
          <div className="cm-search">
            <Search size={15} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="履歴を検索"
            />
          </div>
        </div>

        <div className="cm-divider" />

        <div className="cm-scroll p-2">
          {filtered.length === 0 && <p className="cm-empty">履歴はありません</p>}
          {filtered.map((h) => (
            <div key={h.id} className="cm-row group">
              <Clock size={16} className="shrink-0" style={{ color: '#5f6368' }} />
              <button type="button" onClick={() => open(h.url)} className="flex-1 min-w-0 text-left">
                <div className="truncate text-sm" style={{ color: '#202124' }}>
                  {h.title}
                </div>
                <div className="truncate cm-row-sub">{fmt(h.time)}</div>
              </button>
              <button
                type="button"
                onClick={() => remove(h.id)}
                className="cm-icon-btn opacity-0 group-hover:opacity-100"
                aria-label="削除"
              >
                <Trash2 size={15} />
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
