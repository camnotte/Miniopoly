// Optional real-browser regression. No browser dependency is needed by npm test.
// MINIOPOLY_PLAYWRIGHT_PATH and MINIOPOLY_CHROMIUM_PATH can select local tools.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium } = require(process.env.MINIOPOLY_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'miniopoly-water-'));
const out = process.env.MINIOPOLY_WATER_ARTIFACTS || dir;
let child, browser, base;
const errors = [];
async function api(route, body) {
  const r = await fetch(base + '/api/' + route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json();
  assert.equal(r.status, 200, data.error);
  return data;
}
function observe(page) {
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + new URL(r.url()).pathname); });
}
async function geometry(tile) {
  return tile.evaluate(n => {
    const water = n.querySelector('.tsunami-property-water'), svg = water?.querySelector('svg');
    const t = n.getBoundingClientRect(), w = water?.getBoundingClientRect(), s = svg?.getBoundingClientRect();
    return { position: water && getComputedStyle(water).position, tileWidth: t.width, tileHeight: t.height,
      width: w?.width, height: w?.height, svgHeight: s?.height, label: n.querySelector('.collapse-label')?.textContent };
  });
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const port = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
  base = 'http://127.0.0.1:' + port;
  child = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), DATA_DIR: dir }, stdio: 'ignore' });
  let ready = false;
  for (let i = 0; i < 200; i++) { try { ready = (await fetch(base + '/api/network')).ok; } catch {} if (ready) break; await new Promise(r => setTimeout(r, 25)); }
  assert(ready, 'normal host starts');
  const host = await api('create', { name: 'Cam', capacity: 2, gameMode: 'countdown', rounds: 10 });
  const guest = await api('join', { code: host.code, name: 'Mac' });
  const action = developer => api('action', { code: host.code, token: host.token, kind: 'developer', developer });
  await action({ action: 'start', round: 10 });
  browser = await chromium.launch({ executablePath: process.env.MINIOPOLY_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const pages = [];
  for (const seat of [host, guest]) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    await c.addInitScript(s => {
      localStorage.setItem('miniopoly_wifi_seat_v1', JSON.stringify(s));
      localStorage.setItem('miniopoly_personal_options_v1', JSON.stringify({ sound: false }));
    }, { code: host.code, token: seat.token });
    const p = await c.newPage(); observe(p); await p.goto(base);
    await p.waitForFunction(() => typeof state !== 'undefined' && state?.round === 10);
    pages.push(p);
  }
  const room = (await action({ action: 'jump', round: 11 })).state;
  assert.equal(room.collapse.wave, 1);
  const world = Number(Object.keys(room.collapse.lost)[0].split('-')[0]);
  for (const p of pages) {
    await p.waitForFunction(() => state?.collapse?.wave === 1);
    const f = p.frames().find(f => f.url().includes('board-v5-42'));
    await f.waitForFunction(() => miniWifiLatestState?.collapse?.wave === 1);
    await f.evaluate(w => { devPreviewBoard = w; render(); }, world);
    const g = await geometry(f.locator('.tile.express-lost').first());
    assert.equal(g.position, 'absolute'); assert(g.width > 40 && g.height > 20, 'real clients show a nonzero water layer');
    assert.equal(await f.locator('.deck-swash').count(), 2);
  }
  // Read-only render fixtures cover every deed kind in all three native worlds.
  const data = JSON.parse(fs.readFileSync(path.join(root, 'game-data.json')));
  const fixture = structuredClone(room); fixture.collapse.lost = {}; fixture.collapse.endangered = [];
  for (let w = 0; w < 3; w++) for (const kind of ['p', 'rail', 'util']) {
    const position = data.worlds[w].tiles.findIndex(t => t[0] === kind);
    if (position < 0) continue;
    const id = w + '-' + position; fixture.collapse.lost[id] = 1; delete fixture.owned[id];
  }
  const p = await browser.newPage({ viewport: { width: 1100, height: 1050 } }); observe(p);
  await p.goto(base + '/board-v5-42.html');
  await p.evaluate(room => { document.documentElement.classList.add('mini-live-turn-panel'); postMessage({ type: 'MINI_SYNC', state: room, skipReplay: true }, location.origin); }, fixture);
  await p.locator('.tsunami-center-status').waitFor();
  let cases = 0, animatedTiles = 0;
  for (const width of [1100, 390]) {
    await p.setViewportSize({ width, height: 1050 });
    for (let world = 0; world < 3; world++) {
      await p.evaluate(w => { devPreviewBoard = w; render(); document.getElementById('overlay').classList.add('hidden'); }, world);
      await p.waitForTimeout(100);
      const tiles = p.locator('.tile.express-lost');
      for (let i = 0; i < await tiles.count(); i++) {
        const tile = tiles.nth(i), g = await geometry(tile);
        assert.equal(g.position, 'absolute'); assert(g.width > g.tileWidth * .75); assert(g.height > g.tileHeight * .35);
        assert(g.svgHeight > g.height); assert.equal(g.label, 'SUBMERGED · NO RENT'); cases++;
        await tile.evaluate(n => n.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = 0; }));
        const low = await tile.screenshot();
        await tile.evaluate(n => n.getAnimations({ subtree: true }).forEach(a => { a.currentTime = 2400; }));
        const wash = await tile.screenshot(); assert(!low.equals(wash), 'wave animation changes the rendered tile pixels');
        await tile.locator('.tsunami-property-water').evaluate(n => { n.style.visibility = 'hidden'; });
        const dry = await tile.screenshot(); assert(!wash.equals(dry), 'water visibly overlays native property art');
        await tile.locator('.tsunami-property-water').evaluate(n => { n.style.visibility = ''; }); animatedTiles++;
      }
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
      if (world === 0) {
        await p.locator('.boardwrap').screenshot({ path: path.join(out, width === 1100 ? 'Tsunami-Visible-Water.png' : 'Tsunami-Visible-Water-Phone.png') });
        await tiles.first().screenshot({ path: path.join(out, width === 1100 ? 'Submerged-Property-Waves.png' : 'Submerged-Property-Waves-Phone.png') });
      }
    }
  }
  const changed = await p.evaluate(() => {
    const painter = miniTsunamiScene.painter; cancelAnimationFrame(painter.frame); painter.frame = 0;
    painter.time = 0; painter.draw(); const a = [...painter.surfaces.keys()].map(c => c.toDataURL());
    painter.time = 4; painter.draw(); return [...painter.surfaces.keys()].map((c, i) => c.toDataURL() !== a[i]);
  });
  assert.deepEqual(changed, [true, true], 'surrounding and center oceans both animate');
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.evaluate(() => miniTsunamiScene.painter.sync());
  assert.equal(await p.locator('.tsunami-shore-wash').first().evaluate(n => getComputedStyle(n).animationName), 'none');
  assert.equal(await p.evaluate(() => miniTsunamiScene.painter.frame), 0);
  for (const mode of ['classic', 'express']) {
    await p.evaluate(mode => miniTsunamiScene.update({ ...miniWifiLatestState, gameMode: mode }), mode);
    assert.equal(await p.locator('.tsunami-property-water,.tsunami-ocean-surround,.deck-swash').count(), 0);
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ twoLiveClients: true, actualWave: true, deedLayouts: cases, pixelVerifiedTiles: animatedTiles, movingOceanSurfaces: changed.length, reducedMotion: true, modeCleanup: true, errors }));
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (child && child.exitCode === null) { child.kill(); await new Promise(r => child.once('exit', r)); }
  fs.rmSync(dir, { recursive: true, force: true });
});
