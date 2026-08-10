/**
 * StadiumGenius In-Memory DB Engine
 * 
 * Provides a synchronous DB interface compatible with SQLite driver contracts
 * (prepare().get(), prepare().all(), prepare().run()) for Express backend operation.
 */

const memoryDB = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@stadiumgenius.io',
      password: '$2a$10$e8N8Q/W3zY.8p2x/8.8..u8aB/J5Y4z55e1u5O6J3n5p1x55e1u5O', // bcrypt hash
      role: 'admin',
      avatar: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Operator User',
      email: 'operator@stadiumgenius.io',
      password: '$2a$10$e8N8Q/W3zY.8p2x/8.8..u8aB/J5Y4z55e1u5O6J3n5p1x55e1u5O',
      role: 'operator',
      avatar: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Security User',
      email: 'security@stadiumgenius.io',
      password: '$2a$10$e8N8Q/W3zY.8p2x/8.8..u8aB/J5Y4z55e1u5O6J3n5p1x55e1u5O',
      role: 'security',
      avatar: null,
      created_at: new Date().toISOString(),
    },
  ],
  venues: [
    {
      id: 'metlife',
      name: 'MetLife Stadium',
      location: 'East Rutherford, NJ',
      capacity: 82500,
      status: 'active',
    },
    {
      id: 'rosebowl',
      name: 'Rose Bowl Stadium',
      location: 'Pasadena, CA',
      capacity: 90888,
      status: 'active',
    },
    {
      id: 'wembley',
      name: 'Wembley Stadium',
      location: 'London, UK',
      capacity: 90000,
      status: 'active',
    },
  ],
  incidents: [
    {
      id: 1,
      incident_id: 'INC-2026-1001',
      type: 'Crowd Congestion',
      zone: 'Gate A',
      time: '14:22',
      status: 'active',
      priority: 'high',
      response: 'Medical team dispatched',
      assignee: 'Security Unit 4',
      venue_id: 'metlife',
      description: 'High crowd density bottlenecking entry turnstiles',
      created_by: 1,
    },
    {
      id: 2,
      incident_id: 'INC-2026-1002',
      type: 'Spill / Hazard',
      zone: 'Concession B',
      time: '14:35',
      status: 'resolved',
      priority: 'low',
      response: 'Cleaned',
      assignee: 'Janitorial 2',
      venue_id: 'metlife',
      description: 'Liquid spill near register 3',
      created_by: 2,
    },
  ],
  alerts: [
    {
      id: 1,
      venue_id: 'metlife',
      severity: 'warning',
      message: 'Gate A throughput dropped by 25%',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      venue_id: 'metlife',
      severity: 'info',
      message: 'Concession South sales peak',
      timestamp: new Date().toISOString(),
    },
  ],
  broadcast_messages: [],
  ai_conversations: [],
  nextIds: {
    users: 4,
    incidents: 3,
    alerts: 3,
    venues: 4,
    broadcast_messages: 1,
    ai_conversations: 1,
  },
};

function parseQuery(sql) {
  const normalized = sql.trim().replace(/\s+/g, ' ');
  const isSelect = /^SELECT/i.test(normalized);
  const isInsert = /^INSERT INTO/i.test(normalized);
  const isUpdate = /^UPDATE/i.test(normalized);
  const isDelete = /^DELETE FROM/i.test(normalized);

  let tableName = 'users';
  if (normalized.includes('FROM users') || normalized.includes('INTO users') || normalized.includes('UPDATE users')) {
    tableName = 'users';
  } else if (normalized.includes('FROM venues') || normalized.includes('INTO venues') || normalized.includes('UPDATE venues')) {
    tableName = 'venues';
  } else if (normalized.includes('FROM incidents') || normalized.includes('INTO incidents') || normalized.includes('UPDATE incidents')) {
    tableName = 'incidents';
  } else if (normalized.includes('FROM alerts') || normalized.includes('INTO alerts') || normalized.includes('UPDATE alerts')) {
    tableName = 'alerts';
  } else if (normalized.includes('FROM broadcast_messages') || normalized.includes('INTO broadcast_messages') || normalized.includes('UPDATE broadcast_messages') || normalized.includes('DELETE FROM broadcast_messages')) {
    tableName = 'broadcast_messages';
  } else if (normalized.includes('FROM ai_conversations') || normalized.includes('INTO ai_conversations')) {
    tableName = 'ai_conversations';
  }

  return { normalized, isSelect, isInsert, isUpdate, isDelete, tableName };
}

