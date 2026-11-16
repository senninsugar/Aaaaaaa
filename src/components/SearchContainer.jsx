import clsx from 'clsx';
import { useState, useEffect, useRef, useCallback, useMemo, memo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideSearch, Earth } from 'lucide-react';
import { GlowWrapper } from '../utils/Glow';
import { useOptions } from '../utils/optionsContext';
import Logo from '../components/Logo';
import theme from '../styles/theming.module.css';
import 'movement.css';

const lightBar = {
  backgroundColor: '#ffffff',
  border: '1px solid #dfe1e5',
  color: '#202124',
  boxShadow: '0 1px 6px rgba(32,33,36,.28)',
};

const SearchContainer = memo(function SearchContainer({ logo = true, cls, nav = true, navigating, light = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);
  const latestQuery = useRef('');
  const navigate = useNavigate();
  const { options } = useOptions();

  const fetchResults = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    latestQuery.current = searchQuery;
    try {
      const response = await fetch('/return?q=' + encodeURIComponent(searchQuery));
      if (!response.ok) return setResults([]);

      const data = await response.json();
      if (latestQuery.current !== searchQuery) return;
      const list = Array.isArray(data) ? data.filter((i) => i.phrase).slice(0, 4) : [];
      startTransition(() => setResults(list));
    } catch {
      if (latestQuery.current === searchQuery) setResults([]);
    }
  }, []);

  const go = (strin) => {
    if (nav) {
      navigate('/search', {
        state: {
          url: strin,
        },
      });
    } else {
      const processedUrl = navigating.process(strin);
      if (processedUrl) {
        navigating.go(navigating.id, processedUrl);
      }
    }
  };

  const handleInputChange = useCallback(
    (e) => {
      const newQuery = e.target.value;
      setQuery(newQuery);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!newQuery.trim()) {
        latestQuery.current = '';
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(() => fetchResults(newQuery), 300);
    },
    [fetchResults],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== 'Enter') return;
      const trimmed = query.trim();
      if (!trimmed) return;
      go(trimmed);
    },
    [query, go],
  );

  const handleResultClick = useCallback(
    (phrase) => {
      go(phrase);
    },
    [go],
  );

  useEffect(() => {
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, []);

  const placeholder = useMemo(
    () => `${options.engineName || 'Google'} で検索、またはURLを入力`,
    [options.engineName],
  );

  const iconSrc = useMemo(
    () =>
      options.engineIcon ??
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/120px-Google_Favicon_2025.svg.png',
    [options.engineIcon],
  );

  const themeCls = `theme-${options.theme || 'default'}`;

  return (
    <div
      className={clsx(
        !cls ? 'absolute w-full px-20 py-4 flex flex-col items-center mt-8 z-50' : cls,
      )}
      data-m={!cls && !light && 'bounce-up'}
      data-m-duration={!cls && '0.8'}
    >
      {logo && <Logo black={light} options="w-[15.8rem] h-30" />}
      <GlowWrapper
        glowOptions={{
          color: light ? '0, 0, 0' : options.glowWrapperColor || '255, 255, 255',
          size: 70,
          opacity: light ? 0.06 : 0.2,
        }}
      >
        <div className="w-[40.625rem]">
          <div
            id="search-div"
            className={clsx(
              'flex items-center gap-3 pl-4 pr-4 w-full h-[3.41rem]',
              light ? 'hover:shadow-[0_1px_6px_rgba(32,33,36,.28)]' : 'shadow-xl',
              results.length ? 'rounded-t-[24px] rounded-b-none' : 'rounded-[24px]',
              !light && theme[`searchBarColor`],
              !light && theme[themeCls],
            )}
            style={light ? lightBar : undefined}
          >
            {iconSrc ? (
              <img src={iconSrc} className="w-5 h-5 shrink-0" alt="検索アイコン" loading="lazy" />
            ) : (
              <Earth size={22} />
            )}

            <input
              type="text"
              placeholder={placeholder}
              className={clsx(
                'flex-1 bg-transparent outline-hidden text-[16.5px] leading-[20px] placeholder:font-[Inter] placeholder:font-medium',
                light && 'placeholder:text-[#70757a]',
              )}
              autoComplete="off"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />

            <LucideSearch className="w-[1.08rem] h-[1.08rem] shrink-0" />
          </div>

          {results.length > 0 && (
            <div
              className={clsx(
                'mt-0 p-2 text-[14px] w-full rounded-b-[24px] space-y-1',
                light ? 'shadow-[0_4px_6px_rgba(32,33,36,.28)]' : 'shadow-xl',
                !light && theme[`searchResultStyle`],
                !light && theme[themeCls],
              )}
              style={light ? { ...lightBar, borderTop: 'none', boxShadow: lightBar.boxShadow } : undefined}
            >
              {results.map((result) => (
                <div
                  key={result.phrase}
                  className={clsx(
                    'rounded-[9px] w-full h-11 cursor-pointer duration-100 ease-in px-3 pl-2.5 flex items-center',
                    light ? 'hover:bg-[#f1f3f4]' : 'hover:bg-[#d4d4d418]',
                  )}
                  onClick={() => handleResultClick(result.phrase)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: '12px' }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <span className="text-[15px]">{result.phrase}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlowWrapper>
    </div>
  );
});

export default SearchContainer;
