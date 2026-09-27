import { useMemo, useState } from "react";
import { catering, ordering } from "../data/business";
import { ArrowUpRight, Calendar } from "./Icons";

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", ...o }).format(d);
const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

/** "When's your event?" → the latest time to order (48 hours before), plus a calendar reminder file. */
export default function EventPlanner() {
  const today = new Date();
  const minDate = new Date(today.getTime() + catering.leadTimeHours * 3600_000);
  const toInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const [date, setDate] = useState(() => toInput(new Date(today.getTime() + 7 * 86400_000)));
  const [time, setTime] = useState("12:00");

  const result = useMemo(() => {
    const event = new Date(`${date}T${time}:00`);
    if (Number.isNaN(event.getTime())) return null;
    const orderBy = new Date(event.getTime() - catering.leadTimeHours * 3600_000);
    return { event, orderBy, late: orderBy.getTime() < Date.now() };
  }, [date, time]);

  const downloadReminder = () => {
    if (!result) return;
    const start = new Date(result.orderBy.getTime() - 3 * 3600_000); // remind 3 hours before the deadline
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ronis Bagel Bakery//Catering reminder//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@ronis-catering`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(result.orderBy)}`,
      "SUMMARY:Order Roni's platters",
      `DESCRIPTION:Catering orders need 48 hours' notice. Order at ${ordering.catering}`,
      `URL:${ordering.catering}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Order Roni's platters",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "ronis-catering-reminder.ics" });
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="panel event-planner">
      <div className="ep-head">
        <Calendar />
        <h3 className="serif">When's your event?</h3>
      </div>
      <div className="ep-fields">
        <label htmlFor="ep-date">
          Date
          <input id="ep-date" type="date" value={date} min={toInput(today)} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label htmlFor="ep-time">
          Collection time
          <input id="ep-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      {result && (
        <div className={`ep-result${result.late ? " is-late" : ""}`} aria-live="polite">
          {result.late ? (
            <>
              <p className="ep-label">That's less than 48 hours away</p>
              <p className="ep-date serif">Call the shop you'll collect from</p>
              <p className="small">{catering.lastMinute}</p>
            </>
          ) : (
            <>
              <p className="ep-label">Place your order by</p>
              <p className="ep-date serif">
                {fmt(result.orderBy, { weekday: "long", day: "numeric", month: "long" })},{" "}
                {fmt(result.orderBy, { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "")}
              </p>
              <div className="ep-actions">
                <a className="btn btn-sm" href={ordering.catering} target="_blank" rel="noopener">
                  Order catering <ArrowUpRight />
                </a>
                <button className="btn btn-sm btn-line" onClick={downloadReminder}>
                  Add a reminder to my calendar
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <p className="small muted ep-note">
        Earliest possible collection if you order now: {fmt(minDate, { weekday: "short", day: "numeric", month: "short" })},{" "}
        {fmt(minDate, { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "")}.
      </p>
    </div>
  );
}
