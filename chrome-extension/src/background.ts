/// <reference types="chrome" />

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-vault",
    title: "Save to Vault Vibe",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "save-to-vault" && info.selectionText) {
    console.log("Saving selection:", info.selectionText);
    
    // Store selection in local storage so popup can read it
    chrome.storage.local.set({ pendingSelection: info.selectionText }, () => {
        // Indicate to the user that text was captured. 
        // We can't open popup, but we can update badge.
        chrome.action.setBadgeText({ text: "+" });
        chrome.action.setBadgeBackgroundColor({ color: "#7c3aed" }); // violet-600
    });
  }
});
