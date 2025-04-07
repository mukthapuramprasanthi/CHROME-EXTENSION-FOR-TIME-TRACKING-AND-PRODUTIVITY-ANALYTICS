let activeTab = null;
let startTime = null;

const productiveSites = ["github.com", "leetcode.com", "w3schools.com"];
const unproductiveSites = ["youtube.com", "instagram.com", "facebook.com"];

function getCategory(hostname) {
  if (productiveSites.includes(hostname)) return "Productive";
  if (unproductiveSites.includes(hostname)) return "Unproductive";
  return "Neutral";
}

// Save time to chrome storage
function saveTime(hostname, timeSpent) {
  chrome.storage.local.get("usage", (result) => {
    let usage = result.usage || {};

    if (!usage[hostname]) {
      usage[hostname] = {
        time: 0,
        category: getCategory(hostname),
      };
    }

    usage[hostname].time += timeSpent;

    chrome.storage.local.set({ usage });
  });
}

// On tab switch
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  if (activeTab && startTime) {
    const duration = Date.now() - startTime;
    saveTime(activeTab, duration);
  }

  chrome.tabs.get(tabId, (tab) => {
    if (tab.url) {
      try {
        const hostname = new URL(tab.url).hostname;
        activeTab = hostname;
        startTime = Date.now();
      } catch (error) {
        console.error("Invalid URL");
      }
    }
  });
});

// On tab URL updated (e.g., user switches inside the same tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url) {
    if (activeTab && startTime) {
      const duration = Date.now() - startTime;
      saveTime(activeTab, duration);
    }

    try {
      const hostname = new URL(tab.url).hostname;
      activeTab = hostname;
      startTime = Date.now();
    } catch (error) {
      console.error("Invalid URL");
    }
  }
});

// On browser close or extension unload
chrome.runtime.onSuspend.addListener(() => {
  if (activeTab && startTime) {
    const duration = Date.now() - startTime;
    saveTime(activeTab, duration);
  }
});
