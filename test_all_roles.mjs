// Functional test: Register & verify all 4 roles against every major API endpoint
// Uses the CORRECT HTTP methods and paths matching the actual server routes
const BASE = 'http://localhost:5000/api';

const ROLES = ['operator', 'security', 'manager', 'admin'];
const VENUE_ID = 'metlife';

async function req(path, opts = {}) {
  const { headers, ...otherOpts } = opts;
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...otherOpts,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function testRole(role) {
  const email = `func_${role}_${Date.now()}@stadium.com`;
  const password = 'Password123!';
  const name = `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ROLE: ${role.toUpperCase()}`);
  console.log(`${'═'.repeat(60)}`);

  // ── 1. Register ──
  const reg = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
  console.log(`  [Register]         ${reg.status === 201 ? '✅ PASS' : '❌ FAIL'} (${reg.status}) — ${reg.body.message || reg.body.error}`);
  if (reg.status !== 201) return { role, passed: 0, total: 21 };

  const token = reg.body.token;
  const returnedRole = reg.body.user.role;
  const auth = { Authorization: `Bearer ${token}` };

  console.log(`  [Role Check]       ${returnedRole === role ? '✅ PASS' : '❌ FAIL'} — expected "${role}", got "${returnedRole}"`);

  // ── 2. Login ──
  const login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  console.log(`  [Login]            ${login.status === 200 ? '✅ PASS' : '❌ FAIL'} (${login.status})`);

  // ── 3. GET /auth/me ──
  const me = await req('/auth/me', { headers: auth });
  console.log(`  [GET /me]          ${me.status === 200 ? '✅ PASS' : '❌ FAIL'} (${me.status}) — name="${me.body.user?.name}", role="${me.body.user?.role}"`);

  // ── 4. Venues ──
  const venues = await req('/venues', { headers: auth });
  console.log(`  [GET /venues]      ${venues.status === 200 ? '✅ PASS' : '❌ FAIL'} (${venues.status}) — ${venues.body.venues?.length ?? 0} venues`);

  // ── 5. Venue KPIs ──
  const kpis = await req(`/venues/${VENUE_ID}/kpis`, { headers: auth });
  console.log(`  [GET /kpis]        ${kpis.status === 200 ? '✅ PASS' : '❌ FAIL'} (${kpis.status}) — totalFans=${kpis.body.kpis?.totalFans}`);

  // ── 6. Venue Alerts ──
  const alerts = await req(`/venues/${VENUE_ID}/alerts`, { headers: auth });
  console.log(`  [GET /alerts]      ${alerts.status === 200 ? '✅ PASS' : '❌ FAIL'} (${alerts.status}) — ${alerts.body.alerts?.length ?? 0} alerts`);

  // ── 7. Venue Occupancy ──
  const occ = await req(`/venues/${VENUE_ID}/occupancy`, { headers: auth });
  console.log(`  [GET /occupancy]   ${occ.status === 200 ? '✅ PASS' : '❌ FAIL'} (${occ.status}) — ${occ.body.occupancy?.length ?? 0} zones`);

  // ── 8. Venue Timeseries ──
  const ts = await req(`/venues/${VENUE_ID}/timeseries?points=5`, { headers: auth });
  console.log(`  [GET /timeseries]  ${ts.status === 200 ? '✅ PASS' : '❌ FAIL'} (${ts.status}) — ${ts.body.timeseries?.length ?? 0} points`);

  // ── 9. Venue Heatmap ──
  const hm = await req(`/venues/${VENUE_ID}/heatmap`, { headers: auth });
  console.log(`  [GET /heatmap]     ${hm.status === 200 ? '✅ PASS' : '❌ FAIL'} (${hm.status}) — ${hm.body.heatmap?.length ?? 0} rows`);

  // ── 10. Venue Gates ──
  const gates = await req(`/venues/${VENUE_ID}/gates`, { headers: auth });
  console.log(`  [GET /gates]       ${gates.status === 200 ? '✅ PASS' : '❌ FAIL'} (${gates.status}) — ${gates.body.gates?.length ?? 0} gates`);

  // ── 11. Venue Concessions ──
  const conc = await req(`/venues/${VENUE_ID}/concessions`, { headers: auth });
  console.log(`  [GET /concessions] ${conc.status === 200 ? '✅ PASS' : '❌ FAIL'} (${conc.status}) — ${conc.body.concessions?.length ?? 0} items`);

  // ── 12. Incidents list ──
  const inc = await req(`/incidents?venue_id=${VENUE_ID}`, { headers: auth });
  console.log(`  [GET /incidents]   ${inc.status === 200 ? '✅ PASS' : '❌ FAIL'} (${inc.status}) — ${inc.body.incidents?.length ?? 0} incidents`);

  // ── 13. Create Incident (POST) ──
  const newInc = await req('/incidents', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      type: 'Test Incident',
      zone: 'Zone A',
      priority: 'low',
      description: `Functional test by ${role}`,
      venue_id: VENUE_ID,
    }),
  });
  console.log(`  [POST /incidents]  ${newInc.status === 201 ? '✅ PASS' : '❌ FAIL'} (${newInc.status}) — id=${newInc.body.incident?.incident_id || 'N/A'}`);

  // ── 14. Resolve Incident (PATCH, not PUT) ──
  let resolvePass = false;
  if (newInc.body.incident) {
    const resolve = await req(`/incidents/${newInc.body.incident.id}`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify({ status: 'resolved', response: '5s' }),
    });
    resolvePass = resolve.status === 200;
    console.log(`  [PATCH /incidents] ${resolvePass ? '✅ PASS' : '❌ FAIL'} (${resolve.status}) — resolved`);
  } else {
    console.log(`  [PATCH /incidents] ⏭️ SKIP (no incident to resolve)`);
  }

  // ── 15. Broadcasts (correct path: /broadcast/messages) ──
  const bc = await req('/broadcast/messages', { headers: auth });
  console.log(`  [GET /broadcast]   ${bc.status === 200 ? '✅ PASS' : '❌ FAIL'} (${bc.status}) — ${bc.body.messages?.length ?? 0} messages`);

  // ── 16. Create Broadcast ──
  const newBc = await req('/broadcast/messages', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      title: `Test from ${role}`,
      message: 'Functional test broadcast',
      channel: 'all',
      priority: 'normal',
      venue_id: VENUE_ID,
    }),
  });
  console.log(`  [POST /broadcast]  ${newBc.status === 201 ? '✅ PASS' : '❌ FAIL'} (${newBc.status})`);

  // ── 17. Analytics ──
  const analytics = await req('/analytics/overview', { headers: auth });
  console.log(`  [GET /analytics]   ${analytics.status === 200 ? '✅ PASS' : '❌ FAIL'} (${analytics.status})`);

  // ── 18. AI Chat (correct field: session_id) ──
  const ai = await req('/ai/chat', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ message: 'What is the crowd density?', session_id: `test-${role}-${Date.now()}` }),
  });
  console.log(`  [POST /ai/chat]    ${ai.status === 200 ? '✅ PASS' : '❌ FAIL'} (${ai.status}) — ${ai.body.content?.length ?? 0} chars`);

  // ── 19. Update Profile (PATCH, not PUT) ──
  const profile = await req('/users/profile', {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ name: `${name} Verified` }),
  });
  console.log(`  [PATCH /profile]   ${profile.status === 200 ? '✅ PASS' : '❌ FAIL'} (${profile.status}) — name="${profile.body.user?.name}"`);

  // ── 20. Change Password (PATCH, not PUT) ──
  const pwd = await req('/users/password', {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ currentPassword: password, newPassword: 'NewPassword456!' }),
  });
  console.log(`  [PATCH /password]  ${pwd.status === 200 ? '✅ PASS' : '❌ FAIL'} (${pwd.status})`);

  // ── 21. SSE token auth (query param) ──
  const sseToken = await req(`/venues/${VENUE_ID}/kpis?token=${token}`, {
    headers: {},
  });
  console.log(`  [Token Auth]       ${sseToken.status === 200 ? '✅ PASS' : '❌ FAIL'} (${sseToken.status}) — query-param token`);

  // Count results
  const results = [
    reg.status === 201, returnedRole === role, login.status === 200,
    me.status === 200, venues.status === 200, kpis.status === 200,
    alerts.status === 200, occ.status === 200, ts.status === 200,
    hm.status === 200, gates.status === 200, conc.status === 200,
    inc.status === 200, newInc.status === 201, resolvePass,
    bc.status === 200, newBc.status === 201,
    analytics.status === 200, ai.status === 200,
    profile.status === 200, pwd.status === 200, sseToken.status === 200,
  ];
  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log(`\n  ── SUMMARY: ${passed}/${total} tests passed for role "${role}" ${passed === total ? '🎉' : '⚠️'}`);
  return { role, passed, total };
}

