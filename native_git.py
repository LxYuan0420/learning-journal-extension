#!/usr/bin/env python3
import sys
import json
import struct
import os
import subprocess


def read_message():
    """Read a message from stdin, prefixed with its length."""
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        sys.exit(0)
    message_length = struct.unpack("I", raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode("utf-8")
    return json.loads(message)


def send_message(message):
    """Send a message to stdout, prefixing it with its length."""
    encoded_content = json.dumps(message).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("I", len(encoded_content)))
    sys.stdout.buffer.write(encoded_content)
    sys.stdout.buffer.flush()


def main():
    try:
        message = read_message()
        # Expect a 'file' key that holds the absolute path (e.g., README.md)
        file_path = message.get("file")
        entry = message.get("entry")
        commit_message = message.get(
            "commitMessage", "Update README with new learning journal entry"
        )

        if not file_path or not entry:
            send_message({"result": "error", "error": "Missing file path or entry"})
            return

        # Read existing content if file exists, else start with empty string.
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                current_content = f.read()
        else:
            current_content = ""

        # Append the new entry to the file.
        new_content = current_content.rstrip() + "\n" + entry + "\n"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        # Derive the repository directory from the file path.
        repo_dir = os.path.dirname(file_path)

        # Run 'git add' for the file.
        subprocess.run(["git", "-C", repo_dir, "add", file_path], check=True)

        # Run 'git commit' with the provided commit message.
        try:
            subprocess.run(
                ["git", "-C", repo_dir, "commit", "-m", commit_message],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode().lower()
            # If there's nothing to commit, consider it a success.
            if "nothing to commit" in stderr:
                pass
            else:
                raise

        send_message({"result": "success"})
    except Exception as e:
        send_message({"result": "error", "error": str(e)})


if __name__ == "__main__":
    main()
