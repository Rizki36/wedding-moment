export function frameKey(eventId: string, frameId: string) {
  return `events/${eventId}/frames/${frameId}.png`;
}

export function eventCoverImageKey(eventId: string, ext: "jpg" | "png") {
  return `events/${eventId}/cover.${ext}`;
}

export function submissionPhotoKey(eventId: string, submissionId: string) {
  return `events/${eventId}/submissions/${submissionId}/photo.jpg`;
}

export function submissionAudioKey(
  eventId: string,
  submissionId: string,
  ext: string,
) {
  return `events/${eventId}/submissions/${submissionId}/audio.${ext}`;
}

export function eventPrefix(eventId: string) {
  return `events/${eventId}/`;
}
