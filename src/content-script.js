const ytControls = document.getElementsByClassName("ytp-left-controls");

function fetchIcon(path) {
  const url = new URL(chrome.runtime.getURL(path));
  return url.toString();
}
/** Button image */
const btnImg = document.createElement("img");
btnImg.src = fetchIcon("images/logo.png");
btnImg.id = "yt-bookmark-img-logo";

const ytBookmarkBtn = document.createElement("button");
ytBookmarkBtn.id = "yt-bookmark-button";
ytBookmarkBtn.onclick = bookmarkCurrentTimestamp;
ytBookmarkBtn.title = "Click to bookmark (current timestamp)";
ytBookmarkBtn.appendChild(btnImg);

if (ytControls.length === 1) {
  ytControls[0].appendChild(ytBookmarkBtn);
}

let videoId = null;

function extractVideoTimestamp() {
  const currentTimeRaw = document.querySelector(".ytp-time-current").innerText;
  const currentTimeInSec = convertTimestampToSeconds(currentTimeRaw);
  const totalTimeInSec = convertTimestampToSeconds(
    document.querySelector(".ytp-time-duration").innerText
  );

  return [currentTimeInSec, totalTimeInSec, currentTimeRaw];
}

/**
 *
 * @param {*} timestamp DD:HH:MM:SS
 */
function convertTimestampToSeconds(timestamp) {
  const [seconds = 0, minutes = 0, hours = 0, days = 0] = timestamp
    .split(":")
    .reverse();
  let tInSeconds =
    Number(seconds) * 1 +
    Number(minutes) * 60 +
    Number(hours) * 3600 +
    Number(days) * 86400;

  return tInSeconds;
}

async function bookmarkCurrentTimestamp() {
  console.log("bookmarking current timestamp");
  const [currentTimeInSec, totalTimeInSec, currentTimeRaw] =
    extractVideoTimestamp();

  const bookmarkData = {
    id: `id_${Date.now()}_${currentTimeInSec}`,
    timestamp: currentTimeInSec,
    timestampRaw: currentTimeRaw,
    bookmarkedOn: new Date().toDateString(),
  };

  if (videoId) {
    const existingBookmarks = (await getExistingBookmarks()) || [];
    chrome.storage.sync.set({
      [videoId]: [...existingBookmarks, bookmarkData],
    });
  }
}

function extractVideoId() {
  const url = new URL(document.location.href);
  videoId = url.searchParams.get("v");
}

async function getExistingBookmarks() {
  const resp = await chrome.storage.sync.get([videoId]);
  if (resp && resp[videoId]) {
    return resp[videoId];
  }
  return null;
}

extractVideoId();
