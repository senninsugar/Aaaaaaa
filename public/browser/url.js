export const SEARCH_ENGINES = {
    duckduckgo: { label: 'DuckDuckGo', base: 'https://html.duckduckgo.com/html/?q=' },
    google: { label: 'Google', base: 'https://www.google.com/search?q=' },
    bing: { label: 'Bing', base: 'https://www.bing.com/search?q=' }
};

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\/\S/i;
const LOCAL = /^localhost(:\d+)?([/?#]|$)/i;
const IPV4 = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?([/?#]|$)/;
const DOMAIN = /^[^\s/?#:]+\.[a-z]{2,}(:\d+)?([/?#]|$)/i;

export function toDestination(input, engine = 'duckduckgo') {
    const text = String(input || '').trim();
    if (!text) return null;
    if (SCHEME.test(text)) return text;
    if (!/\s/.test(text)) {
        if (LOCAL.test(text) || IPV4.test(text)) return 'http://' + text;
        if (DOMAIN.test(text)) return 'https://' + text;
    }
    const base = (SEARCH_ENGINES[engine] || SEARCH_ENGINES.duckduckgo).base;
    return base + encodeURIComponent(text);
}

export function hostOf(dest) {
    try {
        return new URL(dest).hostname;
    } catch {
        return dest;
    }
}

export function isSecure(dest) {
    return /^https:\/\//i.test(dest);
}
