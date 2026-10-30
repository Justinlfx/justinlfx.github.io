# Justin availability

A responsive bilingual website hosted free on GitHub Pages.

- Booking: https://justinlfx.github.io/justin-availability/
- View-only availability: https://justinlfx.github.io/justin-availability/availability.html
- The old root URL redirects to the personalized path.

English and Chinese have independent interface translations. The language switch reads 中文 in English and English in Chinese. All appointment times use a 12-hour clock, with AM/PM in English and 上午/下午 in Chinese. The view-only page shows continuous free intervals for the selected day in the visitor’s selected time zone. It contains no booking form or clickable appointment slots.

## Development

Node.js 22+, no dependencies:

```sh
npm run dev
npm run check
```

Visit http://127.0.0.1:4173/justin-availability/.

## Architecture

GitHub Pages serves HTML, CSS, and JavaScript. The browser uses Cal.com’s public v2 slots and booking APIs. No API key, calendar token, subscription URL, personal calendar contents, or server is bundled with the site.

- Availability: `GET /v2/slots`, API version `2024-09-04`, with event type `7703035`, selected duration, explicit UTC day boundaries, and the viewer’s time zone.
- View-only intervals: retrieve one-minute free slots and merge adjacent slots. This resolves free time to the minute rather than approximating it from 30-minute booking slots.
- Booking: `POST /v2/bookings`, API version `2026-02-25`. The site requires name, email, and topic; organization and notes are optional. It rechecks availability before submitting. Cal.com validates conflicts and creates the invitation.
- Booking options: 30, 45, 60, and 120 minutes. Cal.com’s slot interval is **Use event length (default)**, so starts follow the chosen duration.
- Confirmation is displayed only after an accepted API response. Pending responses display a request acknowledgement. Network failures during submission never cause automatic retries, because the request may already have succeeded.
- Availability errors remain visible errors, never “no availability.” Superseded fetches are aborted and ignored. A 30-second in-memory cache avoids duplicate reads; Refresh bypasses it. Name, email, and form contents are never saved to local storage. Only language and time zone preferences are stored locally.
- Local calendar days use actual zone boundaries, including 23-hour and 25-hour daylight-saving days. Displayed intervals are clipped to the selected local day. Today shows only future free time.

Official API references:

- https://cal.com/docs/api-reference/v2/slots/get-available-time-slots-for-an-event-type
- https://cal.com/docs/api-reference/v2/bookings/create-a-booking

## Calendar configuration

Manage private calendar connections in Cal.com:

- Combine the primary calendars from U.S Work, U.S Personal, USC, and Outlook.
- Keep **HOX Calendar NEW excluded**, along with birthdays and holidays.
- Keep the five connected iCloud calendars selected: 课表, 飞行计划, Calendar, NookX, USC.
- Keep the private Dida busy-time mirror selected. Its private Google Apps Script sync runs approximately every 15 minutes; the subscription feed and credentials stay outside this repository.
- Daily scheduling hours remain 08:00–22:00 in `America/Los_Angeles`. The removed left-side information block does not change these scheduling rules.
- New bookings are added to U.S Work; U.S Work is the invitation’s calendar organizer. Cal.com’s delivery service sends the confirmation email, with U.S Work as Reply-To. This is not custom SMTP sending.
- Cal.com’s free personal plan provides the existing video meeting location and automatic confirmation.

Calendar-provider refresh and Dida’s sync interval can introduce delay. The UI displays the live availability returned by Cal.com; it does not claim to bypass provider refresh delays. Apple app-specific passwords may need replacement after Apple account changes.

## Validation

Automated checks cover allowed durations, localized 12-hour times, DST boundaries, cross-zone date rollover, range merging/clipping, duplicate slots, malformed API responses, and absence of credentials from public source.

Browser checks cover both languages, target-language switch labels, duration-dependent starts, time-zone conversion, view-only behavior, and mobile overflow. A temporary self-booking through the custom Chinese form succeeded; its invitation contained the submitted topic and notes and identified U.S Work as organizer. The temporary booking is cancelled after verification.

## Publish

Keep GitHub Pages configured for `main` and repository root. Upload the root public files and the `justin-availability` directory. Keep `.nojekyll`. `index.html` at the repository root redirects to the personalized route. No paid domain or server is required.
