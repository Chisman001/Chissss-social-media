/** Single canonical form for stored email and lookups (not full RFC parser). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
