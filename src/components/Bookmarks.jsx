import clsx from 'clsx';
import {
  X, Plus, Globe, Trash2, Pencil, Check, Image, PenLine,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useOptions } from '../utils/optionsContext';
import '../styles/chrome.css';
import loaderStore from '../utils/hooks/loader/useLoaderStore';
import { process } from '../utils/hooks/loader/utils';

const Bookmarks = ({ isOpen, onClose, inLoader = false }) => {
  const { options: o, updateOption } = useOptions();
  const nav = useNavigate();
  const { tabs, updateUrl, setLoading } = loaderStore();

  const [bms, setBms] = useState([]);
  const [url, setUrl] = useState('');
  const [nm, setNm] = useState('');
  const [ico, setIco] = useState('');
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [anim, setAnim] = useState(false);
  const [render, setRender] = useState(false);
  const [badIcons, setBadIcons] = useState(new Set());
  const [loadedIcons, setLoadedIcons] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setTimeout(() => setAnim(true), 10);
    } else {
      setAnim(false);
      setTimeout(() => setRender(false), 200);
    }
  }, [isOpen]);

  useEffect(() => setBms(o.bookmarks || []), [o.bookmarks]);

  const save = v => {
    setBms(v);
    updateOption({ bookmarks: v });
  };

  const uniq = (base, skip) => {
    let i = 1, n = base;
    const names = bms.filter(b => b.id !== skip).map(b => b.name);
    while (names.includes(n)) n = `${base} (${i++})`;
    return n;
  };

  const reset = () => {
    setUrl(''); setNm(''); setIco('');
    setEditId(null); setShowForm(false);
  };

  const add = () => {
    if (!url.trim()) return;
    const regex = u => (/^(https?:)?\/\//.test(u) ? u : `https://${u}`);
    save([...bms, {
      id: crypto.randomUUID(),
      name: uniq(nm.trim() || '新しいブックマーク'),
      url: regex(url.trim()),
      icon: ico.trim() ? regex(ico.trim()) : null,
    }]);
    reset();
  };

  const update = () => {
    if (!url.trim() || !editId) return;
    const regex = u => (/^(https?:)?\/\//.test(u) ? u : `https://${u}`);
    const oldBm = bms.find(b => b.id === editId);
    const newIcon = ico.trim() ? regex(ico.trim()) : null;
    
    if (oldBm && oldBm.icon !== newIcon) {
      setLoadedIcons(p => {
        const n = new Set(p);
        n.delete(editId);
        return n;
      });
      setBadIcons(p => {
        const n = new Set(p);
        n.delete(editId);
        return n;
      });
    }
    
    save(bms.map(b =>
      b.id === editId
        ? {
            ...b,
            name: uniq(nm.trim() || '新しいブックマーク', editId),
            url: regex(url.trim()),
            icon: newIcon,
          }
        : b
    ));
    reset();
  };

  const edit = b => {
    setEditId(b.id);
    setUrl(b.url);
    setNm(b.name);
    setIco(b.icon || '');
    setShowForm(true);
  };

  const del = id => save(bms.filter(b => b.id !== id));
  const fixUrl = u => (/^(https?:)?\/\//.test(u) ? u : `https://${u}`);

  if (!render) return null;

  return createPortal(
    <div
      className={clsx(
        'cm-backdrop flex items-center justify-center p-4 transition-opacity duration-200',
        anim ? 'opacity-100' : 'opacity-0',
      )}
      onClick={onClose}
    >
      <div
        className={clsx(
          'cm-dialog w-full max-w-2xl max-h-[80vh] transition-all duration-200',
          anim ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="cm-header">
          <div className="flex items-center gap-2">
            <h2 className="cm-title">
              {showForm ? (editId ? 'ブックマークを編集' : 'ブックマークを作成') : 'ブックマーク'}
            </h2>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="cm-icon-btn" aria-label="追加">
                <Plus size={18} />
              </button>
            )}
          </div>
          <button onClick={onClose} className="cm-icon-btn" aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        <div className="cm-scroll px-5 pb-5 max-h-[calc(80vh-4rem)]">
          {showForm ? (
            <div className="space-y-3">
              {[
                ['名前', nm, setNm, PenLine],
                ['URL', url, setUrl, Globe],
                ['アイコン URL（任意）', ico, setIco, Image],
              ].map(([ph, v, s, I], i) => (
                <div key={i}>
                  <label className="cm-label">{ph}</label>
                  <div className="cm-field">
                    <I size={16} />
                    <input value={v} onChange={e => s(e.target.value)} placeholder={ph} />
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={reset} className="cm-text-btn">
                  キャンセル
                </button>
                <button
                  onClick={editId ? update : add}
                  disabled={!url.trim()}
                  className="cm-filled-btn flex items-center gap-2"
                >
                  {editId ? <Check size={16} /> : <Plus size={16} />}
                  {editId ? '変更を保存' : '追加'}
                </button>
              </div>
            </div>
          ) : bms.length === 0 ? (
            <p className="cm-empty">ブックマークはまだありません。</p>
          ) : (
            <div className="space-y-1">
              {bms.map(b => (
                <div
                  key={b.id}
                  onClick={() => {
                    if (inLoader) {
                      const activeTab = tabs.find(t => t.active);
                      if (activeTab) {
                        const processedUrl = process(fixUrl(b.url), false, o.prType || 'auto', o.engine || null);
                        if (processedUrl) {
                          setLoading(activeTab.id, true);
                          updateUrl(activeTab.id, processedUrl);
                        }
                        onClose();
                      }
                    } else {
                      nav('/search', { state: { url: fixUrl(b.url) } });
                    }
                  }}
                  className="cm-row"
                >
                  <div className="w-4 h-4 relative flex-shrink-0">
                    {b.icon && !badIcons.has(b.id) ? (
                      <>
                        {!loadedIcons.has(b.id) && (
                          <div className="absolute inset-0 rounded bg-[#e8eaed] animate-pulse" />
                        )}
                        <img
                          src={b.icon}
                          className="w-4 h-4 relative"
                          alt=""
                          onLoad={() => setLoadedIcons(p => new Set(p).add(b.id))}
                          onError={() => setBadIcons(p => new Set(p).add(b.id))}
                        />
                      </>
                    ) : (
                      <Globe size={16} style={{ color: '#5f6368' }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: '#202124' }}>
                      {b.name}
                    </div>
                    <div className="text-xs truncate cm-row-sub">{b.url}</div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); edit(b); }}
                    className="cm-icon-btn"
                    aria-label="編集"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); del(b.id); }}
                    className="cm-icon-btn"
                    aria-label="削除"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Bookmarks;
