import test from 'node:test'
import assert from 'node:assert/strict'
import { isAdminHost, isPublicPath, publicLanding } from '../src/lib/accessMode.ts'

test('only loopback hosts keep the administration', () => {
  for (const h of ['localhost', 'LOCALHOST', '127.0.0.1', '[::1]', 'app.localhost', 'localhost.']) assert.equal(isAdminHost(h), true, h)
  for (const h of ['192.168.1.20', '10.0.0.5', 'stage-banning-app.vercel.app', 'localhost.evil.com', '127.0.0.1.evil.com', '0.0.0.0', '']) assert.equal(isAdminHost(h), false, h)
})
test('public hosts reach only home, ruleset details and ban sessions', () => {
  for (const p of ['/', '/rulesets/shine-city', '/rulesets/shine-city/', '/session/setup/neon-weekly', '/session/setup/x/']) assert.equal(isPublicPath(p), true, p)
  for (const p of ['/tournament', '/tournament/', '/registration', '/account', '/my-tournaments', '/tournament/screen', '/tournament/presentation',
    '/tournament/standings', '/tournament/standings/presentation', '/tournament/match/W1', '/tournament/match/W1/presentation',
    '/rulesets/new', '/rulesets/shine-city/edit', '/session/setup', '/session/setup/a/b', '/admin', '//tournament', '/%2e%2e/tournament'])
    assert.equal(isPublicPath(p), false, p)
})
test('blocked paths on a public host land on the ban home; allowed ones are untouched', () => {
  assert.equal(publicLanding('/tournament'), '/')
  assert.equal(publicLanding('/registration'), '/')
  assert.equal(publicLanding('/session/setup/shine-city'), null)
  assert.equal(publicLanding('/'), null)
})
