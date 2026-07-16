/**
 * Strip sensitive fields (e.g. password) from a user record before sending it to the client.
 */
export function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}
