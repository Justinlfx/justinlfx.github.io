# Justin Lu

An English personal website with bilingual booking pages, hosted on GitHub Pages.

## Personal website

The root page introduces Justin's finance experience, selected research, filmmaking, and campus leadership. The visual system uses paper and charcoal neutrals, Georgia headlines, an uncropped color professional portrait, and a source-based Carvana chart. LinkedIn uses an inline SVG. The page has no emoji, decorative icons, or dash punctuation.

- Homepage: https://justinlfx.github.io/
- Source branch: `personal-website`
- Homepage files: `index.html`, `personal.css`, `personal.js`, `personal-favicon.svg`, and `justin-lu.jpg`
- The existing booking application remains at `/justin-availability/`.

The homepage has no third-party font, analytics, or JavaScript dependencies. It uses native HTML disclosure for research notes, an accessible mobile menu, a keyboard skip link, visible focus states, and reduced-motion support. The chart is a historical research excerpt, with its period and metric definition shown on the page.

Design review follows [unslop by Damir Sokolovsky](https://github.com/heydamir/unslop), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The professional portrait and biographical content were supplied by Justin Lu.

Homepage verification covered desktop and mobile rendering, widths from 320 to 1440 pixels, menu open/close and Escape, navigation targets, research disclosure, asset responses, and the absence of emoji and dash punctuation. Existing booking checks passed unchanged.

## Booking website

The November 2026 redesign uses a compact personal header and a full-width appointment sheet, retaining the sage palette and DM Sans / Manrope typography. Calendar selections and booking actions carry the green accent. Captions have stronger contrast, controls have consistent spacing, and the mobile time list uses the page's normal scrolling. Both booking and view-only availability share the same presentation system.

The previous published design is preserved on [`checkpoint/pre-unslop-2026-11-03`](https://github.com/Justinlfx/justinlfx.github.io/tree/checkpoint/pre-unslop-2026-11-03), at commit `481bb3f656fcb27e659a97c4295976543e565130`. The redesign changes presentation only; scheduling rules and calendar integrations remain unchanged. Design review used [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop), CC BY 4.0.

- Booking: https://justinlfx.github.io/justin-availability/
- View-only availability: https://justinlfx.github.io/justin-availability/availability.html
- The homepage links to the booking page through “Book a conversation.”

English and Chinese have independent interface translations. Visible copy is limited to scheduling controls, booking details, status messages, and calendar privacy information; promotional headings and footer slogans are omitted. The language switch reads 中文 in English and English in Chinese. All appointment times use a 12-hour clock, with AM/PM in English and 上午/下午 in Chinese. The view-only page shows continuous free intervals for the selected day in the visitor’s selected time zone. It contains no booking form or clickable appointment slots.

Time zones start with U.S. Pacific, U.S. Eastern, Beijing, U.S. Central, and U.S. Mountain, followed by other regions. Labels include the GMT offset for the selected date and automatically follow daylight-saving changes.

## Development

Node.js 22+, no dependencies:

```sh
npm run dev
npm run check
```

Visit http://127.0.0.1:4173/ for the personal website or http://127.0.0.1:4173/justin-availability/ for booking. Set `PORT` to use another local port.

## Architecture

GitHub Pages serves HTML, CSS, and JavaScript. The browser uses Cal.com’s public v2 slots and booking APIs. No API key, calendar token, subscription URL, personal calendar contents, or server is bundled with the site.

- Availability: `GET /v2/slots`, API version `2024-09-04`, with booking event type `7703035`, the selected duration, explicit UTC day boundaries, and the viewer’s time zone.
- View-only intervals: the profile-hidden helper event `7751941` shares the same availability schedule and account calendar-conflict settings; its slot interval remains **Use event length (default)**. Retrieve one-minute free slots and merge adjacent slots. This resolves free time to the minute rather than approximating it from 30-minute booking slots.
- Booking: `POST /v2/bookings`, API version `2026-02-25`. The site requires name and email. The meeting topic and notes are optional; company/school is not requested. Visitors select Zoom or supply a custom location/meeting link, which is sent in the booking API location object. It rechecks availability before submitting. Cal.com validates conflicts and creates the invitation.
- Booking options: 30, 45, 60, and 120 minutes. The booking event’s Cal.com slot interval is **30 minutes**, so both the website and native booking/rescheduling offer half-hour starts. Availability and pre-submission checks use the booking event and selected duration directly. Keep the helper on the same schedule and account calendar-conflict settings; if event-specific buffers or restrictions are added later, mirror them to the helper.
- Confirmation is displayed only after an accepted API response. Pending responses display a request acknowledgement. Network failures during submission never cause automatic retries, because the request may already have succeeded.
- Availability errors remain visible errors, never “no availability.” Superseded fetches are aborted and ignored. A 30-second in-memory cache avoids duplicate reads; Refresh bypasses it. Name, email, and form contents are never saved to local storage. Only language and time zone preferences are stored locally.
- Local calendar days use actual zone boundaries, including 23-hour and 25-hour daylight-saving days. Displayed intervals are clipped to the selected local day. Today shows only future free time.

Official API references:

- https://cal.com/docs/api-reference/v2/slots/get-available-time-slots-for-an-event-type
- https://cal.com/docs/api-reference/v2/bookings/create-a-booking

## Calendar configuration

Manage private calendar connections in Cal.com:

- Combine the primary calendars from U.S Work, U.S Personal, USC, and Outlook.
- Keep unwanted shared calendars, birthdays, and holidays excluded.
- Keep the five previously connected iCloud calendars selected.
- Keep the private Dida busy-time mirror selected. Its private Google Apps Script sync runs approximately every 15 minutes; the subscription feed and credentials stay outside this repository.
- Daily scheduling hours remain 10:00–22:00 in `America/Los_Angeles`. The removed left-side information block does not change these scheduling rules.
- New bookings are added to U.S Work; U.S Work is the invitation’s calendar organizer. Cal.com’s delivery service sends the confirmation email, with U.S Work as Reply-To. This is not custom SMTP sending.
- The configured meeting locations are the connected Zoom integration and attendee-defined custom location. The booking API receives the selected location; Zoom links are generated by Cal.com, and custom locations are included in the invitation. Automatic confirmation remains enabled.

Calendar-provider refresh and Dida’s sync interval can introduce delay. The UI displays the live availability returned by Cal.com; it does not claim to bypass provider refresh delays. Apple app-specific passwords may need replacement after Apple account changes.

## Validation

Automated checks cover allowed durations, localized 12-hour times, DST boundaries, cross-zone date rollover, range merging/clipping, duplicate slots, malformed API responses, and absence of credentials from public source.

Browser checks cover both languages, target-language switch labels, half-hour starts for every duration, time-zone conversion, view-only behavior, and mobile overflow. A temporary self-booking through the custom Chinese form succeeded; its invitation contained the submitted topic and notes and identified U.S Work as organizer. The temporary booking was cancelled after verification. Additional self-bookings with empty meeting topics verified both Zoom-generated links and attendee-defined locations in the received ICS invitations; both test bookings were cancelled. The backend topic field is optional and the organization field is hidden.

## Publish

GitHub Pages uses `personal-website` and repository root. Keep all root public files, the `justin-availability` directory, and `.nojekyll`. `index.html` is the personal homepage; booking has its own route. No paid domain or server is required. The `main` branch retains the earlier booking-only version.
