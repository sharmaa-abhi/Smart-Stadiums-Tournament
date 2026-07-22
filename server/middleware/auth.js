import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No valid Bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Malformed Authorization header.' });
  }

  try {
    // 1. Support for mock/testing tokens
    if (token.startsWith('mock-') || token.startsWith('test-')) {
      const role = token.includes('admin') ? 'admin' :
                   token.includes('manager') ? 'manager' :
                   token.includes('security') ? 'security' : 'operator';
      req.user = { 
        id: `mock-${role}-id-100`, 
        email: `${role}@stadiumgenius.io`, 
        role 
      };
      return next();
    }

    // 2. Support for locally-signed Express JWT tokens
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // 3. Fallback support for Auth0 tokens (RS256) in development/simulation
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
      throw err;
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

