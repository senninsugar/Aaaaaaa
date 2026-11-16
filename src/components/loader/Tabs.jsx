import loaderStore from '/src/utils/hooks/loader/useLoaderStore';
import { Globe, X, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import '/src/styles/chrome.css';

const MAX_TABS = 20;

// shows the page's favicon, or the globe icon when there is none / it fails to load
const TabFavicon = ({ src }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return <Globe size={14} className="chrome-tab-icon" />;
  }

  return (
    <img
      src={src}
      alt=""
      draggable="false"
      className="chrome-tab-favicon"
      onError={() => setFailed(true)}
    />
  );
};

const TabBar = () => {
  const { tabs, addTab, removeTab, setActive, setLastActive, showUI, newTabId } = loaderStore();

  return (
    <div className={clsx('chrome-strip', showUI ? 'flex' : 'hidden')}>
      <div className="chrome-tabs">
        {tabs.map(({ title, id, active, isLoading, url, favicon }) => {
          const isNewPage = url === 'tabs://new';
          const showSpinner = isLoading && !isNewPage;
          const isEntering = id === newTabId;

          return (
            <div
              key={id}
              role="tab"
              aria-selected={active}
              className={clsx(
                'chrome-tab',
                active && 'is-active',
                isEntering && 'is-entering',
              )}
              onClick={() => setActive(id)}
              onMouseDown={(e) => {
                // middle click closes the tab, like Chrome
                if (e.button === 1 && tabs.length > 1) {
                  e.preventDefault();
                  active && setLastActive(id);
                  removeTab(id);
                }
              }}
            >
              {showSpinner ? (
                <span className="chrome-spinner" />
              ) : (
                <TabFavicon src={isNewPage ? null : favicon} />
              )}

              <span className="chrome-tab-title">{isNewPage ? '新しいタブ' : title}</span>

              <span
                role="button"
                aria-label="タブを閉じる"
                className={clsx('chrome-tab-close', tabs.length < 2 && 'is-disabled')}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tabs.length > 1) {
                    active && setLastActive(id);
                    removeTab(id);
                  }
                }}
              >
                <X size={13} />
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="新しいタブ"
        title="新しいタブ"
        disabled={tabs.length >= MAX_TABS}
        className="chrome-new-tab"
        onClick={() => {
          if (tabs.length < MAX_TABS) {
            const uuid = crypto.randomUUID();
            addTab({
              title: '新しいタブ',
              id: uuid,
              url: 'tabs://new',
            });
            setActive(uuid);
          }
        }}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default TabBar;