const db = {
  prepare: (sql) => {
    const { normalized, isInsert, isUpdate, isDelete, tableName } = parseQuery(sql);

    return {
      get: (...params) => {
        const table = memoryDB[tableName] || [];
        if (!table.length) return undefined;

        // Match WHERE email = ?
        if (normalized.includes('WHERE email = ?') && params.length > 0) {
          return table.find((item) => item.email === params[0]);
        }
        // Match WHERE id = ?
        if (normalized.includes('WHERE id = ?') && params.length > 0) {
          return table.find((item) => String(item.id) === String(params[0]));
        }
        // Match WHERE venue_id = ?
        if (normalized.includes('WHERE venue_id = ?') && params.length > 0) {
          return table.find((item) => String(item.venue_id) === String(params[0]));
        }
        return table[0];
      },

      all: (...params) => {
        const table = memoryDB[tableName] || [];

        if (normalized.includes('WHERE venue_id = ?') && params.length > 0) {
          return table.filter((item) => item.venue_id === params[0]);
        }
        if (normalized.includes('WHERE status = ?') && params.length > 0) {
          return table.filter((item) => item.status === params[0]);
        }
        return [...table];
      },

      run: (...params) => {
        if (isInsert) {
          const nextId = memoryDB.nextIds[tableName] || Date.now();
          memoryDB.nextIds[tableName] = nextId + 1;

          if (tableName === 'users') {
            // INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)
            const newUser = {
              id: nextId,
              name: params[0] || 'User',
              email: params[1],
              password: params[2],
              role: params[3] || 'operator',
              avatar: params[4] || null,
              created_at: new Date().toISOString(),
            };
            memoryDB.users.push(newUser);
          } else if (tableName === 'incidents') {
            // INSERT INTO incidents (incident_id, type, zone, time, status, priority, response, assignee, venue_id, description, created_by)
            const newIncident = {
              id: nextId,
              incident_id: params[0],
              type: params[1],
              zone: params[2],
              time: params[3],
              status: 'active',
              priority: params[4] || 'medium',
              response: '-',
              assignee: 'Unassigned',
              venue_id: params[5] || 'metlife',
              description: params[6] || '',
              created_by: params[7] || 1,
            };
            memoryDB.incidents.push(newIncident);
          } else if (tableName === 'ai_conversations') {
            const newConv = {
              id: nextId,
              session_id: params[0],
              role: params[1] || 'user',
              content: params[2] || '',
              user_id: params[3] || 1,
              created_at: new Date().toISOString(),
            };
            memoryDB.ai_conversations.push(newConv);
          } else if (tableName === 'broadcast_messages') {
            const newMsg = {
              id: nextId,
              title: params[0],
              message: params[1],
              channel: params[2] || 'all',
              priority: params[3] || 'normal',
              status: params[4] || 'active',
              venue_id: params[5] || 'metlife',
              created_by: params[6] || 1,
              expires_at: params[7] || null,
              created_at: new Date().toISOString(),
            };
            memoryDB.broadcast_messages.push(newMsg);
          }
          return { lastInsertRowid: nextId, changes: 1 };
        }

        if (isUpdate) {
          if (tableName === 'users' && normalized.includes('WHERE id = ?')) {
            const targetId = params[params.length - 1];
            const user = memoryDB.users.find((u) => String(u.id) === String(targetId));
            if (user && normalized.includes('SET role = ?')) {
              user.role = params[0];
            }
            return { changes: 1 };
          }
          if (tableName === 'incidents' && normalized.includes('WHERE id = ?')) {
            const targetId = params[params.length - 1];
            const incident = memoryDB.incidents.find((i) => String(i.id) === String(targetId));
            if (incident) {
              if (normalized.includes('status = ?')) incident.status = params[0];
              if (normalized.includes('assignee = ?')) incident.assignee = params[1] || params[0];
            }
            return { changes: 1 };
          }
          if (tableName === 'broadcast_messages' && normalized.includes('WHERE id = ?')) {
            const targetId = params[params.length - 1];
            const msg = memoryDB.broadcast_messages.find((m) => String(m.id) === String(targetId));
            if (msg) {
              // Apply all SET field = ? updates
              params.slice(0, -1).forEach((val, idx) => {
                const setFields = normalized.match(/SET\s+(.+?)\s+WHERE/i)?.[1]?.split(',').map(s => s.trim().split(/\s*=\s*/)[0]) || [];
                if (setFields[idx]) msg[setFields[idx]] = val;
              });
            }
            return { changes: msg ? 1 : 0 };
          }
        }

        if (isDelete) {
          if (tableName === 'broadcast_messages' && normalized.includes('WHERE id = ?')) {
            const targetId = params[0];
            const idx = memoryDB.broadcast_messages.findIndex((m) => String(m.id) === String(targetId));
            if (idx !== -1) {
              memoryDB.broadcast_messages.splice(idx, 1);
              return { changes: 1 };
            }
            return { changes: 0 };
          }
        }

        return { changes: 1, lastInsertRowid: 1 };
      },
    };
  },

  transaction: (fn) => fn,
  pragma: () => {},
};

export default db;
