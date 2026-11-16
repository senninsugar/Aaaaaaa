import loaderStore from '/src/utils/hooks/loader/useLoaderStore';
import { Globe, X, Plus, Loader } from 'lucide-react';
import { useOptions } from '/src/utils/optionsContext'
import clsx from 'clsx';

const TabBar = () => {
  const { tabs, addTab, removeTab, setActive, showTabs, setLastActive, showUI } = loaderStore();
  const { options } = useOptions();

  return (
    <div
      className={clsx(
        'h-10 items-end overflow-hidden gap-0.5 px-2 pt-1.5',
        showTabs && showUI ? 'flex' : 'hidden',
      )}
      style={{ backgroundColor: options.tabBarColor || '#070e15' }}
    >
      {tabs.map(({ title, id, active, isLoading, url }) => {
        const showGlobe = url === 'tabs://new' || !isLoading;
        return (
          <div
            className={clsx(
              'flex flex-1 flex-shrink px-2.5 h-full min-w-[60px] max-w-[200px]',
              'items-center rounded-t-lg duration-150 cursor-default',
              !active && 'hover:bg-[#ffffff0f]',
            )}
            onClick={() => setActive(id)}
            key={id}
            style={{
              backgroundColor: active ? options.barColor || '#09121e' : '',
            }}
          >
            {showGlobe ? (
              <Globe size={15} className="flex-shrink-0" />
            ) : (
              <Loader size={15} className="flex-shrink-0 animate-spin" />
            )}
            <span className="truncate text-[0.79rem] ml-1.5 min-w-0">
              {url === 'tabs://new' ? '新しいタブ' : title}
            </span>
            <X
              size={13}
              className={clsx(
                'ml-auto flex-shrink-0 duration-200 rounded-sm',
                tabs.length < 2 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[#ffffff1e]',
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (tabs.length > 1) {
                  active && setLastActive(id);
                  removeTab(id);
                }
              }}
            />
          </div>
        );
      })}

      <button
        disabled={tabs.length >= 20}
        className={clsx(
          'flex-none mx-1 mb-1 w-6 h-6 self-center',
          'flex items-center justify-center',
          'duration-100 rounded-full',
          options.type != 'light' ? 'hover:bg-[#ffffff1e]' : 'hover:bg-[#a7a7a7]',
          tabs.length >= 20 ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : '',
        )}
        onClick={() => {
          if (tabs.length < 20) {
            let uuid = crypto.randomUUID();
            addTab({
              title: '新しいタブ',
              id: uuid,
              url: "tabs://new"
            });
            setActive(uuid);
          }
        }}
      >
        <Plus size={15} />
      </button>
    </div>
  );
};

export default TabBar;
