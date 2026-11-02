import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CreateRulesetPage } from '../pages/CreateRulesetPage'
import { EditRulesetPage } from '../pages/EditRulesetPage'
import { HomePage } from '../pages/HomePage'
import { RulesetDetailPage } from '../pages/RulesetDetailPage'
import { SessionSetupPage } from '../pages/SessionSetupPage'
import { TournamentAdminPage } from '../pages/TournamentAdminPage'
import { TournamentPresentationPage } from '../pages/TournamentPresentationPage'
import { MatchVSPage } from '../pages/MatchVSPage'
import { PublicScreenPage } from '../pages/PublicScreenPage'
import { isAdminHost, publicLanding } from '../lib/accessMode'
import { RegistrationPage } from '../pages/RegistrationPage'
import { StandingsPage } from '../pages/StandingsPage'
import type { MatchId } from '../types/tournament'
import { TournamentWorkspace } from '../components/tournament/TournamentWorkspace'

const AccountPage = lazy(() => import('../pages/AccountPage').then(module => ({ default: module.AccountPage })))
const MyTournamentsPage = lazy(() => import('../pages/MyTournamentsPage').then(module => ({ default: module.MyTournamentsPage })))

type AppRoute =
  | { name: 'my-tournaments' }
  | { name: 'account' }
  | { name: 'standings'; presentation: boolean }
  | { name: 'registration' }
  | { name: 'match-vs'; matchId: MatchId; presentation: boolean }
  | { name: 'tournament-admin' }
  | { name: 'tournament-presentation' }
  | { name: 'public-screen' }
  | { name: 'home' }
  | { name: 'ruleset-new' }
  | { name: 'ruleset-detail'; rulesetId: string }
  | { name: 'ruleset-edit'; rulesetId: string }
  | { name: 'session-setup'; rulesetId: string }

const readRoute = (): AppRoute => {
  // UI-only restriction: hosts other than loopback only get the public stage-ban experience.
  if (!isAdminHost(window.location.hostname) && publicLanding(window.location.pathname)) window.history.replaceState({}, '', '/')
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/account') return { name: 'account' }
  if (path === '/my-tournaments' && import.meta.env.MODE === 'auth-tests' && import.meta.env.DEV) return { name: 'my-tournaments' }
  if (path === '/registration') return { name: 'registration' }
  if (path === '/tournament/standings' || path === '/tournament/standings/presentation') return { name: 'standings', presentation: path.endsWith('/presentation') }
  const matchRoute = path.match(/^\/tournament\/match\/([^/]+)(\/presentation)?$/)
  if (matchRoute) return { name: 'match-vs', matchId: matchRoute[1] as MatchId, presentation: !!matchRoute[2] }
  if (path === '/tournament') return { name: 'tournament-admin' }
  if (path === '/tournament/presentation') return { name: 'tournament-presentation' }
  if (path === '/tournament/screen') return { name: 'public-screen' }
  const sessionSetupMatch = path.match(/^\/session\/setup\/([^/]+)$/)
  const rulesetEditMatch = path.match(/^\/rulesets\/([^/]+)\/edit$/)
  const rulesetMatch = path.match(/^\/rulesets\/([^/]+)$/)

  if (path === '/rulesets/new') {
    return { name: 'ruleset-new' }
  }

  if (sessionSetupMatch) {
    return {
      name: 'session-setup',
      rulesetId: decodeURIComponent(sessionSetupMatch[1]),
    }
  }

  if (rulesetEditMatch) {
    return {
      name: 'ruleset-edit',
      rulesetId: decodeURIComponent(rulesetEditMatch[1]),
    }
  }

  if (rulesetMatch) {
    return {
      name: 'ruleset-detail',
      rulesetId: decodeURIComponent(rulesetMatch[1]),
    }
  }

  return { name: 'home' }
}

export function AppRoutes() {
  const [route, setRoute] = useState<AppRoute>(readRoute)
  const [workspaceId, setWorkspaceId] = useState(() => new URLSearchParams(window.location.search).get('event'))

  useEffect(() => {
    const syncRoute = () => { setRoute(readRoute()); setWorkspaceId(new URLSearchParams(window.location.search).get('event')) }

    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  const routeKey =
    route.name === 'standings' ? `standings-${route.presentation}` :
    route.name === 'match-vs' ? `${route.name}-${route.matchId}-${route.presentation}` :
    route.name === 'ruleset-detail' ||
    route.name === 'ruleset-edit' ||
    route.name === 'session-setup'
      ? `${route.name}-${route.rulesetId}`
      : route.name

  const page = (() => {
    if (route.name === 'my-tournaments') return <Suspense fallback={<p role="status" className="p-8 text-slate-300">Cargando torneos…</p>}><MyTournamentsPage /></Suspense>
    if (route.name === 'account') return <Suspense fallback={<p role="status" className="p-8 text-slate-300">Cargando cuenta…</p>}><AccountPage /></Suspense>
    if (route.name === 'standings') return <StandingsPage key={routeKey} presentation={route.presentation} />
    if (route.name === 'registration') return <RegistrationPage />
    if (route.name === 'match-vs') return <MatchVSPage key={routeKey} matchId={route.matchId} presentation={route.presentation} />
    if (route.name === 'tournament-admin') return <TournamentAdminPage />
    if (route.name === 'tournament-presentation') return <TournamentPresentationPage />
    if (route.name === 'public-screen') return <PublicScreenPage />
    if (route.name === 'ruleset-detail') {
      return <RulesetDetailPage rulesetId={route.rulesetId} />
    }

    if (route.name === 'session-setup') {
      return <SessionSetupPage rulesetId={route.rulesetId} />
    }

    if (route.name === 'ruleset-edit') {
      return <EditRulesetPage rulesetId={route.rulesetId} />
    }

    if (route.name === 'ruleset-new') {
      return <CreateRulesetPage />
    }

    return <HomePage />
  })()

  const scoped = ['registration', 'tournament-admin', 'tournament-presentation', 'public-screen', 'match-vs', 'standings'].includes(route.name)
  const content = scoped && import.meta.env.MODE === 'auth-tests' && import.meta.env.DEV
    ? <TournamentWorkspace key={workspaceId ?? 'legacy'} id={workspaceId}>{page}</TournamentWorkspace> : page
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${routeKey}:${workspaceId ?? 'legacy'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  )
}
