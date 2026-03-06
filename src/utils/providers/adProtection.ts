/**
 * Shadow Player Layer — Anti-Ad Protection
 *
 * 4 protection layers:
 * Layer 1: Click interceptor — prevents external navigation from ad clicks
 * Layer 2: Mutation observer — removes injected ad overlays
 * Layer 3: Overlay shield — prevents click hijacking on the iframe
 * Layer 4: Network request filtering — blocks known ad domains
 *
 * These layers do NOT break playback or provider communication.
 */

// Known ad-related selectors that get injected by providers
const AD_SELECTORS = [
  '[id*="pop"]',
  '[class*="pop"]',
  '[id*="advert"]',
  '[class*="advert"]',
  '[id*="banner"]',
  '[class*="banner"]',
  '.ad-overlay',
  '.ad-container',
  '[data-ad]',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  'iframe[src*="adserver"]',
  'div[style*="z-index: 2147483647"]',
  'div[style*="z-index:2147483647"]',
];

// Known ad domains to block
const AD_DOMAINS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adserver.',
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'trafficjunky.com',
  'exoclick.com',
  'juicyads.com',
  'ad.plus',
  'adsterra.com',
];

// ── Layer 1: Click interceptor ─────────────────────────────────────

let clickInterceptorActive = false;

const isAdNavigation = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return AD_DOMAINS.some(d => parsedUrl.hostname.includes(d));
  } catch {
    return false;
  }
};

const clickHandler = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target) return;

  // Check if the click target is an ad link
  const anchor = target.closest('a');
  if (anchor) {
    const href = anchor.getAttribute('href') || '';
    if (isAdNavigation(href)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Block target="_blank" links that aren't part of the player
    if (anchor.target === '_blank' && !anchor.closest('.video-player-container')) {
      const href = anchor.getAttribute('href') || '';
      if (href && !href.includes(window.location.hostname)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
};

export const enableClickInterceptor = (container: HTMLElement) => {
  if (clickInterceptorActive) return;
  clickInterceptorActive = true;
  container.addEventListener('click', clickHandler, true);
};

export const disableClickInterceptor = (container: HTMLElement) => {
  clickInterceptorActive = false;
  container.removeEventListener('click', clickHandler, true);
};

// ── Layer 2: Mutation Observer ─────────────────────────────────────

let mutationObserver: MutationObserver | null = null;

const removeAdElements = (root: HTMLElement) => {
  AD_SELECTORS.forEach(selector => {
    try {
      const elements = root.querySelectorAll(selector);
      elements.forEach(el => {
        // Don't remove the actual video player elements
        if (el.tagName === 'VIDEO' || el.closest('video')) return;
        if (el.classList.contains('video-player-container')) return;
        el.remove();
      });
    } catch {
      // Selector might be invalid in some browsers
    }
  });
};

export const enableMutationObserver = (container: HTMLElement) => {
  if (mutationObserver) return;

  // Initial cleanup
  removeAdElements(container);

  mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // Check if the added node matches ad selectors
            const isAd = AD_SELECTORS.some(sel => {
              try { return node.matches(sel); } catch { return false; }
            });
            if (isAd && node.tagName !== 'VIDEO' && !node.closest('video')) {
              node.remove();
              return;
            }
            // Check children
            removeAdElements(node);
          }
        });
      }
    }
  });

  mutationObserver.observe(container, {
    childList: true,
    subtree: true,
  });
};

export const disableMutationObserver = () => {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
};

// ── Layer 3: Overlay Shield ────────────────────────────────────────

let shieldElement: HTMLElement | null = null;

/**
 * Creates a transparent overlay above the iframe that intercepts
 * click-hijacking attempts. The shield has pointer-events: none
 * but intercepts suspicious overlay divs injected above the player.
 */
export const enableOverlayShield = (container: HTMLElement) => {
  if (shieldElement) return;

  // Watch for suspicious overlays being added above the iframe
  const shieldObserver = new MutationObserver(() => {
    const children = Array.from(container.children);
    children.forEach(child => {
      if (child instanceof HTMLElement) {
        const style = window.getComputedStyle(child);
        const zIndex = parseInt(style.zIndex) || 0;
        // If a div has extremely high z-index and covers the container, it's likely an ad overlay
        if (
          zIndex > 9999 &&
          child.tagName === 'DIV' &&
          !child.classList.contains('player-controls') &&
          !child.dataset.playerUi
        ) {
          child.style.display = 'none';
        }
      }
    });
  });

  shieldObserver.observe(container, { childList: true, subtree: true });

  // Store reference for cleanup
  (container as any).__shieldObserver = shieldObserver;
};

export const disableOverlayShield = (container: HTMLElement) => {
  const obs = (container as any).__shieldObserver as MutationObserver | undefined;
  if (obs) {
    obs.disconnect();
    delete (container as any).__shieldObserver;
  }
  if (shieldElement) {
    shieldElement.remove();
    shieldElement = null;
  }
};

// ── Layer 4: Network Request Filtering ─────────────────────────────

let originalFetch: typeof fetch | null = null;
let originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;

export const enableNetworkFilter = () => {
  // Intercept fetch
  if (!originalFetch) {
    originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url;
      if (url && AD_DOMAINS.some(d => url.includes(d))) {
        return new Response('', { status: 204 }); // Silently block
      }
      return originalFetch!(input, init);
    };
  }

  // Intercept XMLHttpRequest
  if (!originalXhrOpen) {
    originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async_flag: boolean = true, username?: string | null, password?: string | null) {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (AD_DOMAINS.some(d => urlStr.includes(d))) {
        return originalXhrOpen!.call(this, method, 'about:blank', async_flag, username ?? null, password ?? null);
      }
      return originalXhrOpen!.call(this, method, url, async_flag, username ?? null, password ?? null);
    };
  }
};

export const disableNetworkFilter = () => {
  if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }
  if (originalXhrOpen) {
    XMLHttpRequest.prototype.open = originalXhrOpen;
    originalXhrOpen = null;
  }
};

// ── Master controls ────────────────────────────────────────────────

export const enableAllProtection = (container: HTMLElement) => {
  enableClickInterceptor(container);
  enableMutationObserver(container);
  enableOverlayShield(container);
  enableNetworkFilter();
};

export const disableAllProtection = (container: HTMLElement) => {
  disableClickInterceptor(container);
  disableMutationObserver();
  disableOverlayShield(container);
  disableNetworkFilter();
};
