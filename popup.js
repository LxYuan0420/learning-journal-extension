// Automatically generate a markdown entry using the active tab's title and URL.
async function generateEntry() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const title = tab.title;
    const url = tab.url;
    // Generate entry without a date.
    const entry = `- [x] [${title}](${url})`;
    document.getElementById("entryOutput").value = entry;
    // Store the title for commit message use.
    document.getElementById("entryOutput").dataset.title = title;
}

// Run entry generation and load saved file path when the popup loads.
document.addEventListener("DOMContentLoaded", () => {
    generateEntry();
    const savedFilePath = localStorage.getItem("filePath");
    if (savedFilePath) {
        document.getElementById("filePath").value = savedFilePath;
    }
});

// Function to determine content type by injecting a content script into the active tab.
async function determineContentType() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            function determineContentTypeInner() {
                // This function can be expanded with more checks if needed.
                // For now, we simply return "[Articles]" (but we won't use it in the commit message).
                return "[Articles]";
            }
            return determineContentTypeInner();
        },
    });
    return result;
}

// Utility function to update status message.
function updateStatus(message, isSuccess) {
    const statusDiv = document.getElementById("status");
    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = isSuccess ? "green" : "red";
}

// Event listener for Save and Commit Locally.
document.getElementById("saveLocal").addEventListener("click", async () => {
    const filePath = document.getElementById("filePath").value.trim();
    const entry = document.getElementById("entryOutput").value;
    const title = document.getElementById("entryOutput").dataset.title || "";

    if (!filePath) {
        updateStatus("Please enter the file path.", false);
        return;
    }

    if (!entry) {
        updateStatus(
            "Entry is empty. Please reload or generate an entry.",
            false
        );
        return;
    }

    // Save the file path in localStorage for future use.
    localStorage.setItem("filePath", filePath);

    // (Optional) Determine content type.
    await determineContentType(); // Not used in commit message now.

    // Build commit message without category.
    const commitMessage = `Complete: ${title}`;

    // Send commit info via native messaging.
    chrome.runtime.sendNativeMessage(
        "com.example.githelper", // Must match your native host manifest name.
        {
            file: filePath,
            entry: entry,
            commitMessage: commitMessage,
        },
        (response) => {
            if (chrome.runtime.lastError) {
                updateStatus(
                    "Error: " + chrome.runtime.lastError.message,
                    false
                );
                return;
            }
            if (response && response.result === "success") {
                updateStatus("Entry successfully committed locally!", true);
            } else {
                updateStatus(
                    "Error: " + (response ? response.error : "unknown error"),
                    false
                );
            }
        }
    );
});
