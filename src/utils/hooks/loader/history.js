const KEY = 'browsingHistory';
const MAX = 500;

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

const save = (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
};

export const addHistory = (url) => {
  if (!url || url === 'tabs://new' || url === 'about:blank') return;
  const list = getHistory();
  if (list[0]?.url === url) return;
  save([{ id: crypto.randomUUID(), url, title: url, time: Date.now() }, ...list].slice(0, MAX));
};

export const setHistoryTitle = (url, title) => {
  if (!url || !title) return;
  const list = getHistory();
  const idx = list.findIndex((h) => h.url === url);
  if (idx === -1 || list[idx].title === title) return;
  list[idx] = { ...list[idx], title };
  save(list);
};

export const removeHistory = (id) => save(getHistory().filter((h) => h.id !== id));
export const clearHistory = () => save([]);
