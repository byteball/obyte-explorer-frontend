import { DateTime, Duration } from "luxon";

export function getDateFromSeconds(seconds) {
  return DateTime.fromSeconds(seconds).toFormat("dd.LL.yyyy HH:mm:ss");
}

export function getDurationFromSeconds(seconds) {
  const d = Duration.fromObject({ hours: 0, minutes: 0, seconds: seconds }).normalize().toObject();
  if (d.hours === 0) delete d.hours;
  if (d.minutes === 0) delete d.minutes;

  return Duration.fromObject(d).toHuman().replace(/,/g, "");
}
