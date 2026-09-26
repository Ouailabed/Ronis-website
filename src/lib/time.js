// Everything here works in London time, wherever the visitor is.
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function londonNow(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const day = DAYS.indexOf(parts.weekday.slice(0, 3).toLowerCase());
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return { day, minutes };
}

const toMinutes = (hhmm) => {
  const [h, m = "0"] = String(hhmm).trim().split(":");
  return Number(h) * 60 + Number(m);
};

export function formatTime(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  if (m === 0) return "midnight";
  if (m === 720) return "noon";
  const h = Math.floor(m / 60), mm = m % 60;
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 || 12;
  return mm ? `${h12}:${String(mm).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

// "Mon-Fri, Sun" -> Set of day indexes
function parseDays(text) {
  const set = new Set();
  String(text)
    .toLowerCase()
    .split(",")
    .forEach((part) => {
      const [a, b] = part.split(/\s*[-–—]\s*/).map((s) => DAYS.indexOf(s.trim().slice(0, 3)));
      if (a < 0) return;
      if (b === undefined || b < 0) return set.add(a);
      for (let d = a; ; d = (d + 1) % 7) {
        set.add(d);
        if (d === b) break;
      }
    });
  return set;
}

// Opening windows for a given day, as [start, end] minutes (end may be > 1440).
function windowsFor(hours, day) {
  return hours
    .filter((h) => parseDays(h.days).has(day))
    .map((h) => {
      const open = toMinutes(h.open);
      let close = toMinutes(h.close);
      if (close <= open) close += 1440; // closes after midnight
      return [open, close];
    });
}

// Returns null when a store has no hours, otherwise { open, label }.
export function storeStatus(hours, now = londonNow()) {
  if (!hours?.length) return null;
  const { day, minutes } = now;
  const yesterday = (day + 6) % 7;
  const current =
    windowsFor(hours, day).find(([o, c]) => minutes >= o && minutes < c) ||
    windowsFor(hours, yesterday)
      .map(([o, c]) => [o - 1440, c - 1440])
      .find(([o, c]) => minutes >= o && minutes < c);
  if (current) return { open: true, label: `Open now · till ${formatTime(current[1])}` };

  for (let offset = 0; offset < 7; offset += 1) {
    const d = (day + offset) % 7;
    const next = windowsFor(hours, d)
      .map(([o]) => o)
      .filter((o) => offset > 0 || o > minutes)
      .sort((x, y) => x - y)[0];
    if (next !== undefined) {
      const when = offset === 0 ? "" : offset === 1 ? "tomorrow " : `${DAY_LABELS[d]} `;
      return { open: false, label: `Closed · opens ${when}${formatTime(next)}` };
    }
  }
  return { open: false, label: "Closed" };
}

export function liveMessage(messages, fridayMessage, now = londonNow()) {
  if (now.day === 5 && fridayMessage) return fridayMessage;
  const hit = messages.find((m) => now.minutes >= toMinutes(m.from) && now.minutes < toMinutes(m.to));
  return hit?.text ?? "";
}
