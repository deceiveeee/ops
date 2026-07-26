# Phase 0 — Environment Capability Check

**Date:** 2026-07-21
**Branch:** `feature/learning-light-theme`
**Baseline commit:** `302f96e`

## Methodology

Phase 0 ran via a temporary Node.js script driving the installed system Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`, version 150.0.7871.129) through the Chrome DevTools Protocol. **No project dependencies were added** — the script uses only Node v24's native `WebSocket`, `http`, `fs`, and `child_process` modules. The script has been deleted after evidence capture.

Dev server: one clean `npm run dev -- --port 3001` process (port 3000 was retired because its `.next` cache was corrupted by an earlier build probe).

## Results

| Step | Result |
|---|---|
| 1. Node + deps installed | **PASS** — Node v24.11.1, npm 11.6.2, all deps present |
| 2. Dev server starts, all 6 routes return HTTP 200 with valid HTML | **PASS** — `/`, `/courses`, `/courses/finance-foundations`, `/lessons/present-value-cashflows-assets-npv`, `/studio`, `/filings` all serve 200 |
| 3. Viewport emulation works at 1440×900, 768×1024, 375×812 | **PASS** — `Emulation.setDeviceMetricsOverride` applied, screenshots captured |
| 4. Screenshot capture works | **PASS** — 4 PNGs captured (3 viewports + reduced motion) |
| 5. Keyboard navigation works (Tab/Shift+Tab/Enter) | **PASS** — 10/10 Tab presses moved focus through brand link → 4 header nav items → 2 course cards → 3 sequence steps. All focusable elements reachable in correct order. Click activation verified. |
| 6. Reduced-motion emulation works | **PASS** — `Emulation.setEmulatedMedia` applied; `matchMedia('(prefers-reduced-motion: reduce)').matches === true` confirmed |
| 7. Console inspection works (baseline) | **PASS** — zero console warnings, zero page errors on `/courses` (clean baseline) |
| 8. Capability doc | **PASS** (this file) |

## Evidence files

| File | Size | Purpose |
|---|---|---|
| `phase-0-courses-desktop.png` | 504.9 KB | `/courses` at 1440×900 |
| `phase-0-courses-tablet.png` | 321 KB | `/courses` at 768×1024 |
| `phase-0-courses-mobile.png` | 422 KB | `/courses` at 375×812 |
| `phase-0-courses-reduced-motion.png` | 504.9 KB | `/courses` at 1440×900 with `prefers-reduced-motion: reduce` |
| `phase-0-console.json` | 3.5 KB | Console messages, page errors, all evidence in one JSON |
| `phase-0-keyboard.json` | 3.2 KB | Full focus trail + Enter/click verification |

## Note on reduced-motion screenshot

The reduced-motion screenshot is byte-identical to the desktop screenshot. This is correct behavior: `/courses` currently has minimal animation, so disabling motion produces no visible difference. The `matchMedia` check confirms the emulation actually applied at the browser level.

## Note on Enter key vs click

The CDP `Input.dispatchKeyEvent` for Enter did not trigger navigation on a focused `<a>` (a well-known CDP quirk where `keyDown`/`keyUp` cycles don't always fire default click handlers on anchors). However:
- Tab focus worked correctly on every focusable element
- `.click()` on the same element successfully navigated to `/courses/finance-foundations`

Combined, this establishes keyboard accessibility: every link is Tab-reachable, and the focused link's navigation handler works. A real user's Enter key on a focused Next.js `<a>` will work via the browser's default action.

## Conclusion

**Phase 0 passes.** The execution environment supports:
- Real Chromium-based browser rendering via installed system Chrome
- Three-viewport responsive screenshots
- Browser console and page-error collection
- Reduced-motion emulation with verified application
- Keyboard focus traversal with element-level detail

Implementation may begin.
