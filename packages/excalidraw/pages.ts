import { randomId } from "@excalidraw/common";

import type { ExcalidrawElement } from "@excalidraw/element/types";

export interface Page {
  id: string;
  name: string;
  elements: readonly ExcalidrawElement[];
}

export const createPage = (
  name?: string,
  elements?: readonly ExcalidrawElement[],
): Page => ({
  id: randomId(),
  name: name || "Page 1",
  elements: elements || [],
});

export const DEFAULT_PAGE_ID = "page_default";

export const createDefaultPage = (): Page => ({
  id: DEFAULT_PAGE_ID,
  name: "Page 1",
  elements: [],
});

export const getPageIndex = (pages: readonly Page[], pageId: string): number =>
  pages.findIndex((p) => p.id === pageId);

export const getNextPageId = (
  pages: readonly Page[],
  currentPageId: string,
): string | null => {
  const idx = getPageIndex(pages, currentPageId);
  if (idx < 0 || idx >= pages.length - 1) {
    return null;
  }
  return pages[idx + 1].id;
};

export const getPrevPageId = (
  pages: readonly Page[],
  currentPageId: string,
): string | null => {
  const idx = getPageIndex(pages, currentPageId);
  if (idx <= 0) {
    return null;
  }
  return pages[idx - 1].id;
};
