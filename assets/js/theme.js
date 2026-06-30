/**
 * Shoinik Paper & Stationeries - Theme Manager
 * Handles dark/light mode toggle with localStorage persistence
 */

'use strict';

const ThemeManager = (() => {
  const STORAGE_KEY = 'shoinik-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  /* ---- Detect preferred theme ---- */
  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  /* ---- Apply theme to document ---- */
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all toggle button icons
    document.querySelectorAll('.theme-toggle i').forEach(icon => {
      icon.className = theme === DARK ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    });

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === DARK ? '#0f1117' : '#F8F9FA');
    }
  }

  /* ---- Toggle between dark and light ---- */
  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  /* ---- Init: apply saved/preferred theme & bind toggles ---- */
  function init() {
    // Apply before DOM is fully ready to prevent flash
    apply(getPreferred());

    document.addEventListener('DOMContentLoaded', () => {
      // Bind all theme toggle buttons
      document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', toggle);
        btn.setAttribute('aria-label', 'Toggle dark/light mode');
      });

      // Listen for OS-level preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't set a preference
        if (!localStorage.getItem(STORAGE_KEY)) {
          apply(e.matches ? DARK : LIGHT);
        }
      });
    });
  }

  return { init, toggle, apply, getPreferred };
})();

// Initialize immediately so theme applies before render
ThemeManager.init();

window.ThemeManager = ThemeManager;
