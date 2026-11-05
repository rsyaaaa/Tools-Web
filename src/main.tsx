import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';
import { renderPhotoboothStrip } from './lib/canvas-compositor';
import { PHOTOBOOTH_THEMES } from './lib/photobooth-themes';

// Internal exposure for programmatic sample generation / automation
if (typeof window !== 'undefined') {
  (window as unknown as { __renderPhotoboothStrip: typeof renderPhotoboothStrip }).__renderPhotoboothStrip = renderPhotoboothStrip;
  (window as unknown as { __PHOTOBOOTH_THEMES: typeof PHOTOBOOTH_THEMES }).__PHOTOBOOTH_THEMES = PHOTOBOOTH_THEMES;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

