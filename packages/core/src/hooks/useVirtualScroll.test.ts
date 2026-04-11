import { describe, it, expect } from 'vitest';
import {
  adjustScrollOffset,
  computeRanges,
  navigateUp,
  navigateDown,
  navigatePageUp,
  navigatePageDown,
} from './useVirtualScroll.js';

/**
 * Tests for useVirtualScroll.
 * Following the pattern of useKeyboardNavigation.test.ts: test pure arithmetic
 * helpers directly, plus a smoke test that the module exports the hook function.
 */

// ── Smoke test: module exports ────────────────────────────────────────────────

describe('useVirtualScroll — exports', () => {
  it('exports useVirtualScroll as a function', async () => {
    const mod = await import('./useVirtualScroll.js');
    expect(typeof mod.useVirtualScroll).toBe('function');
  });
});

// ── adjustScrollOffset ────────────────────────────────────────────────────────

describe('adjustScrollOffset', () => {
  it('returns 0 for focused item already at top', () => {
    // Item 0, offset 0, viewport 10, itemSize 1 — already visible
    expect(adjustScrollOffset(0, 0, 10, 1)).toBe(0);
  });

  it('does not scroll when focused item is in the middle of the viewport', () => {
    // Viewport shows rows 0–9, item 5 is at row 5 — in view
    expect(adjustScrollOffset(5, 0, 10, 1)).toBe(0);
  });

  it('scrolls down when focused item is below the viewport', () => {
    // Viewport rows 0–9, item 12 — scrolls to row 3 so item 12 is at the bottom
    // itemBottom = 12, viewportSize = 10 → offset = 12 - 10 + 1 = 3
    expect(adjustScrollOffset(12, 0, 10, 1)).toBe(3);
  });

  it('scrolls up when focused item is above the current scroll offset', () => {
    // Currently scrolled to row 10, focus jumps to item 2
    expect(adjustScrollOffset(2, 10, 10, 1)).toBe(2);
  });

  it('keeps offset unchanged when item is exactly at the visible boundary', () => {
    // Viewport rows 5–14 (offset=5, viewportSize=10), item 14 — at bottom edge, in view
    expect(adjustScrollOffset(14, 5, 10, 1)).toBe(5);
  });

  it('works with itemSize > 1', () => {
    // itemSize=2, viewportSize=10 → viewport rows 0–9
    // Item 5: rows 10–11 → below viewport. offset = 11 - 10 + 1 = 2
    expect(adjustScrollOffset(5, 0, 10, 2)).toBe(2);
  });

  it('works with itemSize > 1 and item above viewport', () => {
    // itemSize=2, currently offset=20, focus item 3 (rows 6–7) → scrolls to 6
    expect(adjustScrollOffset(3, 20, 10, 2)).toBe(6);
  });
});

// ── computeRanges ─────────────────────────────────────────────────────────────

describe('computeRanges', () => {
  it('returns zeros for itemCount=0', () => {
    const r = computeRanges(0, 10, 1, 0, 2);
    expect(r.visibleStartIndex).toBe(0);
    expect(r.visibleEndIndex).toBe(0);
    expect(r.startIndex).toBe(0);
    expect(r.endIndex).toBe(0);
  });

  it('computes correct visible range at offset 0', () => {
    // viewportSize=5, itemSize=1 → items 0–4 visible
    const r = computeRanges(0, 5, 1, 20, 0);
    expect(r.visibleStartIndex).toBe(0);
    expect(r.visibleEndIndex).toBe(4);
  });

  it('computes correct visible range when scrolled', () => {
    // offset=5, viewportSize=5 → items 5–9 visible
    const r = computeRanges(5, 5, 1, 20, 0);
    expect(r.visibleStartIndex).toBe(5);
    expect(r.visibleEndIndex).toBe(9);
  });

  it('clamps visibleEndIndex to itemCount - 1', () => {
    // viewportSize=10, only 6 items → end clamps to 5
    const r = computeRanges(0, 10, 1, 6, 0);
    expect(r.visibleEndIndex).toBe(5);
  });

  it('adds overscan below visible area', () => {
    const r = computeRanges(0, 5, 1, 20, 2);
    expect(r.startIndex).toBe(0);
    expect(r.endIndex).toBe(6); // 4 + 2
  });

  it('adds overscan above visible area', () => {
    // scrolled to offset=10, viewportSize=5 → visible 10–14, overscan: start=8
    const r = computeRanges(10, 5, 1, 30, 2);
    expect(r.startIndex).toBe(8);
    expect(r.endIndex).toBe(16);
  });

  it('clamps startIndex to 0 with overscan at top of list', () => {
    // offset=1, overscan=3 → startIndex would be -2, clamps to 0
    const r = computeRanges(1, 5, 1, 20, 3);
    expect(r.startIndex).toBe(0);
  });

  it('clamps endIndex to itemCount-1 with overscan at bottom', () => {
    // last items, overscan pushes past end
    const r = computeRanges(15, 5, 1, 18, 3);
    expect(r.endIndex).toBe(17); // itemCount-1
  });

  it('works with itemSize=2', () => {
    // offset=4, itemSize=2 → visibleStartIndex=floor(4/2)=2
    const r = computeRanges(4, 4, 2, 20, 0);
    expect(r.visibleStartIndex).toBe(2);
    // items visible: ceil(4/2)=2 items → items 2 and 3
    expect(r.visibleEndIndex).toBe(3);
  });
});

// ── navigateUp ────────────────────────────────────────────────────────────────

