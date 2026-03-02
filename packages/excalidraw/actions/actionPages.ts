import { KEYS } from "@excalidraw/common";

import { CaptureUpdateAction } from "@excalidraw/element";

import {
  createPage,
  getPageIndex,
  getNextPageId,
  getPrevPageId,
} from "../pages";

import type { Page } from "../pages";

import { register } from "./register";

/**
 * Helper: save current elements into the current page,
 * then switch to the target page and load its elements.
 */
const switchToPage = (
  elements: readonly any[],
  appState: any,
  targetPageId: string,
  direction?: "forward" | "backward",
) => {
  const pages = appState.pages as readonly Page[];
  const currentPageId = appState.currentPageId as string;

  // save current page elements
  const updatedPages = pages.map((page) =>
    page.id === currentPageId ? { ...page, elements: [...elements] } : page,
  );

  const targetPage = updatedPages.find((p) => p.id === targetPageId);
  if (!targetPage) {
    return false;
  }

  // determine flip direction if not explicitly provided
  let flipDirection = direction;
  if (!flipDirection) {
    const currentIdx = getPageIndex(pages, currentPageId);
    const targetIdx = getPageIndex(pages, targetPageId);
    flipDirection = targetIdx >= currentIdx ? "forward" : "backward";
  }

  return {
    elements: targetPage.elements,
    appState: {
      ...appState,
      currentPageId: targetPageId,
      pages: updatedPages,
      pageFlipDirection: flipDirection,
      // reset selection on page switch
      selectedElementIds: {},
      selectedGroupIds: {},
      editingGroupId: null,
      selectedLinearElement: null,
    },
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  };
};

export const actionNextPage = register({
  name: "nextPage",
  label: "pages.nextPage",
  trackEvent: { category: "canvas", action: "nextPage" },
  viewMode: true,
  perform(elements, appState) {
    const nextId = getNextPageId(appState.pages, appState.currentPageId);
    if (!nextId) {
      return false;
    }
    return switchToPage(elements, appState, nextId, "forward");
  },
  keyTest: (event) =>
    event.key === KEYS.PAGE_DOWN ||
    (event[KEYS.CTRL_OR_CMD] &&
      !event.altKey &&
      !event.shiftKey &&
      event.key === KEYS.ARROW_RIGHT),
});

export const actionGoToPage = register<{ pageId?: string }>({
  name: "goToPage",
  label: "pages.goToPage",
  trackEvent: { category: "canvas", action: "goToPage" },
  viewMode: true,
  perform(elements, appState, value?: { pageId?: string }) {
    if (!value?.pageId || value.pageId === appState.currentPageId) {
      return false;
    }
    return switchToPage(elements, appState, value.pageId);
  },
});

export const actionRenamePage = register<{ pageId?: string; name?: string }>({
  name: "renamePage",
  label: "pages.renamePage",
  trackEvent: { category: "canvas", action: "renamePage" },
  perform(elements, appState, value) {
    const pageId = value?.pageId;
    const nextName = value?.name?.trim();
    if (!pageId || !nextName) {
      return false;
    }

    const pages = appState.pages as readonly Page[];
    const currentPageId = appState.currentPageId as string;
    const updatedPages = pages.map((page) =>
      page.id === currentPageId ? { ...page, elements: [...elements] } : page,
    );
    const renamedPages = updatedPages.map((page) =>
      page.id === pageId ? { ...page, name: nextName } : page,
    );

    return {
      elements,
      appState: {
        ...appState,
        pages: renamedPages,
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});

export const actionMovePage = register<{ pageId?: string; toIndex?: number }>({
  name: "movePage",
  label: "pages.movePage",
  trackEvent: { category: "canvas", action: "movePage" },
  perform(elements, appState, value) {
    const pageId = value?.pageId;
    const toIndex = value?.toIndex;
    if (!pageId || typeof toIndex !== "number") {
      return false;
    }

    const pages = appState.pages as readonly Page[];
    const currentPageId = appState.currentPageId as string;
    const updatedPages = pages.map((page) =>
      page.id === currentPageId ? { ...page, elements: [...elements] } : page,
    );

    const fromIndex = getPageIndex(updatedPages, pageId);
    if (fromIndex < 0 || toIndex < 0 || toIndex >= updatedPages.length) {
      return false;
    }
    if (fromIndex === toIndex) {
      return false;
    }

    const reordered = [...updatedPages];
    const [movedPage] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedPage);

    return {
      elements,
      appState: {
        ...appState,
        pages: reordered,
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});

export const actionPrevPage = register({
  name: "prevPage",
  label: "pages.prevPage",
  trackEvent: { category: "canvas", action: "prevPage" },
  viewMode: true,
  perform(elements, appState) {
    const prevId = getPrevPageId(appState.pages, appState.currentPageId);
    if (!prevId) {
      return false;
    }
    return switchToPage(elements, appState, prevId, "backward");
  },
  keyTest: (event) =>
    event.key === KEYS.PAGE_UP ||
    (event[KEYS.CTRL_OR_CMD] &&
      !event.altKey &&
      !event.shiftKey &&
      event.key === KEYS.ARROW_LEFT),
});

export const actionAddPage = register({
  name: "addPage",
  label: "pages.addPage",
  trackEvent: { category: "canvas", action: "addPage" },
  perform(elements, appState) {
    const pages = appState.pages as readonly Page[];
    const currentPageId = appState.currentPageId as string;
    const idx = getPageIndex(pages, currentPageId);

    // save current page elements
    const updatedPages = pages.map((page) =>
      page.id === currentPageId ? { ...page, elements: [...elements] } : page,
    );

    const newPage = createPage(`Page ${pages.length + 1}`);

    // insert after current page
    const newPages = [
      ...updatedPages.slice(0, idx + 1),
      newPage,
      ...updatedPages.slice(idx + 1),
    ];

    return {
      elements: [],
      appState: {
        ...appState,
        currentPageId: newPage.id,
        pages: newPages,
        selectedElementIds: {},
        selectedGroupIds: {},
        editingGroupId: null,
        selectedLinearElement: null,
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});

export const actionDeletePage = register<{ pageId?: string }>({
  name: "deletePage",
  label: "pages.deletePage",
  trackEvent: { category: "canvas", action: "deletePage" },
  perform(elements, appState, value?: { pageId?: string }) {
    const pages = appState.pages as readonly Page[];

    // don't delete the last page
    if (pages.length <= 1) {
      return false;
    }

    const currentPageId = appState.currentPageId as string;
    const pageIdToDelete = value?.pageId || currentPageId;

    // save current page elements before deleting, so other pages are not lost
    const updatedPages = pages.map((page) =>
      page.id === currentPageId ? { ...page, elements: [...elements] } : page,
    );

    const idx = getPageIndex(updatedPages, pageIdToDelete);
    if (idx < 0) {
      return false;
    }
    const newPages = updatedPages.filter((p) => p.id !== pageIdToDelete);

    if (pageIdToDelete !== currentPageId) {
      return {
        elements,
        appState: {
          ...appState,
          pages: newPages,
        },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      };
    }

    // switch to previous page, or next if deleting first
    const switchIdx = Math.min(idx, newPages.length - 1);
    const targetPage = newPages[Math.max(0, switchIdx)];

    return {
      elements: targetPage.elements,
      appState: {
        ...appState,
        currentPageId: targetPage.id,
        pages: newPages,
        selectedElementIds: {},
        selectedGroupIds: {},
        editingGroupId: null,
        selectedLinearElement: null,
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});
