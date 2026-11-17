# Infertility Case Record: setup guide

This app records infertility cases for cattle and buffaloes. It saves every case on the phone first, so it works with no signal. When the phone is online, it syncs the cases to a Google Sheet that you own.

Setup takes about 20 minutes, done once.

## Files

| File | What it is |
| --- | --- |
| index.html | The app |
| sw.js | Makes the app open with no internet |
| manifest.webmanifest, icon-*.png | App name and icon for the home screen |
| google-sheet-sync.gs | Script that connects the app to your Google Sheet |

## Step 1: Create the Google Sheet (the online database)

1. Open Google Sheets and create a blank sheet named **Infertility Cases**.
2. Click **Extensions > Apps Script**.
3. Delete the sample code, then paste in everything from `google-sheet-sync.gs`.
4. On the line `const SECRET = 'CHANGE-THIS-KEY';`, change the key to your own password, for example `amul-fip-2026`. Click **Save**.
5. Click **Deploy > New deployment**. Click the gear icon and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, then allow access when Google asks. You may need to click "Advanced > Go to project".
7. Copy the **Web app URL**. It ends in `/exec`.

The sheet tab "Cases" is created automatically the first time the app syncs. Every field becomes a column, ready for Excel or pivot-table analysis.

## Step 2: Put the app online (free hosting)

The app has to be opened once from a web address. After that it works offline. Use either option.

**Option A: Netlify Drop (easiest)**

1. Create a free account at app.netlify.com.
2. Open app.netlify.com/drop and drag the whole app folder onto the page.
3. You get a link like `https://something.netlify.app`. You can rename it under Site settings.

**Option B: GitHub Pages**

1. Create a free GitHub account and a new public repository, for example `case-record`.
2. Upload all the files: Add file > Upload files.
3. Go to Settings > Pages and set Source to "Deploy from branch", branch `main`, folder `/root`.
4. Your link is `https://<username>.github.io/case-record/`.

## Step 3: Install on each Android phone

1. Open the link in **Chrome**.
2. Tap the menu (three dots) and choose **Add to Home screen** or **Install app**.
3. Open the app from the icon. It runs full-screen like a normal app.
4. Tap **Settings** and enter:
   - the Sync URL (from Step 1)
   - the secret key (from Step 1)
   - your name
5. Tap **Save settings**.

Give the same URL and key to field staff. Everyone's cases go into the same sheet.

## How offline and online work

- **Saving:** cases are always saved on the phone first. With no signal, the header shows "Offline · 3 to sync".
- **Syncing:** when the internet returns, the app syncs on its own. It also checks every 5 minutes while open. Tap the status button to sync immediately.
- **Two-way:** sync also downloads cases added from other phones. A new phone gets all records after its first sync.
- **Edits on two phones:** the most recent edit is kept.
- **Delete:** deleting a case removes it from the sheet as well.
- **Export CSV** (in Settings) saves an Excel-ready file from the phone at any time.

## Making a real APK (optional)

To have an .apk file to share or publish on the Play Store:

1. Open pwabuilder.com and paste in your app link from Step 2.
2. Choose **Package for stores > Android**.
3. Download the .apk or .aab and install it on phones (allow "Install unknown apps").

The APK uses the same app, so offline saving and sync work the same way.

## Updating the app later

1. Edit the files.
2. In `sw.js`, change `case-record-v1` to `case-record-v2`.
3. Upload the files again.

Phones get the new version the next time they open the app online.

## Privacy note

The sheet contains farmer names and villages. Keep the sheet private (do not share it publicly) and keep the secret key within your team. The web app URL accepts data only when the correct key is sent.
