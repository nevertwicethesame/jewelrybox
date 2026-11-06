# Never Twice the Same

A personal catalog for an antique and vintage jewelry collection. It's a single web page with no server, accounts, or build step. Add it to an iPhone Home Screen.

Live site: https://nevertwicethesame.github.io/jewelrybox/

## Features

- **Catalog:** record each piece's details, photos, and status.
- **Gallery:** shared reference photos, linked to pieces as references, comparables, or covers.
- **Curations:** collect pieces around a theme, such as Victorian mourning rings, and order them your way.
- **Sets:** link pieces that go together, such as matching earrings and a necklace. Linked pieces form one set, shown as a tray on the Collections page, sorted by type and then color.
- **Coveted Pieces:** wanted items with a photo, a link, and a type.
- **Secret Compartment:** a keyword-protected section. Hidden pieces stay hidden everywhere, including collections.
- **Jewelry of the Day:** a random pick, weighted toward pieces not worn recently.
- **Import and export:** CSV for spreadsheets, and JSON for full backups.
- **Reminders:** a backup banner when the last JSON backup is over 7 days old, and an update notice when a newer version is published.

## Install on iPhone

1. Open the live site in Safari.
2. Tap Share, then **Add to Home Screen**.
3. Always open the app from that Home Screen icon. Data stays on that device.

## Your data

Everything is stored on your device in the browser's IndexedDB. Nothing is uploaded.

iOS can clear browser storage, so keep regular JSON backups:

1. Open the menu, tap **I/O**, then choose **Export JSON**.
2. Save every file it produces to Files or iCloud Drive.

To restore, open the menu, tap **I/O**, and choose **Import JSON**. Select **all** the files from the same export at once. Restoring replaces the data on the device after you confirm. If a file is missing, the app warns you first.

## Privacy

- No accounts, analytics, or tracking. The only outside resource is Google Fonts.
- Your collection, photos, and wishlist stay on your device. The app's event log stays there too, with counts but no piece titles.
- The only other request the app makes is a check for `version.json` on this site.
- JSON backups are not encrypted. Store them somewhere private.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app in one file. |
| `version.json` | The current version. The app reads it for the update notice. |
| `sw.js` | The service worker, which keeps the app working offline. |
| `apple-touch-icon.png` | The Home Screen icon. |
| `README.md` | This file. |

## Development

- No build step. Edit `index.html` and publish it.
- Before publishing, check the script with `node --check`.
- Set the version in `APP_VERSION` in `index.html`, and make `version.json` match it.
