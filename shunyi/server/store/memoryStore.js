let latestMeeting = null;

export function setLatestMeeting(result) {
  latestMeeting = result;
  return latestMeeting;
}

export function getLatestMeeting() {
  return latestMeeting;
}
