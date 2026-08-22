const PLACEHOLDER_EMAIL_DOMAIN = "wedding-moment.internal";

/**
 * Better Auth's core signup contract requires an email even with the
 * `username` plugin enabled — this satisfies that internally so no form
 * has to collect one. Safe/unique as long as `username` is unique
 * (enforced by the DB column).
 */
export function toPlaceholderEmail(username: string): string {
  return `${username.toLowerCase()}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}
