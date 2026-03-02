import React from "react";

import { Island } from "./Island";

import {
  actionAddPage,
  actionDeletePage,
  actionGoToPage,
  actionMovePage,
  actionRenamePage,
} from "../actions/actionPages";

import type { ActionManager } from "../actions/manager";
import type { UIAppState } from "../types";

import "./PageListPanel.scss";

type PageListPanelProps = {
  appState: UIAppState;
  actionManager: ActionManager;
};

const PageListPanel = ({ appState, actionManager }: PageListPanelProps) => {
  const pages = appState.pages;
  const total = pages.length;

  const [editingPageId, setEditingPageId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [collapsed, setCollapsed] = React.useState(false);

  const goToPage = (pageId: string) => {
    actionManager.executeAction(actionGoToPage, "ui", { pageId });
  };

  const deletePage = (pageId: string) => {
    actionManager.executeAction(actionDeletePage, "ui", { pageId });
  };

  const startRename = (pageId: string, name: string) => {
    setEditingPageId(pageId);
    setEditingName(name);
  };

  const commitRename = () => {
    if (!editingPageId) {
      return;
    }
    actionManager.executeAction(actionRenamePage, "ui", {
      pageId: editingPageId,
      name: editingName,
    });
    setEditingPageId(null);
    setEditingName("");
  };

  const cancelRename = () => {
    setEditingPageId(null);
    setEditingName("");
  };

  const onDragStart = (
    event: React.DragEvent<HTMLLIElement>,
    pageId: string,
  ) => {
    event.dataTransfer.setData("text/page-id", pageId);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (event: React.DragEvent<HTMLLIElement>, toIndex: number) => {
    event.preventDefault();
    const pageId = event.dataTransfer.getData("text/page-id");
    if (!pageId) {
      return;
    }
    actionManager.executeAction(actionMovePage, "ui", { pageId, toIndex });
  };

  return (
    <div className="page-list-panel-wrap">
      <Island
        className={`page-list-panel${
          collapsed ? " page-list-panel--collapsed" : ""
        }`}
        padding={collapsed ? 0 : 1}
      >
        <div className="page-list-panel__header">
          <button
            className="page-list-panel__collapse"
            title={collapsed ? "Expand pages" : "Collapse pages"}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? ">" : "<"}
          </button>

          {!collapsed && (
            <>
              <span className="page-list-panel__title">Pages</span>
              <button
                className="page-list-panel__add"
                title="Add page"
                onClick={() => actionManager.executeAction(actionAddPage)}
              >
                +
              </button>
            </>
          )}
        </div>

        {!collapsed && (
          <ol className="page-list-panel__list">
            {pages.map((page, index) => {
              const isActive = page.id === appState.currentPageId;
              return (
                <li
                  key={page.id}
                  className={`page-list-panel__item${
                    isActive ? " page-list-panel__item--active" : ""
                  }`}
                  draggable
                  onDragStart={(event) => onDragStart(event, page.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onDrop(event, index)}
                >
                  <button
                    className="page-list-panel__go"
                    onClick={() => goToPage(page.id)}
                    title={page.name}
                  >
                    <span className="page-list-panel__index">{index + 1}</span>
                    {editingPageId === page.id ? (
                      <input
                        className="page-list-panel__rename"
                        value={editingName}
                        autoFocus
                        onChange={(event) => setEditingName(event.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            commitRename();
                          }
                          if (event.key === "Escape") {
                            cancelRename();
                          }
                        }}
                      />
                    ) : (
                      <span
                        className="page-list-panel__name"
                        onDoubleClick={(event) => {
                          event.preventDefault();
                          startRename(page.id, page.name);
                        }}
                      >
                        {page.name}
                      </span>
                    )}
                  </button>

                  <button
                    className="page-list-panel__delete"
                    title="Delete this page"
                    disabled={total <= 1}
                    onClick={() => deletePage(page.id)}
                  >
                    &times;
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </Island>
    </div>
  );
};

export default PageListPanel;
