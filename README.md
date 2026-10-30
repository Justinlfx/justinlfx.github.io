# Time with Justin

A responsive, bilingual booking website for GitHub Pages. Cal.com hosts calendar connections, conflict checks, booking forms, and invitations; no server needs to be purchased or maintained for this site.

## Run locally

Requires Node.js 22 or later. No dependency installation is required.

```sh
npm run dev
npm run check
```

Open `http://127.0.0.1:4173`.

## Booking configuration

`config.js` contains public settings only. Set `calLink` to the verified Cal.com username/event path and set `enabled: true` only after the calendar connections, destination calendar, availability schedule, and booking questions have been checked. Until then the site explicitly shows that bookings are not open and never invents availability or confirmations.

Manage the following in the private Cal.com dashboard:

- Connect every calendar account used for conflict checks.
- Add the private task-calendar ICS subscription, with completed tasks excluded.
- Use the intended work calendar as the destination for new bookings.
- Set every day to 08:00–22:00 in `America/Los_Angeles`.
- Offer meeting durations and require attendee name and email; add other relevant booking questions.
- Keep confirmation required disabled when bookings should be confirmed immediately.

Calendar subscriptions can refresh with a delay. The live provider owns conflict detection, recurrence handling, submission validation, and booking confirmation. The public site does not store form data or calendar credentials. A loaded iframe is never treated as a successful booking.

## GitHub Pages

Use a public repository named `<username>.github.io`. In **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`. No paid Actions runner or hosting subscription is needed for this buildless site. Keep `.nojekyll` in the root.

Publish `index.html`, `styles.css`, `app.js`, `booking-utils.js`, `config.js`, `.nojekyll`, and `favicon.svg`. The scripts and README are source documentation and are not needed by the website.

Never commit API keys, OAuth tokens, calendar feed URLs, calendar exports, or visitor details. The Cal.com booking path is public; a private calendar subscription URL is a secret and belongs only in the provider dashboard.
