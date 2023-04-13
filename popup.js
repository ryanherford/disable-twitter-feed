function navigateFromFeed() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "goToFollowing" });
  });
}

async function isExtensionDisabled() {
  return (await chrome.storage.sync.get("disable-twitter-ext-disabled"))[
    "disable-twitter-ext-disabled"
  ];
}

const toggleFeedButton = document.getElementById("toggleFeed");
const toggleLabel = document.getElementById("toggleLabel");

isExtensionDisabled().then((isDisabled) => {
  toggleLabel.textContent = isDisabled ? "Feed Enabled" : "Feed Disabled";
  toggleFeedButton.checked = !isDisabled;
});

toggleFeedButton.addEventListener("click", async () => {
  let feedEnabled = await isExtensionDisabled();
  await chrome.storage.sync.set({
    "disable-twitter-ext-disabled": !feedEnabled,
  });
  toggleLabel.textContent = !feedEnabled ? "Feed Enabled" : "Feed Disabled";
  toggleFeedButton.checked = feedEnabled;
  if (feedEnabled) {
    navigateFromFeed();
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url.includes('twitter.com')) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    let exampleRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: '.twitter.com'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };

    let rules = [exampleRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});