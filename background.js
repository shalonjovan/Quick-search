browser.runtime.onInstalled.addListener(() => {
  browser.storage.sync.get("sites").then((data) => {
    if (!data.sites) {
      browser.storage.sync.set({
        sites: [
          { name: "ChatGPT", key: "chatgpt", url: "https://chat.openai.com" },
          { name: "GitHub", key: "github", url: "https://github.com" }
        ]
      });
    }
  });
});

browser.commands.onCommand.addListener((command) => {
  if (command === "open-search") {
    browser.browserAction.openPopup();
  }
});
