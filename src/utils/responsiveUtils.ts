/**
 * Responsive design utilities for cross-device compatibility
 */

import React from 'react';

// Breakpoint constants
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Get current breakpoint
export const getCurrentBreakpoint = (): keyof typeof BREAKPOINTS => {
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// Check if current screen is mobile
export const isMobile = (): boolean => {
  return window.innerWidth < BREAKPOINTS.md;
};

// Check if current screen is tablet
export const isTablet = (): boolean => {
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
};

// Check if current screen is desktop
export const isDesktop = (): boolean => {
  return window.innerWidth >= BREAKPOINTS.lg;
};

// Responsive hook for React components
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS>('md');
  
  React.useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
    };
    
    // Set initial breakpoint
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'
  };
};

// Safe area utilities for mobile devices
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--mobile-safe-area-top') || '0'),
    bottom: parseInt(style.getPropertyValue('--mobile-safe-area-bottom') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
  };
};

// Dynamic viewport height for mobile browsers
export const setDynamicViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Initialize responsive utilities
export const initResponsiveUtils = () => {
  if (typeof window === 'undefined') return;
  
  // Set initial dynamic viewport height
  setDynamicViewportHeight();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setDynamicViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setDynamicViewportHeight, 100);
  });
};

