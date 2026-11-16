const KEYS = {
    session: 'rhb.session',
    password: 'rhb.password',
    settings: 'rhb.settings',
    tabs: 'rhb.tabs'
};

const DEFAULT_SETTINGS = {
    searchEngine: 'duckduckgo',
    httpProxy: '',
    shuffle: true
};

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
}

export const store = {
    getSession() {
        return localStorage.getItem(KEYS.session) || '';
    },
    setSession(id) {
        localStorage.setItem(KEYS.session, id);
    },
    getPassword() {
        return localStorage.getItem(KEYS.password) || '';
    },
    setPassword(value) {
        if (value) localStorage.setItem(KEYS.password, value);
        else localStorage.removeItem(KEYS.password);
    },
    getSettings() {
        return { ...DEFAULT_SETTINGS, ...readJson(KEYS.settings, {}) };
    },
    setSettings(value) {
        writeJson(KEYS.settings, value);
    },
    getTabs() {
        return readJson(KEYS.tabs, null);
    },
    setTabs(value) {
        writeJson(KEYS.tabs, value);
    }
};
