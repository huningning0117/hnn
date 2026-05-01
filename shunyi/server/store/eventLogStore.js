const MAX_EVENT_LOGS = 100;
const eventLogs = [];
let nextEventId = 1;

function formatEventTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(" ");
}

export function addEvent(eventObj = {}) {
  const entry = {
    id: eventObj.id || `event-${nextEventId++}`,
    time: eventObj.time || formatEventTime(),
    event: eventObj.event || "unknown_event",
    source: eventObj.source || "android_app",
  };

  if (typeof eventObj.detail === "string" && eventObj.detail.trim()) {
    entry.detail = eventObj.detail.trim().slice(0, 300);
  }

  eventLogs.push(entry);

  if (eventLogs.length > MAX_EVENT_LOGS) {
    eventLogs.splice(0, eventLogs.length - MAX_EVENT_LOGS);
  }

  return entry;
}

export function getEvents() {
  return eventLogs.slice().reverse();
}