// ── Run all roles ──
(async () => {
  console.log('\n🏟️  StadiumGenius — Full Role Functional Test Suite (v2)');
  console.log(`   Target: ${BASE}`);
  console.log(`   Venue:  ${VENUE_ID}`);
  console.log(`   Roles:  ${ROLES.join(', ')}`);
  console.log(`   Tests:  22 per role (Registration, Auth, Venues, Incidents,`);
  console.log(`           Broadcast, Analytics, AI Chat, Profile, Password, SSE)`);

  const results = [];
  for (const role of ROLES) {
    results.push(await testRole(role));
  }

  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('  FINAL RESULTS');
  console.log(`${'═'.repeat(60)}`);
  let allPass = true;
  for (const r of results) {
    const icon = r.passed === r.total ? '✅' : '❌';
    console.log(`  ${icon} ${r.role.toUpperCase().padEnd(12)} ${r.passed}/${r.total} passed`);
    if (r.passed !== r.total) allPass = false;
  }
  console.log(`${'═'.repeat(60)}`);
  console.log(allPass ? '  🎉 ALL ROLES FULLY FUNCTIONAL — 88/88 TESTS PASSED' : '  ⚠️  SOME TESTS FAILED — review above');
  console.log(`${'═'.repeat(60)}\n`);
})();
