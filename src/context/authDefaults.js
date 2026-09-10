export const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    'manage:users', 'manage:roles', 'configure:system', 'configure:ai',
    'read:incidents', 'delete:incidents', 'read:audit_logs', 'manage:dashboard'
  ],
  manager: [
    'read:dashboard', 'assign:staff', 'read:reports', 'read:incidents',
    'approve:ai', 'allocate:resources'
  ],
  operator: [
    'login', 'read:dashboard', 'update:incidents', 'read:crowd_analytics',
    'create:incidents', 'use:ai_assistant'
  ],
  security: [
    'login', 'read:security_dashboard', 'respond:incidents', 'verify:alerts',
    'read:cctv', 'update:emergency'
  ]
};

export const createDefaultUser = (role = 'admin') => {
  const r = (role || 'admin').toLowerCase();
  return {
    auth0_id: `user|${r}-bypass-id`,
    name: `Stadium ${r.charAt(0).toUpperCase() + r.slice(1)}`,
    email: `${r}@stadiumgenius.io`,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    role: r,
    account_status: 'active',
    email_verified: true,
    last_login: new Date().toISOString(),
    permissions: DEFAULT_ROLE_PERMISSIONS[r] || []
  };
};
