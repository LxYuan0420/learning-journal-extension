# Learning Journal Saver Chrome Extension

Learning Journal Saver is a Chrome extension that helps you quickly generate
markdown entries for your learning journal and automatically update a local
file (such as `README.md`) within a git repository. The extension appends the
entry to the specified file and performs a `git add` and `git commit` locally.
(After that, you only need to run `git push` manually.) The extension features
an old-school terminal look with a black background and white text.

## Features

- **Automatic Entry Generation:**  When you open the extension, it
  automatically creates a markdown entry based on the active tab's title and
  URL (without including a date).
<br>
- **Local File Update and Git Commit:**  The extension sends the entry along
  with a user-specified absolute file path (e.g. `/absolute/path/to/README.md`)
  to a native messaging host that appends the entry to the file and performs
  `git add` and `git commit`.
<br>
- **Persistent Settings:**  The absolute file path is saved in localStorage and
  reloaded on future sessions.
<br>
- **Visual Status Feedback:**  Instead of disruptive pop-up alerts, the
  extension displays a status message in green (for success) or red (for
  errors) within its UI.


## Repository Structure

- **`manifest.json`**: The Chrome extension manifest file.

- **`popup.html`**: The HTML file for the extension's popup window, styled with an old-school terminal look.

- **`popup.js`**: The JavaScript code for the extension, which handles entry generation, settings persistence, and communication with the native messaging host.

- **`native_git.py`**: The Python script that acts as the native messaging host. It appends the new entry to the specified file and executes the git commands.

- **`com.example.githelper.json`**: The native messaging host manifest file. This file must be copied to the Chrome Native Messaging Hosts directory on your system.

## Prerequisites

- **Operating System:** macOS (instructions provided here; Windows users should see below)  
- **Chrome Browser:** Latest version recommended  
- **Git:** Ensure git is installed and that your target repository is already initialized with `git init`  
- **Python 3:** Required to run the native messaging host script  
- **Chrome Native Messaging:** Must be configured by copying the host manifest file to the correct directory

## Installation

### 1. Set Up the Chrome Extension

1. Clone or download this repository to your local machine.
2. In Chrome, navigate to `chrome://extensions/`.
3. Enable **Developer Mode** by toggling the switch in the top-right corner.
4. Click **Load Unpacked** and select the folder containing the extension files (this repository).

### 2. Configure the Native Messaging Host

1. **Make the Python Script Executable:**  
   Open your terminal and run (adjust the path as needed):
   ```bash
   chmod +x /absolute/path/to/native_git.py
   ```
<br>

2.	**Update the Host Manifest File:** 
    Open com.example.githelper.json and update the "path" field to reflect the
    absolute path of your `native_git.py` file. Also, ensure that the
    "allowed_origins" field includes your extension’s ID (you can find it on
    chrome://extensions/ after loading the extension).

<br>

3.	**Copy the Host Manifest File to the Correct Directory:**

    ```bash
	# For macOS: Copy the manifest file to:
    $ cp com.example.githelper.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/

	# For Windows: Copy the manifest file to the directory (create it if it doesn’t exist):
    # Replace <YourUsername> with your actual Windows username.
    $ cp com.example.githelper.json C:\Users\<YourUsername>\AppData\Local\Google\Chrome\User Data\NativeMessagingHosts\

    # Reload the chrome extension after copying the manifest file so that it picks up the new native messaging host configuration.
    ```
	

## Usage
1. Open the Extension: Click on the Learning Journal Saver icon in Chrome.
2. Automatic Entry Generation: The extension automatically generates a markdown entry from the active tab’s title and URL (the entry does not include a date).
3. Set the File Path: In the “Local File Settings” section, enter the absolute path to the file you want to update (e.g., /absolute/path/to/README.md). This setting is saved for future sessions.
4. Save and Commit Locally: Click the Save and Commit Locally button. The extension sends the entry, file path, and commit message to the native messaging host. The native host appends the entry to the file and runs git add and git commit in the repository directory. (After that, run git push manually to update the remote repository.)
5. Status Feedback: The extension updates a status message at the bottom of the popup—green for success or red for errors.

## Troubleshooting
- Native Messaging Errors: If you see an error like “Error when communicating with the native messaging host”:
  - Ensure native_git.py is executable.
  - Verify that com.example.githelper.json is correctly placed in the destination directory and that its "path" field is correct.
  - Make sure the "allowed_origins" field includes your extension’s ID.
  - Restart Chrome after making changes.
- Git Commit Issues: If there’s “nothing to commit” or other git-related messages, note that the native messaging host script is set to treat “nothing to commit” as a successful operation.
