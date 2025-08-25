import { useEffect } from 'react';

/**
 * Mobile optimization utilities and viewport meta tag management
 */
export const MobileOptimization = () => {
  useEffect(() => {
    // Set viewport meta tag for mobile optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Add PWA meta tags for mobile app experience
    const appleMobileWebApp = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebApp) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }

    const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'black-translucent';
      document.head.appendChild(meta);
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#3b82f6';
      document.head.appendChild(meta);
    }

    // Prevent zoom on input focus for iOS
    const preventZoom = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      }
    };

    document.addEventListener('focusin', preventZoom);
    document.addEventListener('focusout', preventZoom);

    return () => {
      document.removeEventListener('focusin', preventZoom);
      document.removeEventListener('focusout', preventZoom);
    };
  }, []);

  return null;
};

// Mobile-specific CSS classes and utilities
export const mobileClasses = {
  // Safe area utilities for iOS devices with notches
  safeAreaTop: 'pt-safe-area-top',
  safeAreaBottom: 'pb-safe-area-bottom',
  
  // Touch-friendly button sizes
  touchButton: 'min-h-[44px] min-w-[44px]',
  
  // Mobile-first responsive utilities
  mobileCard: 'rounded-t-xl sm:rounded-xl',
  mobileModal: 'h-screen sm:h-auto sm:max-h-[90vh]',
  mobileNav: 'sticky top-0 z-50 backdrop-blur-md',
  
  // Typography for mobile
  mobileTitle: 'text-xl sm:text-2xl lg:text-3xl',
  mobileBody: 'text-sm sm:text-base',
  
  // Form inputs optimized for mobile
  mobileInput: 'text-base leading-6',
  
  // Spacing for mobile touch interfaces
  mobilePadding: 'p-4 sm:p-6',
  mobileSpacing: 'space-y-4 sm:space-y-6',
};

// Mobile detection utility
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Touch gesture utilities
export const touchEvents = {
  // Simple swipe detection
  onSwipeLeft: (callback: () => void) => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = startX - endX;
      const deltaY = Math.abs(startY - endY);
      
      // Swipe left detection (minimum 100px horizontal, max 100px vertical)
      if (deltaX > 100 && deltaY < 100) {
        callback();
      }
    };
    
    return { handleTouchStart, handleTouchEnd };
  },
  
  // Simple swipe right detection
  onSwipeRight: (callback: () => void) => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = Math.abs(startY - endY);
      
      // Swipe right detection (minimum 100px horizontal, max 100px vertical)
      if (deltaX > 100 && deltaY < 100) {
        callback();
      }
    };
    
    return { handleTouchStart, handleTouchEnd };
  }
};