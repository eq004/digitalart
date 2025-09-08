import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';

// PWA update prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              if (confirm('A new version is available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  });
}

// iOS specific fixes
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isIOS) {
  // Prevent zoom on input focus
  document.addEventListener('touchstart', function() {}, { passive: true });
  
  // Handle iOS viewport issues
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    let viewportContent = viewport.getAttribute('content');
    if (window.DeviceOrientationEvent) {
      const orientationChangeHandler = () => {
        if (Math.abs(window.orientation) === 90) {
          // Landscape
          viewport.setAttribute('content', viewportContent + ', height=device-height');
        } else {
          // Portrait
          viewport.setAttribute('content', viewportContent);
        }
      };
      
      window.addEventListener('orientationchange', orientationChangeHandler);
      orientationChangeHandler(); // Initial call
    }
  }

  // Prevent elastic scrolling on iOS
  document.body.addEventListener('touchmove', function(e) {
    if (e.target === document.body) {
      e.preventDefault();
    }
  }, { passive: false });

  // Handle safe areas for notch devices
  if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
    document.documentElement.classList.add('has-safe-areas');
  }
}

// Performance monitoring
if (typeof window !== 'undefined') {
  // Log performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('App loaded in:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
    }, 0);
  });

  // Handle app state changes for mobile
  let isVisible = true;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isVisible = false;
      console.log('App hidden - pausing heavy operations');
    } else {
      isVisible = true;
      console.log('App visible - resuming operations');
    }
  });

  // Handle memory warnings on mobile
  if ('memory' in performance) {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
        console.warn('High memory usage detected');
        // Could trigger cleanup operations here
      }
    };
    
    setInterval(checkMemory, 30000); // Check every 30 seconds
  }
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);