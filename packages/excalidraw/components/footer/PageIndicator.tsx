import { getPageIndex } from "../../pages";
import {
  actionAddPage,
  actionDeletePage,
  actionNextPage,
  actionPrevPage,
} from "../../actions/actionPages";

import type { Page } from "../../pages";
import type { ActionManager } from "../../actions/manager";

import "./PageIndicator.scss";

const PageIndicator = ({
  pages,
  currentPageId,
  actionManager,
}: {
  pages: readonly Page[];
  currentPageId: string;
  actionManager: ActionManager;
}) => {
  const currentIndex = getPageIndex(pages, currentPageId);
  const total = pages.length;

  return (
    <div className="page-indicator">
      <button
        className="page-indicator__btn"
        title="Previous page (PageUp)"
        disabled={currentIndex <= 0}
        onClick={() => actionManager.executeAction(actionPrevPage)}
      >
        &#x25C0;
      </button>

      <span className="page-indicator__label">
        {currentIndex + 1} / {total}
      </span>

      <button
        className="page-indicator__btn"
        title="Next page (PageDown)"
        disabled={currentIndex >= total - 1}
        onClick={() => actionManager.executeAction(actionNextPage)}
      >
        &#x25B6;
      </button>

      <button
        className="page-indicator__btn"
        title="Add page"
        onClick={() => actionManager.executeAction(actionAddPage)}
      >
        +
      </button>

      <button
        className="page-indicator__btn"
        title="Delete page"
        disabled={total <= 1}
        onClick={() => actionManager.executeAction(actionDeletePage)}
      >
        &minus;
      </button>
    </div>
  );
};

export default PageIndicator;
