// Public website settings only. Never put passwords, API keys, or calendar feed URLs here.
export const bookingConfig = Object.freeze({
  // Set only after all four email calendars AND the task calendar are verified.
  enabled: false,
  // Your own Cal.com booking path, for example "your-username/conversation".
  // Do not use another person's link or an unverified guessed username.
  calLink: "",
  hostTimeZone: "America/Los_Angeles",
  defaultLanguage: "en",
});
