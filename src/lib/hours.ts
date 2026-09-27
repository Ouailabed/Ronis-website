import type { Hours, Location } from "../data/business";

// All opening-hours logic runs on London time, wherever the visitor is.
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type LondonNow = { day: number; minutes: number; date: Date };

export function londonNow(date = new Date()): LondonNow {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return { day: DAYS.indexOf(String(parts.weekday).slice(0, 3).toLowerCase()), minutes: Number(parts.hour) * 60 + Number(parts.minute), date };
}

const toMinutes = (hhmm: string) => {
  const [h, m = "0"] = hhmm.trim().split(":");
  return Number(h) * 60 + Number(m);
};

export function formatTime(minutes: number) {
  const m = ((minutes % 1440) + 1440) % 1440;
  if (m === 0) return "midnight";
  if (m === 720) return "noon";
  const h = Math.floor(m / 60), mm = m % 60;
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""}${suffix}`;
}

function parseDays(text: string) {
  const set = new Set<number>();
  text.toLowerCase().split(",").forEach((part) => {
    const [a, b] = part.split(/\s*[-–—]\s*/).map((s) => DAYS.indexOf(s.trim().slice(0, 3)));
    if (a < 0) return;
    if (b === undefined || b < 0) {
      set.add(a);
      return;
    }
    for (let d = a; ; d = (d + 1) % 7) {
      set.add(d);
      if (d === b) break;
    }
  });
  return set;
}

function windows(hours: Hours[], day: number) {
  return hours
    .filter((h) => parseDays(h.days).has(day))
    .map((h) => {
      const open = toMinutes(h.open);
      let close = toMinutes(h.close);
      if (close <= open) close += 1440;
      return [open, close] as const;
    });
}

export type OpenStatus = { open: boolean; label: string; closingSoon: boolean };

/** null when the shop's hours aren't published. */
export function openStatus(hours: Hours[], now: LondonNow = londonNow()): OpenStatus | null {
  if (!hours.length) return null;
  const { day, minutes } = now;
  const current =
    windows(hours, day).find(([o, c]) => minutes >= o && minutes < c) ??
    windows(hours, (day + 6) % 7).map(([o, c]) => [o - 1440, c - 1440] as const).find(([o, c]) => minutes >= o && minutes < c);
  if (current) {
    return { open: true, closingSoon: current[1] - minutes <= 45, label: `Open now · until ${formatTime(current[1])}` };
  }
  for (let offset = 0; offset < 7; offset += 1) {
    const d = (day + offset) % 7;
    const next = windows(hours, d).map(([o]) => o).filter((o) => offset > 0 || o > minutes).sort((x, y) => x - y)[0];
    if (next !== undefined) {
      const when = offset === 0 ? "" : offset === 1 ? "tomorrow " : `${DAY_LABELS[d]} `;
      return { open: false, closingSoon: false, label: `Closed · opens ${when}${formatTime(next)}` };
    }
  }
  return { open: false, closingSoon: false, label: "Closed" };
}

/** "Mon – Sun" / "7am – midnight" rows for display. */
export function hoursRows(hours: Hours[]) {
  return hours.map((h) => ({
    days: h.days.replace(/\s*-\s*/g, " – "),
    time: `${formatTime(toMinutes(h.open))} – ${formatTime(toMinutes(h.close))}`,
  }));
}

/** schema.org openingHoursSpecification */
export function openingHoursSpec(hours: Hours[]) {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [...parseDays(h.days)].sort().map((d) => names[d]),
    opens: h.open,
    closes: h.close === "24:00" ? "23:59" : h.close,
  }));
}

export const fullAddress = (l: Location) => [l.street, l.locality, l.postcode].filter(Boolean).join(", ");

export const directionsUrl = (l: Location) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`Roni's ${fullAddress(l)}`)}`;

export const appleMapsUrl = (l: Location) => `https://maps.apple.com/?q=${encodeURIComponent(`Roni's, ${fullAddress(l)}`)}`;

export const telHref = (phone: string) => `tel:+44${phone.replace(/\s/g, "").replace(/^0/, "")}`;

/** Today's opening times as text ("7am – midnight"), or null if not open today / not published. */
export function todayHours(hours: Hours[], now: LondonNow = londonNow()) {
  const w = windows(hours, now.day);
  if (!w.length) return null;
  return w.map(([o, c]) => `${formatTime(o)} – ${formatTime(c)}`).join(", ");
}
