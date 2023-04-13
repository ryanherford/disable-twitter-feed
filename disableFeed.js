const invalidUrls = ["/i/twitter_blue_sign_up", "/explore", "/home", "/"];

window.addEventListener("load", () => goToFollowing());
window.addEventListener("popstate", () => goToFollowing());

async function goToFollowing() {
  const isEnabled = !(
    await chrome.storage.sync.get("disable-twitter-ext-disabled")
  )["disable-twitter-ext-disabled"];
  if (invalidUrls.includes(new URL(window.location).pathname) && isEnabled) {
    window.location = "https://twitter.com/following";
  }
}

const observer = new MutationObserver(async (mutations) => {
  if (
    !(await chrome.storage.sync.get("disable-twitter-ext-disabled"))[
      "disable-twitter-ext-disabled"
    ]
  ) {
    const links = Array.from(document.querySelectorAll("a"));
    links
      .filter((link) =>
        invalidUrls.includes(link.href.replace("https://twitter.com", ""))
      )
      .filter((link) => link.ariaLabel !== "Twitter")
      .forEach((link) => link.remove());

    const logo = document.querySelector(`a[aria-label=Twitter]`);
    if (logo) {
      logo.onclick = () => (window.location = "https://twitter.com/following");
    }

    const trending = document.querySelector(
      `div[aria-label="Timeline: Trending now"]`
    );
    trending?.remove();
  }
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "goToFollowing") {
    goToFollowing();
  }
});

goToFollowing();
