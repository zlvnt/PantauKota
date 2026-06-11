'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[SW] Registered successfully, scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[SW] Registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
