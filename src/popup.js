const currentTab = await getCurrentTab();
const urlString = currentTab.url;

let videoId = new URL(urlString).searchParams.get("v");
let bookmarkData = [];

/* DOM refs */
const noBookmarksElm = document.querySelector("#no-bookmarks-text");
const bookmarkListWrapperElm = document.querySelector(".bookmark-list");
const clearBtn = document.querySelector("#clear-btn");

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

/**
 * Core logic
 */
function renderBookmarks(bookmarks) {
  console.log("renderBookmarks: rendering bookmarks...");
  hideNoBookmark();

  // Prepare ul and li
  const list = bookmarks.reduce((acc, curr) => {
    const { timestamp, timestampRaw, bookmarkedOn, id } = curr;
    const liElm = `
                    <li>
                        <div class="bookmark-item" data-timestamp="${timestamp}">
                            <div class="bookmark-timestamp">
                                <p class="small-text">Timestamp</p>
                                <p>${timestampRaw}</p>
                            </div>
                            <div class="bookmark-date">
                                <p class="small-text">Bookmarked on</p>
                                <p>${bookmarkedOn}</p>
                            </div>
                            <div class="bookmark-item-actions">
                                <button class="delete-bookmark-item" title="Delete" data-id="${id}">
                                    <img src="../images/trash.svg" />
                                </button>
                            </div>
                        </div>
                    </li>
    `;
    return acc + liElm;
  }, "");

  bookmarkListWrapperElm.innerHTML = `<ul>
  ${list}
  </ul>`;
}

function renderNoBookmarsMsg() {
  showNoBookmark();
}

function onBookmarkItemClick(e) {
  e.stopPropagation();
  const timeInSec = e.target.dataset.timestamp;

  const urlObj = new URL(urlString);
  urlObj.searchParams.set("t", `${timeInSec}s`);

  const timestampedUrl = urlObj.href;
  chrome.tabs.update(currentTab.id, {
    url: timestampedUrl,
  });
}

async function onBookmarkItemDelete(e) {
  e.stopPropagation();
  const itemId = e.target.dataset.id;
  const newBookmark = bookmarkData.filter((b) => b.id !== itemId);
  await chrome.storage.sync.set({
    [videoId]: [...newBookmark],
  });
  bookmarkData = newBookmark;

  renderBookmarks(bookmarkData);
  registerEventListeners();
  if (bookmarkData.length === 0) {
    renderNoBookmarsMsg();
  }
}

function hideNoBookmark() {
  noBookmarksElm.style = "visibility: hidden";
}

function showNoBookmark() {
  noBookmarksElm.style = "visibility: visible";
}

function registerEventListeners() {
  document.querySelectorAll(".bookmark-item").forEach((elm) => {
    elm.addEventListener("click", onBookmarkItemClick);
  });
  document.querySelectorAll(".delete-bookmark-item").forEach((elm) => {
    elm.addEventListener("click", onBookmarkItemDelete);
  });

  clearBtn.addEventListener("click", clearBookmarks);
}

async function clearBookmarks() {
  await chrome.storage.sync.set({
    [videoId]: null,
  });
  bookmarkData = [];
  renderBookmarks([]);
  renderNoBookmarsMsg();
}

async function handlePopupOpen() {
  if (videoId) {
    const data = await chrome.storage.sync.get([videoId]);
    if (data && data[videoId] && data[videoId].length > 0) {
      const bookmarks = data[videoId].reverse();
      bookmarkData = data[videoId];
      renderBookmarks(bookmarks);
      return;
    }
  }
  renderNoBookmarsMsg();
}

await handlePopupOpen();
registerEventListeners();