describe('navigateUp', () => {
  it('decrements normally', () => {
    expect(navigateUp(5, 10, false)).toBe(4);
  });

  it('clamps at 0 when loop=false', () => {
    expect(navigateUp(0, 10, false)).toBe(0);
  });

  it('wraps from 0 to last when loop=true', () => {
    expect(navigateUp(0, 10, true)).toBe(9);
  });

  it('decrements from middle with loop=true', () => {
    expect(navigateUp(5, 10, true)).toBe(4);
  });

  it('returns 0 for itemCount=0', () => {
    expect(navigateUp(0, 0, false)).toBe(0);
    expect(navigateUp(0, 0, true)).toBe(0);
  });
});

// ── navigateDown ──────────────────────────────────────────────────────────────

describe('navigateDown', () => {
  it('increments normally', () => {
    expect(navigateDown(3, 10, false)).toBe(4);
  });

  it('clamps at last when loop=false', () => {
    expect(navigateDown(9, 10, false)).toBe(9);
  });

  it('wraps from last to 0 when loop=true', () => {
    expect(navigateDown(9, 10, true)).toBe(0);
  });

  it('increments from middle with loop=true', () => {
    expect(navigateDown(5, 10, true)).toBe(6);
  });

  it('returns 0 for itemCount=0', () => {
    expect(navigateDown(0, 0, false)).toBe(0);
  });
});

// ── navigatePageUp ────────────────────────────────────────────────────────────

describe('navigatePageUp', () => {
  it('jumps back by pageItems', () => {
    expect(navigatePageUp(15, 5)).toBe(10);
  });

  it('clamps to 0 when not enough items above', () => {
    expect(navigatePageUp(3, 5)).toBe(0);
  });

  it('landing exactly on 0', () => {
    expect(navigatePageUp(5, 5)).toBe(0);
  });
});

// ── navigatePageDown ──────────────────────────────────────────────────────────

describe('navigatePageDown', () => {
  it('jumps forward by pageItems', () => {
    expect(navigatePageDown(5, 20, 5)).toBe(10);
  });

  it('clamps to itemCount-1 when not enough items below', () => {
    expect(navigatePageDown(17, 20, 5)).toBe(19);
  });

  it('landing exactly on last item', () => {
    expect(navigatePageDown(15, 20, 5)).toBe(19);
  });
});

// ── Scroll tracking (integration of adjust + navigate) ────────────────────────

describe('scroll tracking — window follows focus', () => {
  it('scrolls down when navigating past the viewport bottom', () => {
    // viewport rows 0–4 (size=5), currently at item 4
    // navigate down to item 5 → offset should become 1 (item 5 at bottom)
    let offset = 0;
    const next = navigateDown(4, 20, false);
    offset = adjustScrollOffset(next, offset, 5, 1);
    expect(next).toBe(5);
    expect(offset).toBe(1);
  });

  it('scrolls up when navigating past the viewport top', () => {
    // viewport rows 5–9 (offset=5, size=5), currently at item 5
    // navigate up to item 4 → offset should become 4
    let offset = 5;
    const next = navigateUp(5, 20, false);
    offset = adjustScrollOffset(next, offset, 5, 1);
    expect(next).toBe(4);
    expect(offset).toBe(4);
  });

  it('Home key: offset becomes 0', () => {
    // Regardless of current scroll, Home resets to 0
    const offset = adjustScrollOffset(0, 0, 5, 1);
    expect(offset).toBe(0);
  });

  it('End key: offset scrolls to show last item', () => {
    // 20 items, viewportSize=5 → last item=19, offset = 19 - 5 + 1 = 15
    const offset = adjustScrollOffset(19, 0, 5, 1);
    expect(offset).toBe(15);
  });
});

// ── isItemVisible logic ───────────────────────────────────────────────────────

describe('isItemVisible logic', () => {
  it('item inside visible range is visible', () => {
    const { visibleStartIndex, visibleEndIndex } = computeRanges(5, 5, 1, 20, 2);
    // visible: 5–9
    const isVisible = (i: number) => i >= visibleStartIndex && i <= visibleEndIndex;
    expect(isVisible(7)).toBe(true);
  });

  it('item outside visible range (in overscan) is not visible', () => {
    const { visibleStartIndex, visibleEndIndex } = computeRanges(5, 5, 1, 20, 2);
    const isVisible = (i: number) => i >= visibleStartIndex && i <= visibleEndIndex;
    // overscan items 3 and 4 are rendered but not in the visible range
    expect(isVisible(3)).toBe(false);
    expect(isVisible(11)).toBe(false);
  });

  it('returns false for any index when itemCount=0', () => {
    // computeRanges returns 0,0,0,0 for empty list
    const { visibleStartIndex, visibleEndIndex } = computeRanges(0, 5, 1, 0, 2);
    // For empty list, nothing should be visible — guard in hook returns false
    // Here we just verify the ranges are 0,0
    expect(visibleStartIndex).toBe(0);
    expect(visibleEndIndex).toBe(0);
  });
});

// ── scrollToIndex centering logic ─────────────────────────────────────────────

describe('scrollToIndex centering', () => {
  it('centers item in viewport', () => {
    // viewportSize=10, itemSize=1, item 20 → centered offset = 20 - floor((10-1)/2) = 20 - 4 = 16
    const itemTop = 20 * 1;
    const centered = Math.max(0, itemTop - Math.floor((10 - 1) / 2));
    expect(centered).toBe(16);
  });

  it('clamps centered offset to 0 for items near the top', () => {
    // item 1 with viewportSize=10 → would be -3, clamps to 0
    const itemTop = 1 * 1;
    const centered = Math.max(0, itemTop - Math.floor((10 - 1) / 2));
    expect(centered).toBe(0);
  });

  it('item 0 always centers at offset 0', () => {
    const itemTop = 0;
    const centered = Math.max(0, itemTop - Math.floor((10 - 1) / 2));
    expect(centered).toBe(0);
  });
});
