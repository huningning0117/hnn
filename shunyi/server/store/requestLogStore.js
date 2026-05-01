const MAX_REQUEST_LOGS = 100;
const requestLogs = [];

export function addRequestLog(log) {
  const entry = {
    time: log.time || new Date().toISOString(),
    method: log.method || "UNKNOWN",
    path: log.path || "/",
    statusCode: Number(log.statusCode) || 0,
    durationMs: Number(log.durationMs) || 0,
    source: log.source || "unknown",
  };

  requestLogs.push(entry);

  if (requestLogs.length > MAX_REQUEST_LOGS) {
    requestLogs.splice(0, requestLogs.length - MAX_REQUEST_LOGS);
  }

  return entry;
}

export function getRequestLogs() {
  return requestLogs.slice().reverse();
}

export function getRequestLogLimit() {
  return MAX_REQUEST_LOGS;
}
