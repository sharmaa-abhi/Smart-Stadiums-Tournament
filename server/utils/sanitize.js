/**
 * Strip sensitive fields (e.g. password) from a user record before sending it to the client.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}
