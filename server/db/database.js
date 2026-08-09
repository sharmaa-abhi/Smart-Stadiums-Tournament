/**
 * Database Module Placeholder for Supabase Integration
 * 
 * SQLite (node:sqlite) has been removed.
 * Wire up your Supabase client (@supabase/supabase-js) here.
 */

const notImplementedHandler = (methodName) => {
  return () => {
    throw new Error(
      `[Supabase Migration] Database action '${methodName}' called, but SQLite has been removed. ` +
      `Please configure your Supabase client in server/db/database.js.`
    );
  };
};

const db = {
  prepare: (sql) => {
    console.warn(`[Supabase Stub] Query attempted: "${sql.trim().replace(/\s+/g, ' ')}"`);
    return {
      get: () => {
        throw new Error(
          `[Supabase Migration] SQLite removed. Replace 'db.prepare().get()' with Supabase client query. ` +
          `Configure Supabase in server/db/database.js.`
        );
      },
      all: () => {
        console.warn(`[Supabase Stub] Returning empty array [] for query.`);
        return [];
      },
      run: () => {
        throw new Error(
          `[Supabase Migration] SQLite removed. Replace 'db.prepare().run()' with Supabase client mutation. ` +
          `Configure Supabase in server/db/database.js.`
        );
      },
    };
  },
  transaction: (fn) => fn,
  pragma: () => {},
};

export default db;
