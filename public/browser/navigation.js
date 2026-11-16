import { StrShuffler, shuffledIndicator } from './shuffler.js';
import { hostOf } from './url.js';

export const NEW_TAB_TITLE = '新しいタブ';

const LOAD_TIMEOUT = 30000;

const FRAME_ALLOW = 'clipboard-read; clipboard-write; fullscreen; autoplay; encrypted-media; picture-in-picture';

const safe = (fn) => {
    try {
        return fn();
    } catch {
        return null;
    }
};

export class Browser {
    constructor(viewport, onChange) {
        this.viewport = viewport;
        this.onChange = onChange;
        this.sid = null;
        this.shuffler = null;
        this.tabs = [];
        this.activeId = null;
        this.nextId = 1;
    }

    init(sid, dictionary) {
        this.sid = sid;
        this.setDictionary(dictionary);
    }

    setDictionary(dictionary) {
        this.shuffler = dictionary ? new StrShuffler(dictionary) : null;
    }

    reset(sid, dictionary) {
        this.tabs.forEach((tab) => tab.frame && tab.frame.remove());
        this.tabs = [];
        this.activeId = null;
        this.init(sid, dictionary);
        this.addTab();
    }

    get active() {
        return this.tabs.find((tab) => tab.id === this.activeId) || null;
    }

    current(tab = this.active) {
        return tab && tab.index >= 0 ? tab.history[tab.index] : null;
    }

    addTab() {
        const tab = {
            id: this.nextId++,
            history: [],
            index: -1,
            title: NEW_TAB_TITLE,
            frame: null,
            pending: null,
            loading: false,
            startedAt: 0
        };
        this.tabs.push(tab);
        this.activate(tab.id);
        return tab;
    }

    activate(id) {
        const tab = this.tabs.find((item) => item.id === id);
        if (!tab) return;
        this.activeId = id;
        const dest = this.current(tab);
        if (!tab.frame && dest) this.mount(tab, dest, 'restore');
        this.refresh();
    }

    navigate(dest) {
        const tab = this.active || this.addTab();
        tab.history = tab.history.slice(0, tab.index + 1).concat(dest);
        tab.index = tab.history.length - 1;
        this.mount(tab, dest, 'new');
        this.refresh();
    }

    back() {
        const tab = this.active;
        if (!tab || tab.index <= 0) return;
        tab.index -= 1;
        this.mount(tab, this.current(tab), 'history');
        this.refresh();
    }

    forward() {
        const tab = this.active;
        if (!tab || tab.index >= tab.history.length - 1) return;
        tab.index += 1;
        this.mount(tab, this.current(tab), 'history');
        this.refresh();
    }

    reload() {
        const tab = this.active;
        const dest = this.current(tab);
        if (!dest) return;
        this.mount(tab, dest, 'history');
        this.refresh();
    }

    closeTab(id) {
        const index = this.tabs.findIndex((tab) => tab.id === id);
        if (index === -1) return;
        const [tab] = this.tabs.splice(index, 1);
        if (tab.frame) tab.frame.remove();
        if (this.activeId === id) {
            this.activeId = null;
            const next = this.tabs[index] || this.tabs[index - 1];
            if (next) this.activate(next.id);
            else this.addTab();
        }
        this.refresh();
    }

    snapshot() {
        return {
            active: this.tabs.findIndex((tab) => tab.id === this.activeId),
            tabs: this.tabs.map((tab) => ({ history: tab.history, index: tab.index, title: tab.title }))
        };
    }

    restore(saved) {
        if (!saved || !Array.isArray(saved.tabs) || saved.tabs.length === 0) return false;
        this.tabs = saved.tabs.map((item) => {
            const history = Array.isArray(item.history) ? item.history.filter((url) => typeof url === 'string') : [];
            const index = history.length ? Math.min(Math.max(Number(item.index) || 0, 0), history.length - 1) : -1;
            const title = typeof item.title === 'string' && item.title ? item.title : NEW_TAB_TITLE;
            return { id: this.nextId++, history, index, title, frame: null, pending: null, loading: false, startedAt: 0 };
        });
        const target = this.tabs[saved.active] || this.tabs[0];
        this.activate(target.id);
        return true;
    }

