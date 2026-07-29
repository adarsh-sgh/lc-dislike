# Dislike Count for LeetCode

Chrome extension that restores the hidden LeetCode dislike count on problem pages. LeetCode hides the number in its UI but the GraphQL API still returns it, so this fetches it and shows it inside the dislike button, next to the likes.

## Install

1. Open `chrome://extensions` and turn on Developer mode
2. Click "Load unpacked" and pick this folder

## Notes

- Content script reads the problem slug from the URL and queries `/graphql/` (same origin, cookies omitted) for the count
- Handles LeetCode's SPA navigation with a MutationObserver
- No permissions, nothing collected or sent anywhere besides LeetCode's own API

Icon based on Font Awesome Free's thumbs-down (CC BY 4.0), modified. See NOTICE.
