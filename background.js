browser.commands.onCommand.addListener((command) => {
  if (command === "open-search") {
    browser.browserAction.openPopup();
  }
});
