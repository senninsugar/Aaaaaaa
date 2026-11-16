import { SEARCH_ENGINES, isSecure } from './url.js';
import { NEW_TAB_TITLE } from './navigation.js';

const LOCK_ICON = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const SEARCH_ICON = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.3-4.3"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

export function createView(doc, handlers, quickLinks) {
    const $ = (id) => doc.getElementById(id);
    const el = {
        body: doc.body,
        tabs: $('tabs'),
        newTab: $('new-tab'),
        back: $('back'),
        forward: $('forward'),
        reload: $('reload'),
        settingsBtn: $('settings-btn'),
        addressForm: $('address-form'),
        address: $('address'),
        addressIcon: $('address-icon'),
        progress: $('progress'),
        viewport: $('viewport'),
        newtab: $('newtab'),
        newtabForm: $('newtab-form'),
        newtabSearch: $('newtab-search'),
        shortcuts: $('shortcuts'),
        lock: $('lock-modal'),
        lockForm: $('lock-form'),
        lockPassword: $('lock-password'),
        lockError: $('lock-error'),
        settings: $('settings-modal'),
        settingsForm: $('settings-form'),
        setSearch: $('set-search'),
        setProxy: $('set-httpproxy'),
        setShuffle: $('set-shuffle'),
        settingsClose: $('settings-close'),
        sessionReset: $('session-reset'),
        passwordClear: $('password-clear'),
        toast: $('toast')
    };

    let addressFocused = false;
    let lastBrowser = null;
    let toastTimer = 0;

    Object.entries(SEARCH_ENGINES).forEach(([key, engine]) => {
        const option = doc.createElement('option');
        option.value = key;
        option.textContent = engine.label;
        el.setSearch.appendChild(option);
    });

    el.newTab.addEventListener('click', () => handlers.newTab());
    el.back.addEventListener('click', () => handlers.back());
    el.forward.addEventListener('click', () => handlers.forward());
    el.reload.addEventListener('click', () => handlers.reload());
    el.settingsBtn.addEventListener('click', () => handlers.openSettings());

    el.addressForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handlers.navigate(el.address.value);
        el.address.blur();
    });
    el.address.addEventListener('focus', () => {
        addressFocused = true;
        el.address.select();
    });
    el.address.addEventListener('blur', () => {
        addressFocused = false;
        if (lastBrowser) render(lastBrowser);
    });
    el.address.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') el.address.blur();
    });

    el.newtabForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handlers.navigate(el.newtabSearch.value);
        el.newtabSearch.value = '';
    });

    el.lockForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handlers.unlock(el.lockPassword.value.trim());
    });

    el.settingsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handlers.saveSettings(readSettings());
    });
    el.settingsClose.addEventListener('click', hideSettings);
    el.settings.addEventListener('click', (event) => {
        if (event.target === el.settings) hideSettings();
    });
    el.sessionReset.addEventListener('click', () => handlers.resetSession());
    el.passwordClear.addEventListener('click', () => handlers.clearPassword());

    renderShortcuts(quickLinks || []);

    function renderShortcuts(links) {
        el.shortcuts.replaceChildren(
            ...links.map((link) => {
                const button = doc.createElement('button');
                button.type = 'button';
                button.className = 'shortcut';
                const icon = doc.createElement('span');
                icon.className = 'shortcut-icon';
                icon.textContent = link.name.charAt(0);
                const label = doc.createElement('span');
                label.textContent = link.name;
                button.append(icon, label);
                button.addEventListener('click', () => handlers.openUrl(link.url));
                return button;
            })
        );
    }

    function tabNode(tab, active) {
        const node = doc.createElement('div');
        node.className = 'tab' + (active ? ' active' : '') + (tab.loading ? ' loading' : '');
        node.setAttribute('role', 'tab');
        node.setAttribute('aria-selected', String(active));
        node.title = tab.title;

        const dot = doc.createElement('span');
        dot.className = 'tab-dot';
        const title = doc.createElement('span');
        title.className = 'tab-title';
        title.textContent = tab.title || NEW_TAB_TITLE;
        const close = doc.createElement('button');
        close.type = 'button';
        close.className = 'icon-btn tab-close';
        close.setAttribute('aria-label', 'タブを閉じる');
        close.innerHTML = CLOSE_ICON;

        close.addEventListener('click', (event) => {
            event.stopPropagation();
            handlers.close(tab.id);
        });
        node.addEventListener('click', () => handlers.activate(tab.id));
        node.addEventListener('mousedown', (event) => {
            if (event.button === 1) {
                event.preventDefault();
                handlers.close(tab.id);
            }
        });
        node.append(dot, title, close);
        return node;
    }

    function render(browser) {
        lastBrowser = browser;
        const tab = browser.active;
        const dest = browser.current(tab);

        el.tabs.replaceChildren(...browser.tabs.map((item) => tabNode(item, item.id === browser.activeId)));
        el.back.disabled = !(tab && tab.index > 0);
        el.forward.disabled = !(tab && tab.index < tab.history.length - 1);
        el.reload.disabled = !dest;
        el.newtab.hidden = Boolean(dest);
        el.progress.classList.toggle('on', Boolean(tab && tab.loading));
        if (!addressFocused) el.address.value = dest || '';
        el.addressIcon.innerHTML = dest && isSecure(dest) ? LOCK_ICON : SEARCH_ICON;
        doc.title = dest && tab.title ? tab.title + ' · SenninProxy' : 'SenninProxy';
    }

    function toast(message) {
        el.toast.textContent = message;
        el.toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            el.toast.hidden = true;
        }, 2600);
    }

    function showLock(message) {
        el.lockError.textContent = message || '';
        el.lockError.hidden = !message;
        el.lockPassword.value = '';
        el.lock.hidden = false;
        el.lockPassword.focus();
    }

    function hideLock() {
        el.lock.hidden = true;
        el.lockPassword.value = '';
    }

    function openSettings(settings) {
        el.setSearch.value = settings.searchEngine;
        el.setProxy.value = settings.httpProxy || '';
        el.setShuffle.checked = Boolean(settings.shuffle);
        el.settings.hidden = false;
    }

    function hideSettings() {
        el.settings.hidden = true;
    }

    function readSettings() {
        return {
            searchEngine: el.setSearch.value,
            httpProxy: el.setProxy.value.trim(),
            shuffle: el.setShuffle.checked
        };
    }

    function setReady(ready) {
        el.body.classList.toggle('not-ready', !ready);
    }

    function focusAddress() {
        el.address.focus();
        el.address.select();
    }

    return {
        render,
        toast,
        showLock,
        hideLock,
        openSettings,
        hideSettings,
        setReady,
        focusAddress
    };
}
