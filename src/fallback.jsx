import '/src/styles/chrome.css';

// light loading screen, shown only while a page's code is being loaded
export default function Fallback() {
  return (
    <div className="chrome-fallback" role="status" aria-live="polite">
      <div className="chrome-fallback-ring" />
      <span>読み込み中...</span>
    </div>
  );
}
