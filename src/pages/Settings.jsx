import clsx from 'clsx';
import { useState, useMemo, useCallback, useEffect } from 'react';
import Nav from '../layouts/Nav';
import theme from '../styles/theming.module.css';
import { Search, HatGlasses, Palette, Globe, Wrench } from 'lucide-react';
import { useOptions } from '/src/utils/optionsContext';
import RenderSetting from '../components/Settings';

let asyncConfs = [];
const baseConfigs = [
  {
    name: 'Privacy',
    label: 'プライバシー',
    icon: HatGlasses,
    keywords: ['title', 'cloak', 'cloaking', 'tab cloak', 'about', 'about:blank', 'blank'],
    key: 'privacyConfig',
  },
  {
    name: 'Customize',
    label: 'カスタマイズ',
    icon: Palette,
    keywords: [
      'theme',
      'color',
      'appearance',
      'ui',
      'interface',
      'games',
      'pages',
      'apps',
      'scale',
      'nav',
      'navigation bar',
      'nav bar',
      'navbar',
      'size',
      'donate',
      'donation',
      'tabs bar',
      'tab bar',
    ],
    key: 'customizeConfig',
  },
  {
    name: 'Browsing',
    label: 'ブラウジング',
    icon: Globe,
    keywords: ['tabs', 'tab', 'type', 'search engine',],
    key: 'browsingConfig',
  },
  {
    name: 'Advanced',
    label: '詳細設定',
    icon: Wrench,
    keywords: [
      'wisp',
      'type',
      'bare',
      'leave confirm',
      'debug',
      'reset instance',
      'experimental',
      'inspect',
      'clear cache',
    ],
    key: 'advancedConfig',
  },
];

const Settings = () => {
  const { options, updateOption } = useOptions();
  const [q, setQ] = useState('');
  const [content, setContent] = useState('Privacy');

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let m = true;
    import('/src/data/settings.js').then((mod) => {
      if (!m) return;
      asyncConfs = baseConfigs.map((c) => ({ ...c, fn: mod[c.key] }));
      setLoaded(true);
    });
    return () => {
      m = false;
    };
  }, []);

  const settings = useMemo(
    () =>
      loaded
        ? asyncConfs.map(({ fn, ...c }) => ({
            ...c,
            items: Object.values(fn({ options, updateOption })).map(({ name, desc }) => ({
              name,
              desc,
            })),
          }))
        : [],
    [options, updateOption, loaded],
  );

  const fq = q.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      !fq
        ? settings
        : settings.filter(
            ({ name, keywords, items }) =>
              name.toLowerCase().includes(fq) ||
              keywords.some((kw) => kw.toLowerCase().includes(fq)) ||
              items.some((i) => i.name.toLowerCase().includes(fq)),
          ),
    [settings, fq],
  );

  const matchCount = useMemo(
    () =>
      settings.reduce(
        (c, s) => c + s.items.filter((i) => i.name.toLowerCase().includes(fq)).length,
        0,
      ),
    [settings, fq],
  );

  const showKeywordTip =
    !!fq &&
    filtered.length > 0 &&
    !filtered.some((s) => s.name.toLowerCase().includes(fq)) &&
    filtered.some((s) => s.keywords.some((kw) => kw.toLowerCase().includes(fq)));

  return (
    <div className="flex flex-col h-screen">
      <div className="shrink-0">
        <Nav />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={clsx(
            theme['settings-panelColor'],
            theme[`theme-${options.theme || 'default'}`],
            'w-60 shrink-0 overflow-y-auto p-2 pt-3',
          )}
        >
          <div
            className="flex items-center max-w-52 h-7 rounded-lg mx-auto px-2"
            style={{ backgroundColor: options.settingsSearchBar || '#3c475a' }}
          >
            <Search className="w-4 mr-1.5" />
            <input
              type="text"
              placeholder="設定を絞り込む"
              className="bg-transparent outline-hidden w-full text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {showKeywordTip && (
            <div className="mt-2 text-xs text-gray-400 text-center px-2">
              お探しの設定が含まれている可能性があります
            </div>
          )}
          {fq && matchCount > 1 && (
            <div className="mt-2 text-xs text-gray-400 text-center px-2">
              {matchCount} 件の設定が見つかりました
            </div>
          )}

          <div className="flex flex-col gap-3 mt-5">
            {filtered.map(({ name, icon: Icon, items }) => {
              const matched = fq ? items.filter((i) => i.name.toLowerCase().includes(fq)) : [];
              return (
                <div
                  key={name}
                  className={clsx(
                    'w-full flex flex-col rounded-xl duration-75 cursor-pointer px-5 py-2',
                    content !== name && 'bg-transparent hover:bg-[#ffffff23]',
                  )}
                  style={{
                    backgroundColor:
                      content === name
                        ? options.settingsPanelItemBackgroundColor || '#405a77'
                        : undefined,
                  }}
                  onClick={() => setContent((prev) => (prev === name ? '' : name))}
                >
                  <div className="flex items-center h-6">
                    <Icon className="w-5" />
                    <p className="mx-4">{label}</p>
                  </div>
                  {matched.length > 0 && (
                    <p className="ml-9 text-xs text-gray-400 truncate">
                      {matched.map((i) => i.name).join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {loaded ? (
          <RenderSetting setting={content} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm">読み込み中...</div>
        )}
      </div>
    </div>
  );
};

export default Settings;
