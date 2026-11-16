# rammerhead

> proxy based on testcafe-hammerhead (password is `sharkie4life`)

Demo link: https://demo-opensource.rammerhead.org

Polished closed-source-for-now browser version: https://browser.rammerhead.org (more links by awesome community members in the discord server at the end of readme)


## Supporting me and contributing

Server infrastructure costs money and developing this project consumes a lot of my time, so I would appreciate it greatly if you become a Patreon member: https://www.patreon.com/rammerhead


## Who is this package for

Package is for those who want a fully-configurable proxy that works on many sites

## Effectiveness of proxy

This proxy supports proxying
- basically everything except google logins

## Features of proxy

The proxy allows users to create a "session". When they access their session, their localStorage and cookies will be synced with rammerhead. This allows for accurately mocking cookied requests and conveniently save their logins even if they switch devices. This also enables users to configure a custom HTTP proxy server for rammerhead to connect to for the session.

## Installing and running

Rammerhead recommends you to have at least **node v16** to be installed. Once you installed nodejs, clone the repo, then run `npm install` and `npm run build`.

After, configure your settings in [src/config.js](src/config.js). If you wish to consistently pull updates from this repo without the hassle of merging, create `config.js` in the root folder so they override the configs in `src/`.

Finally run the following to start rammerhead: `node src/server.js`

## Browser UI

Opening the root page (`http://localhost:8080/`) shows a browser-style interface: tabs, back/forward/reload, an address bar that accepts either a URL or a search query, a new tab page with shortcuts, and a settings panel for search engine, HTTP proxy, URL shuffling, and session reset. Open tabs are restored after a reload. The original session manager remains available at `/classic.html`.

Keyboard shortcuts: `Ctrl+T` new tab, `Ctrl+W` close tab, `Ctrl+L` focus address bar, `Ctrl+R` / `F5` reload, `Alt+Left` / `Alt+Right` back / forward, `Ctrl+Tab` next tab. These work when the focus is on the browser chrome, not inside a loaded page.

The UI is built from plain files in `public/browser/` (ES modules, no build step). Saved passwords are stored in the browser's localStorage.

## Discord server

For any user-help non-issue related questions, especially pertaining to Rammerhead Browser, please ask them here: [Rammerhead Support Server](https://discord.gg/VNT4E7gN5Y).
