# B.I Records Beat Store

A responsive, Ghana-inspired beat marketplace for B.I Records.

## Files
- `index.html` — main storefront
- `styles.css` — visual design
- `script.js` — beat catalog, search/filter, cart and Paystack Popup
- `assets/bi-records-logo.jpeg` — supplied B.I Records logo
- `audio/` — place your MP3 preview files here

## Add real beats
Put your preview MP3 files in `/audio/` using these filenames:
- accra-after-dark.mp3
- golden-coast.mp3
- concrete-dreams.mp3
- black-star.mp3
- midnight-love.mp3
- osu-nights.mp3

Or change the `audioSrc` values in `script.js`.

## Paystack
Open `script.js` and replace:
`pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY`

The amount is converted from GHS to pesewas/cents in the browser. For a production store, use a backend to initialize/verify transactions and only release purchased files after server-side verification.

## Run
Open `index.html` in a browser, or serve the folder with any static web server.
