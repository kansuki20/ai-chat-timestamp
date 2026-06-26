# Privacy Policy — AI Chat Timestamp

_Last updated: 2026-06-26_

## Overview

AI Chat Timestamp is a Chrome extension that automatically inserts the current local timestamp into AI chat messages before sending. This extension does not collect, store, transmit, or share any personal data.

## Data Collection

This extension does **not** collect any user data. Specifically:

- No personal information is collected
- No chat messages or content are read or stored
- No browsing history is recorded
- No data is sent to any external server

## Local Storage

The extension uses Chrome's `storage` API solely to save your preferences on your own device:

- **Enabled state** (ON/OFF toggle)
- **Custom timestamp format**

This data never leaves your device.

## Permissions

| Permission | Reason |
|---|---|
| `activeTab` | To detect which AI chat site is currently open |
| `scripting` | To inject the content script that inserts the timestamp |
| `storage` | To save your preferences locally on your device |
| `tabs` | To identify the active tab and apply the extension only on supported sites |
| Host permissions | To run on chatgpt.com, gemini.google.com, and claude.ai |

## Contact

If you have any questions, please open an issue on [GitHub](https://github.com/kansuki20/ai-chat-timestamp).