    sync() {
        const tab = this.active;
        if (!tab || !tab.frame || tab.index < 0 || !tab.frame.getAttribute('src')) return;
        if (tab.loading) {
            if (Date.now() - tab.startedAt > LOAD_TIMEOUT) this.stopLoading(tab);
            return;
        }
        const dest = this.readDestination(tab);
        if (!dest) return;
        let changed = false;
        if (dest !== this.current(tab)) {
            this.pushIfNew(tab, dest);
            changed = true;
        }
        const title = this.readTitle(tab);
        if (title && title !== tab.title) {
            tab.title = title;
            changed = true;
        }
        if (changed) this.refresh();
    }

    stopLoading(tab) {
        const dest = this.current(tab);
        tab.pending = null;
        tab.loading = false;
        if (tab.title === NEW_TAB_TITLE && dest) tab.title = hostOf(dest);
        this.refresh();
    }

    mount(tab, dest, mode) {
        if (!tab.frame) tab.frame = this.createFrame(tab);
        tab.pending = mode;
        tab.loading = true;
        tab.startedAt = Date.now();
        tab.frame.src = this.proxied(dest);
    }

    createFrame(tab) {
        const frame = document.createElement('iframe');
        frame.className = 'page';
        frame.setAttribute('allow', FRAME_ALLOW);
        frame.addEventListener('load', () => this.handleLoad(tab));
        this.viewport.appendChild(frame);
        return frame;
    }

    handleLoad(tab) {
        if (!tab.frame || !tab.frame.getAttribute('src')) return;
        const dest = this.readDestination(tab);
        if (!dest) return;
        if (tab.pending) {
            tab.history[tab.index] = dest;
        } else {
            this.pushIfNew(tab, dest);
        }
        tab.pending = null;
        tab.loading = false;
        tab.title = this.readTitle(tab) || hostOf(dest);
        this.refresh();
    }

    pushIfNew(tab, dest) {
        if (dest === this.current(tab)) return;
        tab.history = tab.history.slice(0, tab.index + 1).concat(dest);
        tab.index = tab.history.length - 1;
    }

    proxied(dest) {
        return '/' + this.sid + '/' + (this.shuffler ? this.shuffler.shuffle(dest) : dest);
    }

    readDestination(tab) {
        const frame = tab.frame;
        const href = safe(() => frame.contentWindow.location.href);
        if (!href || href === 'about:blank') return null;
        const parsed = safe(() => {
            const hammerhead = frame.contentWindow['%hammerhead%'];
            return hammerhead && hammerhead.utils.url.parseProxyUrl(href);
        });
        if (parsed && /^https?:\/\//i.test(parsed.destUrl || '')) return parsed.destUrl;
        return this.unproxy(href);
    }

    unproxy(href) {
        const marker = '/' + this.sid + '/';
        const at = href.indexOf(marker);
        if (at === -1 && href.startsWith(location.origin)) return null;
        let path = at === -1 ? href : href.slice(at + marker.length);
        if (path.startsWith(shuffledIndicator)) {
            if (!this.shuffler) return null;
            path = this.shuffler.unshuffle(path);
        }
        return /^https?:\/\//i.test(path) ? path : null;
    }

    readTitle(tab) {
        return safe(() => tab.frame.contentDocument.title) || '';
    }

    syncFrames() {
        this.tabs.forEach((tab) => {
            if (tab.frame) tab.frame.classList.toggle('visible', tab.id === this.activeId && tab.index >= 0);
        });
    }

    refresh() {
        this.syncFrames();
        this.onChange(this);
    }
}
