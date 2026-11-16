import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, CircleX, History, Star, Maximize, EyeOff, Code, Home, Settings,
} from 'lucide-react';
import { useOptions } from '/src/utils/optionsContext';
import loaderStore from '/src/utils/hooks/loader/useLoaderStore';
import Zoom from './menu/Zoom';
import Bookmarks from '../Bookmarks';
import HistoryPanel from '../HistoryPanel';
import SettingsPanel from '../SettingsPanel';

const devTools = (fr) => {
  if (!fr?.contentWindow || !fr?.contentDocument) return;

  try {
    const doc = fr.contentDocument;
    const win = fr.contentWindow;
    const erudaEl = doc.getElementById('eruda');

    if (erudaEl?.shadowRoot) {
      win.eruda?.destroy();
      return;
    }

    const s = doc.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/eruda';
    s.onload = () => {
      win.eruda?.init();
      win.eruda?.show();
      win.eruda?.show('elements');
      setTimeout(() => {
        const root = doc.getElementById('eruda')?.shadowRoot;
        root?.querySelector('div.eruda-entry-btn')?.remove();
      }, 100);
    };
    doc.body.appendChild(s);
  } catch (e) {
    console.error(e);
  }
};

export default function Menu() {
  const {
    showMenu,
    toggleMenu,
    tabs,
    addTab,
    setActive,
    removeTab,
    showTabs,
    activeFrameRef,
    toggleUI,
  } = loaderStore();
  const { options } = useOptions();
  const nav = useNavigate();
  const [showBookmarks, setShowBm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const newTab = useCallback(() => {
    if (tabs.length < 20) {
      const uuid = crypto.randomUUID();
      addTab({ title: '新しいタブ', id: uuid, url: 'tabs://new' });
      setActive(uuid);
    }
  }, [tabs.length]);

  const fs = useCallback(() => {
    activeFrameRef?.current && activeFrameRef.current?.requestFullscreen?.();
  }, [activeFrameRef]);

  const clearTabs = useCallback(() => {
    tabs.forEach((tab) => removeTab(tab.id));
    newTab();
  }, [tabs, removeTab, newTab]);

  const togEruda = useCallback(() => {
    activeFrameRef?.current && devTools(activeFrameRef.current);
  }, [activeFrameRef]);

  const items = [
    { name: '新しいタブ', shortcut: 'Alt + N', icon: Plus, fn: newTab },
    { name: 'すべてのタブを閉じる', shortcut: 'Alt + C', icon: CircleX, fn: clearTabs, divider: true },
    { name: '履歴', shortcut: 'Alt + H', icon: History, fn: () => setShowHistory(true) },
    { name: 'お気に入り', shortcut: 'Alt + B', icon: Star, fn: () => setShowBm(true), divider: true },
    { name: '全画面表示', shortcut: 'Shift + F', icon: Maximize, fn: fs, disabled: !activeFrameRef?.current },
    { name: 'zoom-cmpn', isComponent: true, divider: true },
    { name: 'UIを非表示', shortcut: 'Alt + Z', icon: EyeOff, fn: toggleUI },
    {
      name: '開発者ツール',
      shortcut: 'Alt + I',
      icon: Code,
      fn: togEruda,
      disabled: !activeFrameRef?.current,
      divider: true,
    },
    { name: '設定', shortcut: 'Alt + ,', icon: Settings, fn: () => setShowSettings(true) },
    { name: 'ホームに戻る', icon: Home, fn: () => nav('/') },
  ];

  useEffect(() => {
    const shortcuts = {
      'alt+n': newTab,
      'alt+c': clearTabs,
      'alt+h': () => setShowHistory(true),
      'shift+F': () => activeFrameRef?.current && fs(),
      'alt+z': toggleUI,
      'alt+i': togEruda,
      'alt+b': () => setShowBm(true),
      'alt+,': () => setShowSettings(true),
    };

    const handleKey = (e) => {
      const key = `${e.altKey ? 'alt+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key}`;
      const action = shortcuts[key];

      if (action) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [newTab, clearTabs, fs, activeFrameRef, toggleUI, togEruda]);

  const light = options.type === 'light';

  const cnt = clsx(
    'absolute right-2 w-72 rounded-xl shadow-2xl overflow-hidden text-sm z-50 p-1.5',
    'border transition-all duration-200 origin-top-right',
    showTabs ? 'mt-21' : 'mt-11',
    showMenu ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none',
  );

  const item = clsx(
    'w-full flex items-center gap-3 text-left text-[0.82rem] px-3 py-2 rounded-md focus:outline-none',
    light ? 'hover:bg-gray-100' : 'hover:bg-[#ffffff12]',
  );

  return (
    <>
      <Bookmarks isOpen={showBookmarks} onClose={() => setShowBm(false)} inLoader={true} />
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <div
        className={cnt}
        style={{
          backgroundColor: options.menuColor || '#1a252f',
          borderColor: light ? '#e5e7eb' : '#374151',
        }}
      >
        {items.map(
          ({ name, shortcut = null, divider = null, fn = null, disabled = false, isComponent = false, icon: Icon }, id) => (
            <div key={id} className={clsx(disabled ? 'opacity-50 pointer-events-none' : '')}>
              {isComponent ? (
                <div className="px-1 py-1">
                  <Zoom />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    !disabled && fn();
                    showMenu && toggleMenu();
                  }}
                  className={item}
                >
                  {Icon && <Icon size={15} className="shrink-0 opacity-80" />}
                  <span className="flex-1">{name}</span>
                  {shortcut && <span className="text-[0.7rem] opacity-50">{shortcut}</span>}
                </button>
              )}
              {divider && (
                <hr className={clsx('my-1 border-t', light ? 'border-gray-200' : 'border-gray-700')} />
              )}
            </div>
          ),
        )}
      </div>
    </>
  );
}
