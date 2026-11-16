let password = '';

export class AuthError extends Error {}

export const setPassword = (value) => {
    password = value || '';
};

async function call(path, params = {}) {
    const url = new URL(path, location.origin);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
    if (password) url.searchParams.set('pwd', password);

    let res;
    try {
        res = await fetch(url, { cache: 'no-store' });
    } catch {
        throw new Error('サーバーに接続できません');
    }
    const text = await res.text();
    if (res.status === 403) throw new AuthError(text);
    if (!res.ok) throw new Error(text || 'HTTP ' + res.status);
    return text;
}

export const sessionExists = async (id) => (await call('/sessionexists', { id })) === 'exists';

export const newSession = () => call('/newsession');

export const deleteSession = (id) => call('/deletesession', { id });

export const editSession = (id, httpProxy, shuffle) =>
    call('/editsession', {
        id,
        httpProxy: httpProxy || undefined,
        enableShuffling: shuffle ? '1' : '0'
    });

export async function getDictionary(id) {
    const text = await call('/api/dictionary', { id });
    try {
        return JSON.parse(text) || null;
    } catch {
        return null;
    }
}
