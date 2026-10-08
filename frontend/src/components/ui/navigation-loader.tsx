'use client';

/**
 * NavigationLoader
 *
 * Wraps the CyberLoader to automatically show/hide during Next.js App Router
 * soft navigations. It intercepts the native `navigate` event (supported by
 * the View Transitions API in Next 14+) and falls back to intercepting
 * `<a>` clicks for older environments.
 *
 * Drop this inside the root layout or any layout that wraps navigable pages.
 */

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CyberLoader } from './cyber-loader';

export function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const pendingPath = useRef<string | null>(null);
  const prevPathname = useRef(pathname);

  // Intercept link clicks to start the loader
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Walk up the DOM to find the nearest anchor
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (!target) return;

      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only handle same-origin, non-hash, non-external links
      const isSameOrigin =
        !href.startsWith('http') &&
        !href.startsWith('//') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:');

      const isHashOnly = href.startsWith('#');
      const isCurrentPage = href === pathname || href === pathname + '/';

      if (isSameOrigin && !isHashOnly && !isCurrentPage) {
        pendingPath.current = href;
        setLoading(true);
      }
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  // Hide loader once the route has changed (pathname updated)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      pendingPath.current = null;
      // Brief delay so the page content begins mounting before we hide
      const t = setTimeout(() => setLoading(false), 150);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // Safety timeout — never leave loader on screen longer than 8s
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  return <CyberLoader show={loading} />;
}
