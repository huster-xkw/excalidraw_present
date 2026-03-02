import {
  DEFAULT_FILENAME,
  EXPORT_DATA_TYPES,
  getExportSource,
  MIME_TYPES,
  VERSIONS,
} from "@excalidraw/common";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { cleanAppStateForExport, clearAppStateForDatabase } from "../appState";

import { isImageFileHandle, loadFromBlob } from "./blob";
import { fileOpen, fileSave } from "./filesystem";

import type { Page } from "../pages";
import type { AppState, BinaryFiles, LibraryItems } from "../types";
import type {
  ExportedDataState,
  ImportedDataState,
  ExportedLibraryData,
  ImportedLibraryData,
} from "./types";

/**
 * Strips out files which are only referenced by deleted elements
 */
const filterOutDeletedFiles = (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
) => {
  const nextFiles: BinaryFiles = {};
  for (const element of elements) {
    if (
      !element.isDeleted &&
      "fileId" in element &&
      element.fileId &&
      files[element.fileId]
    ) {
      nextFiles[element.fileId] = files[element.fileId];
    }
  }
  return nextFiles;
};

export const serializeAsJSON = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  type: "local" | "database",
): string => {
  // Sync current page elements into the pages array before serializing
  let patchedAppState = { ...appState };
  if (patchedAppState.pages && patchedAppState.currentPageId) {
    const pages = patchedAppState.pages as readonly Page[];
    const currentPageId = patchedAppState.currentPageId as string;
    patchedAppState = {
      ...patchedAppState,
      pages: pages.map((page) =>
        page.id === currentPageId ? { ...page, elements: [...elements] } : page,
      ),
    };
  }

  // Collect all elements across all pages for file filtering
  const allElements: ExcalidrawElement[] = [];
  if (patchedAppState.pages) {
    for (const page of patchedAppState.pages as readonly Page[]) {
      allElements.push(...page.elements);
    }
  } else {
    allElements.push(...elements);
  }

  const data: ExportedDataState = {
    type: EXPORT_DATA_TYPES.excalidraw,
    version: VERSIONS.excalidraw,
    source: getExportSource(),
    elements,
    appState:
      type === "local"
        ? cleanAppStateForExport(patchedAppState)
        : clearAppStateForDatabase(patchedAppState),
    files:
      type === "local"
        ? filterOutDeletedFiles(allElements, files)
        : // will be stripped from JSON
          undefined,
  };

  return JSON.stringify(data, null, 2);
};

export const saveAsJSON = async (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
  /** filename */
  name: string = appState.name || DEFAULT_FILENAME,
) => {
  const serialized = serializeAsJSON(elements, appState, files, "local");
  const blob = new Blob([serialized], {
    type: MIME_TYPES.excalidraw,
  });

  const fileHandle = await fileSave(blob, {
    name,
    extension: "excalidraw",
    description: "Excalidraw file",
    fileHandle: isImageFileHandle(appState.fileHandle)
      ? null
      : appState.fileHandle,
  });
  return { fileHandle };
};

export const loadFromJSON = async (
  localAppState: AppState,
  localElements: readonly ExcalidrawElement[] | null,
) => {
  const file = await fileOpen({
    description: "Excalidraw files",
    // ToDo: Be over-permissive until https://bugs.webkit.org/show_bug.cgi?id=34442
    // gets resolved. Else, iOS users cannot open `.excalidraw` files.
    // extensions: ["json", "excalidraw", "png", "svg"],
  });
  return loadFromBlob(file, localAppState, localElements, file.handle);
};

export const isValidExcalidrawData = (data?: {
  type?: any;
  elements?: any;
  appState?: any;
}): data is ImportedDataState => {
  return (
    data?.type === EXPORT_DATA_TYPES.excalidraw &&
    (!data.elements ||
      (Array.isArray(data.elements) &&
        (!data.appState || typeof data.appState === "object")))
  );
};

export const isValidLibrary = (json: any): json is ImportedLibraryData => {
  return (
    typeof json === "object" &&
    json &&
    json.type === EXPORT_DATA_TYPES.excalidrawLibrary &&
    (json.version === 1 || json.version === 2)
  );
};

export const serializeLibraryAsJSON = (libraryItems: LibraryItems) => {
  const data: ExportedLibraryData = {
    type: EXPORT_DATA_TYPES.excalidrawLibrary,
    version: VERSIONS.excalidrawLibrary,
    source: getExportSource(),
    libraryItems,
  };
  return JSON.stringify(data, null, 2);
};

export const saveLibraryAsJSON = async (libraryItems: LibraryItems) => {
  const serialized = serializeLibraryAsJSON(libraryItems);
  await fileSave(
    new Blob([serialized], {
      type: MIME_TYPES.excalidrawlib,
    }),
    {
      name: "library",
      extension: "excalidrawlib",
      description: "Excalidraw library file",
    },
  );
};
