# Time with Justin

A responsive, bilingual booking website for GitHub Pages. Cal.com hosts calendar connections, conflict checks, booking forms, and invitations; no server needs to be purchased or maintained for this site.

Website: https://justinlfx.github.io/

Booking route: https://cal.com/fanxi-lu-pkoayc/conversation

The booking route is enabled after verifying four email accounts, five iCloud calendars, and the private Dida busy-time mirror. Calendar credentials and synchronization run in the connected services; GitHub Pages hosts only the public website.

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

- Check the U.S Personal, U.S Work, USC primary, and Outlook primary calendars for conflicts. Explicitly exclude **HOX Calendar NEW**, birthdays, and holidays.
- Keep all five connected iCloud calendars enabled through the free Apple Calendar integration: 课表, 飞行计划, Calendar, NookX, and USC. The connection uses a private Apple app-specific password named **Cal.com Availability**. No password is stored in this repository.
- Keep **滴答清单 · 预约冲突（自动同步）** enabled. The private Apps Script mirror successfully synchronized 11 unfinished task time blocks and installed one trigger to run approximately every 15 minutes. The failed direct ICS connection and unused Google URL subscription have been removed.
- Use U.S Work as both the Cal.com primary email and the destination calendar for new bookings.
- Set every day to 08:00–22:00 in `America/Los_Angeles`.
- Offer 15, 30, 45, 60, 90, and 120 minutes, defaulting to 30. Start times use 15-minute steps.
- Require name, email, and meeting topic. Company/school and notes are optional.
- Keep confirmation required disabled when bookings should be confirmed immediately.

Two temporary self-bookings were created and cancelled during verification. The second received invitation's ICS organizer was the U.S Work email, and the booking existed in the work Google Calendar. Cal.com sends the confirmation email from its delivery service (`hello@cal.com`); the calendar invitation identifies U.S Work as organizer.

Dida conflict checks were verified on the public booking page across the Los Angeles daylight saving time transition. iCloud busy events were also confirmed by Cal.com's conflict diagnostics. Overlapping starts are excluded, and 30-minute appointments start no earlier than 08:00 and no later than 21:30.

Calendar subscriptions can refresh with a delay. The live provider owns conflict detection, recurrence handling, submission validation, and booking confirmation. The public site does not store form data or calendar credentials. A loaded iframe is never treated as a successful booking.

This setup uses GitHub Pages, Cal.com's free personal plan, and included Google Apps Script quotas; no purchased server is required. The existing Dida account supplies the private subscription feed. Its subscription export and the roughly 15-minute script interval can introduce delay. Changing the Apple account password may require replacing its app-specific password in Cal.com.

## GitHub Pages

Use a public repository named `<username>.github.io`. In **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`. No paid Actions runner or hosting subscription is needed for this buildless site. Keep `.nojekyll` in the root.

Publish `index.html`, `styles.css`, `app.js`, `booking-utils.js`, `config.js`, `.nojekyll`, and `favicon.svg`. The scripts and README are source documentation and are not needed by the website.

Never commit API keys, OAuth tokens, calendar feed URLs, calendar exports, or visitor details. The Cal.com booking path is public; a private calendar subscription URL is a secret and belongs only in the provider dashboard.
