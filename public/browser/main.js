import * as api from './api.js';
import { store } from './store.js';
import { Browser } from './navigation.js';
import { createView } from './view.js';
import { toDestination } from './url.js';

const QUICK_LINKS = [
    { name: 'Wikipedia', url: 'https://ja.wikipedia.org/' },
    { name: 'YouTube', url: 'https://www.youtube.com/' },
    { name: 'GitHub', url: 'https://github.com/' },
    { name: 'Yahoo! JAPAN', url: 'https://www.yahoo.co.jp/' },
    { name: 'Reddit', url: 'https://www.reddit.com/' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com/' }
];

const browser = new Browser(document.getElementById('viewport'), () => changed());

const view = createView(
    document,
    {
        navigate: (text) => {
            const dest = toDestination(text, store.getSettings().searchEngine);
            if (dest) browser.navigate(dest);
        },
        openUrl: (url) => browser.navigate(url),
        newTab: () => {
            browser.addTab();
            view.focusAddress();
        },
        activate: (id) => browser.activate(id),
        close: (id) => browser.closeTab(id),
        back: () => browser.back(),
        forward: () => browser.forward(),
        reload: () => browser.reload(),
        openSettings: () => view.openSettings(store.getSettings()),
        saveSettings,
        resetSession,
        clearPassword,
        unlock
    },
    QUICK_LINKS
);

function changed() {
    if (!browser.sid) return;
    store.setTabs(browser.snapshot());
    view.render(browser);
}

function fail(error) {
    if (error instanceof api.AuthError) {
        view.showLock(store.getPassword() ? 'パスワードが違います' : 'このプロキシはパスワードで保護されています');
        return;
    }
    view.toast(error.message);
}

async function resolveSession() {
    const saved = store.getSession();
    if (saved && (await api.sessionExists(saved))) return saved;
    const sid = await api.newSession();
    store.setSession(sid);
    return sid;
}

async function connect() {
    const sid = await resolveSession();
    const { httpProxy, shuffle } = store.getSettings();
    await api.editSession(sid, httpProxy, shuffle);
    const dictionary = shuffle ? await api.getDictionary(sid) : null;
    return { sid, dictionary };
}

async function start() {
    view.setReady(false);
    api.setPassword(store.getPassword());
    try {
        const { sid, dictionary } = await connect();
        view.hideLock();
        const first = !browser.sid;
        browser.init(sid, dictionary);
        if (first && !browser.restore(store.getTabs())) browser.addTab();
        view.setReady(true);
        changed();
    } catch (error) {
        fail(error);
    }
}

async function unlock(password) {
    if (!password) {
        view.showLock('パスワードを入力してください');
        return;
    }
    api.setPassword(password);
    store.setPassword(password);
    await start();
}

async function saveSettings(values) {
    store.setSettings(values);
    try {
        await api.editSession(browser.sid, values.httpProxy, values.shuffle);
        browser.setDictionary(values.shuffle ? await api.getDictionary(browser.sid) : null);
        view.hideSettings();
        view.toast('設定を保存しました');
    } catch (error) {
        fail(error);
    }
}

async function resetSession() {
    if (!window.confirm('セッションをリセットします。保存されたログイン情報とクッキーは消去されます。')) return;
    try {
        await api.deleteSession(browser.sid).catch(() => {});
        const sid = await api.newSession();
        store.setSession(sid);
        const { httpProxy, shuffle } = store.getSettings();
        await api.editSession(sid, httpProxy, shuffle);
        browser.reset(sid, shuffle ? await api.getDictionary(sid) : null);
        view.hideSettings();
        view.toast('セッションをリセットしました');
    } catch (error) {
        fail(error);
    }
}

function clearPassword() {
    store.setPassword('');
    api.setPassword('');
    view.toast('保存済みのパスワードを消去しました');
}

function cycleTab(step) {
    if (browser.tabs.length < 2) return;
    const index = browser.tabs.findIndex((tab) => tab.id === browser.activeId);
    const next = browser.tabs[(index + step + browser.tabs.length) % browser.tabs.length];
    browser.activate(next.id);
}

document.addEventListener('keydown', (event) => {
    if (!browser.sid) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (mod && !event.shiftKey && key === 't') {
        event.preventDefault();
        browser.addTab();
        view.focusAddress();
    } else if (mod && key === 'w') {
        event.preventDefault();
        if (browser.activeId !== null) browser.closeTab(browser.activeId);
    } else if (mod && key === 'l') {
        event.preventDefault();
        view.focusAddress();
    } else if ((mod && key === 'r') || key === 'f5') {
        event.preventDefault();
        browser.reload();
    } else if (event.altKey && key === 'arrowleft') {
        event.preventDefault();
        browser.back();
    } else if (event.altKey && key === 'arrowright') {
        event.preventDefault();
        browser.forward();
    } else if (event.ctrlKey && key === 'tab') {
        event.preventDefault();
        cycleTab(event.shiftKey ? -1 : 1);
    }
});

setInterval(() => browser.sync(), 700);

start();
