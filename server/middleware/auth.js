import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No valid token provided in header or query parameter.' });
  }

  try {
    // 1. Verify locally-signed Express JWT tokens
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded;
      return next();
    } catch (_err) {
      // 2. Support for Auth0 tokens (RS256) — decode and verify issuer
      const decoded = jwt.decode(token);
      if (decoded && (decoded.iss?.includes('auth0.com') || decoded.sub?.startsWith('auth0|'))) {
        const role = decoded.role || decoded['https://stadiumgenius.io/role'] || 'operator';
        req.user = {
          id: decoded.sub,
          email: decoded.email || `${decoded.sub.replace('|', '_')}@stadiumgenius.io`,
          role: role
        };
        return next();
      }
      throw _err;
    }
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
